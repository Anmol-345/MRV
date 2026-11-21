#![no_std]
#![allow(clippy::missing_const_for_thread_local, clippy::too_many_arguments)]

#[cfg(not(target_arch = "wasm32"))]
extern crate std;

pub mod services;
pub mod state;
pub mod types;

use sails_rs::{prelude::*, ActorId};
use services::{AdminService, BluvftService, MarketService, RegistryService};
use state::{reset_storage, with_storage_mut};
use types::Role;

#[derive(Default)]
pub struct BluTokenProgram;

#[sails_rs::program]
impl BluTokenProgram {
    pub fn new() -> Self {
        reset_storage();
        let caller = sails_rs::gstd::msg::source();
        with_storage_mut(|st| {
            st.admins.insert(caller);
            st.roles.entry(caller).or_default().insert(Role::Admin);
        });
        Self
    }

    pub fn with_admin(admin: ActorId) -> Self {
        reset_storage();
        with_storage_mut(|st| {
            st.admins.insert(admin);
            st.roles.entry(admin).or_default().insert(Role::Admin);
        });
        Self
    }

    pub fn admin(&self) -> AdminService {
        AdminService::new()
    }

    pub fn bluvft(&self) -> BluvftService {
        BluvftService::new()
    }

    pub fn registry(&self) -> RegistryService {
        RegistryService::new()
    }

    pub fn market(&self) -> MarketService {
        MarketService::new()
    }
}
