/**
 * Stub MRV Analysis Generator (DEMO-tagged bundle)
 * 
 * Generates deterministic satellite & biomass bundles for MRV verification,
 * computes SHA-256 data hashes using the Web Crypto API, and returns formatted payloads.
 */

export interface DemoMrvBundle {
  tag: 'DEMO';
  projectId: number;
  periodStart: number;
  periodEnd: number;
  baselineBiomassMgHa: number;
  observedBiomassMgHa: number;
  areaHa: number;
  deltaBiomassMg: number;
  milliTco2eNet: bigint;
  cloudCoverPct: number;
  ndviMean: number;
  sensorHealthScore: number;
  evidenceCids: string[];
  sha256Hex: string;
  sha256Bytes: number[];
  bundleCid: string;
  methodologyVersion: string;
}

/**
 * Computes SHA-256 hash of a string using Web Crypto API
 */
export async function computeSha256(data: string): Promise<{ hex: string; bytes: number[] }> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = Array.from(new Uint8Array(hashBuffer));
  const hex = '0x' + bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  return { hex, bytes };
}

/**
 * Generates deterministic MRV bundle for demonstration & verification
 */
export async function generateDemoMrvBundle(
  projectId: number,
  areaHa: number,
  periodStart: number,
  periodEnd: number,
  ecosystem: string = 'Mangrove'
): Promise<DemoMrvBundle> {
  // Ecological carbon factor based on ecosystem
  const factor = ecosystem === 'Mangrove' ? 4.2 : ecosystem === 'Seagrass' ? 2.5 : 3.1;

  const baselineBiomass = 110.5;
  const observedBiomass = 114.2; // ~3.7 Mg/ha gain
  const deltaBiomassPerHa = observedBiomass - baselineBiomass;
  const totalDeltaMg = deltaBiomassPerHa * areaHa;

  // 1 Mg dry biomass ≈ 0.47 C ≈ 1.72 tCO2e
  const estimatedTco2e = totalDeltaMg * factor;
  // Convert to milli-tCO2e integer (1 tCO2e = 1000 milli-tCO2e)
  const milliTco2eNet = BigInt(Math.max(1000, Math.round(estimatedTco2e * 1000)));

  const canonicalPayload = JSON.stringify({
    tag: 'DEMO',
    projectId,
    periodStart,
    periodEnd,
    areaHa,
    baselineBiomass,
    observedBiomass,
    milliTco2eNet: milliTco2eNet.toString(),
    methodology: 'VM0033-BLUE-CARBON-V1.0',
    satellite: 'Sentinel-2-L2A-HARMONIZED',
    cloudCoverMaxPct: 4.2,
    sensorIntegrityChecked: true,
  });

  const { hex, bytes } = await computeSha256(canonicalPayload);
  const bundleCid = `bafybeidemo${hex.slice(2, 14)}${projectId}`;

  return {
    tag: 'DEMO',
    projectId,
    periodStart,
    periodEnd,
    baselineBiomassMgHa: baselineBiomass,
    observedBiomassMgHa: observedBiomass,
    areaHa,
    deltaBiomassMg: Math.round(totalDeltaMg * 100) / 100,
    milliTco2eNet,
    cloudCoverPct: 3.8,
    ndviMean: 0.74,
    sensorHealthScore: 98,
    evidenceCids: [
      `${bundleCid}/composite_rgb.tif`,
      `${bundleCid}/ndvi_diff.tif`,
      `${bundleCid}/sensor_telemetry.csv`,
    ],
    sha256Hex: hex,
    sha256Bytes: bytes,
    bundleCid,
    methodologyVersion: 'VM0033-BLUE-CARBON-V1.0',
  };
}
