import { Prisma } from '@blutoken/database';
import { ChainEventRecord } from './types.js';

export async function projectEvent(
  tx: Prisma.TransactionClient,
  event: ChainEventRecord
): Promise<void> {
  const { service, name, payload } = event;

  switch (`${service}.${name}`) {
    case 'Registry.ProjectRegistered': {
      const id = BigInt(payload.id ?? payload.projectId);
      const owner = payload.owner || payload.ownerWallet;
      const stateCode = (payload.state_code ?? payload.stateCode ?? '').toUpperCase();
      const boundaryCid = payload.boundary_cid ?? payload.boundaryCid ?? '';
      const areaHa =
        payload.area_ha_x100 != null
          ? new Prisma.Decimal(Number(payload.area_ha_x100) / 100)
          : new Prisma.Decimal(Number(payload.areaHa || 0));

      await tx.project.upsert({
        where: { id },
        create: {
          id,
          ownerWallet: owner,
          name: payload.name,
          ecosystem: payload.ecosystem,
          stateCode,
          boundaryCid,
          areaHa,
          status: 'Pending',
          totalMinted: 0n,
          totalRetired: 0n,
          bufferHeld: 0n,
          pendingRevenue: 0n,
          createdAt: event.ts,
        },
        update: {
          name: payload.name,
          ecosystem: payload.ecosystem,
          stateCode,
          boundaryCid,
          areaHa,
        },
      });

      if (Array.isArray(payload.beneficiaries)) {
        for (const b of payload.beneficiaries) {
          const wallet = b.who ?? b.wallet;
          const shareBps = b.share_bps ?? b.shareBps;
          const displayName = b.displayName ?? b.name ?? null;

          await tx.beneficiary.upsert({
            where: {
              projectId_wallet: {
                projectId: id,
                wallet,
              },
            },
            create: {
              projectId: id,
              wallet,
              shareBps,
              displayName,
            },
            update: {
              shareBps,
              displayName,
            },
          });
        }
      }
      break;
    }

    case 'Registry.ProjectStatusChanged': {
      const id = BigInt(payload.id ?? payload.projectId);
      await tx.project.update({
        where: { id },
        data: { status: payload.status },
      });
      break;
    }

    case 'Admin.ProjectActivated':
    case 'Registry.ProjectActivated': {
      const id = BigInt(payload.id ?? payload.projectId);
      await tx.project.update({
        where: { id },
        data: { status: 'Active' },
      });
      break;
    }

    case 'Admin.ProjectSuspended':
    case 'Registry.ProjectSuspended': {
      const id = BigInt(payload.id ?? payload.projectId);
      await tx.project.update({
        where: { id },
        data: { status: 'Suspended' },
      });
      break;
    }

    case 'Registry.ReportSubmitted': {
      const id = BigInt(payload.id ?? payload.reportId);
      const projectId = BigInt(payload.project_id ?? payload.projectId);
      const periodStart = BigInt(payload.period_start ?? payload.periodStart ?? 0);
      const periodEnd = BigInt(payload.period_end ?? payload.periodEnd ?? 0);
      const estimatedMilli = BigInt(
        payload.estimated_milli_tco2e ?? payload.estimatedMilli ?? payload.estimated ?? 0
      );

      await tx.mrvReport.upsert({
        where: { id },
        create: {
          id,
          projectId,
          submitter: payload.submitter,
          periodStart,
          periodEnd,
          dataHash: String(payload.data_hash ?? payload.dataHash ?? ''),
          dataCid: payload.data_cid ?? payload.dataCid ?? '',
          estimatedMilli,
          methodologyVersion: payload.methodology_version ?? payload.methodologyVersion ?? 'v1',
          status: 'Submitted',
          minted: 0n,
          buffered: 0n,
          createdAt: event.ts,
        },
        update: {
          periodStart,
          periodEnd,
          estimatedMilli,
        },
      });
      break;
    }

    case 'Registry.ReportVoted': {
      const reportId = BigInt(payload.report_id ?? payload.reportId ?? payload.id);
      const verifier = payload.voter ?? payload.verifier;
      const approve = Boolean(payload.approve);
      const noteHash = payload.note_hash ?? payload.noteHash ? String(payload.note_hash ?? payload.noteHash) : null;
      const noteText = payload.reason ?? payload.noteText ?? null;

      await tx.vote.upsert({
        where: {
          reportId_verifierWallet: {
            reportId,
            verifierWallet: verifier,
          },
        },
        create: {
          reportId,
          verifierWallet: verifier,
          approve,
          noteHash,
          noteText,
          ts: event.ts,
        },
        update: {
          approve,
          noteHash,
          noteText,
          ts: event.ts,
        },
      });
      break;
    }

    case 'Registry.ReportVerified': {
      const reportId = BigInt(payload.report_id ?? payload.reportId ?? payload.id);
      const projectId = BigInt(payload.project_id ?? payload.projectId);
      const minted = BigInt(payload.minted ?? 0);
      const buffered = BigInt(payload.buffered ?? payload.buffer ?? 0);

      await tx.mrvReport.update({
        where: { id: reportId },
        data: {
          status: 'Verified',
          minted,
          buffered,
        },
      });

      await tx.project.update({
        where: { id: projectId },
        data: {
          totalMinted: { increment: minted },
          bufferHeld: { increment: buffered },
        },
      });

      // Track project pool balance
      await tx.balance.upsert({
        where: { wallet: `project_${projectId}` },
        create: {
          wallet: `project_${projectId}`,
          balanceMilli: minted,
        },
        update: {
          balanceMilli: { increment: minted },
        },
      });
      break;
    }

    case 'Registry.ReportRejected': {
      const reportId = BigInt(payload.report_id ?? payload.reportId ?? payload.id);
      await tx.mrvReport.update({
        where: { id: reportId },
        data: { status: 'Rejected' },
      });
      break;
    }

    case 'Registry.ReportCancelled': {
      const reportId = BigInt(payload.report_id ?? payload.reportId ?? payload.id);
      await tx.mrvReport.update({
        where: { id: reportId },
        data: { status: 'Cancelled' },
      });
      break;
    }

    case 'Bluvft.Minted': {
      const amount = BigInt(payload.amount);
      await tx.balance.upsert({
        where: { wallet: payload.to },
        create: {
          wallet: payload.to,
          balanceMilli: amount,
        },
        update: {
          balanceMilli: { increment: amount },
        },
      });
      break;
    }

    case 'Bluvft.Burned': {
      const amount = BigInt(payload.amount);
      await tx.balance.upsert({
        where: { wallet: payload.from },
        create: {
          wallet: payload.from,
          balanceMilli: 0n,
        },
        update: {
          balanceMilli: { decrement: amount },
        },
      });
      break;
    }

    case 'Bluvft.Transfer': {
      const amount = BigInt(payload.amount);
      await tx.balance.upsert({
        where: { wallet: payload.from },
        create: { wallet: payload.from, balanceMilli: 0n },
        update: { balanceMilli: { decrement: amount } },
      });

      await tx.balance.upsert({
        where: { wallet: payload.to },
        create: { wallet: payload.to, balanceMilli: amount },
        update: { balanceMilli: { increment: amount } },
      });
      break;
    }

    case 'Market.ListingCreated': {
      const id = BigInt(payload.id ?? payload.listingId);
      const projectId = BigInt(payload.project_id ?? payload.projectId);
      const amount = BigInt(payload.amount);
      const pricePerMilli = BigInt(payload.price_per_milli ?? payload.pricePerMilli);

      await tx.listing.upsert({
        where: { id },
        create: {
          id,
          projectId,
          seller: payload.seller,
          remaining: amount,
          pricePerMilli,
          active: true,
          createdAt: event.ts,
        },
        update: {
          remaining: amount,
          active: true,
        },
      });

      // Debit project pool balance for listed tokens
      await tx.balance.upsert({
        where: { wallet: `project_${projectId}` },
        create: { wallet: `project_${projectId}`, balanceMilli: 0n },
        update: { balanceMilli: { decrement: amount } },
      });
      break;
    }

    case 'Market.ListingCancelled': {
      const id = BigInt(payload.id ?? payload.listingId);
      const listing = await tx.listing.findUnique({ where: { id } });
      if (listing) {
        await tx.listing.update({
          where: { id },
          data: { active: false },
        });

        // Return remaining tokens to project pool
        if (listing.remaining > 0n) {
          await tx.balance.upsert({
            where: { wallet: `project_${listing.projectId}` },
            create: { wallet: `project_${listing.projectId}`, balanceMilli: listing.remaining },
            update: { balanceMilli: { increment: listing.remaining } },
          });
        }
      }
      break;
    }

    case 'Market.ListingFilled':
    case 'Market.ListingBought': {
      const id = BigInt(payload.id ?? payload.listingId);
      const amount = BigInt(payload.amount);
      const value = BigInt(payload.total_paid ?? payload.value ?? 0);
      const buyer = payload.buyer;

      const listing = await tx.listing.findUnique({ where: { id } });
      const remainingAfter = (listing?.remaining ?? amount) - amount;

      await tx.listing.update({
        where: { id },
        data: {
          remaining: remainingAfter > 0n ? remainingAfter : 0n,
          active: remainingAfter > 0n,
        },
      });

      await tx.trade.create({
        data: {
          listingId: id,
          buyer,
          amount,
          value,
          retired: false,
          txHash: event.txHash,
          ts: event.ts,
        },
      });

      // Credit buyer BLU balance
      await tx.balance.upsert({
        where: { wallet: buyer },
        create: { wallet: buyer, balanceMilli: amount },
        update: { balanceMilli: { increment: amount } },
      });
      break;
    }

    case 'Market.Retired':
    case 'Market.ListingRetired': {
      const projectId = BigInt(payload.project_id ?? payload.projectId);
      const amount = BigInt(payload.amount);
      const retiree = payload.retiree ?? payload.who;
      const retirementId = BigInt(payload.id ?? payload.retirementId ?? Date.now());
      const beneficiaryName = payload.beneficiary_name ?? payload.beneficiaryName ?? '';
      const reason = payload.reason ?? '';

      await tx.project.update({
        where: { id: projectId },
        data: {
          totalRetired: { increment: amount },
        },
      });

      await tx.retirement.upsert({
        where: { id: retirementId },
        create: {
          id: retirementId,
          projectId,
          retiree,
          amount,
          beneficiaryName,
          reason,
          ts: event.ts,
        },
        update: {},
      });

      // Debit retiree BLU balance
      await tx.balance.upsert({
        where: { wallet: retiree },
        create: { wallet: retiree, balanceMilli: 0n },
        update: { balanceMilli: { decrement: amount } },
      });
      break;
    }

    case 'Market.RevenueClaimed': {
      const projectId = BigInt(payload.project_id ?? payload.projectId ?? 1);
      const wallet = payload.who ?? payload.claimant ?? payload.wallet;
      const amount = BigInt(payload.amount);

      await tx.revenueClaim.create({
        data: {
          projectId,
          wallet,
          amount,
          ts: event.ts,
        },
      });
      break;
    }

    default:
      // Other events (e.g. RoleGranted, ParamsUpdated, Paused, Unpaused, ReversalFlagged)
      break;
  }
}
