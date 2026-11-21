use parity_scale_codec::{Decode, Encode};
use sails_rs::{prelude::*, ActorId};
use scale_info::TypeInfo;

pub type ProjectId = u64;
pub type ReportId = u64;
pub type ListingId = u64;
pub type RetirementId = u64;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Encode, Decode, TypeInfo)]
pub enum Role {
    Admin,
    Verifier,
    ProjectOwner,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum Ecosystem {
    Mangrove,
    Seagrass,
    SaltMarsh,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum ProjectStatus {
    Pending,
    Active,
    Suspended,
    Closed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum ReportStatus {
    Submitted,
    Verified,
    Rejected,
    Cancelled,
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub struct Beneficiary {
    pub who: ActorId,
    pub share_bps: u16,
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub struct Params {
    pub quorum: u8,
    pub min_orgs: u8,
    pub buffer_bps: u16,
    pub platform_fee_bps: u16,
    pub treasury: ActorId,
    pub paused: bool,
}

impl Default for Params {
    fn default() -> Self {
        Self {
            quorum: 2,
            min_orgs: 2,
            buffer_bps: 2000,      // 20%
            platform_fee_bps: 200, // 2%
            treasury: ActorId::zero(),
            paused: false,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub struct Project {
    pub id: ProjectId,
    pub owner: ActorId,
    pub name: String,
    pub ecosystem: Ecosystem,
    pub state_code: String,
    pub boundary_cid: String,
    pub area_ha_x100: u64,
    pub beneficiaries: Vec<Beneficiary>,
    pub status: ProjectStatus,
    pub total_minted: u128,
    pub total_retired: u128,
    pub buffer_held: u128,
    pub created_at: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub struct MrvReport {
    pub id: ReportId,
    pub project_id: ProjectId,
    pub submitter: ActorId,
    pub period_start: u64,
    pub period_end: u64,
    pub data_hash: [u8; 32],
    pub data_cid: String,
    pub estimated_milli_tco2e: u128,
    pub methodology_version: String,
    pub status: ReportStatus,
    pub approvals: Vec<ActorId>,
    pub rejections: Vec<ActorId>,
    pub minted: u128,
    pub buffered: u128,
    pub created_at: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub struct Listing {
    pub id: ListingId,
    pub project_id: ProjectId,
    pub seller: ActorId,
    pub remaining: u128,
    pub price_per_milli: u128,
    pub active: bool,
    pub created_at: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub struct Retirement {
    pub id: RetirementId,
    pub project_id: ProjectId,
    pub retiree: ActorId,
    pub amount: u128,
    pub beneficiary_name: String,
    pub reason: String,
    pub at: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum Error {
    Unauthorized,
    Paused,
    NotFound,
    InvalidInput,
    InvalidShares,
    ProjectNotActive,
    OverlappingPeriod,
    AlreadyVoted,
    ConflictOfInterest,
    QuorumImpossible,
    InsufficientBalance,
    InsufficientListing,
    WrongPayment,
    NothingToClaim,
    BufferDeficit,
    Overflow,
}
