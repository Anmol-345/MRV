use parity_scale_codec::{Decode, Encode};
use sails_rs::{
    gstd::{msg, service},
    prelude::*,
    ActorId,
};
use scale_info::TypeInfo;

use crate::{
    state::{with_storage, with_storage_mut},
    types::{Error, Params, Role},
};

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum AdminEvents {
    RoleGranted {
        who: ActorId,
        role: Role,
        org_id: Option<u32>,
    },
    RoleRevoked {
        who: ActorId,
        role: Role,
    },
    ParamsUpdated {
        params: Params,
    },
    Paused,
    Unpaused,
}

#[derive(Clone, Default)]
pub struct AdminService;

#[service(events = AdminEvents)]
impl AdminService {
    pub fn new() -> Self {
        Self
    }

    pub fn grant_role(
        &mut self,
        who: ActorId,
        role: Role,
        org_id: Option<u32>,
    ) -> Result<(), Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.grant_role(caller, who, role, org_id))?;
        let _ = self.notify_on(AdminEvents::RoleGranted { who, role, org_id });
        Ok(())
    }

    pub fn revoke_role(&mut self, who: ActorId, role: Role) -> Result<(), Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.revoke_role(caller, who, role))?;
        let _ = self.notify_on(AdminEvents::RoleRevoked { who, role });
        Ok(())
    }

    pub fn set_params(&mut self, params: Params) -> Result<(), Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.set_params(caller, params.clone()))?;
        let _ = self.notify_on(AdminEvents::ParamsUpdated { params });
        Ok(())
    }

    pub fn pause(&mut self) -> Result<(), Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.pause(caller))?;
        let _ = self.notify_on(AdminEvents::Paused);
        Ok(())
    }

    pub fn unpause(&mut self) -> Result<(), Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.unpause(caller))?;
        let _ = self.notify_on(AdminEvents::Unpaused);
        Ok(())
    }

    // Queries
    pub fn roles_of(&self, who: ActorId) -> Vec<Role> {
        with_storage(|st| {
            st.roles
                .get(&who)
                .map(|set| set.iter().copied().collect())
                .unwrap_or_default()
        })
    }

    pub fn is_role(&self, who: ActorId, role: Role) -> bool {
        with_storage(|st| st.has_role(&who, role))
    }

    pub fn verifier_org(&self, who: ActorId) -> Option<u32> {
        with_storage(|st| st.verifiers.get(&who).copied())
    }

    pub fn params(&self) -> Params {
        with_storage(|st| st.params.clone())
    }

    pub fn is_paused(&self) -> bool {
        with_storage(|st| st.is_paused())
    }

    pub fn verifiers(&self, offset: u32, limit: u32) -> Vec<(ActorId, u32)> {
        with_storage(|st| {
            st.verifiers
                .iter()
                .skip(offset as usize)
                .take(limit as usize)
                .map(|(&who, &org)| (who, org))
                .collect()
        })
    }
}
