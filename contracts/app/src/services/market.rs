use parity_scale_codec::{Decode, Encode};
use sails_rs::{
    gstd::{exec, msg, service},
    prelude::*,
    ActorId,
};
use scale_info::TypeInfo;

use crate::{
    state::{with_storage, with_storage_mut},
    types::{Error, Listing, ListingId, ProjectId, Retirement, RetirementId},
};

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum MarketEvents {
    ListingCreated {
        id: ListingId,
        project_id: ProjectId,
        seller: ActorId,
        amount: u128,
        price_per_milli: u128,
    },
    ListingCancelled {
        id: ListingId,
    },
    ListingFilled {
        id: ListingId,
        buyer: ActorId,
        amount: u128,
        total_paid: u128,
    },
    RevenueAccrued {
        project_id: ProjectId,
        value: u128,
    },
    Retired {
        id: RetirementId,
        project_id: ProjectId,
        retiree: ActorId,
        amount: u128,
        beneficiary_name: String,
        reason: String,
    },
    RevenueClaimed {
        project_id: ProjectId,
        who: ActorId,
        amount: u128,
    },
}

#[derive(Clone, Default)]
pub struct MarketService;

#[service(events = MarketEvents)]
impl MarketService {
    pub fn new() -> Self {
        Self
    }

    pub fn create_listing(
        &mut self,
        project_id: ProjectId,
        amount: u128,
        price_per_milli: u128,
    ) -> Result<ListingId, Error> {
        let caller = msg::source();
        let timestamp = exec::block_timestamp();
        let id = with_storage_mut(|st| {
            st.create_listing(caller, project_id, amount, price_per_milli, timestamp)
        })?;

        let _ = self.notify_on(MarketEvents::ListingCreated {
            id,
            project_id,
            seller: caller,
            amount,
            price_per_milli,
        });

        Ok(id)
    }

    pub fn cancel_listing(&mut self, id: ListingId) -> Result<(), Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.cancel_listing(caller, id))?;
        let _ = self.notify_on(MarketEvents::ListingCancelled { id });
        Ok(())
    }

    pub fn buy(&mut self, listing_id: ListingId, amount: u128) -> Result<(), Error> {
        let caller = msg::source();
        let msg_value = msg::value();
        let (total_paid, project_id) =
            with_storage_mut(|st| st.buy(caller, listing_id, amount, msg_value))?;

        let _ = self.notify_on(MarketEvents::ListingFilled {
            id: listing_id,
            buyer: caller,
            amount,
            total_paid,
        });

        let _ = self.notify_on(MarketEvents::RevenueAccrued {
            project_id,
            value: total_paid,
        });

        Ok(())
    }

    pub fn buy_and_retire(
        &mut self,
        listing_id: ListingId,
        amount: u128,
        beneficiary_name: String,
        reason: String,
    ) -> Result<RetirementId, Error> {
        let caller = msg::source();
        let msg_value = msg::value();
        let timestamp = exec::block_timestamp();
        let (total_paid, ret_id, project_id) = with_storage_mut(|st| {
            st.buy_and_retire(
                caller,
                listing_id,
                amount,
                msg_value,
                beneficiary_name.clone(),
                reason.clone(),
                timestamp,
            )
        })?;

        let _ = self.notify_on(MarketEvents::ListingFilled {
            id: listing_id,
            buyer: caller,
            amount,
            total_paid,
        });

        let _ = self.notify_on(MarketEvents::RevenueAccrued {
            project_id,
            value: total_paid,
        });

        let _ = self.notify_on(MarketEvents::Retired {
            id: ret_id,
            project_id,
            retiree: caller,
            amount,
            beneficiary_name,
            reason,
        });

        Ok(ret_id)
    }

    pub fn retire(
        &mut self,
        project_id: ProjectId,
        amount: u128,
        beneficiary_name: String,
        reason: String,
    ) -> Result<RetirementId, Error> {
        let caller = msg::source();
        let timestamp = exec::block_timestamp();
        let ret_id = with_storage_mut(|st| {
            st.retire(
                caller,
                project_id,
                amount,
                beneficiary_name.clone(),
                reason.clone(),
                timestamp,
            )
        })?;

        let _ = self.notify_on(MarketEvents::Retired {
            id: ret_id,
            project_id,
            retiree: caller,
            amount,
            beneficiary_name,
            reason,
        });

        Ok(ret_id)
    }

    pub fn claim_revenue(&mut self, project_id: ProjectId) -> Result<u128, Error> {
        let caller = msg::source();
        let amount = with_storage_mut(|st| st.claim_revenue(caller, project_id))?;

        // Pull-payment: state updated BEFORE transfer!
        let _ = msg::send_bytes(caller, [], amount);

        let _ = self.notify_on(MarketEvents::RevenueClaimed {
            project_id,
            who: caller,
            amount,
        });

        Ok(amount)
    }

    // Queries
    pub fn listing(&self, id: ListingId) -> Option<Listing> {
        with_storage(|st| st.listing(id))
    }

    pub fn listings(&self, offset: u32, limit: u32, filter: Option<bool>) -> Vec<Listing> {
        with_storage(|st| st.listings(offset, limit, filter))
    }

    pub fn retirement(&self, id: RetirementId) -> Option<Retirement> {
        with_storage(|st| st.retirement(id))
    }

    pub fn retirements_by(&self, who: ActorId, offset: u32, limit: u32) -> Vec<Retirement> {
        with_storage(|st| st.retirements_by(who, offset, limit))
    }

    pub fn claimable(&self, project_id: ProjectId, who: ActorId) -> u128 {
        with_storage(|st| st.claimable(project_id, who))
    }

    pub fn native_vara_held(&self) -> u128 {
        with_storage(|st| st.native_vara_held())
    }

    pub fn treasury_accrual(&self) -> u128 {
        with_storage(|st| st.treasury_accrual())
    }

    pub fn pending_revenue_dust(&self) -> u128 {
        with_storage(|st| st.pending_revenue_dust())
    }
}
