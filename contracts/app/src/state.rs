use sails_rs::{
    collections::{BTreeMap, BTreeSet},
    prelude::*,
    ActorId,
};

use crate::types::{Error, Params, Role};

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
    pub balances: BTreeMap<ActorId, u128>,
    pub allowances: BTreeMap<(ActorId, ActorId), u128>,
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
            balances: BTreeMap::new(),
            allowances: BTreeMap::new(),
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
        self.balances.insert(from, from_balance - amount);
        Ok(())
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
