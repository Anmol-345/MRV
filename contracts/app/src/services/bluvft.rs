use parity_scale_codec::{Decode, Encode};
use sails_rs::{
    gstd::{msg, service},
    prelude::*,
    ActorId,
};
use scale_info::TypeInfo;

use crate::{
    state::{with_storage, with_storage_mut},
    types::Error,
};

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum BluvftEvents {
    Transfer {
        from: ActorId,
        to: ActorId,
        amount: u128,
    },
    Approval {
        owner: ActorId,
        spender: ActorId,
        amount: u128,
    },
    Minted {
        to: ActorId,
        amount: u128,
    },
    Burned {
        from: ActorId,
        amount: u128,
    },
}

#[derive(Clone, Default)]
pub struct BluvftService;

#[service(events = BluvftEvents)]
impl BluvftService {
    pub fn new() -> Self {
        Self
    }

    // Metadata queries
    pub fn name(&self) -> String {
        with_storage(|st| st.name.clone())
    }

    pub fn symbol(&self) -> String {
        with_storage(|st| st.symbol.clone())
    }

    pub fn decimals(&self) -> u8 {
        with_storage(|st| st.decimals)
    }

    pub fn total_supply(&self) -> u128 {
        with_storage(|st| st.total_supply)
    }

    pub fn balance_of(&self, account: ActorId) -> u128 {
        with_storage(|st| st.balance_of(&account))
    }

    pub fn allowance(&self, owner: ActorId, spender: ActorId) -> u128 {
        with_storage(|st| st.allowance(&owner, &spender))
    }

    // Commands
    pub fn transfer(&mut self, to: ActorId, amount: u128) -> Result<bool, Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.transfer(caller, to, amount))?;
        let _ = self.notify_on(BluvftEvents::Transfer {
            from: caller,
            to,
            amount,
        });
        Ok(true)
    }

    pub fn approve(&mut self, spender: ActorId, amount: u128) -> Result<bool, Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.approve(caller, spender, amount))?;
        let _ = self.notify_on(BluvftEvents::Approval {
            owner: caller,
            spender,
            amount,
        });
        Ok(true)
    }

    pub fn transfer_from(
        &mut self,
        from: ActorId,
        to: ActorId,
        amount: u128,
    ) -> Result<bool, Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.transfer_from(caller, from, to, amount))?;
        let _ = self.notify_on(BluvftEvents::Transfer { from, to, amount });
        Ok(true)
    }
}
