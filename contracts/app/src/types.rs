use sails_rs::{
    prelude::*,
    ActorId,
};
use parity_scale_codec::{Encode, Decode};
use scale_info::TypeInfo;

pub type ProjectId = u64;
pub type ReportId = u64;
pub type ListingId = u64;
pub type RetirementId = u64;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Encode, Decode, TypeInfo)]
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
            buffer_bps: 2000,       // 20%
            platform_fee_bps: 200,   // 2%
            treasury: ActorId::zero(),
            paused: false,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
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
