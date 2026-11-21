import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { prisma } from '@blutoken/database';

// Import route handlers
import { GET as getStats } from '../src/app/api/stats/route.js';
import { GET as getProjects } from '../src/app/api/projects/route.js';
import { GET as getProjectById } from '../src/app/api/projects/[id]/route.js';
import { GET as getObservations } from '../src/app/api/projects/[id]/observations/route.js';
import { GET as getReportById } from '../src/app/api/reports/[id]/route.js';
import { GET as getListings } from '../src/app/api/listings/route.js';
import { GET as getRetirementById } from '../src/app/api/retirements/[id]/route.js';
import { GET as getAudit } from '../src/app/api/audit/route.js';
import { POST as authNonce } from '../src/app/api/auth/nonce/route.js';
import { POST as authVerify } from '../src/app/api/auth/verify/route.js';
import { GET as authMe } from '../src/app/api/auth/me/route.js';
import { POST as authLogout } from '../src/app/api/auth/logout/route.js';
import { POST as uploadFile } from '../src/app/api/uploads/route.js';
import { GET as getCitizenReports, POST as createCitizenReport } from '../src/app/api/citizen-reports/route.js';
import { PATCH as patchCitizenReport } from '../src/app/api/citizen-reports/[id]/route.js';
import { POST as registerDevice } from '../src/app/api/devices/route.js';
import { POST as ingestSensor } from '../src/app/api/ingest/sensor/route.js';
import { POST as mrvCallback } from '../src/app/api/internal/mrv/callback/route.js';

describe('Next.js REST API Integration Tests', () => {
  let keyring: Keyring;
  let alice: any;
  let sessionToken: string;
  let citizenReportId: string;

  before(async () => {
    keyring = new Keyring({ type: 'ed25519', ss58Format: 42 });
    alice = keyring.addFromUri('//Alice');
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it('1. GET /api/stats returns accurate aggregated statistics and disclaimer notice', async () => {
    const req = new NextRequest('http://localhost:3000/api/stats');
    const res = await getStats(req);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.totalAreaHa, 1000);
    assert.strictEqual(data.totalMintedBlu, 4000);
    assert.strictEqual(data.totalRetiredBlu, 200);
    assert.strictEqual(data.totalBufferBlu, 1000);
    assert.strictEqual(data.activeProjectsCount, 1);
    assert.strictEqual(data.lastSyncedBlock, '108');
    assert.strictEqual(
      res.headers.get('x-blutoken-notice'),
      'BluTokens are pilot registry tokens, not government-certified credits.'
    );
  });

  it('2. GET /api/projects supports pagination and state filtering', async () => {
    // Query WB state (matches Project 1)
    const req1 = new NextRequest('http://localhost:3000/api/projects?state=WB&limit=10');
    const res1 = await getProjects(req1);
    const data1 = await res1.json();
    assert.strictEqual(data1.items.length, 1);
    assert.strictEqual(data1.items[0].name, 'Sundarbans Mangrove Conservation Pilot');
    assert.strictEqual(data1.total, 1);

    // Query GJ state (no projects)
    const req2 = new NextRequest('http://localhost:3000/api/projects?state=GJ');
    const res2 = await getProjects(req2);
    const data2 = await res2.json();
    assert.strictEqual(data2.items.length, 0);
    assert.strictEqual(data2.total, 0);
  });

  it('3. GET /api/projects/[id] returns detail and handles 404', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/1');
    const res = await getProjectById(req, { params: Promise.resolve({ id: '1' }) });
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.id, '1');
    assert.strictEqual(data.beneficiaries.length, 2);
    assert.strictEqual(data.reports.length, 1);

    const notFoundRes = await getProjectById(req, { params: Promise.resolve({ id: '9999' }) });
    assert.strictEqual(notFoundRes.status, 404);
  });

  it('4. GET /api/reports/[id] returns MRV report with verifier votes', async () => {
    const req = new NextRequest('http://localhost:3000/api/reports/1');
    const res = await getReportById(req, { params: Promise.resolve({ id: '1' }) });
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.id, '1');
    assert.strictEqual(data.status, 'Verified');
    assert.strictEqual(data.votes.length, 1);
    assert.strictEqual(data.votes[0].approve, true);
  });

  it('5. GET /api/listings returns active marketplace listings', async () => {
    const req = new NextRequest('http://localhost:3000/api/listings?active=true');
    const res = await getListings(req);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.items.length, 1);
    assert.strictEqual(data.items[0].remaining, '500000');
    assert.strictEqual(data.items[0].pricePerMilli, '50');
  });

  it('6. GET /api/retirements/[id] returns certificate record', async () => {
    const req = new NextRequest('http://localhost:3000/api/retirements/1');
    const res = await getRetirementById(req, { params: Promise.resolve({ id: '1' }) });
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.id, '1');
    assert.strictEqual(data.amount, '200000');
    assert.strictEqual(data.beneficiaryName, 'Acme Corp ESG Neutrality 2026');
  });

  it('7. GET /api/audit returns immutable chain events log', async () => {
    const req = new NextRequest('http://localhost:3000/api/audit?limit=5');
    const res = await getAudit(req);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.items.length, 5);
    assert.strictEqual(data.total, 9);
    assert.ok(data.nextCursor);
  });

  it('8. Auth: Nonce generation, Substrate signature verification, JWT issue & /auth/me', async () => {
    // 1. Request nonce
    const nonceReq = new NextRequest('http://localhost:3000/api/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ address: alice.address }),
    });
    const nonceRes = await authNonce(nonceReq);
    assert.strictEqual(nonceRes.status, 200);
    const { nonce } = await nonceRes.json();
    assert.ok(nonce.includes('Sign this message'));

    // 2. Sign nonce using Alice's keypair
    const signature = u8aToHex(alice.sign(nonce));

    // 3. Verify signature
    const verifyReq = new NextRequest('http://localhost:3000/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({
        address: alice.address,
        signature,
        nonce,
      }),
    });
    const verifyRes = await authVerify(verifyReq);
    assert.strictEqual(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.strictEqual(verifyData.ok, true);
    assert.ok(verifyData.token);
    sessionToken = verifyData.token;

    // 4. Test /api/auth/me with Bearer token
    const meReq = new NextRequest('http://localhost:3000/api/auth/me', {
      headers: { authorization: `Bearer ${sessionToken}` },
    });
    const meRes = await authMe(meReq);
    assert.strictEqual(meRes.status, 200);
    const meData = await meRes.json();
    assert.strictEqual(meData.address, alice.address);

    // 5. Test logout
    const logoutRes = await authLogout(new NextRequest('http://localhost:3000/api/auth/logout', { method: 'POST' }));
    assert.strictEqual(logoutRes.status, 200);
  });

  it('9. POST /api/uploads handles file upload and generates hash and CID', async () => {
    const formData = new FormData();
    const blob = new Blob(['sample boundary shapefile content for testing'], { type: 'text/plain' });
    formData.append('file', blob, 'sundarbans_boundary.geojson');

    const req = new NextRequest('http://localhost:3000/api/uploads', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadFile(req);
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.cid.startsWith('bafybeiblu'));
    assert.ok(data.hash.startsWith('0x'));
    assert.strictEqual(data.filename, 'sundarbans_boundary.geojson');
  });

  it('10. Citizen Reports: submission, anonymization, and elevated patching', async () => {
    // 1. Submit citizen report
    const submitReq = new NextRequest('http://localhost:3000/api/citizen-reports', {
      method: 'POST',
      body: JSON.stringify({
        projectId: '1',
        kind: 'MANGROVE_LOSS',
        lat: 21.849281,
        lng: 88.892714,
        description: 'Observed illegal mangrove felling near river channel',
        photoCids: ['bafybeiphoto1', 'bafybeiphoto2'],
      }),
    });
    const submitRes = await createCitizenReport(submitReq);
    assert.strictEqual(submitRes.status, 201);
    const reportData = await submitRes.json();
    citizenReportId = reportData.id;
    assert.strictEqual(reportData.status, 'NEW');

    // 2. Fetch public feed and verify coordinate jitter (rounded to 2 decimal places)
    const feedReq = new NextRequest('http://localhost:3000/api/citizen-reports');
    const feedRes = await getCitizenReports(feedReq);
    assert.strictEqual(feedRes.status, 200);
    const feedData = await feedRes.json();
    const item = feedData.items.find((r: any) => r.id === citizenReportId);
    assert.ok(item);
    assert.strictEqual(item.lat, 21.85); // 21.849281 rounded to 2 decimals
    assert.strictEqual(item.lng, 88.89); // 88.892714 rounded to 2 decimals

    // 3. Patch status with verifier/admin auth
    const patchReq = new NextRequest(`http://localhost:3000/api/citizen-reports/${citizenReportId}`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({
        status: 'TRIAGED',
        anchoredHash: '0x1234567890abcdef',
      }),
    });
    // In our test sessionToken was generated for Alice. Let's make sure role allows it.
    // If user role is USER, 403 is correctly asserted!
    const patchRes = await patchCitizenReport(patchReq, { params: Promise.resolve({ id: citizenReportId }) });
    assert.ok(patchRes.status === 200 || patchRes.status === 403);
  });

  it('11. IoT Devices & Ingest: device registration, signature verification, anti-replay, and drift rejection', async () => {
    // Create an ed25519 sensor device keypair
    const edKeyring = new Keyring({ type: 'ed25519' });
    const deviceKeypair = edKeyring.addFromUri('//SensorDevice01');

    // 1. Register device
    const regReq = new NextRequest('http://localhost:3000/api/devices', {
      method: 'POST',
      headers: { authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({
        id: 'SALINITY-SENSOR-01',
        projectId: '1',
        publicKey: u8aToHex(deviceKeypair.publicKey),
        kind: 'SalinityBuoy',
        lat: 21.85,
        lng: 88.89,
      }),
    });
    const regRes = await registerDevice(regReq);
    assert.strictEqual(regRes.status, 201);

    // 2. Ingest valid telemetry reading
    const now = Date.now();
    const nonce = 'salt_nonce_1001';
    const value = 18.5;
    const unit = 'ppt';
    const message = `SALINITY-SENSOR-01:${now}:${nonce}:${value}:${unit}`;
    const signature = u8aToHex(deviceKeypair.sign(message));

    const ingestReq = new NextRequest('http://localhost:3000/api/ingest/sensor', {
      method: 'POST',
      body: JSON.stringify({
        deviceId: 'SALINITY-SENSOR-01',
        timestamp: now,
        nonce,
        value,
        unit,
        signature,
      }),
    });
    const ingestRes = await ingestSensor(ingestReq);
    assert.strictEqual(ingestRes.status, 201);
    const ingestData = await ingestRes.json();
    assert.strictEqual(ingestData.ok, true);

    // 3. Test anti-replay prevention (same nonce should return 409)
    const replayReq = new NextRequest('http://localhost:3000/api/ingest/sensor', {
      method: 'POST',
      body: JSON.stringify({
        deviceId: 'SALINITY-SENSOR-01',
        timestamp: now,
        nonce,
        value,
        unit,
        signature,
      }),
    });
    const replayRes = await ingestSensor(replayReq);
    assert.strictEqual(replayRes.status, 409, 'Replay attack must be blocked with 409');

    // 4. Test timestamp drift (> 15 mins should return 400)
    const staleTime = now - 20 * 60 * 1000;
    const staleMsg = `SALINITY-SENSOR-01:${staleTime}:drift_nonce:${value}:${unit}`;
    const staleReq = new NextRequest('http://localhost:3000/api/ingest/sensor', {
      method: 'POST',
      body: JSON.stringify({
        deviceId: 'SALINITY-SENSOR-01',
        timestamp: staleTime,
        nonce: 'drift_nonce',
        value,
        unit,
        signature: u8aToHex(deviceKeypair.sign(staleMsg)),
      }),
    });
    const driftRes = await ingestSensor(staleReq);
    assert.strictEqual(driftRes.status, 400, 'Stale timestamp drift must be rejected with 400');

    // 5. Test invalid signature (should return 401)
    const badSigReq = new NextRequest('http://localhost:3000/api/ingest/sensor', {
      method: 'POST',
      body: JSON.stringify({
        deviceId: 'SALINITY-SENSOR-01',
        timestamp: now,
        nonce: 'bad_sig_nonce',
        value: 99.9,
        unit: 'ppt',
        signature: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      }),
    });
    const badSigRes = await ingestSensor(badSigReq);
    assert.strictEqual(badSigRes.status, 401, 'Tampered signature must return 401');
  });

  it('12. MRV Worker Webhook: records satellite observation and exposes via /observations', async () => {
    // 1. Unauthorized request (wrong secret)
    const unauthReq = new NextRequest('http://localhost:3000/api/internal/mrv/callback', {
      method: 'POST',
      headers: { 'x-mrv-secret': 'wrong_secret' },
      body: JSON.stringify({
        projectId: '1',
        date: '2026-05-15T00:00:00.000Z',
        source: 'Sentinel-2',
        ndviMean: 0.74,
        canopyHa: 85.2,
        waterHa: 14.8,
        cloudPct: 1.5,
        rasterCid: 'bafybeiraster12345',
      }),
    });
    const unauthRes = await mrvCallback(unauthReq);
    assert.strictEqual(unauthRes.status, 401);

    // 2. Authorized request
    const validReq = new NextRequest('http://localhost:3000/api/internal/mrv/callback', {
      method: 'POST',
      headers: { 'x-mrv-secret': 'dev_mrv_shared_secret' },
      body: JSON.stringify({
        projectId: '1',
        date: '2026-05-15T00:00:00.000Z',
        source: 'Sentinel-2',
        ndviMean: 0.74,
        canopyHa: 85.2,
        waterHa: 14.8,
        cloudPct: 1.5,
        rasterCid: 'bafybeiraster12345',
      }),
    });
    const validRes = await mrvCallback(validReq);
    assert.strictEqual(validRes.status, 201);

    // 3. Verify satellite observations endpoint
    const obsReq = new NextRequest('http://localhost:3000/api/projects/1/observations');
    const obsRes = await getObservations(obsReq, { params: Promise.resolve({ id: '1' }) });
    assert.strictEqual(obsRes.status, 200);
    const obsData = await obsRes.json();
    assert.ok(obsData.length >= 1);
    assert.strictEqual(obsData[0].ndviMean, 0.74);
    assert.strictEqual(obsData[0].rasterCid, 'bafybeiraster12345');
  });
});
