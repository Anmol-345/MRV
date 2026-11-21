use blutoken_app::{
    services::{BluvftService, MarketService, RegistryService},
    state::{reset_storage, with_storage, with_storage_mut, ESCROW_ACTOR_ID},
    types::{Beneficiary, Ecosystem, Error, ProjectStatus, ReportStatus, Role},
};
use sails_rs::ActorId;

fn setup_test_environment(admin: ActorId) {
    reset_storage();
    with_storage_mut(|st| {
        st.admins.insert(admin);
        st.roles.entry(admin).or_default().insert(Role::Admin);
    });
}

// -------------------------------------------------------------------------------------------------
// 1. HAPPY PATH TEST: Complete End-to-End Lifecycle
// -------------------------------------------------------------------------------------------------
#[test]
fn test_happy_path_complete_lifecycle() {
    let admin = ActorId::from(1);
    let owner = ActorId::from(2);
    let verifier1 = ActorId::from(3);
    let verifier2 = ActorId::from(4);
    let beneficiary1 = ActorId::from(5);
    let beneficiary2 = ActorId::from(6);
    let buyer = ActorId::from(7);

    setup_test_environment(admin);

    let registry_svc = RegistryService::new();
    let market_svc = MarketService::new();
    let bluvft_svc = BluvftService::new();

    // Setup verifiers with distinct organizations (Org 10 and Org 20)
    with_storage_mut(|st| {
        st.grant_role(admin, verifier1, Role::Verifier, Some(10))?;
        st.grant_role(admin, verifier2, Role::Verifier, Some(20))?;
        Ok::<(), Error>(())
    })
    .expect("setup verifiers");

    // 1. Register project: Sundarbans Mangrove (60% / 40% split)
    let beneficiaries = vec![
        Beneficiary {
            who: beneficiary1,
            share_bps: 6000,
        },
        Beneficiary {
            who: beneficiary2,
            share_bps: 4000,
        },
    ];
    let project_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "Sundarbans Delta Project".into(),
            Ecosystem::Mangrove,
            "WB".into(),
            "bafybeiboundary123".into(),
            10_000, // 100 ha
            beneficiaries.clone(),
            1000,
        )
    })
    .expect("register project");

    assert_eq!(project_id, 1);
    let proj = registry_svc.project(project_id).expect("project found");
    assert_eq!(proj.status, ProjectStatus::Pending);
    assert_eq!(proj.total_minted, 0);
    assert_eq!(proj.buffer_held, 0);

    // 2. Admin activates project
    with_storage_mut(|st| st.activate_project(admin, project_id)).expect("activate project");
    let proj = registry_svc.project(project_id).unwrap();
    assert_eq!(proj.status, ProjectStatus::Active);

    // 3. Project owner submits MRV report: 100,000 milli-tCO2e (100 tCO2e)
    let report_id = with_storage_mut(|st| {
        st.submit_report(
            owner,
            project_id,
            1_000_000,
            2_000_000,
            [0xaa; 32],
            "bafybeimrvdata456".into(),
            100_000,
            "VM0033-v1.0".into(),
            2_000_001,
        )
    })
    .expect("submit report");

    assert_eq!(report_id, 1);
    let rep = registry_svc.report(report_id).expect("report found");
    assert_eq!(rep.status, ReportStatus::Submitted);

    // 4. Verifiers vote:
    // Vote 1 (verifier1 from org 10) -> stays submitted
    let (status1, _, _, _, _) =
        with_storage_mut(|st| st.vote_report(verifier1, report_id, true)).unwrap();
    assert_eq!(status1, ReportStatus::Submitted);

    // Vote 2 (verifier2 from org 20) -> quorum 2 & 2 orgs reached -> Finalize & Mint!
    let (status2, minted, buffered, mint_owner, p_id) =
        with_storage_mut(|st| st.vote_report(verifier2, report_id, true)).unwrap();
    assert_eq!(status2, ReportStatus::Verified);
    assert_eq!(mint_owner, owner);
    assert_eq!(p_id, project_id);

    // Verification math: 20% buffer (20,000) and 80% minted (80,000)
    assert_eq!(buffered, 20_000);
    assert_eq!(minted, 80_000);

    let proj = registry_svc.project(project_id).unwrap();
    assert_eq!(proj.total_minted, 80_000);
    assert_eq!(proj.buffer_held, 20_000);
    assert_eq!(bluvft_svc.balance_of(owner), 80_000);
    assert_eq!(bluvft_svc.total_supply(), 80_000);

    // 5. Market: Owner creates listing of 50,000 BLU at 10 planck per milli-tCO2e
    let listing_id =
        with_storage_mut(|st| st.create_listing(owner, project_id, 50_000, 10, 3_000_000))
            .expect("create listing");

    assert_eq!(listing_id, 1);
    assert_eq!(bluvft_svc.balance_of(owner), 30_000);
    assert_eq!(bluvft_svc.balance_of(ESCROW_ACTOR_ID), 50_000);

    let listing = market_svc.listing(listing_id).expect("listing found");
    assert_eq!(listing.remaining, 50_000);
    assert!(listing.active);

    // 6. Market: Buyer buys 20,000 BLU paying exact 20,000 * 10 = 200,000 planck
    let payment1 = 20_000 * 10;
    with_storage_mut(|st| st.buy(buyer, listing_id, 20_000, payment1)).expect("buy listing");

    assert_eq!(bluvft_svc.balance_of(buyer), 20_000);
    assert_eq!(bluvft_svc.balance_of(ESCROW_ACTOR_ID), 30_000);
    let listing = market_svc.listing(listing_id).unwrap();
    assert_eq!(listing.remaining, 30_000);
    assert!(listing.active);

    // Check revenue settlement from buy:
    // Platform fee (2%) = 4,000 planck
    // Net = 196,000 planck
    // Beneficiary 1 (60%) = 117,600 planck
    // Beneficiary 2 (40%) = 78,400 planck
    assert_eq!(market_svc.treasury_accrual(), 4_000);
    assert_eq!(market_svc.claimable(project_id, beneficiary1), 117_600);
    assert_eq!(market_svc.claimable(project_id, beneficiary2), 78_400);

    // 7. Market: Buyer buys remaining 30,000 BLU and retires them paying 300,000 planck
    let payment2 = 30_000 * 10;
    let (paid2, ret_id, p_id) = with_storage_mut(|st| {
        st.buy_and_retire(
            buyer,
            listing_id,
            30_000,
            payment2,
            "Acme Corp ESG".into(),
            "Scope 3 Offset 2026".into(),
            4_000_000,
        )
    })
    .expect("buy and retire");

    assert_eq!(paid2, 300_000);
    assert_eq!(ret_id, 1);
    assert_eq!(p_id, project_id);
    assert_eq!(bluvft_svc.balance_of(ESCROW_ACTOR_ID), 0);

    // Tokens burned from escrow -> total supply decreases
    assert_eq!(bluvft_svc.total_supply(), 50_000); // 80_000 - 30_000
    let proj = registry_svc.project(project_id).unwrap();
    assert_eq!(proj.total_retired, 30_000);

    let listing = market_svc.listing(listing_id).unwrap();
    assert_eq!(listing.remaining, 0);
    assert!(!listing.active);

    // Check revenue settlement from buy_and_retire:
    // Fee (2%) = 6,000 planck -> Total treasury = 10,000 planck
    // Net = 294,000 planck
    // Beneficiary 1 (60%) = 176,400 -> Total = 117,600 + 176,400 = 294,000 planck
    // Beneficiary 2 (40%) = 117,600 -> Total = 78,400 + 117,600 = 196,000 planck
    assert_eq!(market_svc.treasury_accrual(), 10_000);
    assert_eq!(market_svc.claimable(project_id, beneficiary1), 294_000);
    assert_eq!(market_svc.claimable(project_id, beneficiary2), 196_000);

    // 8. Direct retirement: Buyer retires 10,000 of their 20,000 BLU directly
    let ret_id2 = with_storage_mut(|st| {
        st.retire(
            buyer,
            project_id,
            10_000,
            "Acme Corp ESG".into(),
            "Direct Retirement".into(),
            4_500_000,
        )
    })
    .expect("direct retire");

    assert_eq!(ret_id2, 2);
    assert_eq!(bluvft_svc.balance_of(buyer), 10_000);
    assert_eq!(bluvft_svc.total_supply(), 40_000);

    let proj = registry_svc.project(project_id).unwrap();
    assert_eq!(proj.total_retired, 40_000);

    // 9. Pull payment revenue claims:
    // Beneficiary 1 claims revenue
    let b1_claim =
        with_storage_mut(|st| st.claim_revenue(beneficiary1, project_id)).expect("b1 claim");
    assert_eq!(b1_claim, 294_000);
    assert_eq!(market_svc.claimable(project_id, beneficiary1), 0);

    // B1 second claim fails with NothingToClaim
    assert_eq!(
        with_storage_mut(|st| st.claim_revenue(beneficiary1, project_id)),
        Err(Error::NothingToClaim)
    );

    // Beneficiary 2 claims revenue
    let b2_claim =
        with_storage_mut(|st| st.claim_revenue(beneficiary2, project_id)).expect("b2 claim");
    assert_eq!(b2_claim, 196_000);
    assert_eq!(market_svc.claimable(project_id, beneficiary2), 0);

    // B2 second claim fails with NothingToClaim
    assert_eq!(
        with_storage_mut(|st| st.claim_revenue(beneficiary2, project_id)),
        Err(Error::NothingToClaim)
    );

    // Native VARA remaining held is exactly the treasury accrual + dust (10,000 planck)
    assert_eq!(market_svc.native_vara_held(), 10_000);
}

// -------------------------------------------------------------------------------------------------
// 2. INVARIANTS 1, 2, 3, AND 7: Mathematical Integrity Tests
// -------------------------------------------------------------------------------------------------
#[test]
fn test_invariants_1_2_3_and_7() {
    let admin = ActorId::from(10);
    let owner = ActorId::from(11);
    let v1 = ActorId::from(12);
    let v2 = ActorId::from(13);
    let ben = ActorId::from(14);
    let buyer = ActorId::from(15);

    setup_test_environment(admin);

    with_storage_mut(|st| {
        st.grant_role(admin, v1, Role::Verifier, Some(1))?;
        st.grant_role(admin, v2, Role::Verifier, Some(2))?;
        Ok::<(), Error>(())
    })
    .unwrap();

    let p_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "Mangrove Test".into(),
            Ecosystem::Mangrove,
            "TN".into(),
            "cid_bnd".into(),
            5_000,
            vec![Beneficiary {
                who: ben,
                share_bps: 10_000,
            }],
            100,
        )
    })
    .unwrap();

    with_storage_mut(|st| st.activate_project(admin, p_id)).unwrap();

    let r_id = with_storage_mut(|st| {
        st.submit_report(
            owner,
            p_id,
            10,
            20,
            [1; 32],
            "cid_mrv".into(),
            60_000,
            "VM0033".into(),
            21,
        )
    })
    .unwrap();

    with_storage_mut(|st| st.vote_report(v1, r_id, true)).unwrap();
    with_storage_mut(|st| st.vote_report(v2, r_id, true)).unwrap();

    // Verify after mint:
    // Invariant 1: sum(balances) == total_supply
    // Invariant 2: total_supply == sum(minted) - total_burned
    // Invariant 3: total_retired <= total_minted
    with_storage(|st| {
        let sum_balances: u128 = st.balances.values().sum();
        assert_eq!(sum_balances, st.total_supply); // Inv 1
        assert_eq!(
            st.total_supply,
            st.projects[&p_id].total_minted - st.total_burned
        ); // Inv 2
        assert!(st.projects[&p_id].total_retired <= st.projects[&p_id].total_minted);
        // Inv 3
    });

    // List and Buy
    let l_id = with_storage_mut(|st| st.create_listing(owner, p_id, 40_000, 20, 30)).unwrap();
    with_storage_mut(|st| st.buy(buyer, l_id, 15_000, 15_000 * 20)).unwrap();

    // Retire 5_000
    with_storage_mut(|st| st.retire(buyer, p_id, 5_000, "Ben".into(), "Reason".into(), 40))
        .unwrap();

    // Check Invariants 1, 2, 3 again:
    with_storage(|st| {
        let sum_balances: u128 = st.balances.values().sum();
        assert_eq!(sum_balances, st.total_supply); // Inv 1
        assert_eq!(
            st.total_supply,
            st.projects[&p_id].total_minted - st.total_burned
        ); // Inv 2
        assert!(st.projects[&p_id].total_retired <= st.projects[&p_id].total_minted);
        // Inv 3
    });

    // Invariant 7: Native VARA accounting guard
    with_storage(|st| {
        let unclaimed: u128 = st.claimable_revenue.values().sum();
        let total_accounted = unclaimed + st.treasury_accrual + st.pending_revenue_dust;
        assert_eq!(st.native_vara_held, total_accounted); // Inv 7
    });
}

// -------------------------------------------------------------------------------------------------
// 3. INVARIANT 4: Report Mints At Most Once
// -------------------------------------------------------------------------------------------------
#[test]
fn test_invariant_4_report_mints_at_most_once() {
    let admin = ActorId::from(20);
    let owner = ActorId::from(21);
    let v1 = ActorId::from(22);
    let v2 = ActorId::from(23);
    let v3 = ActorId::from(24);

    setup_test_environment(admin);

    with_storage_mut(|st| {
        st.grant_role(admin, v1, Role::Verifier, Some(1))?;
        st.grant_role(admin, v2, Role::Verifier, Some(2))?;
        st.grant_role(admin, v3, Role::Verifier, Some(3))?;
        Ok::<(), Error>(())
    })
    .unwrap();

    let p_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "P".into(),
            Ecosystem::Seagrass,
            "GJ".into(),
            "cid".into(),
            1_000,
            vec![Beneficiary {
                who: owner,
                share_bps: 10_000,
            }],
            1,
        )
    })
    .unwrap();
    with_storage_mut(|st| st.activate_project(admin, p_id)).unwrap();

    let r_id = with_storage_mut(|st| {
        st.submit_report(
            owner,
            p_id,
            1,
            2,
            [0; 32],
            "cid".into(),
            50_000,
            "V1".into(),
            3,
        )
    })
    .unwrap();

    // V1 and V2 finalize
    with_storage_mut(|st| st.vote_report(v1, r_id, true)).unwrap();
    let res = with_storage_mut(|st| st.vote_report(v2, r_id, true)).unwrap();
    assert_eq!(res.0, ReportStatus::Verified);

    let initial_minted = with_storage(|st| st.projects[&p_id].total_minted);
    assert_eq!(initial_minted, 40_000); // 80% of 50_000

    // V3 attempts to vote on already-verified report -> rejected with InvalidInput
    let err = with_storage_mut(|st| st.vote_report(v3, r_id, true));
    assert_eq!(err, Err(Error::InvalidInput));

    // Ensure total_minted did NOT increase
    let final_minted = with_storage(|st| st.projects[&p_id].total_minted);
    assert_eq!(final_minted, initial_minted);
}

// -------------------------------------------------------------------------------------------------
// 4. INVARIANT 5: Conflict of Interest and Double-Voting Prevention
// -------------------------------------------------------------------------------------------------
#[test]
fn test_invariant_5_conflict_of_interest_and_double_voting() {
    let admin = ActorId::from(30);
    let owner = ActorId::from(31);
    let ben = ActorId::from(32);
    let independent_v = ActorId::from(33);

    setup_test_environment(admin);

    // Give Verifier role to owner, beneficiary, and independent verifier
    with_storage_mut(|st| {
        st.grant_role(admin, owner, Role::Verifier, Some(1))?;
        st.grant_role(admin, ben, Role::Verifier, Some(2))?;
        st.grant_role(admin, independent_v, Role::Verifier, Some(3))?;
        Ok::<(), Error>(())
    })
    .unwrap();

    let p_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "P".into(),
            Ecosystem::SaltMarsh,
            "KA".into(),
            "cid".into(),
            1_000,
            vec![Beneficiary {
                who: ben,
                share_bps: 10_000,
            }],
            1,
        )
    })
    .unwrap();
    with_storage_mut(|st| st.activate_project(admin, p_id)).unwrap();

    let r_id = with_storage_mut(|st| {
        st.submit_report(
            owner,
            p_id,
            1,
            2,
            [0; 32],
            "cid".into(),
            10_000,
            "V1".into(),
            3,
        )
    })
    .unwrap();

    // 1. Owner cannot vote on own project
    assert_eq!(
        with_storage_mut(|st| st.vote_report(owner, r_id, true)),
        Err(Error::ConflictOfInterest)
    );

    // 2. Beneficiary cannot vote on project
    assert_eq!(
        with_storage_mut(|st| st.vote_report(ben, r_id, true)),
        Err(Error::ConflictOfInterest)
    );

    // 3. Independent verifier can vote
    with_storage_mut(|st| st.vote_report(independent_v, r_id, true)).expect("vote should succeed");

    // 4. Double-voting is prevented
    assert_eq!(
        with_storage_mut(|st| st.vote_report(independent_v, r_id, true)),
        Err(Error::AlreadyVoted)
    );
    assert_eq!(
        with_storage_mut(|st| st.vote_report(independent_v, r_id, false)),
        Err(Error::AlreadyVoted)
    );
}

// -------------------------------------------------------------------------------------------------
// 5. INVARIANT 6: Beneficiary Shares Strictly Sum to 10,000 BPS
// -------------------------------------------------------------------------------------------------
#[test]
fn test_invariant_6_beneficiary_shares() {
    let admin = ActorId::from(40);
    let owner = ActorId::from(41);
    let b1 = ActorId::from(42);
    let b2 = ActorId::from(43);

    setup_test_environment(admin);

    // Shares sum to 9,999 -> rejected
    let under_shares = vec![
        Beneficiary {
            who: b1,
            share_bps: 5000,
        },
        Beneficiary {
            who: b2,
            share_bps: 4999,
        },
    ];
    assert_eq!(
        with_storage_mut(|st| st.register_project(
            owner,
            "P".into(),
            Ecosystem::Mangrove,
            "WB".into(),
            "cid".into(),
            1_000,
            under_shares,
            1
        )),
        Err(Error::InvalidShares)
    );

    // Shares sum to 10,001 -> rejected
    let over_shares = vec![
        Beneficiary {
            who: b1,
            share_bps: 5000,
        },
        Beneficiary {
            who: b2,
            share_bps: 5001,
        },
    ];
    assert_eq!(
        with_storage_mut(|st| st.register_project(
            owner,
            "P".into(),
            Ecosystem::Mangrove,
            "WB".into(),
            "cid".into(),
            1_000,
            over_shares,
            1
        )),
        Err(Error::InvalidShares)
    );

    // Exactly 10,000 -> succeeds
    let valid_shares = vec![
        Beneficiary {
            who: b1,
            share_bps: 6500,
        },
        Beneficiary {
            who: b2,
            share_bps: 3500,
        },
    ];
    let p_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "P".into(),
            Ecosystem::Mangrove,
            "WB".into(),
            "cid".into(),
            1_000,
            valid_shares,
            1,
        )
    })
    .expect("register should succeed");

    // Updating beneficiaries with non-10,000 sum fails
    let bad_update = vec![Beneficiary {
        who: b1,
        share_bps: 9000,
    }];
    assert_eq!(
        with_storage_mut(|st| st.set_beneficiaries(owner, p_id, bad_update)),
        Err(Error::InvalidShares)
    );

    // Updating beneficiaries with 10,000 sum succeeds before minting
    let good_update = vec![
        Beneficiary {
            who: b1,
            share_bps: 5000,
        },
        Beneficiary {
            who: b2,
            share_bps: 5000,
        },
    ];
    assert!(with_storage_mut(|st| st.set_beneficiaries(owner, p_id, good_update)).is_ok());
}

// -------------------------------------------------------------------------------------------------
// 6. QUORUM AND MINIMUM DISTINCT ORGANIZATIONS RULE
// -------------------------------------------------------------------------------------------------
#[test]
fn test_quorum_requires_minimum_distinct_organizations() {
    let admin = ActorId::from(50);
    let owner = ActorId::from(51);
    let v1 = ActorId::from(52); // Org 1
    let v2 = ActorId::from(53); // Org 1 (same org!)
    let v3 = ActorId::from(54); // Org 2

    setup_test_environment(admin);

    with_storage_mut(|st| {
        st.grant_role(admin, v1, Role::Verifier, Some(1))?;
        st.grant_role(admin, v2, Role::Verifier, Some(1))?; // SAME ORG
        st.grant_role(admin, v3, Role::Verifier, Some(2))?; // DIFFERENT ORG
        Ok::<(), Error>(())
    })
    .unwrap();

    let p_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "P".into(),
            Ecosystem::Mangrove,
            "WB".into(),
            "cid".into(),
            1_000,
            vec![Beneficiary {
                who: owner,
                share_bps: 10_000,
            }],
            1,
        )
    })
    .unwrap();
    with_storage_mut(|st| st.activate_project(admin, p_id)).unwrap();

    let r_id = with_storage_mut(|st| {
        st.submit_report(
            owner,
            p_id,
            1,
            2,
            [0; 32],
            "cid".into(),
            20_000,
            "V1".into(),
            3,
        )
    })
    .unwrap();

    // V1 (Org 1) approves -> 1 vote, 1 org -> Submitted
    let (s1, _, _, _, _) = with_storage_mut(|st| st.vote_report(v1, r_id, true)).unwrap();
    assert_eq!(s1, ReportStatus::Submitted);

    // V2 (Org 1) approves -> 2 votes, but ONLY 1 ORG! Quorum = 2, min_orgs = 2
    // Must NOT finalize because distinct orgs == 1 < min_orgs == 2!
    let (s2, _, _, _, _) = with_storage_mut(|st| st.vote_report(v2, r_id, true)).unwrap();
    assert_eq!(s2, ReportStatus::Submitted);

    // V3 (Org 2) approves -> 3 votes, 2 distinct orgs -> FINALIZES!
    let (s3, minted, buffered, _, _) =
        with_storage_mut(|st| st.vote_report(v3, r_id, true)).unwrap();
    assert_eq!(s3, ReportStatus::Verified);
    assert_eq!(minted, 16_000);
    assert_eq!(buffered, 4_000);
}

// -------------------------------------------------------------------------------------------------
// 7. REJECTIONS AND QUORUM IMPOSSIBILITY
// -------------------------------------------------------------------------------------------------
#[test]
fn test_rejection_and_quorum_impossible() {
    let admin = ActorId::from(60);
    let owner = ActorId::from(61);
    let v1 = ActorId::from(62);
    let v2 = ActorId::from(63);
    let v3 = ActorId::from(64);

    setup_test_environment(admin);

    with_storage_mut(|st| {
        st.grant_role(admin, v1, Role::Verifier, Some(1))?;
        st.grant_role(admin, v2, Role::Verifier, Some(2))?;
        st.grant_role(admin, v3, Role::Verifier, Some(3))?;
        Ok::<(), Error>(())
    })
    .unwrap();

    let p_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "P".into(),
            Ecosystem::Mangrove,
            "WB".into(),
            "cid".into(),
            1_000,
            vec![Beneficiary {
                who: owner,
                share_bps: 10_000,
            }],
            1,
        )
    })
    .unwrap();
    with_storage_mut(|st| st.activate_project(admin, p_id)).unwrap();

    let r_id = with_storage_mut(|st| {
        st.submit_report(
            owner,
            p_id,
            1,
            2,
            [0; 32],
            "cid".into(),
            10_000,
            "V1".into(),
            3,
        )
    })
    .unwrap();

    // Total verifiers = 3, Quorum = 2.
    // Verifier 1 rejects -> 1 rejection. Max remaining = 2, quorum still possible.
    let (s1, _, _, _, _) = with_storage_mut(|st| st.vote_report(v1, r_id, false)).unwrap();
    assert_eq!(s1, ReportStatus::Submitted);

    // Verifier 2 rejects -> 2 rejections. Max remaining = 1 < quorum 2 -> REJECTED!
    let (s2, _, _, _, _) = with_storage_mut(|st| st.vote_report(v2, r_id, false)).unwrap();
    assert_eq!(s2, ReportStatus::Rejected);
}

// -------------------------------------------------------------------------------------------------
// 8. OVERLAPPING REPORT PERIODS REJECTED
// -------------------------------------------------------------------------------------------------
#[test]
fn test_overlapping_report_periods() {
    let admin = ActorId::from(70);
    let owner = ActorId::from(71);
    let v1 = ActorId::from(72);
    let v2 = ActorId::from(73);

    setup_test_environment(admin);

    with_storage_mut(|st| {
        st.grant_role(admin, v1, Role::Verifier, Some(1))?;
        st.grant_role(admin, v2, Role::Verifier, Some(2))?;
        Ok::<(), Error>(())
    })
    .unwrap();

    let p_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "P".into(),
            Ecosystem::Mangrove,
            "WB".into(),
            "cid".into(),
            1_000,
            vec![Beneficiary {
                who: owner,
                share_bps: 10_000,
            }],
            1,
        )
    })
    .unwrap();
    with_storage_mut(|st| st.activate_project(admin, p_id)).unwrap();

    // Report 1: period 1000..2000
    let r1 = with_storage_mut(|st| {
        st.submit_report(
            owner,
            p_id,
            1000,
            2000,
            [0; 32],
            "cid".into(),
            10_000,
            "V1".into(),
            1,
        )
    })
    .unwrap();

    // Verify Report 1
    with_storage_mut(|st| st.vote_report(v1, r1, true)).unwrap();
    with_storage_mut(|st| st.vote_report(v2, r1, true)).unwrap();

    // Report 2 overlaps: 1500..2500 -> Rejected with OverlappingPeriod
    assert_eq!(
        with_storage_mut(|st| {
            st.submit_report(
                owner,
                p_id,
                1500,
                2500,
                [0; 32],
                "cid".into(),
                10_000,
                "V1".into(),
                2,
            )
        }),
        Err(Error::OverlappingPeriod)
    );

    // Report 3 overlaps: 500..1500 -> Rejected with OverlappingPeriod
    assert_eq!(
        with_storage_mut(|st| {
            st.submit_report(
                owner,
                p_id,
                500,
                1500,
                [0; 32],
                "cid".into(),
                10_000,
                "V1".into(),
                2,
            )
        }),
        Err(Error::OverlappingPeriod)
    );

    // Report 4 non-overlapping: 2000..3000 -> Succeeds!
    let r4 = with_storage_mut(|st| {
        st.submit_report(
            owner,
            p_id,
            2000,
            3000,
            [0; 32],
            "cid".into(),
            10_000,
            "V1".into(),
            3,
        )
    });
    assert!(r4.is_ok());
}

// -------------------------------------------------------------------------------------------------
// 9. MARKET PAYMENT VALIDATION AND LISTING CANCELLATION
// -------------------------------------------------------------------------------------------------
#[test]
fn test_market_payment_and_cancellation() {
    let admin = ActorId::from(80);
    let owner = ActorId::from(81);
    let buyer = ActorId::from(82);
    let stranger = ActorId::from(83);

    setup_test_environment(admin);

    let p_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "P".into(),
            Ecosystem::Mangrove,
            "WB".into(),
            "cid".into(),
            1_000,
            vec![Beneficiary {
                who: owner,
                share_bps: 10_000,
            }],
            1,
        )
    })
    .unwrap();
    with_storage_mut(|st| st.activate_project(admin, p_id)).unwrap();

    // Mint tokens to owner
    with_storage_mut(|st| st.mint(owner, 50_000)).unwrap();

    // Create listing: 10_000 at 5 planck/milli
    let l_id = with_storage_mut(|st| st.create_listing(owner, p_id, 10_000, 5, 10)).unwrap();

    // Underpayment -> WrongPayment
    assert_eq!(
        with_storage_mut(|st| st.buy(buyer, l_id, 1_000, 4_999)),
        Err(Error::WrongPayment)
    );

    // Overpayment -> WrongPayment (exact match required)
    assert_eq!(
        with_storage_mut(|st| st.buy(buyer, l_id, 1_000, 5_001)),
        Err(Error::WrongPayment)
    );

    // Non-seller cannot cancel listing
    assert_eq!(
        with_storage_mut(|st| st.cancel_listing(stranger, l_id)),
        Err(Error::Unauthorized)
    );

    // Seller cancels listing -> escrow returned
    assert_eq!(with_storage(|st| st.balance_of(&owner)), 40_000);
    assert_eq!(with_storage(|st| st.balance_of(&ESCROW_ACTOR_ID)), 10_000);

    let refund = with_storage_mut(|st| st.cancel_listing(owner, l_id)).unwrap();
    assert_eq!(refund, 10_000);

    assert_eq!(with_storage(|st| st.balance_of(&owner)), 50_000);
    assert_eq!(with_storage(|st| st.balance_of(&ESCROW_ACTOR_ID)), 0);

    // Cancelled listing cannot be bought
    assert_eq!(
        with_storage_mut(|st| st.buy(buyer, l_id, 1_000, 5_000)),
        Err(Error::InsufficientListing)
    );
}

// -------------------------------------------------------------------------------------------------
// 10. REVERSAL FLAGGING AND BUFFER DEFICIT
// -------------------------------------------------------------------------------------------------
#[test]
fn test_reversal_flagging_and_deficit() {
    let admin = ActorId::from(90);
    let owner = ActorId::from(91);
    let stranger = ActorId::from(92);

    setup_test_environment(admin);

    let p_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "P".into(),
            Ecosystem::Mangrove,
            "WB".into(),
            "cid".into(),
            1_000,
            vec![Beneficiary {
                who: owner,
                share_bps: 10_000,
            }],
            1,
        )
    })
    .unwrap();

    // Manually credit buffer_held = 20_000 for test
    with_storage_mut(|st| {
        st.projects.get_mut(&p_id).unwrap().buffer_held = 20_000;
    });

    // Stranger cannot flag reversal
    assert_eq!(
        with_storage_mut(|st| st.flag_reversal(stranger, p_id, 5_000)),
        Err(Error::Unauthorized)
    );

    // Admin flags reversal of 5_000 -> deficit = 0, buffer becomes 15_000
    let def1 = with_storage_mut(|st| st.flag_reversal(admin, p_id, 5_000)).unwrap();
    assert_eq!(def1, 0);
    assert_eq!(with_storage(|st| st.projects[&p_id].buffer_held), 15_000);

    // Admin flags reversal of 25_000 -> exceeds buffer of 15_000 -> buffer = 0, deficit = 10_000
    let def2 = with_storage_mut(|st| st.flag_reversal(admin, p_id, 25_000)).unwrap();
    assert_eq!(def2, 10_000);
    assert_eq!(with_storage(|st| st.projects[&p_id].buffer_held), 0);
}

// -------------------------------------------------------------------------------------------------
// 11. ROUNDING AND DUST RECONCILIATION WITH 3 BENEFICIARIES
// -------------------------------------------------------------------------------------------------
#[test]
fn test_rounding_and_dust_accounting() {
    let admin = ActorId::from(100);
    let owner = ActorId::from(101);
    let b1 = ActorId::from(102);
    let b2 = ActorId::from(103);
    let b3 = ActorId::from(104);
    let buyer = ActorId::from(105);

    setup_test_environment(admin);

    // Beneficiaries: 3333 bps, 3333 bps, 3334 bps = 10_000 bps
    let beneficiaries = vec![
        Beneficiary {
            who: b1,
            share_bps: 3333,
        },
        Beneficiary {
            who: b2,
            share_bps: 3333,
        },
        Beneficiary {
            who: b3,
            share_bps: 3334,
        },
    ];

    let p_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "P".into(),
            Ecosystem::Mangrove,
            "WB".into(),
            "cid".into(),
            1_000,
            beneficiaries,
            1,
        )
    })
    .unwrap();
    with_storage_mut(|st| st.activate_project(admin, p_id)).unwrap();

    // Mint and list
    with_storage_mut(|st| st.mint(owner, 10_000)).unwrap();
    let l_id = with_storage_mut(|st| st.create_listing(owner, p_id, 10_000, 10, 1)).unwrap();

    // Buy 10_000 tokens paying 100_000 planck
    with_storage_mut(|st| st.buy(buyer, l_id, 10_000, 100_000)).unwrap();

    // Check reconciliation:
    // Total payment = 100,000 planck
    // Platform fee (2%) = 2,000 planck
    // Net = 98,000 planck
    // B1: 98,000 * 3333 / 10000 = 32,663 planck
    // B2: 98,000 * 3333 / 10000 = 32,663 planck
    // B3: 98,000 * 3334 / 10000 = 32,673 planck
    // Sum distributed = 32,663 + 32,663 + 32,673 = 97,999 planck
    // Dust = 98,000 - 97,999 = 1 planck!
    with_storage(|st| {
        let b1_share = st.claimable_revenue[&(p_id, b1)];
        let b2_share = st.claimable_revenue[&(p_id, b2)];
        let b3_share = st.claimable_revenue[&(p_id, b3)];

        assert_eq!(b1_share, 32_663);
        assert_eq!(b2_share, 32_663);
        assert_eq!(b3_share, 32_673);
        assert_eq!(st.treasury_accrual, 2_000);
        assert_eq!(st.pending_revenue_dust, 1);

        // Invariant 7: exact balance reconciliation
        assert_eq!(
            st.native_vara_held,
            b1_share + b2_share + b3_share + st.treasury_accrual + st.pending_revenue_dust
        );
        assert_eq!(st.native_vara_held, 100_000);
    });

    // Claims work cleanly
    let c1 = with_storage_mut(|st| st.claim_revenue(b1, p_id)).unwrap();
    let c2 = with_storage_mut(|st| st.claim_revenue(b2, p_id)).unwrap();
    let c3 = with_storage_mut(|st| st.claim_revenue(b3, p_id)).unwrap();

    assert_eq!(c1, 32_663);
    assert_eq!(c2, 32_663);
    assert_eq!(c3, 32_673);

    // Remaining held is exactly treasury + dust
    with_storage(|st| {
        assert_eq!(st.native_vara_held, 2_001);
    });
}

// -------------------------------------------------------------------------------------------------
// 12. PAUSE BLOCKS WRITES BUT PULL-PAYMENTS AND QUERIES SUCCEED
// -------------------------------------------------------------------------------------------------
#[test]
fn test_pause_market_and_registry_semantics() {
    let admin = ActorId::from(110);
    let owner = ActorId::from(111);
    let ben = ActorId::from(112);
    let buyer = ActorId::from(113);

    setup_test_environment(admin);

    let p_id = with_storage_mut(|st| {
        st.register_project(
            owner,
            "P".into(),
            Ecosystem::Mangrove,
            "WB".into(),
            "cid".into(),
            1_000,
            vec![Beneficiary {
                who: ben,
                share_bps: 10_000,
            }],
            1,
        )
    })
    .unwrap();
    with_storage_mut(|st| st.activate_project(admin, p_id)).unwrap();

    with_storage_mut(|st| st.mint(owner, 20_000)).unwrap();
    let l_id = with_storage_mut(|st| st.create_listing(owner, p_id, 10_000, 5, 1)).unwrap();

    // Buy 5_000 tokens so revenue accrues to beneficiary
    with_storage_mut(|st| st.buy(buyer, l_id, 5_000, 25_000)).unwrap();

    // ADMIN PAUSES THE SYSTEM
    with_storage_mut(|st| st.pause(admin)).expect("pause");

    // All mutations fail with Paused:
    assert_eq!(
        with_storage_mut(|st| st.register_project(
            owner,
            "P2".into(),
            Ecosystem::Seagrass,
            "TN".into(),
            "cid".into(),
            1_000,
            vec![Beneficiary {
                who: ben,
                share_bps: 10_000
            }],
            2
        )),
        Err(Error::Paused)
    );
    assert_eq!(
        with_storage_mut(|st| st.activate_project(admin, p_id)),
        Err(Error::Paused)
    );
    assert_eq!(
        with_storage_mut(|st| st.submit_report(
            owner,
            p_id,
            1,
            2,
            [0; 32],
            "c".into(),
            100,
            "v".into(),
            3
        )),
        Err(Error::Paused)
    );
    assert_eq!(
        with_storage_mut(|st| st.create_listing(owner, p_id, 1_000, 5, 2)),
        Err(Error::Paused)
    );
    assert_eq!(
        with_storage_mut(|st| st.cancel_listing(owner, l_id)),
        Err(Error::Paused)
    );
    assert_eq!(
        with_storage_mut(|st| st.buy(buyer, l_id, 1_000, 5_000)),
        Err(Error::Paused)
    );
    assert_eq!(
        with_storage_mut(|st| st.retire(buyer, p_id, 1_000, "b".into(), "r".into(), 3)),
        Err(Error::Paused)
    );

    // CRITICAL: Pull-payment claim STILL SUCCEEDS even when paused!
    let claimed = with_storage_mut(|st| st.claim_revenue(ben, p_id));
    assert!(claimed.is_ok());
    assert_eq!(claimed.unwrap(), 24_500); // 25_000 - 2% (500)

    // Read queries STILL SUCCEED while paused:
    let reg_svc = RegistryService::new();
    let mkt_svc = MarketService::new();
    assert!(reg_svc.project(p_id).is_some());
    assert!(mkt_svc.listing(l_id).is_some());
    assert_eq!(mkt_svc.claimable(p_id, ben), 0);
}
