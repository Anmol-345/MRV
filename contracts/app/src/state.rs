use sails_rs::{
    collections::{BTreeMap, BTreeSet},
    prelude::*,
    ActorId,
};

use crate::types::{
    Beneficiary, Ecosystem, Error, Listing, ListingId, MrvReport, Params, Project, ProjectId,
    ProjectStatus, ReportId, ReportStatus, Retirement, RetirementId, Role,
};

pub const ESCROW_ACTOR_ID: ActorId = ActorId::new([0xee; 32]);

#[derive(Debug, Clone)]
pub struct Storage {
    // Admin state
    pub admins: BTreeSet<ActorId>,
    pub roles: BTreeMap<ActorId, BTreeSet<Role>>,
    pub verifiers: BTreeMap<ActorId, u32>, // ActorId -> org_id
    pub params: Params,

    // Token state (Bluvft)
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub total_supply: u128,
    pub total_burned: u128,
    pub balances: BTreeMap<ActorId, u128>,
    pub allowances: BTreeMap<(ActorId, ActorId), u128>,

    // Registry state
    pub next_project_id: ProjectId,
    pub projects: BTreeMap<ProjectId, Project>,
    pub next_report_id: ReportId,
    pub reports: BTreeMap<ReportId, MrvReport>,

    // Market state
    pub next_listing_id: ListingId,
    pub listings: BTreeMap<ListingId, Listing>,
    pub next_retirement_id: RetirementId,
    pub retirements: BTreeMap<RetirementId, Retirement>,
    pub retirements_by_user: BTreeMap<ActorId, Vec<RetirementId>>,
    pub treasury_accrual: u128,
    pub claimable_revenue: BTreeMap<(ProjectId, ActorId), u128>,
    pub pending_revenue_dust: u128,
    pub native_vara_held: u128,
}

impl Default for Storage {
    fn default() -> Self {
        Self::new()
    }
}

impl Storage {
    pub fn new() -> Self {
        Self {
            admins: BTreeSet::new(),
            roles: BTreeMap::new(),
            verifiers: BTreeMap::new(),
            params: Params::default(),
            name: String::from("BluToken"),
            symbol: String::from("BLU"),
            decimals: 3,
            total_supply: 0,
            total_burned: 0,
            balances: BTreeMap::new(),
            allowances: BTreeMap::new(),
            next_project_id: 1,
            projects: BTreeMap::new(),
            next_report_id: 1,
            reports: BTreeMap::new(),
            next_listing_id: 1,
            listings: BTreeMap::new(),
            next_retirement_id: 1,
            retirements: BTreeMap::new(),
            retirements_by_user: BTreeMap::new(),
            treasury_accrual: 0,
            claimable_revenue: BTreeMap::new(),
            pending_revenue_dust: 0,
            native_vara_held: 0,
        }
    }

    // Role helpers
    pub fn has_role(&self, who: &ActorId, role: Role) -> bool {
        if role == Role::Admin && self.admins.contains(who) {
            return true;
        }
        self.roles
            .get(who)
            .map(|set| set.contains(&role))
            .unwrap_or(false)
    }

    pub fn is_admin(&self, who: &ActorId) -> bool {
        self.has_role(who, Role::Admin)
    }

    pub fn is_paused(&self) -> bool {
        self.params.paused
    }

    // Admin commands
    pub fn grant_role(
        &mut self,
        caller: ActorId,
        who: ActorId,
        role: Role,
        org_id: Option<u32>,
    ) -> Result<(), Error> {
        if !self.is_admin(&caller) {
            return Err(Error::Unauthorized);
        }
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if role == Role::Admin {
            self.admins.insert(who);
        }
        if role == Role::Verifier {
            if let Some(org) = org_id {
                self.verifiers.insert(who, org);
            }
        }
        self.roles.entry(who).or_default().insert(role);
        Ok(())
    }

    pub fn revoke_role(&mut self, caller: ActorId, who: ActorId, role: Role) -> Result<(), Error> {
        if !self.is_admin(&caller) {
            return Err(Error::Unauthorized);
        }
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if role == Role::Admin {
            self.admins.remove(&who);
        }
        if role == Role::Verifier {
            self.verifiers.remove(&who);
        }
        if let Some(roles) = self.roles.get_mut(&who) {
            roles.remove(&role);
        }
        Ok(())
    }

    pub fn set_params(&mut self, caller: ActorId, params: Params) -> Result<(), Error> {
        if !self.is_admin(&caller) {
            return Err(Error::Unauthorized);
        }
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if params.buffer_bps > 10_000
            || params.platform_fee_bps > 10_000
            || params.quorum < 1
            || params.min_orgs < 1
        {
            return Err(Error::InvalidInput);
        }
        self.params = params;
        Ok(())
    }

    pub fn pause(&mut self, caller: ActorId) -> Result<(), Error> {
        if !self.is_admin(&caller) {
            return Err(Error::Unauthorized);
        }
        self.params.paused = true;
        Ok(())
    }

    pub fn unpause(&mut self, caller: ActorId) -> Result<(), Error> {
        if !self.is_admin(&caller) {
            return Err(Error::Unauthorized);
        }
        self.params.paused = false;
        Ok(())
    }

    // Token operations
    pub fn balance_of(&self, account: &ActorId) -> u128 {
        self.balances.get(account).copied().unwrap_or(0)
    }

    pub fn allowance(&self, owner: &ActorId, spender: &ActorId) -> u128 {
        self.allowances
            .get(&(*owner, *spender))
            .copied()
            .unwrap_or(0)
    }

    pub fn transfer(&mut self, caller: ActorId, to: ActorId, amount: u128) -> Result<bool, Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if to == ActorId::zero() {
            return Err(Error::InvalidInput);
        }
        let from_balance = self.balance_of(&caller);
        if from_balance < amount {
            return Err(Error::InsufficientBalance);
        }

        let to_balance = self.balance_of(&to);
        let new_to_balance = to_balance.checked_add(amount).ok_or(Error::Overflow)?;

        self.balances.insert(caller, from_balance - amount);
        self.balances.insert(to, new_to_balance);
        Ok(true)
    }

    pub fn approve(
        &mut self,
        caller: ActorId,
        spender: ActorId,
        amount: u128,
    ) -> Result<bool, Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if spender == ActorId::zero() {
            return Err(Error::InvalidInput);
        }
        self.allowances.insert((caller, spender), amount);
        Ok(true)
    }

    pub fn transfer_from(
        &mut self,
        caller: ActorId,
        from: ActorId,
        to: ActorId,
        amount: u128,
    ) -> Result<bool, Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if to == ActorId::zero() {
            return Err(Error::InvalidInput);
        }
        let current_allowance = self.allowance(&from, &caller);
        if current_allowance < amount {
            return Err(Error::InsufficientBalance);
        }

        let from_balance = self.balance_of(&from);
        if from_balance < amount {
            return Err(Error::InsufficientBalance);
        }

        let to_balance = self.balance_of(&to);
        let new_to_balance = to_balance.checked_add(amount).ok_or(Error::Overflow)?;

        self.allowances
            .insert((from, caller), current_allowance - amount);
        self.balances.insert(from, from_balance - amount);
        self.balances.insert(to, new_to_balance);
        Ok(true)
    }

    // Internal mint & burn (not publicly exposed via commands)
    pub fn mint(&mut self, to: ActorId, amount: u128) -> Result<(), Error> {
        if to == ActorId::zero() {
            return Err(Error::InvalidInput);
        }
        self.total_supply = self
            .total_supply
            .checked_add(amount)
            .ok_or(Error::Overflow)?;
        let to_balance = self.balance_of(&to);
        let new_balance = to_balance.checked_add(amount).ok_or(Error::Overflow)?;
        self.balances.insert(to, new_balance);
        Ok(())
    }

    pub fn burn(&mut self, from: ActorId, amount: u128) -> Result<(), Error> {
        let from_balance = self.balance_of(&from);
        if from_balance < amount {
            return Err(Error::InsufficientBalance);
        }
        self.total_supply = self
            .total_supply
            .checked_sub(amount)
            .ok_or(Error::Overflow)?;
        self.total_burned = self
            .total_burned
            .checked_add(amount)
            .ok_or(Error::Overflow)?;
        self.balances.insert(from, from_balance - amount);
        Ok(())
    }

    // ==========================================
    // Registry Operations
    // ==========================================

    pub fn register_project(
        &mut self,
        caller: ActorId,
        name: String,
        ecosystem: Ecosystem,
        state_code: String,
        boundary_cid: String,
        area_ha_x100: u64,
        beneficiaries: Vec<Beneficiary>,
        created_at: u64,
    ) -> Result<ProjectId, Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if name.is_empty()
            || name.len() > 64
            || state_code.is_empty()
            || state_code.len() > 8
            || boundary_cid.is_empty()
            || boundary_cid.len() > 128
            || area_ha_x100 == 0
            || beneficiaries.is_empty()
            || beneficiaries.len() > 50
        {
            return Err(Error::InvalidInput);
        }

        let sum_shares: u32 = beneficiaries.iter().map(|b| b.share_bps as u32).sum();
        if sum_shares != 10_000 {
            return Err(Error::InvalidShares);
        }

        self.roles
            .entry(caller)
            .or_default()
            .insert(Role::ProjectOwner);

        let id = self.next_project_id;
        self.next_project_id += 1;

        let project = Project {
            id,
            owner: caller,
            name,
            ecosystem,
            state_code,
            boundary_cid,
            area_ha_x100,
            beneficiaries,
            status: ProjectStatus::Pending,
            total_minted: 0,
            total_retired: 0,
            buffer_held: 0,
            created_at,
        };

        self.projects.insert(id, project);
        Ok(id)
    }

    pub fn activate_project(&mut self, caller: ActorId, id: ProjectId) -> Result<(), Error> {
        if !self.is_admin(&caller) {
            return Err(Error::Unauthorized);
        }
        if self.is_paused() {
            return Err(Error::Paused);
        }
        let project = self.projects.get_mut(&id).ok_or(Error::NotFound)?;
        project.status = ProjectStatus::Active;
        Ok(())
    }

    pub fn suspend_project(&mut self, caller: ActorId, id: ProjectId) -> Result<(), Error> {
        if !self.is_admin(&caller) {
            return Err(Error::Unauthorized);
        }
        if self.is_paused() {
            return Err(Error::Paused);
        }
        let project = self.projects.get_mut(&id).ok_or(Error::NotFound)?;
        project.status = ProjectStatus::Suspended;
        Ok(())
    }

    pub fn close_project(&mut self, caller: ActorId, id: ProjectId) -> Result<(), Error> {
        if !self.is_admin(&caller) {
            return Err(Error::Unauthorized);
        }
        if self.is_paused() {
            return Err(Error::Paused);
        }
        let project = self.projects.get_mut(&id).ok_or(Error::NotFound)?;
        project.status = ProjectStatus::Closed;
        Ok(())
    }

    pub fn set_beneficiaries(
        &mut self,
        caller: ActorId,
        id: ProjectId,
        beneficiaries: Vec<Beneficiary>,
    ) -> Result<(), Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if beneficiaries.is_empty() || beneficiaries.len() > 50 {
            return Err(Error::InvalidInput);
        }
        let sum_shares: u32 = beneficiaries.iter().map(|b| b.share_bps as u32).sum();
        if sum_shares != 10_000 {
            return Err(Error::InvalidShares);
        }

        let is_admin = self.is_admin(&caller);
        let project = self.projects.get_mut(&id).ok_or(Error::NotFound)?;

        if caller != project.owner && !is_admin {
            return Err(Error::Unauthorized);
        }
        if caller == project.owner && project.total_minted > 0 && !is_admin {
            return Err(Error::Unauthorized);
        }

        project.beneficiaries = beneficiaries;
        Ok(())
    }

    pub fn submit_report(
        &mut self,
        caller: ActorId,
        project_id: ProjectId,
        period_start: u64,
        period_end: u64,
        data_hash: [u8; 32],
        data_cid: String,
        estimated_milli_tco2e: u128,
        methodology_version: String,
        created_at: u64,
    ) -> Result<ReportId, Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        let project = self.projects.get(&project_id).ok_or(Error::NotFound)?;
        if project.status != ProjectStatus::Active {
            return Err(Error::ProjectNotActive);
        }
        if caller != project.owner {
            return Err(Error::Unauthorized);
        }
        if period_start >= period_end
            || estimated_milli_tco2e == 0
            || data_cid.is_empty()
            || data_cid.len() > 128
            || methodology_version.is_empty()
            || methodology_version.len() > 32
        {
            return Err(Error::InvalidInput);
        }

        // Check non-overlapping periods with prior verified reports for this project
        for r in self.reports.values() {
            if r.project_id == project_id && r.status == ReportStatus::Verified {
                let overlaps = !(period_end <= r.period_start || period_start >= r.period_end);
                if overlaps {
                    return Err(Error::OverlappingPeriod);
                }
            }
        }

        let id = self.next_report_id;
        self.next_report_id += 1;

        let report = MrvReport {
            id,
            project_id,
            submitter: caller,
            period_start,
            period_end,
            data_hash,
            data_cid,
            estimated_milli_tco2e,
            methodology_version,
            status: ReportStatus::Submitted,
            approvals: Vec::new(),
            rejections: Vec::new(),
            minted: 0,
            buffered: 0,
            created_at,
        };

        self.reports.insert(id, report);
        Ok(id)
    }

    pub fn vote_report(
        &mut self,
        caller: ActorId,
        report_id: ReportId,
        approve: bool,
    ) -> Result<(ReportStatus, u128, u128, ActorId, ProjectId), Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if !self.has_role(&caller, Role::Verifier) || !self.verifiers.contains_key(&caller) {
            return Err(Error::Unauthorized);
        }

        let report = self.reports.get_mut(&report_id).ok_or(Error::NotFound)?;
        if report.status != ReportStatus::Submitted {
            return Err(Error::InvalidInput);
        }

        let project_id = report.project_id;
        let project = self.projects.get(&project_id).ok_or(Error::NotFound)?;

        // Conflict of interest rule: verifier cannot be owner or beneficiary
        if caller == project.owner || project.beneficiaries.iter().any(|b| b.who == caller) {
            return Err(Error::ConflictOfInterest);
        }

        // One vote per verifier
        if report.approvals.contains(&caller) || report.rejections.contains(&caller) {
            return Err(Error::AlreadyVoted);
        }

        if approve {
            report.approvals.push(caller);
        } else {
            report.rejections.push(caller);
        }

        let owner = project.owner;
        let quorum = self.params.quorum as usize;
        let min_orgs = self.params.min_orgs as usize;

        // Check distinct organizations among approvals
        let mut distinct_orgs = BTreeSet::new();
        for voter in &report.approvals {
            if let Some(&org) = self.verifiers.get(voter) {
                distinct_orgs.insert(org);
            }
        }

        if report.approvals.len() >= quorum && distinct_orgs.len() >= min_orgs {
            // Finalize & Mint
            let estimate = report.estimated_milli_tco2e;
            let buffered = estimate * (self.params.buffer_bps as u128) / 10_000;
            let minted = estimate - buffered;

            let proj = self.projects.get_mut(&project_id).unwrap();
            proj.total_minted = proj
                .total_minted
                .checked_add(minted)
                .ok_or(Error::Overflow)?;
            proj.buffer_held = proj
                .buffer_held
                .checked_add(buffered)
                .ok_or(Error::Overflow)?;

            report.status = ReportStatus::Verified;
            report.minted = minted;
            report.buffered = buffered;

            // Mint to owner
            self.mint(owner, minted)?;

            return Ok((ReportStatus::Verified, minted, buffered, owner, project_id));
        }

        // Check if quorum impossible due to rejections
        let total_verifiers = self.verifiers.len();
        if report.rejections.len() > total_verifiers.saturating_sub(quorum) {
            report.status = ReportStatus::Rejected;
            return Ok((ReportStatus::Rejected, 0, 0, owner, project_id));
        }

        Ok((ReportStatus::Submitted, 0, 0, owner, project_id))
    }

    pub fn cancel_report(&mut self, caller: ActorId, report_id: ReportId) -> Result<(), Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        let report = self.reports.get_mut(&report_id).ok_or(Error::NotFound)?;
        if caller != report.submitter {
            return Err(Error::Unauthorized);
        }
        if report.status != ReportStatus::Submitted
            || !report.approvals.is_empty()
            || !report.rejections.is_empty()
        {
            return Err(Error::InvalidInput);
        }
        report.status = ReportStatus::Cancelled;
        Ok(())
    }

    pub fn flag_reversal(
        &mut self,
        caller: ActorId,
        project_id: ProjectId,
        amount: u128,
    ) -> Result<u128, Error> {
        if !self.is_admin(&caller) {
            return Err(Error::Unauthorized);
        }
        if self.is_paused() {
            return Err(Error::Paused);
        }
        let project = self.projects.get_mut(&project_id).ok_or(Error::NotFound)?;
        let deficit = if project.buffer_held >= amount {
            project.buffer_held -= amount;
            0
        } else {
            let d = amount - project.buffer_held;
            project.buffer_held = 0;
            d
        };
        Ok(deficit)
    }

    // ==========================================
    // Market Operations
    // ==========================================

    pub fn create_listing(
        &mut self,
        caller: ActorId,
        project_id: ProjectId,
        amount: u128,
        price_per_milli: u128,
        created_at: u64,
    ) -> Result<ListingId, Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if amount == 0 || price_per_milli == 0 {
            return Err(Error::InvalidInput);
        }
        let project = self.projects.get(&project_id).ok_or(Error::NotFound)?;
        if project.status != ProjectStatus::Active {
            return Err(Error::ProjectNotActive);
        }

        // Move tokens from seller to ESCROW_ACTOR_ID
        self.transfer(caller, ESCROW_ACTOR_ID, amount)?;

        let id = self.next_listing_id;
        self.next_listing_id += 1;

        let listing = Listing {
            id,
            project_id,
            seller: caller,
            remaining: amount,
            price_per_milli,
            active: true,
            created_at,
        };

        self.listings.insert(id, listing);
        Ok(id)
    }

    pub fn cancel_listing(&mut self, caller: ActorId, id: ListingId) -> Result<u128, Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        let listing = self.listings.get_mut(&id).ok_or(Error::NotFound)?;
        if !listing.active || listing.remaining == 0 {
            return Err(Error::InvalidInput);
        }
        if caller != listing.seller {
            return Err(Error::Unauthorized);
        }

        let remaining = listing.remaining;
        listing.active = false;
        listing.remaining = 0;

        // Return escrow tokens to seller
        self.transfer(ESCROW_ACTOR_ID, caller, remaining)?;
        Ok(remaining)
    }

    pub fn settle_value(&mut self, project_id: ProjectId, value: u128) -> Result<(), Error> {
        let fee = value * (self.params.platform_fee_bps as u128) / 10_000;
        self.treasury_accrual = self
            .treasury_accrual
            .checked_add(fee)
            .ok_or(Error::Overflow)?;
        let net = value - fee;

        self.native_vara_held = self
            .native_vara_held
            .checked_add(value)
            .ok_or(Error::Overflow)?;

        let project = self.projects.get(&project_id).ok_or(Error::NotFound)?;
        let mut distributed = 0u128;

        for b in &project.beneficiaries {
            let share = net * (b.share_bps as u128) / 10_000;
            distributed = distributed.checked_add(share).ok_or(Error::Overflow)?;
            let entry = self
                .claimable_revenue
                .entry((project_id, b.who))
                .or_default();
            *entry = entry.checked_add(share).ok_or(Error::Overflow)?;
        }

        // Integer-division dust stays in pool
        let dust = net - distributed;
        self.pending_revenue_dust = self
            .pending_revenue_dust
            .checked_add(dust)
            .ok_or(Error::Overflow)?;

        Ok(())
    }

    pub fn buy(
        &mut self,
        caller: ActorId,
        listing_id: ListingId,
        amount: u128,
        msg_value: u128,
    ) -> Result<(u128, ProjectId), Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if amount == 0 {
            return Err(Error::InvalidInput);
        }
        let listing = self.listings.get_mut(&listing_id).ok_or(Error::NotFound)?;
        if !listing.active || listing.remaining < amount {
            return Err(Error::InsufficientListing);
        }

        let expected_value = amount
            .checked_mul(listing.price_per_milli)
            .ok_or(Error::Overflow)?;
        if msg_value != expected_value {
            return Err(Error::WrongPayment);
        }

        listing.remaining -= amount;
        if listing.remaining == 0 {
            listing.active = false;
        }

        let project_id = listing.project_id;

        // Move tokens from escrow to buyer
        self.transfer(ESCROW_ACTOR_ID, caller, amount)?;

        // Settle payment revenue
        self.settle_value(project_id, expected_value)?;

        Ok((expected_value, project_id))
    }

    pub fn buy_and_retire(
        &mut self,
        caller: ActorId,
        listing_id: ListingId,
        amount: u128,
        msg_value: u128,
        beneficiary_name: String,
        reason: String,
        timestamp: u64,
    ) -> Result<(u128, RetirementId, ProjectId), Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if amount == 0 || beneficiary_name.len() > 96 || reason.len() > 256 {
            return Err(Error::InvalidInput);
        }
        let listing = self.listings.get_mut(&listing_id).ok_or(Error::NotFound)?;
        if !listing.active || listing.remaining < amount {
            return Err(Error::InsufficientListing);
        }

        let expected_value = amount
            .checked_mul(listing.price_per_milli)
            .ok_or(Error::Overflow)?;
        if msg_value != expected_value {
            return Err(Error::WrongPayment);
        }

        listing.remaining -= amount;
        if listing.remaining == 0 {
            listing.active = false;
        }

        let project_id = listing.project_id;

        // Burn tokens directly from escrow
        self.burn(ESCROW_ACTOR_ID, amount)?;

        let project = self.projects.get_mut(&project_id).ok_or(Error::NotFound)?;
        project.total_retired = project
            .total_retired
            .checked_add(amount)
            .ok_or(Error::Overflow)?;

        let ret_id = self.next_retirement_id;
        self.next_retirement_id += 1;

        let retirement = Retirement {
            id: ret_id,
            project_id,
            retiree: caller,
            amount,
            beneficiary_name,
            reason,
            at: timestamp,
        };

        self.retirements.insert(ret_id, retirement);
        self.retirements_by_user
            .entry(caller)
            .or_default()
            .push(ret_id);

        // Settle value
        self.settle_value(project_id, expected_value)?;

        Ok((expected_value, ret_id, project_id))
    }

    pub fn retire(
        &mut self,
        caller: ActorId,
        project_id: ProjectId,
        amount: u128,
        beneficiary_name: String,
        reason: String,
        timestamp: u64,
    ) -> Result<RetirementId, Error> {
        if self.is_paused() {
            return Err(Error::Paused);
        }
        if amount == 0 || beneficiary_name.len() > 96 || reason.len() > 256 {
            return Err(Error::InvalidInput);
        }
        {
            let project = self.projects.get(&project_id).ok_or(Error::NotFound)?;
            // Accounting guard: project.total_minted - project.total_retired >= amount
            if project.total_minted.saturating_sub(project.total_retired) < amount {
                return Err(Error::InsufficientBalance);
            }
        }

        // Burn from caller's balance
        self.burn(caller, amount)?;

        let project = self.projects.get_mut(&project_id).ok_or(Error::NotFound)?;
        project.total_retired = project
            .total_retired
            .checked_add(amount)
            .ok_or(Error::Overflow)?;

        let ret_id = self.next_retirement_id;
        self.next_retirement_id += 1;

        let retirement = Retirement {
            id: ret_id,
            project_id,
            retiree: caller,
            amount,
            beneficiary_name,
            reason,
            at: timestamp,
        };

        self.retirements.insert(ret_id, retirement);
        self.retirements_by_user
            .entry(caller)
            .or_default()
            .push(ret_id);

        Ok(ret_id)
    }

    pub fn claim_revenue(&mut self, caller: ActorId, project_id: ProjectId) -> Result<u128, Error> {
        // PULL-PAYMENT CLAIMS SUCCEED EVEN WHEN PAUSED!
        let amount = self
            .claimable_revenue
            .get(&(project_id, caller))
            .copied()
            .unwrap_or(0);

        if amount == 0 {
            return Err(Error::NothingToClaim);
        }

        // State updated BEFORE transfer!
        self.claimable_revenue.insert((project_id, caller), 0);
        self.native_vara_held = self.native_vara_held.saturating_sub(amount);

        Ok(amount)
    }

    // Registry queries
    pub fn project(&self, id: ProjectId) -> Option<Project> {
        self.projects.get(&id).cloned()
    }

    pub fn projects(&self, offset: u32, limit: u32, filter: Option<ProjectStatus>) -> Vec<Project> {
        self.projects
            .values()
            .filter(|p| filter.is_none_or(|f| p.status == f))
            .skip(offset as usize)
            .take(limit as usize)
            .cloned()
            .collect()
    }

    pub fn report(&self, id: ReportId) -> Option<MrvReport> {
        self.reports.get(&id).cloned()
    }

    pub fn reports_by_project(
        &self,
        project_id: ProjectId,
        offset: u32,
        limit: u32,
    ) -> Vec<MrvReport> {
        self.reports
            .values()
            .filter(|r| r.project_id == project_id)
            .skip(offset as usize)
            .take(limit as usize)
            .cloned()
            .collect()
    }

    pub fn pending_reports(&self, offset: u32, limit: u32) -> Vec<MrvReport> {
        self.reports
            .values()
            .filter(|r| r.status == ReportStatus::Submitted)
            .skip(offset as usize)
            .take(limit as usize)
            .cloned()
            .collect()
    }

    // Market queries
    pub fn listing(&self, id: ListingId) -> Option<Listing> {
        self.listings.get(&id).cloned()
    }

    pub fn listings(&self, offset: u32, limit: u32, filter: Option<bool>) -> Vec<Listing> {
        self.listings
            .values()
            .filter(|l| filter.is_none_or(|active| l.active == active))
            .skip(offset as usize)
            .take(limit as usize)
            .cloned()
            .collect()
    }

    pub fn retirement(&self, id: RetirementId) -> Option<Retirement> {
        self.retirements.get(&id).cloned()
    }

    pub fn retirements_by(&self, who: ActorId, offset: u32, limit: u32) -> Vec<Retirement> {
        if let Some(ids) = self.retirements_by_user.get(&who) {
            ids.iter()
                .skip(offset as usize)
                .take(limit as usize)
                .filter_map(|id| self.retirements.get(id).cloned())
                .collect()
        } else {
            Vec::new()
        }
    }

    pub fn claimable(&self, project_id: ProjectId, who: ActorId) -> u128 {
        self.claimable_revenue
            .get(&(project_id, who))
            .copied()
            .unwrap_or(0)
    }

    pub fn native_vara_held(&self) -> u128 {
        self.native_vara_held
    }

    pub fn treasury_accrual(&self) -> u128 {
        self.treasury_accrual
    }

    pub fn pending_revenue_dust(&self) -> u128 {
        self.pending_revenue_dust
    }
}

// Thread-local storage for native host/test execution
#[cfg(not(target_arch = "wasm32"))]
std::thread_local! {
    static STORAGE: core::cell::RefCell<Option<Storage>> = const { core::cell::RefCell::new(None) };
}

#[cfg(not(target_arch = "wasm32"))]
pub fn with_storage<R>(f: impl FnOnce(&Storage) -> R) -> R {
    STORAGE.with(|cell| {
        let mut guard = cell.borrow_mut();
        if guard.is_none() {
            *guard = Some(Storage::new());
        }
        f(guard.as_ref().unwrap())
    })
}

#[cfg(not(target_arch = "wasm32"))]
pub fn with_storage_mut<R>(f: impl FnOnce(&mut Storage) -> R) -> R {
    STORAGE.with(|cell| {
        let mut guard = cell.borrow_mut();
        if guard.is_none() {
            *guard = Some(Storage::new());
        }
        f(guard.as_mut().unwrap())
    })
}

#[cfg(not(target_arch = "wasm32"))]
pub fn reset_storage() {
    STORAGE.with(|cell| {
        *cell.borrow_mut() = Some(Storage::new());
    });
}

// Single-threaded spin-mutex storage for wasm32 deployment
#[cfg(target_arch = "wasm32")]
static STORAGE: sails_rs::spin::Mutex<Option<Storage>> = sails_rs::spin::Mutex::new(None);

#[cfg(target_arch = "wasm32")]
pub fn with_storage<R>(f: impl FnOnce(&Storage) -> R) -> R {
    let mut guard = STORAGE.lock();
    if guard.is_none() {
        *guard = Some(Storage::new());
    }
    f(guard.as_ref().unwrap())
}

#[cfg(target_arch = "wasm32")]
pub fn with_storage_mut<R>(f: impl FnOnce(&mut Storage) -> R) -> R {
    let mut guard = STORAGE.lock();
    if guard.is_none() {
        *guard = Some(Storage::new());
    }
    f(guard.as_mut().unwrap())
}

#[cfg(target_arch = "wasm32")]
pub fn reset_storage() {
    *STORAGE.lock() = Some(Storage::new());
}
