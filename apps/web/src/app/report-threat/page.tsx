'use client';

import React, { useState } from 'react';
import { useOfflineQueue, saveQueuedReport, type QueuedThreatReport } from '@/components/pwa/offline-queue';

const COPY: Record<string, { title: string; sub: string; btn: string }> = {
  en: {
    title: 'Coastal Threat Reporter',
    sub: 'Capture geotagged evidence for rapid Forest Samiti response.',
    btn: 'Submit Field Report to Forest Panchayat',
  },
  hi: {
    title: 'तटीय खतरा रिपोर्टर',
    sub: 'वन समिति की त्वरित कार्रवाई के लिए जियोटैग किया गया साक्ष्य भेजें।',
    btn: 'वन पंचायत को फील्ड रिपोर्ट भेजें',
  },
  bn: {
    title: 'উপকূলীয় বিপদ রিপোর্টার',
    sub: 'বন সমিতির দ্রুত পদক্ষেপের জন্য জিওট্যাগ করা প্রমাণ পাঠান।',
    btn: 'বন পঞ্চায়েতে ফিল্ড রিপোর্ট জমা দিন',
  },
};

export default function CitizenReportingPwaPage() {
  const { isOnline, queueCount, refreshCount } = useOfflineQueue();
  const [lang, setLang] = useState<'en' | 'hi' | 'bn'>('en');
  const [selectedCat, setSelectedCat] = useState<string>('Illegal Mangrove Felling');
  const [note, setNote] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const categories = [
    { id: 'felling', name: 'Illegal Mangrove Felling', icon: 'carpenter', color: 'text-rhizome-earth' },
    { id: 'erosion', name: 'Bund Erosion / Tidal Breach', icon: 'waves', color: 'text-tidal-teal' },
    { id: 'debris', name: 'Oil / Plastic Debris', icon: 'oil_barrel', color: 'text-rhizome-earth' },
    { id: 'wildlife', name: 'Unusual Wildlife / Crab Mortality', icon: 'pest_control', color: 'text-living-leaf' },
  ];

  const handleSubmit = async () => {
    const reportData: QueuedThreatReport = {
      id: `report_${Date.now()}`,
      category: selectedCat,
      severity: 'High',
      latitude: 21.8421,
      longitude: 88.8924,
      note,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    if (!isOnline) {
      await saveQueuedReport(reportData);
      refreshCount();
      setSubmittedMessage('Offline: Report queued in IndexedDB. Will sync when connection restores.');
    } else {
      try {
        await fetch('/api/citizen-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData),
        });
        setSubmittedMessage('Report submitted successfully to Forest Panchayat and queued for IPFS pinning!');
      } catch {
        await saveQueuedReport(reportData);
        refreshCount();
        setSubmittedMessage('Network error: Saved to local offline queue.');
      }
    }

    setTimeout(() => setSubmittedMessage(null), 5000);
  };

  const c = COPY[lang];

  return (
    <div className="max-w-md mx-auto w-full min-h-[884px] flex flex-col bg-surface text-on-surface font-body shadow-lg my-0 sm:my-6 rounded-none sm:rounded-2xl overflow-hidden border border-outline-variant/60">
      {/* Dark Forest Green Mobile PWA Header from Stitch */}
      <header className="sticky top-0 z-40 bg-deep-canopy text-on-deep-canopy px-gutter-md py-3.5 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-shoot-lime" aria-hidden="true">
              shield_with_heart
            </span>
            <span className="font-headline text-title-md text-on-deep-canopy">BluToken Field</span>
          </div>

          {/* Dual/Tri Language Toggle from Stitch */}
          <div className="inline-flex items-center bg-surface-card/10 rounded-full p-0.5 border border-on-deep-canopy/20">
            {(['en', 'hi', 'bn'] as const).map((code) => {
              const labels = { en: 'EN', hi: 'हिन्दी', bn: 'বাংলা' };
              const isActive = lang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`px-2 py-0.5 rounded-full font-label text-label-sm transition-colors ${
                    isActive ? 'bg-shoot-lime text-on-shoot-lime' : 'text-on-deep-canopy'
                  }`}
                >
                  {labels[code]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2.5">
          {/* Offline / Online Indicator Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-label-sm ${
              isOnline
                ? 'bg-living-leaf-container text-on-living-leaf-container'
                : 'bg-rhizome-earth-container text-on-rhizome-earth-container'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isOnline ? 'bg-living-leaf' : 'bg-rhizome-earth'}`}
              aria-hidden="true"
            />
            <span>{isOnline ? 'Online / Synced' : `Offline (${queueCount} queued)`}</span>
          </span>
          <span className="font-mono text-mono-sm text-on-deep-canopy/80">Gosaba Panchayat</span>
        </div>
      </header>

      <main className="flex-1 px-gutter-md py-gutter-md flex flex-col gap-gutter-md">
        {/* Title */}
        <div>
          <h1 className="font-headline text-headline-lg-mobile text-on-surface">{c.title}</h1>
          <p className="font-body text-body-md text-botanical-muted">{c.sub}</p>
        </div>

        {/* Prominent Photo Capture Viewfinder with Geotag Overlay from Stitch */}
        <section className="relative rounded-xl overflow-hidden border border-outline-variant shadow-sm h-56 bg-deep-canopy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://lh3.googleusercontent.com/aida/ALJJyrDN3x1eEz-HH1Tgklv1xpSSMlZTPFzNMbzsebbfOyCCS2ngjePaWTgtX6Lwr_I92uAuWuAJh7Mgki1ROrFDCw_1rzhPPZlgQ7bz41a9BG1p_J6CFPYitbHrauBmDF0zivE_-cfsvFjjZ0NyxQHgyrlWWkCd-n5m1pfWvX53pK42fmeQ0VD-mwXV84rXFoMapJ_mUT1qu8tqjAGnhjLBrQO_EllQbQqcKpkYu7Bd42IDVZ_o5ac42xpDv4kgMTpG5eRc6g"
            alt="Viewfinder showing Sundarbans mangrove shoreline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-deep-canopy/20 pointer-events-none" aria-hidden="true" />

          {/* Geotag Overlay Pill */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-deep-canopy/85 backdrop-blur-md text-on-deep-canopy border border-on-deep-canopy/20">
              <span className="material-symbols-outlined text-[15px] text-shoot-lime" aria-hidden="true">
                location_on
              </span>
              <span className="font-mono text-mono-sm tabular-nums">
                Lat: 21.8421°N, Lon: 88.8924°E • Sundarbans Buffer
              </span>
            </div>
          </div>

          {/* Camera Shutter Button */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center">
            <button
              type="button"
              aria-label="Capture geotagged field photo"
              className="w-12 h-12 rounded-full bg-surface-card text-deep-canopy shadow-lg border-4 border-shoot-lime flex items-center justify-center active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                photo_camera
              </span>
            </button>
          </div>
        </section>

        {/* Category Selection Grid (2x2 Tactile Icon Buttons from Stitch) */}
        <section className="flex flex-col gap-2">
          <span className="font-label text-label-md text-on-surface">Select Incident Category</span>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCat === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat.name)}
                  className={`text-left rounded-lg p-3.5 flex flex-col gap-2 shadow-sm transition-all ${
                    isSelected
                      ? 'bg-primary-container border-2 border-primary'
                      : 'bg-surface-card border border-outline-variant hover:border-primary'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[24px] ${cat.color}`} aria-hidden="true">
                    {cat.icon}
                  </span>
                  <span className="font-label text-label-md text-on-surface leading-snug">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Audio Voice Note / Description Text Area from Stitch */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label text-label-md text-on-surface">Field Note or Voice Memo</span>
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label text-label-sm transition-colors ${
                isRecording
                  ? 'bg-error-container text-on-error-container animate-pulse'
                  : 'bg-primary-container text-on-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                mic
              </span>
              <span>{isRecording ? 'Recording...' : 'Record Audio'}</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe tidal breach width or vessel markings..."
            className="w-full rounded-lg border border-outline-variant bg-surface-card px-3.5 py-2.5 text-body-md text-on-surface placeholder:text-botanical-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </section>

        {submittedMessage && (
          <div className="p-3 rounded-lg bg-living-leaf-container text-on-living-leaf-container text-body-md font-body">
            {submittedMessage}
          </div>
        )}

        {/* One-Tap Large Submit Button from Stitch */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full min-h-[52px] inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded-md bg-primary text-on-primary shadow-md hover:bg-deep-canopy active:scale-[0.99] transition-all font-label text-label-lg"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            send
          </span>
          <span>{c.btn}</span>
        </button>

        {/* Offline Sync Status Queue Card from Stitch */}
        <section className="bg-surface-card rounded-xl border border-outline-variant/70 p-gutter-md flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-label-md text-on-surface">Sync Queue History</span>
            <span className="font-label text-label-sm text-primary">All Synced</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-outline-variant/50">
            <div>
              <p className="font-body text-body-md text-on-surface">Bund Erosion • Sector B-2</p>
              <p className="font-mono text-mono-sm text-botanical-muted">21 Nov • 11:04 IST • CID #bafy...82a</p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-living-leaf" aria-hidden="true">
              cloud_done
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
