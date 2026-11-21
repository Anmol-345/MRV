/**
 * BluToken Contract Error Decoder & Human-Friendly Mapping
 */

export type ContractErrorCode =
  | 'Unauthorized'
  | 'Paused'
  | 'NotFound'
  | 'InvalidInput'
  | 'InvalidShares'
  | 'ProjectNotActive'
  | 'OverlappingPeriod'
  | 'AlreadyVoted'
  | 'ConflictOfInterest'
  | 'QuorumImpossible'
  | 'InsufficientBalance'
  | 'InsufficientListing'
  | 'WrongPayment'
  | 'NothingToClaim'
  | 'BufferDeficit'
  | 'Overflow'
  | string;

export interface FriendlyError {
  code: string;
  title: string;
  message: string;
  suggestion?: string;
}

export const ERROR_MAPPINGS: Record<string, { title: string; message: string; suggestion?: string }> = {
  Unauthorized: {
    title: 'Authorization Required',
    message: 'Your connected wallet does not have the required role or permission for this operation.',
    suggestion: 'Switch to an account with Admin, Verifier, or Project Owner credentials.',
  },
  Paused: {
    title: 'Contract Paused',
    message: 'The BluToken smart contracts are temporarily paused for maintenance or emergency protection.',
    suggestion: 'Please check back shortly or check /audit for protocol status updates.',
  },
  NotFound: {
    title: 'Entity Not Found',
    message: 'The requested project, report, or listing does not exist on-chain.',
    suggestion: 'Verify the identifier and ensure your indexer is up to date.',
  },
  InvalidInput: {
    title: 'Invalid Parameters',
    message: 'One or more submitted parameters violate validation rules.',
    suggestion: 'Check boundaries, timestamps, or numerical inputs and try again.',
  },
  InvalidShares: {
    title: 'Beneficiary Allocation Error',
    message: 'The sum of beneficiary shares must equal exactly 10,000 basis points (100.00%).',
    suggestion: 'Ensure Gram Panchayat beneficiary allocations total exactly 100%.',
  },
  ProjectNotActive: {
    title: 'Project Inactive',
    message: 'This operation requires the project to be in Active status.',
    suggestion: 'Contact an Admin or wait for the project to be activated.',
  },
  OverlappingPeriod: {
    title: 'Overlapping Monitoring Period',
    message: 'The selected start and end dates overlap with a previously verified or submitted MRV report.',
    suggestion: 'Choose a reporting window that starts after the latest verified period.',
  },
  AlreadyVoted: {
    title: 'Duplicate Vote',
    message: 'Your organization has already submitted a verification vote on this MRV report.',
    suggestion: 'Each accredited verifier organization may only vote once per report.',
  },
  ConflictOfInterest: {
    title: 'Conflict of Interest Detected',
    message: 'You cannot verify an MRV report for a project your organization developed or owns.',
    suggestion: 'Independence rule: only unrelated scientific verifiers may vote on registry reports.',
  },
  QuorumImpossible: {
    title: 'Quorum Cannot Be Met',
    message: 'Too many rejections have been recorded for this report to reach the required approval quorum.',
    suggestion: 'The developer must address issues and submit a revised MRV report bundle.',
  },
  InsufficientBalance: {
    title: 'Insufficient Balance',
    message: 'Your account does not have sufficient BLU credit balance or allowance.',
    suggestion: 'Check your wallet balance and ensure approvals are set.',
  },
  InsufficientListing: {
    title: 'Listing Quantity Exceeded',
    message: 'The requested purchase amount exceeds the available credits in this listing.',
    suggestion: 'Reduce the quantity or select another active marketplace listing.',
  },
  WrongPayment: {
    title: 'Incorrect Payment Amount',
    message: 'The attached VARA value does not match the exact price plus 2% platform fee.',
    suggestion: 'Refresh the page and re-estimate the purchase price.',
  },
  NothingToClaim: {
    title: 'No Revenue Claimable',
    message: 'There are no pending revenue distributions for your wallet address.',
    suggestion: 'Revenue accumulates when marketplace credits from your project are purchased.',
  },
  BufferDeficit: {
    title: 'Buffer Pool Deficit',
    message: 'A registered carbon reversal exceeds the available buffer pool reserve.',
    suggestion: 'Contact protocol administrators for manual settlement.',
  },
  Overflow: {
    title: 'Arithmetic Overflow',
    message: 'A mathematical calculation exceeded numeric bounds.',
    suggestion: 'Verify all units are within standard u64 / u128 limits.',
  },
};

/**
 * Parses raw contract error responses into structured friendly text
 */
export function decodeContractError(err: unknown): FriendlyError {
  let errKey = 'Unknown';

  if (typeof err === 'string') {
    errKey = err;
  } else if (err && typeof err === 'object') {
    if ('err' in err && typeof (err as any).err === 'string') {
      errKey = (err as any).err;
    } else if ('message' in err && typeof (err as any).message === 'string') {
      const msg = (err as any).message;
      for (const key of Object.keys(ERROR_MAPPINGS)) {
        if (msg.includes(key)) {
          errKey = key;
          break;
        }
      }
      if (errKey === 'Unknown') {
        return {
          code: 'Error',
          title: 'Operation Failed',
          message: msg,
        };
      }
    }
  }

  const mapping = ERROR_MAPPINGS[errKey];
  if (mapping) {
    return {
      code: errKey,
      title: mapping.title,
      message: mapping.message,
      suggestion: mapping.suggestion,
    };
  }

  return {
    code: errKey,
    title: 'Transaction Error',
    message: typeof err === 'string' ? err : 'An unexpected error occurred during execution.',
  };
}
