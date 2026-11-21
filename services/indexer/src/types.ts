export interface ChainEventRecord {
  blockNumber: bigint;
  eventIndex: number;
  service: string;
  name: string;
  payload: Record<string, any>;
  txHash: string;
  ts: Date;
}

export type ServiceName = 'Admin' | 'Bluvft' | 'Registry' | 'Market';

export interface ProjectRegisteredPayload {
  id: number | string | bigint;
  owner: string;
  name: string;
  ecosystem: 'Mangrove' | 'Seagrass' | 'SaltMarsh';
  state_code: string;
  boundary_cid: string;
  area_ha_x100: number | string | bigint;
  beneficiaries: Array<{ who: string; share_bps: number }>;
}

export interface ProjectActivatedPayload {
  id: number | string | bigint;
}

export interface ProjectSuspendedPayload {
  id: number | string | bigint;
}

export interface ReportSubmittedPayload {
  id: number | string | bigint;
  project_id: number | string | bigint;
  submitter: string;
  period_start: number | string | bigint;
  period_end: number | string | bigint;
  data_hash: string;
  data_cid: string;
  estimated_milli_tco2e: number | string | bigint;
  methodology_version: string;
}

export interface ReportVotedPayload {
  id: number | string | bigint;
  verifier: string;
  approve: boolean;
  reason: string;
}

export interface ReportVerifiedPayload {
  id: number | string | bigint;
  project_id: number | string | bigint;
  minted: number | string | bigint;
  buffered: number | string | bigint;
}

export interface ReportRejectedPayload {
  id: number | string | bigint;
  project_id: number | string | bigint;
}

export interface ReportCancelledPayload {
  id: number | string | bigint;
  project_id: number | string | bigint;
}

export interface MintedPayload {
  to: string;
  amount: number | string | bigint;
}

export interface BurnedPayload {
  from: string;
  amount: number | string | bigint;
}

export interface TransferPayload {
  from: string;
  to: string;
  amount: number | string | bigint;
}

export interface ListingCreatedPayload {
  id: number | string | bigint;
  project_id: number | string | bigint;
  seller: string;
  amount: number | string | bigint;
  price_per_milli: number | string | bigint;
}

export interface ListingCancelledPayload {
  id: number | string | bigint;
}

export interface ListingBoughtPayload {
  id: number | string | bigint;
  buyer: string;
  amount: number | string | bigint;
  value: number | string | bigint;
}

export interface ListingRetiredPayload {
  id: number | string | bigint;
  project_id: number | string | bigint;
  retiree: string;
  amount: number | string | bigint;
  beneficiary_name: string;
  reason: string;
}

export interface RevenueClaimedPayload {
  who: string;
  amount: number | string | bigint;
  project_id?: number | string | bigint;
}
