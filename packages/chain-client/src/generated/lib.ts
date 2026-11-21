/* eslint-disable */

import { ActorId, TransactionBuilder, QueryBuilder, getServiceNamePrefix, getFnNamePrefix, ZERO_ADDRESS } from 'sails-js';
import { GearApi, BaseGearProgram } from '@gear-js/api';
export type HexString = `0x${string}`;
import { TypeRegistry } from '@polkadot/types';

export type Role = "Admin" | "Verifier" | "ProjectOwner";

export type Error = "Unauthorized" | "Paused" | "NotFound" | "InvalidInput" | "InvalidShares" | "ProjectNotActive" | "OverlappingPeriod" | "AlreadyVoted" | "ConflictOfInterest" | "QuorumImpossible" | "InsufficientBalance" | "InsufficientListing" | "WrongPayment" | "NothingToClaim" | "BufferDeficit" | "Overflow";

export interface Params {
  quorum: number;
  min_orgs: number;
  buffer_bps: number;
  platform_fee_bps: number;
  treasury: ActorId;
  paused: boolean;
}

export interface Listing {
  id: number | string | bigint;
  project_id: number | string | bigint;
  seller: ActorId;
  remaining: number | string | bigint;
  price_per_milli: number | string | bigint;
  active: boolean;
  created_at: number | string | bigint;
}

export interface Retirement {
  id: number | string | bigint;
  project_id: number | string | bigint;
  retiree: ActorId;
  amount: number | string | bigint;
  beneficiary_name: string;
  reason: string;
  at: number | string | bigint;
}

export type Ecosystem = "Mangrove" | "Seagrass" | "SaltMarsh";

export interface Beneficiary {
  who: ActorId;
  share_bps: number;
}

export interface MrvReport {
  id: number | string | bigint;
  project_id: number | string | bigint;
  submitter: ActorId;
  period_start: number | string | bigint;
  period_end: number | string | bigint;
  data_hash: Array<number>;
  data_cid: string;
  estimated_milli_tco2e: number | string | bigint;
  methodology_version: string;
  status: ReportStatus;
  approvals: Array<ActorId>;
  rejections: Array<ActorId>;
  minted: number | string | bigint;
  buffered: number | string | bigint;
  created_at: number | string | bigint;
}

export type ReportStatus = "Submitted" | "Verified" | "Rejected" | "Cancelled";

export interface Project {
  id: number | string | bigint;
  owner: ActorId;
  name: string;
  ecosystem: Ecosystem;
  state_code: string;
  boundary_cid: string;
  area_ha_x100: number | string | bigint;
  beneficiaries: Array<Beneficiary>;
  status: ProjectStatus;
  total_minted: number | string | bigint;
  total_retired: number | string | bigint;
  buffer_held: number | string | bigint;
  created_at: number | string | bigint;
}

export type ProjectStatus = "Pending" | "Active" | "Suspended" | "Closed";

export class BluToken {
  public readonly typeRegistry: TypeRegistry;
  public readonly admin: Admin;
  public readonly bluvft: Bluvft;
  public readonly market: Market;
  public readonly registry: Registry;
  private _program?: BaseGearProgram;

  constructor(public api: GearApi, programId?: `0x${string}`) {
    const types: Record<string, any> = {
      Role: {"_enum":["Admin","Verifier","ProjectOwner"]},
      Error: {"_enum":["Unauthorized","Paused","NotFound","InvalidInput","InvalidShares","ProjectNotActive","OverlappingPeriod","AlreadyVoted","ConflictOfInterest","QuorumImpossible","InsufficientBalance","InsufficientListing","WrongPayment","NothingToClaim","BufferDeficit","Overflow"]},
      Params: {"quorum":"u8","min_orgs":"u8","buffer_bps":"u16","platform_fee_bps":"u16","treasury":"[u8;32]","paused":"bool"},
      Listing: {"id":"u64","project_id":"u64","seller":"[u8;32]","remaining":"u128","price_per_milli":"u128","active":"bool","created_at":"u64"},
      Retirement: {"id":"u64","project_id":"u64","retiree":"[u8;32]","amount":"u128","beneficiary_name":"String","reason":"String","at":"u64"},
      Ecosystem: {"_enum":["Mangrove","Seagrass","SaltMarsh"]},
      Beneficiary: {"who":"[u8;32]","share_bps":"u16"},
      MrvReport: {"id":"u64","project_id":"u64","submitter":"[u8;32]","period_start":"u64","period_end":"u64","data_hash":"[u8; 32]","data_cid":"String","estimated_milli_tco2e":"u128","methodology_version":"String","status":"ReportStatus","approvals":"Vec<[u8;32]>","rejections":"Vec<[u8;32]>","minted":"u128","buffered":"u128","created_at":"u64"},
      ReportStatus: {"_enum":["Submitted","Verified","Rejected","Cancelled"]},
      Project: {"id":"u64","owner":"[u8;32]","name":"String","ecosystem":"Ecosystem","state_code":"String","boundary_cid":"String","area_ha_x100":"u64","beneficiaries":"Vec<Beneficiary>","status":"ProjectStatus","total_minted":"u128","total_retired":"u128","buffer_held":"u128","created_at":"u64"},
      ProjectStatus: {"_enum":["Pending","Active","Suspended","Closed"]},
    }

    this.typeRegistry = new TypeRegistry();
    this.typeRegistry.setKnownTypes({ types });
    this.typeRegistry.register(types);
    if (programId) {
      this._program = new BaseGearProgram(programId, api);
    }

    this.admin = new Admin(this);
    this.bluvft = new Bluvft(this);
    this.market = new Market(this);
    this.registry = new Registry(this);
  }

  public get programId(): `0x${string}` {
    if (!this._program) throw new Error(`Program ID is not set`);
    return this._program.id;
  }

  newCtorFromCode(code: Uint8Array | Buffer | HexString): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.typeRegistry,
      'upload_program',
      null,
      'New',
      null,
      null,
      'String',
      code,
      async (programId) =>  {
        this._program = await BaseGearProgram.new(programId, this.api);
      }
    );
    return builder;
  }

  newCtorFromCodeId(codeId: `0x${string}`) {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.typeRegistry,
      'create_program',
      null,
      'New',
      null,
      null,
      'String',
      codeId,
      async (programId) =>  {
        this._program = await BaseGearProgram.new(programId, this.api);
      }
    );
    return builder;
  }
  withAdminCtorFromCode(code: Uint8Array | Buffer | HexString, admin: ActorId): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.typeRegistry,
      'upload_program',
      null,
      'WithAdmin',
      admin,
      '[u8;32]',
      'String',
      code,
      async (programId) =>  {
        this._program = await BaseGearProgram.new(programId, this.api);
      }
    );
    return builder;
  }

  withAdminCtorFromCodeId(codeId: `0x${string}`, admin: ActorId) {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.typeRegistry,
      'create_program',
      null,
      'WithAdmin',
      admin,
      '[u8;32]',
      'String',
      codeId,
      async (programId) =>  {
        this._program = await BaseGearProgram.new(programId, this.api);
      }
    );
    return builder;
  }
}

export class Admin {
  constructor(private _program: BluToken) {}

  public grantRole(who: ActorId, role: Role, org_id: number | null): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Admin',
      'GrantRole',
      [who, role, org_id],
      '([u8;32], Role, Option<u32>)',
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public pause(): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Admin',
      'Pause',
      null,
      null,
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public revokeRole(who: ActorId, role: Role): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Admin',
      'RevokeRole',
      [who, role],
      '([u8;32], Role)',
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public setParams(params: Params): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Admin',
      'SetParams',
      params,
      'Params',
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public unpause(): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Admin',
      'Unpause',
      null,
      null,
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public isPaused(): QueryBuilder<boolean> {
    return new QueryBuilder<boolean>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Admin',
      'IsPaused',
      null,
      null,
      'bool',
    );
  }

  public isRole(who: ActorId, role: Role): QueryBuilder<boolean> {
    return new QueryBuilder<boolean>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Admin',
      'IsRole',
      [who, role],
      '([u8;32], Role)',
      'bool',
    );
  }

  public params(): QueryBuilder<Params> {
    return new QueryBuilder<Params>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Admin',
      'Params',
      null,
      null,
      'Params',
    );
  }

  public rolesOf(who: ActorId): QueryBuilder<Array<Role>> {
    return new QueryBuilder<Array<Role>>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Admin',
      'RolesOf',
      who,
      '[u8;32]',
      'Vec<Role>',
    );
  }

  public verifierOrg(who: ActorId): QueryBuilder<number | null> {
    return new QueryBuilder<number | null>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Admin',
      'VerifierOrg',
      who,
      '[u8;32]',
      'Option<u32>',
    );
  }

  public verifiers(offset: number, limit: number): QueryBuilder<Array<[ActorId, number]>> {
    return new QueryBuilder<Array<[ActorId, number]>>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Admin',
      'Verifiers',
      [offset, limit],
      '(u32, u32)',
      'Vec<([u8;32], u32)>',
    );
  }

  public subscribeToRoleGrantedEvent(callback: (data: { who: ActorId; role: Role; org_id: number | null }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Admin' && getFnNamePrefix(payload) === 'RoleGranted') {
        callback(this._program.typeRegistry.createType('(String, String, {"who":"[u8;32]","role":"Role","org_id":"Option<u32>"})', message.payload)[2].toJSON() as unknown as { who: ActorId; role: Role; org_id: number | null });
      }
    });
  }

  public subscribeToRoleRevokedEvent(callback: (data: { who: ActorId; role: Role }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Admin' && getFnNamePrefix(payload) === 'RoleRevoked') {
        callback(this._program.typeRegistry.createType('(String, String, {"who":"[u8;32]","role":"Role"})', message.payload)[2].toJSON() as unknown as { who: ActorId; role: Role });
      }
    });
  }

  public subscribeToParamsUpdatedEvent(callback: (data: { params: Params }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Admin' && getFnNamePrefix(payload) === 'ParamsUpdated') {
        callback(this._program.typeRegistry.createType('(String, String, {"params":"Params"})', message.payload)[2].toJSON() as unknown as { params: Params });
      }
    });
  }

  public subscribeToPausedEvent(callback: (data: null) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Admin' && getFnNamePrefix(payload) === 'Paused') {
        callback(null);
      }
    });
  }

  public subscribeToUnpausedEvent(callback: (data: null) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Admin' && getFnNamePrefix(payload) === 'Unpaused') {
        callback(null);
      }
    });
  }
}

export class Bluvft {
  constructor(private _program: BluToken) {}

  public approve(spender: ActorId, amount: number | string | bigint): TransactionBuilder<{ ok: boolean } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: boolean } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Bluvft',
      'Approve',
      [spender, amount],
      '([u8;32], u128)',
      'Result<bool, Error>',
      this._program.programId,
    );
  }

  public transfer(to: ActorId, amount: number | string | bigint): TransactionBuilder<{ ok: boolean } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: boolean } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Bluvft',
      'Transfer',
      [to, amount],
      '([u8;32], u128)',
      'Result<bool, Error>',
      this._program.programId,
    );
  }

  public transferFrom($from: ActorId, to: ActorId, amount: number | string | bigint): TransactionBuilder<{ ok: boolean } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: boolean } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Bluvft',
      'TransferFrom',
      [$from, to, amount],
      '([u8;32], [u8;32], u128)',
      'Result<bool, Error>',
      this._program.programId,
    );
  }

  public allowance(owner: ActorId, spender: ActorId): QueryBuilder<bigint> {
    return new QueryBuilder<bigint>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Bluvft',
      'Allowance',
      [owner, spender],
      '([u8;32], [u8;32])',
      'u128',
    );
  }

  public balanceOf(account: ActorId): QueryBuilder<bigint> {
    return new QueryBuilder<bigint>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Bluvft',
      'BalanceOf',
      account,
      '[u8;32]',
      'u128',
    );
  }

  public decimals(): QueryBuilder<number> {
    return new QueryBuilder<number>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Bluvft',
      'Decimals',
      null,
      null,
      'u8',
    );
  }

  public name(): QueryBuilder<string> {
    return new QueryBuilder<string>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Bluvft',
      'Name',
      null,
      null,
      'String',
    );
  }

  public symbol(): QueryBuilder<string> {
    return new QueryBuilder<string>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Bluvft',
      'Symbol',
      null,
      null,
      'String',
    );
  }

  public totalSupply(): QueryBuilder<bigint> {
    return new QueryBuilder<bigint>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Bluvft',
      'TotalSupply',
      null,
      null,
      'u128',
    );
  }

  public subscribeToTransferEvent(callback: (data: { from: ActorId; to: ActorId; amount: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Bluvft' && getFnNamePrefix(payload) === 'Transfer') {
        callback(this._program.typeRegistry.createType('(String, String, {"from":"[u8;32]","to":"[u8;32]","amount":"u128"})', message.payload)[2].toJSON() as unknown as { from: ActorId; to: ActorId; amount: number | string | bigint });
      }
    });
  }

  public subscribeToApprovalEvent(callback: (data: { owner: ActorId; spender: ActorId; amount: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Bluvft' && getFnNamePrefix(payload) === 'Approval') {
        callback(this._program.typeRegistry.createType('(String, String, {"owner":"[u8;32]","spender":"[u8;32]","amount":"u128"})', message.payload)[2].toJSON() as unknown as { owner: ActorId; spender: ActorId; amount: number | string | bigint });
      }
    });
  }

  public subscribeToMintedEvent(callback: (data: { to: ActorId; amount: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Bluvft' && getFnNamePrefix(payload) === 'Minted') {
        callback(this._program.typeRegistry.createType('(String, String, {"to":"[u8;32]","amount":"u128"})', message.payload)[2].toJSON() as unknown as { to: ActorId; amount: number | string | bigint });
      }
    });
  }

  public subscribeToBurnedEvent(callback: (data: { from: ActorId; amount: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Bluvft' && getFnNamePrefix(payload) === 'Burned') {
        callback(this._program.typeRegistry.createType('(String, String, {"from":"[u8;32]","amount":"u128"})', message.payload)[2].toJSON() as unknown as { from: ActorId; amount: number | string | bigint });
      }
    });
  }
}

export class Market {
  constructor(private _program: BluToken) {}

  public buy(listing_id: number | string | bigint, amount: number | string | bigint): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Market',
      'Buy',
      [listing_id, amount],
      '(u64, u128)',
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public buyAndRetire(listing_id: number | string | bigint, amount: number | string | bigint, beneficiary_name: string, reason: string): TransactionBuilder<{ ok: number | string | bigint } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: number | string | bigint } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Market',
      'BuyAndRetire',
      [listing_id, amount, beneficiary_name, reason],
      '(u64, u128, String, String)',
      'Result<u64, Error>',
      this._program.programId,
    );
  }

  public cancelListing(id: number | string | bigint): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Market',
      'CancelListing',
      id,
      'u64',
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public claimRevenue(project_id: number | string | bigint): TransactionBuilder<{ ok: number | string | bigint } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: number | string | bigint } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Market',
      'ClaimRevenue',
      project_id,
      'u64',
      'Result<u128, Error>',
      this._program.programId,
    );
  }

  public createListing(project_id: number | string | bigint, amount: number | string | bigint, price_per_milli: number | string | bigint): TransactionBuilder<{ ok: number | string | bigint } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: number | string | bigint } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Market',
      'CreateListing',
      [project_id, amount, price_per_milli],
      '(u64, u128, u128)',
      'Result<u64, Error>',
      this._program.programId,
    );
  }

  public retire(project_id: number | string | bigint, amount: number | string | bigint, beneficiary_name: string, reason: string): TransactionBuilder<{ ok: number | string | bigint } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: number | string | bigint } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Market',
      'Retire',
      [project_id, amount, beneficiary_name, reason],
      '(u64, u128, String, String)',
      'Result<u64, Error>',
      this._program.programId,
    );
  }

  public claimable(project_id: number | string | bigint, who: ActorId): QueryBuilder<bigint> {
    return new QueryBuilder<bigint>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Market',
      'Claimable',
      [project_id, who],
      '(u64, [u8;32])',
      'u128',
    );
  }

  public listing(id: number | string | bigint): QueryBuilder<Listing | null> {
    return new QueryBuilder<Listing | null>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Market',
      'Listing',
      id,
      'u64',
      'Option<Listing>',
    );
  }

  public listings(offset: number, limit: number, filter: boolean | null): QueryBuilder<Array<Listing>> {
    return new QueryBuilder<Array<Listing>>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Market',
      'Listings',
      [offset, limit, filter],
      '(u32, u32, Option<bool>)',
      'Vec<Listing>',
    );
  }

  public nativeVaraHeld(): QueryBuilder<bigint> {
    return new QueryBuilder<bigint>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Market',
      'NativeVaraHeld',
      null,
      null,
      'u128',
    );
  }

  public pendingRevenueDust(): QueryBuilder<bigint> {
    return new QueryBuilder<bigint>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Market',
      'PendingRevenueDust',
      null,
      null,
      'u128',
    );
  }

  public retirement(id: number | string | bigint): QueryBuilder<Retirement | null> {
    return new QueryBuilder<Retirement | null>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Market',
      'Retirement',
      id,
      'u64',
      'Option<Retirement>',
    );
  }

  public retirementsBy(who: ActorId, offset: number, limit: number): QueryBuilder<Array<Retirement>> {
    return new QueryBuilder<Array<Retirement>>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Market',
      'RetirementsBy',
      [who, offset, limit],
      '([u8;32], u32, u32)',
      'Vec<Retirement>',
    );
  }

  public treasuryAccrual(): QueryBuilder<bigint> {
    return new QueryBuilder<bigint>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Market',
      'TreasuryAccrual',
      null,
      null,
      'u128',
    );
  }

  public subscribeToListingCreatedEvent(callback: (data: { id: number | string | bigint; project_id: number | string | bigint; seller: ActorId; amount: number | string | bigint; price_per_milli: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Market' && getFnNamePrefix(payload) === 'ListingCreated') {
        callback(this._program.typeRegistry.createType('(String, String, {"id":"u64","project_id":"u64","seller":"[u8;32]","amount":"u128","price_per_milli":"u128"})', message.payload)[2].toJSON() as unknown as { id: number | string | bigint; project_id: number | string | bigint; seller: ActorId; amount: number | string | bigint; price_per_milli: number | string | bigint });
      }
    });
  }

  public subscribeToListingCancelledEvent(callback: (data: { id: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Market' && getFnNamePrefix(payload) === 'ListingCancelled') {
        callback(this._program.typeRegistry.createType('(String, String, {"id":"u64"})', message.payload)[2].toJSON() as unknown as { id: number | string | bigint });
      }
    });
  }

  public subscribeToListingFilledEvent(callback: (data: { id: number | string | bigint; buyer: ActorId; amount: number | string | bigint; total_paid: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Market' && getFnNamePrefix(payload) === 'ListingFilled') {
        callback(this._program.typeRegistry.createType('(String, String, {"id":"u64","buyer":"[u8;32]","amount":"u128","total_paid":"u128"})', message.payload)[2].toJSON() as unknown as { id: number | string | bigint; buyer: ActorId; amount: number | string | bigint; total_paid: number | string | bigint });
      }
    });
  }

  public subscribeToRevenueAccruedEvent(callback: (data: { project_id: number | string | bigint; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Market' && getFnNamePrefix(payload) === 'RevenueAccrued') {
        callback(this._program.typeRegistry.createType('(String, String, {"project_id":"u64","value":"u128"})', message.payload)[2].toJSON() as unknown as { project_id: number | string | bigint; value: number | string | bigint });
      }
    });
  }

  public subscribeToRetiredEvent(callback: (data: { id: number | string | bigint; project_id: number | string | bigint; retiree: ActorId; amount: number | string | bigint; beneficiary_name: string; reason: string }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Market' && getFnNamePrefix(payload) === 'Retired') {
        callback(this._program.typeRegistry.createType('(String, String, {"id":"u64","project_id":"u64","retiree":"[u8;32]","amount":"u128","beneficiary_name":"String","reason":"String"})', message.payload)[2].toJSON() as unknown as { id: number | string | bigint; project_id: number | string | bigint; retiree: ActorId; amount: number | string | bigint; beneficiary_name: string; reason: string });
      }
    });
  }

  public subscribeToRevenueClaimedEvent(callback: (data: { project_id: number | string | bigint; who: ActorId; amount: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Market' && getFnNamePrefix(payload) === 'RevenueClaimed') {
        callback(this._program.typeRegistry.createType('(String, String, {"project_id":"u64","who":"[u8;32]","amount":"u128"})', message.payload)[2].toJSON() as unknown as { project_id: number | string | bigint; who: ActorId; amount: number | string | bigint });
      }
    });
  }
}

export class Registry {
  constructor(private _program: BluToken) {}

  public activateProject(id: number | string | bigint): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Registry',
      'ActivateProject',
      id,
      'u64',
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public cancelReport(report_id: number | string | bigint): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Registry',
      'CancelReport',
      report_id,
      'u64',
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public closeProject(id: number | string | bigint): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Registry',
      'CloseProject',
      id,
      'u64',
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public flagReversal(project_id: number | string | bigint, amount: number | string | bigint, evidence_cid: string): TransactionBuilder<{ ok: number | string | bigint } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: number | string | bigint } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Registry',
      'FlagReversal',
      [project_id, amount, evidence_cid],
      '(u64, u128, String)',
      'Result<u128, Error>',
      this._program.programId,
    );
  }

  public registerProject(name: string, ecosystem: Ecosystem, state_code: string, boundary_cid: string, area_ha_x100: number | string | bigint, beneficiaries: Array<Beneficiary>): TransactionBuilder<{ ok: number | string | bigint } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: number | string | bigint } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Registry',
      'RegisterProject',
      [name, ecosystem, state_code, boundary_cid, area_ha_x100, beneficiaries],
      '(String, Ecosystem, String, String, u64, Vec<Beneficiary>)',
      'Result<u64, Error>',
      this._program.programId,
    );
  }

  public setBeneficiaries(id: number | string | bigint, beneficiaries: Array<Beneficiary>): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Registry',
      'SetBeneficiaries',
      [id, beneficiaries],
      '(u64, Vec<Beneficiary>)',
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public submitReport(project_id: number | string | bigint, period_start: number | string | bigint, period_end: number | string | bigint, data_hash: Array<number>, data_cid: string, estimated_milli_tco2e: number | string | bigint, methodology_version: string): TransactionBuilder<{ ok: number | string | bigint } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: number | string | bigint } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Registry',
      'SubmitReport',
      [project_id, period_start, period_end, data_hash, data_cid, estimated_milli_tco2e, methodology_version],
      '(u64, u64, u64, [u8; 32], String, u128, String)',
      'Result<u64, Error>',
      this._program.programId,
    );
  }

  public suspendProject(id: number | string | bigint): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Registry',
      'SuspendProject',
      id,
      'u64',
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public voteReport(report_id: number | string | bigint, approve: boolean, note_hash: Array<number> | null): TransactionBuilder<{ ok: null } | { err: Error }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: Error }>(
      this._program.api,
      this._program.typeRegistry,
      'send_message',
      'Registry',
      'VoteReport',
      [report_id, approve, note_hash],
      '(u64, bool, Option<[u8; 32]>)',
      'Result<Null, Error>',
      this._program.programId,
    );
  }

  public pendingReports(offset: number, limit: number): QueryBuilder<Array<MrvReport>> {
    return new QueryBuilder<Array<MrvReport>>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Registry',
      'PendingReports',
      [offset, limit],
      '(u32, u32)',
      'Vec<MrvReport>',
    );
  }

  public project(id: number | string | bigint): QueryBuilder<Project | null> {
    return new QueryBuilder<Project | null>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Registry',
      'Project',
      id,
      'u64',
      'Option<Project>',
    );
  }

  public projects(offset: number, limit: number, filter: ProjectStatus | null): QueryBuilder<Array<Project>> {
    return new QueryBuilder<Array<Project>>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Registry',
      'Projects',
      [offset, limit, filter],
      '(u32, u32, Option<ProjectStatus>)',
      'Vec<Project>',
    );
  }

  public report(id: number | string | bigint): QueryBuilder<MrvReport | null> {
    return new QueryBuilder<MrvReport | null>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Registry',
      'Report',
      id,
      'u64',
      'Option<MrvReport>',
    );
  }

  public reportsByProject(project_id: number | string | bigint, offset: number, limit: number): QueryBuilder<Array<MrvReport>> {
    return new QueryBuilder<Array<MrvReport>>(
      this._program.api,
      this._program.typeRegistry,
      this._program.programId,
      'Registry',
      'ReportsByProject',
      [project_id, offset, limit],
      '(u64, u32, u32)',
      'Vec<MrvReport>',
    );
  }

  public subscribeToProjectRegisteredEvent(callback: (data: { id: number | string | bigint; owner: ActorId; name: string; ecosystem: Ecosystem; state_code: string; boundary_cid: string; area_ha_x100: number | string | bigint; beneficiaries: Array<Beneficiary> }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Registry' && getFnNamePrefix(payload) === 'ProjectRegistered') {
        callback(this._program.typeRegistry.createType('(String, String, {"id":"u64","owner":"[u8;32]","name":"String","ecosystem":"Ecosystem","state_code":"String","boundary_cid":"String","area_ha_x100":"u64","beneficiaries":"Vec<Beneficiary>"})', message.payload)[2].toJSON() as unknown as { id: number | string | bigint; owner: ActorId; name: string; ecosystem: Ecosystem; state_code: string; boundary_cid: string; area_ha_x100: number | string | bigint; beneficiaries: Array<Beneficiary> });
      }
    });
  }

  public subscribeToProjectStatusChangedEvent(callback: (data: { id: number | string | bigint; status: ProjectStatus }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Registry' && getFnNamePrefix(payload) === 'ProjectStatusChanged') {
        callback(this._program.typeRegistry.createType('(String, String, {"id":"u64","status":"ProjectStatus"})', message.payload)[2].toJSON() as unknown as { id: number | string | bigint; status: ProjectStatus });
      }
    });
  }

  public subscribeToBeneficiariesSetEvent(callback: (data: { id: number | string | bigint; beneficiaries: Array<Beneficiary> }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Registry' && getFnNamePrefix(payload) === 'BeneficiariesSet') {
        callback(this._program.typeRegistry.createType('(String, String, {"id":"u64","beneficiaries":"Vec<Beneficiary>"})', message.payload)[2].toJSON() as unknown as { id: number | string | bigint; beneficiaries: Array<Beneficiary> });
      }
    });
  }

  public subscribeToReportSubmittedEvent(callback: (data: { id: number | string | bigint; project_id: number | string | bigint; submitter: ActorId; period_start: number | string | bigint; period_end: number | string | bigint; data_hash: Array<number>; data_cid: string; estimated_milli_tco2e: number | string | bigint; methodology_version: string }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Registry' && getFnNamePrefix(payload) === 'ReportSubmitted') {
        callback(this._program.typeRegistry.createType('(String, String, {"id":"u64","project_id":"u64","submitter":"[u8;32]","period_start":"u64","period_end":"u64","data_hash":"[u8; 32]","data_cid":"String","estimated_milli_tco2e":"u128","methodology_version":"String"})', message.payload)[2].toJSON() as unknown as { id: number | string | bigint; project_id: number | string | bigint; submitter: ActorId; period_start: number | string | bigint; period_end: number | string | bigint; data_hash: Array<number>; data_cid: string; estimated_milli_tco2e: number | string | bigint; methodology_version: string });
      }
    });
  }

  public subscribeToReportVotedEvent(callback: (data: { report_id: number | string | bigint; voter: ActorId; approve: boolean; note_hash: Array<number> | null }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Registry' && getFnNamePrefix(payload) === 'ReportVoted') {
        callback(this._program.typeRegistry.createType('(String, String, {"report_id":"u64","voter":"[u8;32]","approve":"bool","note_hash":"Option<[u8; 32]>"})', message.payload)[2].toJSON() as unknown as { report_id: number | string | bigint; voter: ActorId; approve: boolean; note_hash: Array<number> | null });
      }
    });
  }

  public subscribeToReportVerifiedEvent(callback: (data: { report_id: number | string | bigint; project_id: number | string | bigint; minted: number | string | bigint; buffered: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Registry' && getFnNamePrefix(payload) === 'ReportVerified') {
        callback(this._program.typeRegistry.createType('(String, String, {"report_id":"u64","project_id":"u64","minted":"u128","buffered":"u128"})', message.payload)[2].toJSON() as unknown as { report_id: number | string | bigint; project_id: number | string | bigint; minted: number | string | bigint; buffered: number | string | bigint });
      }
    });
  }

  public subscribeToReportRejectedEvent(callback: (data: { report_id: number | string | bigint; project_id: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Registry' && getFnNamePrefix(payload) === 'ReportRejected') {
        callback(this._program.typeRegistry.createType('(String, String, {"report_id":"u64","project_id":"u64"})', message.payload)[2].toJSON() as unknown as { report_id: number | string | bigint; project_id: number | string | bigint });
      }
    });
  }

  public subscribeToReportCancelledEvent(callback: (data: { report_id: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Registry' && getFnNamePrefix(payload) === 'ReportCancelled') {
        callback(this._program.typeRegistry.createType('(String, String, {"report_id":"u64"})', message.payload)[2].toJSON() as unknown as { report_id: number | string | bigint });
      }
    });
  }

  public subscribeToReversalFlaggedEvent(callback: (data: { project_id: number | string | bigint; amount: number | string | bigint; deficit: number | string | bigint; evidence_cid: string }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }: any) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Registry' && getFnNamePrefix(payload) === 'ReversalFlagged') {
        callback(this._program.typeRegistry.createType('(String, String, {"project_id":"u64","amount":"u128","deficit":"u128","evidence_cid":"String"})', message.payload)[2].toJSON() as unknown as { project_id: number | string | bigint; amount: number | string | bigint; deficit: number | string | bigint; evidence_cid: string });
      }
    });
  }
}