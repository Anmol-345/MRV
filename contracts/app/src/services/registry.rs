use parity_scale_codec::{Decode, Encode};
use sails_rs::{
    gstd::{exec, msg, service},
    prelude::*,
    ActorId,
};
use scale_info::TypeInfo;

use crate::{
    state::{with_storage, with_storage_mut},
    types::{
        Beneficiary, Ecosystem, Error, MrvReport, Project, ProjectId, ProjectStatus, ReportId,
        ReportStatus,
    },
};

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum RegistryEvents {
    ProjectRegistered {
        id: ProjectId,
        owner: ActorId,
        name: String,
        ecosystem: Ecosystem,
        state_code: String,
        boundary_cid: String,
        area_ha_x100: u64,
        beneficiaries: Vec<Beneficiary>,
    },
    ProjectStatusChanged {
        id: ProjectId,
        status: ProjectStatus,
    },
    BeneficiariesSet {
        id: ProjectId,
        beneficiaries: Vec<Beneficiary>,
    },
    ReportSubmitted {
        id: ReportId,
        project_id: ProjectId,
        submitter: ActorId,
        period_start: u64,
        period_end: u64,
        data_hash: [u8; 32],
        data_cid: String,
        estimated_milli_tco2e: u128,
        methodology_version: String,
    },
    ReportVoted {
        report_id: ReportId,
        voter: ActorId,
        approve: bool,
        note_hash: Option<[u8; 32]>,
    },
    ReportVerified {
        report_id: ReportId,
        project_id: ProjectId,
        minted: u128,
        buffered: u128,
    },
    ReportRejected {
        report_id: ReportId,
        project_id: ProjectId,
    },
    ReportCancelled {
        report_id: ReportId,
    },
    ReversalFlagged {
        project_id: ProjectId,
        amount: u128,
        deficit: u128,
        evidence_cid: String,
    },
}

#[derive(Clone, Default)]
pub struct RegistryService;

#[service(events = RegistryEvents)]
impl RegistryService {
    pub fn new() -> Self {
        Self
    }

    pub fn register_project(
        &mut self,
        name: String,
        ecosystem: Ecosystem,
        state_code: String,
        boundary_cid: String,
        area_ha_x100: u64,
        beneficiaries: Vec<Beneficiary>,
    ) -> Result<ProjectId, Error> {
        let caller = msg::source();
        let timestamp = exec::block_timestamp();
        let id = with_storage_mut(|st| {
            st.register_project(
                caller,
                name.clone(),
                ecosystem,
                state_code.clone(),
                boundary_cid.clone(),
                area_ha_x100,
                beneficiaries.clone(),
                timestamp,
            )
        })?;

        let _ = self.notify_on(RegistryEvents::ProjectRegistered {
            id,
            owner: caller,
            name,
            ecosystem,
            state_code,
            boundary_cid,
            area_ha_x100,
            beneficiaries,
        });

        Ok(id)
    }

    pub fn activate_project(&mut self, id: ProjectId) -> Result<(), Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.activate_project(caller, id))?;
        let _ = self.notify_on(RegistryEvents::ProjectStatusChanged {
            id,
            status: ProjectStatus::Active,
        });
        Ok(())
    }

    pub fn suspend_project(&mut self, id: ProjectId) -> Result<(), Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.suspend_project(caller, id))?;
        let _ = self.notify_on(RegistryEvents::ProjectStatusChanged {
            id,
            status: ProjectStatus::Suspended,
        });
        Ok(())
    }

    pub fn close_project(&mut self, id: ProjectId) -> Result<(), Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.close_project(caller, id))?;
        let _ = self.notify_on(RegistryEvents::ProjectStatusChanged {
            id,
            status: ProjectStatus::Closed,
        });
        Ok(())
    }

    pub fn set_beneficiaries(
        &mut self,
        id: ProjectId,
        beneficiaries: Vec<Beneficiary>,
    ) -> Result<(), Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.set_beneficiaries(caller, id, beneficiaries.clone()))?;
        let _ = self.notify_on(RegistryEvents::BeneficiariesSet { id, beneficiaries });
        Ok(())
    }

    pub fn submit_report(
        &mut self,
        project_id: ProjectId,
        period_start: u64,
        period_end: u64,
        data_hash: [u8; 32],
        data_cid: String,
        estimated_milli_tco2e: u128,
        methodology_version: String,
    ) -> Result<ReportId, Error> {
        let caller = msg::source();
        let timestamp = exec::block_timestamp();
        let id = with_storage_mut(|st| {
            st.submit_report(
                caller,
                project_id,
                period_start,
                period_end,
                data_hash,
                data_cid.clone(),
                estimated_milli_tco2e,
                methodology_version.clone(),
                timestamp,
            )
        })?;

        let _ = self.notify_on(RegistryEvents::ReportSubmitted {
            id,
            project_id,
            submitter: caller,
            period_start,
            period_end,
            data_hash,
            data_cid,
            estimated_milli_tco2e,
            methodology_version,
        });

        Ok(id)
    }

    pub fn vote_report(
        &mut self,
        report_id: ReportId,
        approve: bool,
        note_hash: Option<[u8; 32]>,
    ) -> Result<(), Error> {
        let caller = msg::source();
        let (status, minted, buffered, _owner, project_id) =
            with_storage_mut(|st| st.vote_report(caller, report_id, approve))?;

        let _ = self.notify_on(RegistryEvents::ReportVoted {
            report_id,
            voter: caller,
            approve,
            note_hash,
        });

        if status == ReportStatus::Verified {
            let _ = self.notify_on(RegistryEvents::ReportVerified {
                report_id,
                project_id,
                minted,
                buffered,
            });
        } else if status == ReportStatus::Rejected {
            let _ = self.notify_on(RegistryEvents::ReportRejected {
                report_id,
                project_id,
            });
        }

        Ok(())
    }

    pub fn cancel_report(&mut self, report_id: ReportId) -> Result<(), Error> {
        let caller = msg::source();
        with_storage_mut(|st| st.cancel_report(caller, report_id))?;
        let _ = self.notify_on(RegistryEvents::ReportCancelled { report_id });
        Ok(())
    }

    pub fn flag_reversal(
        &mut self,
        project_id: ProjectId,
        amount: u128,
        evidence_cid: String,
    ) -> Result<u128, Error> {
        let caller = msg::source();
        let deficit = with_storage_mut(|st| st.flag_reversal(caller, project_id, amount))?;
        let _ = self.notify_on(RegistryEvents::ReversalFlagged {
            project_id,
            amount,
            deficit,
            evidence_cid,
        });
        Ok(deficit)
    }

    // Queries
    pub fn project(&self, id: ProjectId) -> Option<Project> {
        with_storage(|st| st.project(id))
    }

    pub fn projects(&self, offset: u32, limit: u32, filter: Option<ProjectStatus>) -> Vec<Project> {
        with_storage(|st| st.projects(offset, limit, filter))
    }

    pub fn report(&self, id: ReportId) -> Option<MrvReport> {
        with_storage(|st| st.report(id))
    }

    pub fn reports_by_project(
        &self,
        project_id: ProjectId,
        offset: u32,
        limit: u32,
    ) -> Vec<MrvReport> {
        with_storage(|st| st.reports_by_project(project_id, offset, limit))
    }

    pub fn pending_reports(&self, offset: u32, limit: u32) -> Vec<MrvReport> {
        with_storage(|st| st.pending_reports(offset, limit))
    }
}
