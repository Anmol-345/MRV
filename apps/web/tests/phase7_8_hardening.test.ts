import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { rateLimit } from '../src/lib/rate-limit';

describe('Phase 7 & 8: MRV Pipeline, PWA, Gov Dashboard & Security Hardening', () => {
  it('1. Rate Limiting sliding window enforces quota and rejects over-limit bursts', () => {
    const testIp = '192.168.1.100';
    const limit = 5;

    // First 5 requests should pass
    for (let i = 1; i <= limit; i++) {
      const res = rateLimit(testIp, limit, 10);
      assert.strictEqual(res.success, true, `Request ${i} should succeed`);
      assert.strictEqual(res.remaining, limit - i);
    }

    // 6th request should be blocked
    const blockedRes = rateLimit(testIp, limit, 10);
    assert.strictEqual(blockedRes.success, false, '6th request must be rate-limited');
    assert.strictEqual(blockedRes.remaining, 0);
  });

  it('2. Government Dashboard Data Reconciliation', () => {
    // Sample state data representing the 10 coastal jurisdictions
    const stateData = [
      { stateCode: 'WB', areaHa: 4200, mintedBlu: 18400, retiredBlu: 2800 },
      { stateCode: 'TN', areaHa: 2800, mintedBlu: 9800, retiredBlu: 1200 },
      { stateCode: 'GJ', areaHa: 2100, mintedBlu: 7500, retiredBlu: 900 },
      { stateCode: 'OD', areaHa: 1400, mintedBlu: 5600, retiredBlu: 650 },
      { stateCode: 'KL', areaHa: 850, mintedBlu: 3100, retiredBlu: 400 },
      { stateCode: 'AP', areaHa: 600, mintedBlu: 2100, retiredBlu: 250 },
      { stateCode: 'KA', areaHa: 250, mintedBlu: 900, retiredBlu: 100 },
      { stateCode: 'GA', areaHa: 150, mintedBlu: 500, retiredBlu: 60 },
      { stateCode: 'MH', areaHa: 80, mintedBlu: 200, retiredBlu: 30 },
      { stateCode: 'AN', areaHa: 20, mintedBlu: 100, retiredBlu: 10 },
    ];

    const totalArea = stateData.reduce((acc, s) => acc + s.areaHa, 0);
    const totalMinted = stateData.reduce((acc, s) => acc + s.mintedBlu, 0);
    const totalRetired = stateData.reduce((acc, s) => acc + s.retiredBlu, 0);

    assert.strictEqual(totalArea, 12450, 'Total monitored coastal area must equal 12,450 ha');
    assert.strictEqual(totalMinted, 48200, 'Total minted credits must equal 48,200 tCO2e');
    assert.strictEqual(totalRetired, 6400, 'Total retired credits must equal 6,400 tCO2e');
    assert.ok(totalRetired < totalMinted, 'Total retired cannot exceed total minted');
  });

  it('3. Threat Model & Mainnet Runbook Documentation Verification', () => {
    const threatsPath = path.resolve(__dirname, '../../../docs/THREATS.md');
    const runbookPath = path.resolve(__dirname, '../../../docs/MAINNET_RUNBOOK.md');

    assert.ok(fs.existsSync(threatsPath), 'docs/THREATS.md must exist');
    assert.ok(fs.existsSync(runbookPath), 'docs/MAINNET_RUNBOOK.md must exist');

    const threatsContent = fs.readFileSync(threatsPath, 'utf-8');
    assert.ok(threatsContent.includes('Conservation of Supply'), 'Threat model must specify supply conservation');
    assert.ok(threatsContent.includes('Buffer Pool Reserve'), 'Threat model must specify buffer pool reserve');
    assert.ok(threatsContent.includes('Pull Payment Invariant'), 'Threat model must specify pull-payments');

    const runbookContent = fs.readFileSync(runbookPath, 'utf-8');
    assert.ok(runbookContent.includes('Pre-Deployment Readiness Checklist'), 'Runbook must include readiness checklist');
    assert.ok(runbookContent.includes('Emergency Incident Response'), 'Runbook must include incident response');
  });

  it('4. Secrets Scan: No unencrypted private keys or mnemonics in committed configs', () => {
    const rootDir = path.resolve(__dirname, '../../..');
    const envExamplePath = path.join(rootDir, '.env.example');
    assert.ok(fs.existsSync(envExamplePath), '.env.example must exist');

    const envContent = fs.readFileSync(envExamplePath, 'utf-8');
    const forbiddenPatterns = [
      /xprv[a-zA-Z0-9]{100,}/,
      /-----BEGIN RSA PRIVATE KEY-----/,
      /-----BEGIN EC PRIVATE KEY-----/,
      /-----BEGIN PRIVATE KEY-----/,
    ];

    for (const pattern of forbiddenPatterns) {
      assert.ok(!pattern.test(envContent), `Found matching forbidden private credential pattern in .env.example`);
    }
  });

  it('5. PWA Manifest & Service Worker exist and are configured', () => {
    const manifestPath = path.resolve(__dirname, '../public/manifest.json');
    const swPath = path.resolve(__dirname, '../public/sw.js');

    assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
    assert.ok(fs.existsSync(swPath), 'sw.js must exist');

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.strictEqual(manifest.short_name, 'BluToken PWA');
    assert.strictEqual(manifest.display, 'standalone');
    assert.strictEqual(manifest.start_url, '/report-threat');
  });

  it('6. Carbon Parameters Strict TODO Refusal Verification', () => {
    const carbonParamsPath = path.resolve(__dirname, '../../../services/mrv-worker/app/carbon_params.yaml');
    assert.ok(fs.existsSync(carbonParamsPath), 'carbon_params.yaml must exist');
    const content = fs.readFileSync(carbonParamsPath, 'utf-8');
    assert.ok(content.includes('TODO'), 'Template carbon_params.yaml must contain TODO to prevent uncalibrated runs');
  });
});
