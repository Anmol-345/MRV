use blutoken_app::{
    services::{AdminService, BluvftService},
    state::{reset_storage, with_storage, with_storage_mut},
    types::{Error, Params, Role},
};
use sails_rs::ActorId;

fn setup_program(admin: ActorId) {
    reset_storage();
    with_storage_mut(|st| {
        st.admins.insert(admin);
        st.roles.entry(admin).or_default().insert(Role::Admin);
    });
}

#[test]
fn test_roles_management() {
    let admin = ActorId::from(100);
    let alice = ActorId::from(101);
    let bob = ActorId::from(102);
    let eve = ActorId::from(999);

    setup_program(admin);

    let admin_svc = AdminService::new();

    // 1. Initial queries
    assert!(admin_svc.is_role(admin, Role::Admin));
    assert!(!admin_svc.is_role(alice, Role::Verifier));

    // 2. Admin grants Verifier role with org_id
    with_storage_mut(|st| st.grant_role(admin, alice, Role::Verifier, Some(42)))
        .expect("admin should grant verifier");
    assert!(admin_svc.is_role(alice, Role::Verifier));
    assert_eq!(admin_svc.verifier_org(alice), Some(42));

    // 3. Admin grants ProjectOwner role
    with_storage_mut(|st| st.grant_role(admin, bob, Role::ProjectOwner, None))
        .expect("admin should grant project owner");
    assert!(admin_svc.is_role(bob, Role::ProjectOwner));

    // 4. Roles of query
    let alice_roles = admin_svc.roles_of(alice);
    assert_eq!(alice_roles, vec![Role::Verifier]);

    // 5. Verifiers pagination query
    let verifiers = admin_svc.verifiers(0, 10);
    assert_eq!(verifiers.len(), 1);
    assert_eq!(verifiers[0], (alice, 42));

    // 6. Unauthorized caller cannot grant roles
    let unauth_grant = with_storage_mut(|st| st.grant_role(eve, eve, Role::Admin, None));
    assert_eq!(unauth_grant, Err(Error::Unauthorized));

    // 7. Unauthorized caller cannot revoke roles
    let unauth_revoke = with_storage_mut(|st| st.revoke_role(eve, alice, Role::Verifier));
    assert_eq!(unauth_revoke, Err(Error::Unauthorized));

    // 8. Admin revokes Verifier role
    with_storage_mut(|st| st.revoke_role(admin, alice, Role::Verifier))
        .expect("admin should revoke verifier");
    assert!(!admin_svc.is_role(alice, Role::Verifier));
    assert_eq!(admin_svc.verifier_org(alice), None);
    assert!(admin_svc.verifiers(0, 10).is_empty());
}

#[test]
fn test_params_validation() {
    let admin = ActorId::from(100);
    let eve = ActorId::from(999);

    setup_program(admin);

    let admin_svc = AdminService::new();

    // 1. Check default params
    let default_params = admin_svc.params();
    assert_eq!(default_params.quorum, 2);
    assert_eq!(default_params.min_orgs, 2);
    assert_eq!(default_params.buffer_bps, 2000);
    assert_eq!(default_params.platform_fee_bps, 200);
    assert!(!default_params.paused);

    // 2. Admin updates params with valid values
    let new_params = Params {
        quorum: 3,
        min_orgs: 3,
        buffer_bps: 1500,
        platform_fee_bps: 300,
        treasury: ActorId::from(200),
        paused: false,
    };
    with_storage_mut(|st| st.set_params(admin, new_params.clone()))
        .expect("admin should set valid params");
    assert_eq!(admin_svc.params(), new_params);

    // 3. Unauthorized caller cannot set params
    let unauth = with_storage_mut(|st| st.set_params(eve, new_params.clone()));
    assert_eq!(unauth, Err(Error::Unauthorized));

    // 4. Invalid buffer_bps > 10 000
    let invalid_buffer = Params {
        buffer_bps: 10_001,
        ..new_params.clone()
    };
    assert_eq!(
        with_storage_mut(|st| st.set_params(admin, invalid_buffer)),
        Err(Error::InvalidInput)
    );

    // 5. Invalid platform_fee_bps > 10 000
    let invalid_fee = Params {
        platform_fee_bps: 10_001,
        ..new_params.clone()
    };
    assert_eq!(
        with_storage_mut(|st| st.set_params(admin, invalid_fee)),
        Err(Error::InvalidInput)
    );

    // 6. Invalid quorum == 0
    let invalid_quorum = Params {
        quorum: 0,
        ..new_params.clone()
    };
    assert_eq!(
        with_storage_mut(|st| st.set_params(admin, invalid_quorum)),
        Err(Error::InvalidInput)
    );

    // 7. Invalid min_orgs == 0
    let invalid_min_orgs = Params {
        min_orgs: 0,
        ..new_params
    };
    assert_eq!(
        with_storage_mut(|st| st.set_params(admin, invalid_min_orgs)),
        Err(Error::InvalidInput)
    );
}

#[test]
fn test_pause_and_invariant_9() {
    let admin = ActorId::from(100);
    let alice = ActorId::from(101);
    let bob = ActorId::from(102);
    let eve = ActorId::from(999);

    setup_program(admin);

    let admin_svc = AdminService::new();
    let bluvft_svc = BluvftService::new();

    // Mint some initial balance to Alice for testing
    with_storage_mut(|st| st.mint(alice, 10_000)).unwrap();

    // 1. Unauthorized caller cannot pause
    assert_eq!(
        with_storage_mut(|st| st.pause(eve)),
        Err(Error::Unauthorized)
    );
    assert!(!admin_svc.is_paused());

    // 2. Admin pauses contract
    with_storage_mut(|st| st.pause(admin)).expect("admin should pause");
    assert!(admin_svc.is_paused());

    // 3. INVARIANT 9: While paused, all state changes fail with Paused
    assert_eq!(
        with_storage_mut(|st| st.grant_role(admin, alice, Role::Verifier, Some(1))),
        Err(Error::Paused)
    );
    assert_eq!(
        with_storage_mut(|st| st.revoke_role(admin, admin, Role::Admin)),
        Err(Error::Paused)
    );
    assert_eq!(
        with_storage_mut(|st| st.set_params(admin, Params::default())),
        Err(Error::Paused)
    );
    assert_eq!(
        with_storage_mut(|st| st.transfer(alice, bob, 1_000)),
        Err(Error::Paused)
    );
    assert_eq!(
        with_storage_mut(|st| st.approve(alice, bob, 500)),
        Err(Error::Paused)
    );
    assert_eq!(
        with_storage_mut(|st| st.transfer_from(bob, alice, bob, 500)),
        Err(Error::Paused)
    );

    // 4. INVARIANT 9: While paused, ALL read queries STILL SUCCEED
    assert_eq!(bluvft_svc.name(), "BluToken");
    assert_eq!(bluvft_svc.symbol(), "BLU");
    assert_eq!(bluvft_svc.decimals(), 3);
    assert_eq!(bluvft_svc.total_supply(), 10_000);
    assert_eq!(bluvft_svc.balance_of(alice), 10_000);
    assert_eq!(bluvft_svc.allowance(alice, bob), 0);
    assert!(admin_svc.is_role(admin, Role::Admin));
    assert_eq!(admin_svc.params().quorum, 2);
    assert!(admin_svc.is_paused());

    // 5. Unauthorized caller cannot unpause
    assert_eq!(
        with_storage_mut(|st| st.unpause(eve)),
        Err(Error::Unauthorized)
    );

    // 6. Admin unpauses
    with_storage_mut(|st| st.unpause(admin)).expect("admin should unpause");
    assert!(!admin_svc.is_paused());

    // 7. Operations succeed again after unpause
    with_storage_mut(|st| st.transfer(alice, bob, 1_000)).expect("transfer should succeed");
    assert_eq!(bluvft_svc.balance_of(alice), 9_000);
    assert_eq!(bluvft_svc.balance_of(bob), 1_000);
}

#[test]
fn test_bluvft_transfer_and_allowance() {
    let admin = ActorId::from(100);
    let alice = ActorId::from(101);
    let bob = ActorId::from(102);
    let charlie = ActorId::from(103);
    let dave = ActorId::from(104);

    setup_program(admin);

    let bluvft_svc = BluvftService::new();

    // Verify metadata
    assert_eq!(bluvft_svc.name(), "BluToken");
    assert_eq!(bluvft_svc.symbol(), "BLU");
    assert_eq!(bluvft_svc.decimals(), 3);

    // Internal mint 50 BLU (50 000 milli-BLU) to Alice
    with_storage_mut(|st| st.mint(alice, 50_000)).unwrap();
    assert_eq!(bluvft_svc.balance_of(alice), 50_000);
    assert_eq!(bluvft_svc.total_supply(), 50_000);

    // Transfer: Alice -> Bob 20_000
    with_storage_mut(|st| st.transfer(alice, bob, 20_000)).unwrap();
    assert_eq!(bluvft_svc.balance_of(alice), 30_000);
    assert_eq!(bluvft_svc.balance_of(bob), 20_000);

    // Transfer to zero address rejected
    assert_eq!(
        with_storage_mut(|st| st.transfer(alice, ActorId::zero(), 1_000)),
        Err(Error::InvalidInput)
    );

    // Transfer exceeding balance rejected
    assert_eq!(
        with_storage_mut(|st| st.transfer(alice, bob, 30_001)),
        Err(Error::InsufficientBalance)
    );

    // Allowance & TransferFrom
    // Bob approves Charlie for 8_000
    with_storage_mut(|st| st.approve(bob, charlie, 8_000)).unwrap();
    assert_eq!(bluvft_svc.allowance(bob, charlie), 8_000);

    // Approve zero address rejected
    assert_eq!(
        with_storage_mut(|st| st.approve(bob, ActorId::zero(), 1_000)),
        Err(Error::InvalidInput)
    );

    // Charlie executes transfer_from Bob -> Dave for 5_000
    with_storage_mut(|st| st.transfer_from(charlie, bob, dave, 5_000)).unwrap();
    assert_eq!(bluvft_svc.balance_of(bob), 15_000);
    assert_eq!(bluvft_svc.balance_of(dave), 5_000);
    assert_eq!(bluvft_svc.allowance(bob, charlie), 3_000);

    // Charlie tries to transfer_from more than remaining allowance (3_001)
    assert_eq!(
        with_storage_mut(|st| st.transfer_from(charlie, bob, dave, 3_001)),
        Err(Error::InsufficientBalance)
    );

    // Transfer_from to zero address rejected
    assert_eq!(
        with_storage_mut(|st| st.transfer_from(charlie, bob, ActorId::zero(), 1_000)),
        Err(Error::InvalidInput)
    );
}

#[test]
fn test_supply_and_invariant_1() {
    let admin = ActorId::from(100);
    let alice = ActorId::from(101);
    let bob = ActorId::from(102);
    let charlie = ActorId::from(103);
    let dave = ActorId::from(104);

    setup_program(admin);

    let bluvft_svc = BluvftService::new();

    // Invariant 1 check function: Σ balances == total_supply
    let verify_invariant_1 = || {
        with_storage(|st| {
            let sum_balances: u128 = st.balances.values().copied().sum();
            assert_eq!(
                sum_balances, st.total_supply,
                "Invariant 1 violation: sum of balances {} != total_supply {}",
                sum_balances, st.total_supply
            );
        });
    };

    // 1. Initial empty state
    assert_eq!(bluvft_svc.total_supply(), 0);
    verify_invariant_1();

    // 2. Mint tokens to multiple accounts
    with_storage_mut(|st| st.mint(alice, 100_000)).unwrap();
    verify_invariant_1();

    with_storage_mut(|st| st.mint(bob, 250_000)).unwrap();
    verify_invariant_1();

    with_storage_mut(|st| st.mint(charlie, 50_000)).unwrap();
    verify_invariant_1();

    assert_eq!(bluvft_svc.total_supply(), 400_000);

    // 3. Mint to zero address rejected
    assert_eq!(
        with_storage_mut(|st| st.mint(ActorId::zero(), 10_000)),
        Err(Error::InvalidInput)
    );
    verify_invariant_1();

    // 4. Series of transfers
    with_storage_mut(|st| st.transfer(alice, bob, 20_000)).unwrap();
    verify_invariant_1();

    with_storage_mut(|st| st.transfer(bob, charlie, 70_000)).unwrap();
    verify_invariant_1();

    with_storage_mut(|st| st.transfer(charlie, dave, 30_000)).unwrap();
    verify_invariant_1();

    // 5. Approve and transfer_from
    with_storage_mut(|st| st.approve(alice, charlie, 50_000)).unwrap();
    with_storage_mut(|st| st.transfer_from(charlie, alice, dave, 40_000)).unwrap();
    verify_invariant_1();

    // 6. Internal Burn (e.g. Carbon credit retirement)
    // Burn 30_000 from Dave
    with_storage_mut(|st| st.burn(dave, 30_000)).unwrap();
    assert_eq!(bluvft_svc.balance_of(dave), 40_000);
    assert_eq!(bluvft_svc.total_supply(), 370_000);
    verify_invariant_1();

    // Burn exceeding balance rejected
    assert_eq!(
        with_storage_mut(|st| st.burn(dave, 40_001)),
        Err(Error::InsufficientBalance)
    );
    verify_invariant_1();

    // 7. Final balances check
    assert_eq!(bluvft_svc.balance_of(alice), 40_000);
    assert_eq!(bluvft_svc.balance_of(bob), 200_000);
    assert_eq!(bluvft_svc.balance_of(charlie), 90_000);
    assert_eq!(bluvft_svc.balance_of(dave), 40_000);
    assert_eq!(bluvft_svc.total_supply(), 370_000);
    assert_eq!(40_000 + 200_000 + 90_000 + 40_000, 370_000);
    verify_invariant_1();
}
