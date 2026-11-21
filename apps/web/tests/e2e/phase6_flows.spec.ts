import { test, expect } from '@playwright/test';

test.describe('Phase 6 End-to-End User Journeys', () => {
  test('1. Project Wizard: metadata, boundary calculation, and 100% beneficiary invariant', async ({
    page,
  }) => {
    await page.goto('/dashboard/owner/projects/new');

    // Verify title and page loaded
    await expect(page.locator('h1')).toContainText('Register New Restoration Project');

    // Fill metadata
    await page.fill('input[placeholder*="Sundarbans Delta"]', 'Chilika Lake Seagrass Meadow Restoration');
    await page.selectOption('select:has-text("Mangrove Forest")', 'Seagrass');
    await page.selectOption('select:has-text("West Bengal")', 'OD');

    // Load sample polygon
    const loadSampleBtn = page.locator('button:has-text("Load Sample Polygon")');
    await expect(loadSampleBtn).toBeVisible();
    await loadSampleBtn.click();

    // Verify area calculated
    await expect(page.locator('text=Calculated Area:')).toBeVisible();

    // Beneficiary shares validation: initial is 100% (10,000 bps)
    await expect(page.locator('text=Total: 100.00% (10,000 bps)')).toBeVisible();

    // Trigger an invalid state: add another beneficiary without adjusting shares
    const addBeneficiaryBtn = page.locator('button:has-text("Add Community Beneficiary")');
    await addBeneficiaryBtn.click();

    // Change the new beneficiary's share so sum exceeds 10,000 bps
    const shareInputs = page.locator('input[type="number"][max="10000"]');
    await shareInputs.nth(1).fill('2000');

    // Assert validation error appears and submit button is disabled
    await expect(page.locator('text=Total shares exceed 100%')).toBeVisible();
    const submitBtn = page.locator('button:has-text("Register Project on Vara")');
    await expect(submitBtn).toBeDisabled();

    // Click Split Evenly to restore 100% (10,000 bps)
    const splitEvenlyBtn = page.locator('button:has-text("Split Evenly")');
    await splitEvenlyBtn.click();
    await expect(page.locator('text=Total: 100.00% (10,000 bps)')).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('2. MRV Submission: period selection, stub satellite analysis, SHA-256 hash, and bundle CID', async ({
    page,
  }) => {
    await page.goto('/dashboard/owner/projects/1/submit-report');

    // Header and project metadata
    await expect(page.locator('h1')).toContainText('Submit MRV Verification Report');
    await expect(page.locator('text=Target Project')).toBeVisible();

    // Click Run Analysis
    const runAnalysisBtn = page.locator('button:has-text("Run Satellite & Biomass Analysis")');
    await expect(runAnalysisBtn).toBeVisible();
    await runAnalysisBtn.click();

    // Verify bundle preview appears
    await expect(page.locator('text=2. MRV Evidence Bundle Preview')).toBeVisible();
    await expect(page.locator('text=Net Carbon Sequestration')).toBeVisible();
    await expect(page.locator('text=SHA-256 Hash:')).toBeVisible();
    await expect(page.locator('text=IPFS Bundle CID:')).toBeVisible();

    // Submit button is active
    const submitReportBtn = page.locator('button:has-text("Sign & Submit to Registry Contract")');
    await expect(submitReportBtn).toBeVisible();
  });

  test('3. Verifier Queue & Review Screen: automated checklist, quorum meter, and voting', async ({
    page,
  }) => {
    await page.goto('/dashboard/verifier');
    await expect(page.locator('h1')).toContainText('MRV Verification Queue');

    // Navigate to report audit dossier
    const auditBtn = page.locator('a:has-text("Audit & Cast Vote")').first();
    await expect(auditBtn).toBeVisible();
    await auditBtn.click();

    await page.waitForURL('**/dashboard/verifier/reports/**');
    await expect(page.locator('h1')).toBeVisible();

    // Check automated checklist items
    await expect(page.locator('text=Automated Verification Checks')).toBeVisible();
    await expect(page.locator('text=SHA-256 Bundle Integrity')).toBeVisible();
    await expect(page.locator('text=Monitoring Period Non-Overlap')).toBeVisible();
    await expect(page.locator('text=Sentinel-2 Cloud Masking')).toBeVisible();
    await expect(page.locator('text=Verifier Independence Check')).toBeVisible();

    // Check Quorum meter
    await expect(page.locator('text=Verification Quorum')).toBeVisible();
    await expect(page.locator('text=Distinct Orgs')).toBeVisible();

    // Test voting buttons
    const rejectBtn = page.locator('button:has-text("Reject")');
    await rejectBtn.click();
    await expect(page.locator('button:has-text("Submit Verification Vote to Vara")')).toBeVisible();

    const approveBtn = page.locator('button:has-text("Approve")');
    await approveBtn.click();
    await expect(page.locator('button:has-text("Submit Verification Vote to Vara")')).toBeVisible();
  });

  test('4. Marketplace Purchase Modal & Printable Retirement Certificate', async ({ page }) => {
    await page.goto('/market');
    await expect(page.locator('h1')).toContainText('Verified Blue Carbon Credits');

    // Check stats and active listing
    await expect(page.locator('text=Available Carbon Credits')).toBeVisible();
    await expect(page.locator('text=Floor Price')).toBeVisible();

    // Open Buy & Retire Modal
    const retireBtn = page.locator('button:has-text("Buy & Retire")').first();
    await expect(retireBtn).toBeVisible();
    await retireBtn.click();

    // Modal opens
    await expect(page.locator('text=Buy & Retire Carbon Credits')).toBeVisible();
    await expect(page.locator('text=Retiree Legal Entity or Beneficiary Name')).toBeVisible();
    await expect(page.locator('text=Protocol Treasury Fee (2.00%)')).toBeVisible();
    await expect(page.locator('text=BluTokens are pilot registry tokens, not government-certified credits.')).toBeVisible();

    // Close modal
    await page.locator('button:has(svg.lucide-x)').click();

    // Visit Certificate Page directly
    await page.goto('/retire/1');
    await expect(page.locator('h1')).toContainText('Certificate of Carbon Offset');
    await expect(page.locator('text=Official Blue Carbon Retirement Certificate')).toBeVisible();
    await expect(page.locator('text=Amount Permanently Retired')).toBeVisible();
    await expect(page.locator('text=SCAN TO VERIFY')).toBeVisible();
    await expect(page.locator('text=Immutable On-Chain Verification')).toBeVisible();
    await expect(page.locator('text=Print or Save as PDF')).toBeVisible();
    await expect(
      page.locator('text=BluTokens are pilot registry tokens, not government-certified credits.')
    ).toBeVisible();
  });

  test('5. Community Revenue & Admin Portals', async ({ page }) => {
    // Community Portal
    await page.goto('/dashboard/community');
    await expect(page.locator('h1')).toContainText('Community Revenue Distributions');
    await expect(page.locator('text=Claimable Balance')).toBeVisible();
    await expect(page.locator('text=Pull-Payment Architecture')).toBeVisible();

    // Admin Portal
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText('Protocol Control Center');
    await expect(page.locator('text=Global Circuit Breaker Status')).toBeVisible();
    await expect(page.locator('text=Accreditation & Roles')).toBeVisible();
    await expect(page.locator('text=Protocol Parameters')).toBeVisible();
  });
});
