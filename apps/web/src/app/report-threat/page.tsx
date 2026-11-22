'use client';

import React, { useState } from 'react';
import {
  useOfflineQueue,
  saveQueuedReport,
  type QueuedThreatReport,
} from '@/components/pwa/offline-queue';
import {
  ShieldAlert,
  Camera,
  MapPin,
  Send,
  Mic,
  CheckCircle2,
  AlertTriangle,
  History,
  PhoneCall,
  Clock,
  Radio,
  FileCheck2,
} from 'lucide-react';

const COPY: Record<
  string,
  {
    title: string;
    sub: string;
    btn: string;
    viewfinderLabel: string;
    categoryTitle: string;
    notesTitle: string;
    notesPlaceholder: string;
    recentTitle: string;
  }
> = {
  en: {
    title: 'Citizen Coastal Threat Reporter',
    sub: 'Capture geotagged evidence of mangrove cutting, bund erosion, or debris for immediate Forest Samiti response.',
    btn: 'Submit Field Report to Forest Panchayat',
    viewfinderLabel: 'Lat: 21.8421°N, Lon: 88.8924°E • Sundarbans Buffer Zone',
    categoryTitle: 'Select Incident Category',
    notesTitle: 'Field Note or Voice Memo',
    notesPlaceholder: 'Describe tidal breach width, tree stump counts, or vessel markings...',
    recentTitle: 'Recent Panchayat Patrol Stream',
  },
  hi: {
    title: 'तटीय खतरा एवं मैंग्रोव रिपोर्टर',
    sub: 'वन समिति की त्वरित कार्रवाई के लिए मैंग्रोव कटाई, तटबंध कटाव या मलबे का जियोटैग किया गया साक्ष्य भेजें।',
    btn: 'वन पंचायत को फील्ड रिपोर्ट भेजें',
    viewfinderLabel: 'अक्षांश: 21.8421°N, देशांतर: 88.8924°E • सुंदरबन बफर जोन',
    categoryTitle: 'घटना श्रेणी चुनें',
    notesTitle: 'फील्ड नोट या वॉयस मेमो',
    notesPlaceholder: 'कटाव की चौड़ाई, कटे हुए पेड़ों की संख्या या नाव का विवरण लिखें...',
    recentTitle: 'हालिया पंचायत गश्ती स्ट्रीम',
  },
  bn: {
    title: 'উপকূলীয় ম্যানগ্রোভ বিপদ রিপোর্টার',
    sub: 'বন সমিতির দ্রুত পদক্ষেপের জন্য ম্যানগ্রোভ নিধন বা বাঁধ ভাঙনের ভূ-ট্যাগযুক্ত প্রমাণ জমা দিন।',
    btn: 'বন পঞ্চায়েতে ফিল্ড রিপোর্ট জমা দিন',
    viewfinderLabel: 'অক্ষাংশ: ২১.৮৪২১°উ, দ্রাঘিমাংশ: ৮৮.৮৯২৪°পূ • সুন্দরবন বাফার',
    categoryTitle: 'বিপদের ধরন বেছে নিন',
    notesTitle: 'ফিল্ড নোট বা ভয়েস রেকর্ড',
    notesPlaceholder: 'বাঁধ ভাঙার পরিমাপ, কাটা গাছের গুঁড়ি বা নৌকার বিবরণ লিখুন...',
    recentTitle: 'সাম্প্রতিক পঞ্চায়েত টহল স্ট্রিম',
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
    {
      id: 'felling',
      name: 'Illegal Mangrove Felling',
      icon: 'carpenter',
      color: 'text-rhizome-earth',
      imageUrl:
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'erosion',
      name: 'Bund Erosion / Tidal Breach',
      icon: 'waves',
      color: 'text-tidal-teal',
      imageUrl:
        'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'debris',
      name: 'Oil / Plastic Debris',
      icon: 'oil_barrel',
      color: 'text-rhizome-earth',
      imageUrl:
        'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'wildlife',
      name: 'Unusual Wildlife / Crab Mortality',
      icon: 'pest_control',
      color: 'text-living-leaf',
      imageUrl:
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=500&q=80',
    },
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
    <main className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex flex-col gap-8">
      {/* Nature Banner Header */}
      <section className="relative rounded-2xl overflow-hidden bg-deep-canopy text-on-deep-canopy p-6 sm:p-10 shadow-lg border border-outline-variant/60">
        {/* Background Nature Imagery - Real Mangrove Canals */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=80"
          alt="Sundarbans coastal mangrove forest estuary"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-canopy/95 via-deep-canopy/80 to-deep-canopy/65" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card/15 backdrop-blur-md border border-on-deep-canopy/20 text-xs font-semibold text-shoot-lime">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>CITIZEN MRV • PANCHAYAT THREAT REPORTING</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-on-deep-canopy tracking-tight">
              {c.title}
            </h1>
            <p className="font-body text-sm sm:text-base text-on-deep-canopy/85 leading-relaxed">
              {c.sub}
            </p>
          </div>

          {/* Controls: Online/Offline Status Pill & Trilingual Toggle */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border ${
                isOnline
                  ? 'bg-living-leaf-container/90 text-on-living-leaf-container border-living-leaf/30'
                  : 'bg-rhizome-earth-container/90 text-on-rhizome-earth-container border-rhizome-earth/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-living-leaf animate-pulse' : 'bg-rhizome-earth'
                }`}
              />
              <span>{isOnline ? 'Online / Synced' : `Offline (${queueCount} queued)`}</span>
            </span>

            {/* Trilingual Selector */}
            <div className="inline-flex items-center bg-surface-card/15 backdrop-blur-md rounded-full p-1 border border-on-deep-canopy/25">
              {(['en', 'hi', 'bn'] as const).map((code) => {
                const labels = { en: 'English', hi: 'हिन्दी', bn: 'বাংলা' };
                const isActive = lang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-shoot-lime text-on-shoot-lime shadow-sm'
                        : 'text-on-deep-canopy hover:bg-surface-card/20'
                    }`}
                  >
                    {labels[code]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Field Viewfinder & Threat Submission Form (7 cols) */}
        <div className="lg:col-span-7 bg-surface-card rounded-2xl border border-outline-variant/60 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-outline-variant/50 pb-4">
            <div>
              <span className="font-label text-xs font-semibold text-primary uppercase tracking-wider">
                Geotagged Field Evidence
              </span>
              <h2 className="font-headline text-2xl font-bold text-on-surface">Camera Viewfinder</h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/60 text-xs font-mono text-botanical-muted">
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>GPS Lock: ±2.4m</span>
            </div>
          </div>

          {/* Real Mangrove Prop Roots Viewfinder (100% genuine mangrove forest) */}
          <section className="relative rounded-2xl overflow-hidden border border-outline-variant shadow-md h-72 sm:h-80 bg-deep-canopy">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1618245318763-a15176d00133?auto=format&fit=crop&w=1200&q=80"
              alt="Real Rhizophora mangrove prop and stilt roots in coastal tidal water"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-deep-canopy/15 pointer-events-none" aria-hidden="true" />

            {/* Geotag Overlay Pill */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-deep-canopy/90 backdrop-blur-md text-on-deep-canopy border border-on-deep-canopy/20 shadow-md">
                <MapPin className="w-3.5 h-3.5 text-shoot-lime shrink-0" />
                <span className="font-mono text-xs tabular-nums">{c.viewfinderLabel}</span>
              </div>
            </div>

            {/* Camera Shutter Button */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center">
              <button
                type="button"
                aria-label="Capture geotagged field photo"
                className="w-14 h-14 rounded-full bg-surface-card text-deep-canopy shadow-2xl border-4 border-shoot-lime flex items-center justify-center active:scale-95 hover:scale-105 transition-all"
              >
                <Camera className="w-6 h-6 text-primary" />
              </button>
            </div>
          </section>

          {/* Incident Category Selection Grid with Real Photos */}
          <section className="flex flex-col gap-3">
            <span className="font-label text-sm font-semibold text-on-surface">
              {c.categoryTitle}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {categories.map((cat) => {
                const isSelected = selectedCat === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCat(cat.name)}
                    className={`text-left rounded-xl overflow-hidden shadow-sm transition-all group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-primary-container border-2 border-primary ring-2 ring-primary/20'
                        : 'bg-surface-card border border-outline-variant/60 hover:border-primary'
                    }`}
                  >
                    <div className="relative h-20 w-full overflow-hidden bg-deep-canopy">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-canopy/80 via-transparent to-transparent" />
                      <span
                        className="material-symbols-outlined text-[20px] text-white absolute bottom-1.5 left-2"
                        aria-hidden="true"
                      >
                        {cat.icon}
                      </span>
                    </div>
                    <div className="p-3">
                      <span className="font-label text-xs font-semibold text-on-surface leading-snug line-clamp-2">
                        {cat.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Description & Audio Note */}
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-label text-sm font-semibold text-on-surface">{c.notesTitle}</span>
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  isRecording
                    ? 'bg-error-container text-on-error-container animate-pulse'
                    : 'bg-primary-container text-on-primary-container hover:bg-deep-canopy hover:text-on-deep-canopy'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRecording ? 'Recording Audio...' : 'Record Voice Memo'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={c.notesPlaceholder}
              className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-botanical-muted/70 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </section>

          {submittedMessage && (
            <div className="p-4 rounded-xl bg-living-leaf-container text-on-living-leaf-container text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-living-leaf shrink-0" />
              <span>{submittedMessage}</span>
            </div>
          )}

          {/* Large Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-on-primary shadow-md hover:bg-deep-canopy active:scale-[0.99] transition-all font-label text-sm font-semibold"
          >
            <Send className="w-4 h-4" />
            <span>{c.btn}</span>
          </button>
        </div>

        {/* Right Column: Panchayat Stream, Active Patrols & Guidelines (5 cols) */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          {/* Sync Queue Card */}
          <section className="bg-surface-card rounded-2xl border border-outline-variant/60 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-label text-sm font-semibold text-on-surface">
                Offline Queue &amp; IPFS Sync Status
              </span>
              <span className="font-label text-xs font-semibold px-2.5 py-0.5 rounded-full bg-living-leaf-container text-on-living-leaf-container">
                {queueCount === 0 ? 'All Synced' : `${queueCount} Queued`}
              </span>
            </div>

            <div className="divide-y divide-outline-variant/40 text-xs">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-on-surface">Bund Erosion • Sector B-2</p>
                  <p className="font-mono text-[11px] text-botanical-muted">22 Nov • 07:15 IST • CID #bafy...82a</p>
                </div>
                <span className="inline-flex items-center gap-1 text-living-leaf font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Synced</span>
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-on-surface">Illegal Timber Skiff • Gosaba Creek</p>
                  <p className="font-mono text-[11px] text-botanical-muted">21 Nov • 16:40 IST • CID #bafy...14c</p>
                </div>
                <span className="inline-flex items-center gap-1 text-living-leaf font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Synced</span>
                </span>
              </div>
            </div>
          </section>

          {/* Ranger Protocol Guidelines */}
          <section className="bg-surface-card rounded-2xl border border-outline-variant/60 p-6 shadow-sm space-y-4">
            <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-primary" />
              <span>Field Verification Protocol</span>
            </h3>
            <ul className="space-y-3 text-xs text-botanical-muted">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>
                  <strong>Geotagged Accuracy:</strong> Ensure GPS precision is within ±10m before capturing evidence photos of tidal breaches.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>
                  <strong>Immutable IPFS Storage:</strong> Reports are hashed, stored in local IndexedDB offline, and pinned to IPFS upon network restoration.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>
                  <strong>Smart Contract Permanence:</strong> Cluster verified reports trigger automated smart contract reviews for affected buffer pools.
                </span>
              </li>
            </ul>
          </section>

          {/* Emergency Gram Panchayat Contact Card */}
          <section className="bg-deep-canopy text-on-deep-canopy rounded-2xl p-6 shadow-md border border-outline-variant/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-shoot-lime font-semibold text-xs">
                <PhoneCall className="w-4 h-4" />
                <span>Emergency Coastal Patrol</span>
              </div>
              <span className="text-[11px] font-mono text-on-deep-canopy/70">24x7 Samiti Helpline</span>
            </div>
            <p className="text-xs text-on-deep-canopy/85 leading-relaxed">
              For active wildlife entanglements or industrial vessel spills, contact the Gosaba Panchayat Forest Ranger Station immediately:
            </p>
            <div className="bg-surface-card/10 rounded-xl p-3 border border-on-deep-canopy/20 flex items-center justify-between font-mono text-xs text-shoot-lime">
              <span>Gosaba Forest Station</span>
              <span>+91 3218 255 108</span>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
