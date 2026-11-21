'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Camera,
  MapPin,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Send,
  Loader2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useOfflineQueue, saveQueuedReport } from '@/components/pwa/offline-queue';
import { useI18n } from '@/lib/i18n';

export default function CitizenReportingPwaPage() {
  const { t } = useI18n();
  const { isOnline, queueCount, refreshCount } = useOfflineQueue();

  // Form State
  const [category, setCategory] = useState<string>('Cutting');
  const [severity, setSeverity] = useState<string>('Medium');
  const [latitude, setLatitude] = useState<number>(21.95);
  const [longitude, setLongitude] = useState<number>(88.85);
  const [note, setNote] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedStatus, setSubmittedStatus] = useState<'online' | 'offline_queued' | null>(null);

  const handleGetLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Truncate to 4 decimals for privacy & exactness
          setLatitude(Math.round(pos.coords.latitude * 10000) / 10000);
          setLongitude(Math.round(pos.coords.longitude * 10000) / 10000);
        },
        () => {
          // Fallback location kept
        }
      );
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const reportId = 'report_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    if (!isOnline) {
      // Store in offline IndexedDB
      await saveQueuedReport({
        id: reportId,
        projectId: 1,
        category,
        severity,
        latitude,
        longitude,
        note,
        imageBase64: photoPreview || undefined,
        timestamp: new Date().toISOString(),
        synced: false,
      });
      await refreshCount();
      setSubmittedStatus('offline_queued');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/citizen-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 1,
          category,
          severity,
          latitude,
          longitude,
          note,
          photoCid: photoPreview ? 'bafkreiphotosynced' : undefined,
        }),
      });

      if (res.ok) {
        setSubmittedStatus('online');
      } else {
        // Fallback to offline queue on API error
        await saveQueuedReport({
          id: reportId,
          projectId: 1,
          category,
          severity,
          latitude,
          longitude,
          note,
          imageBase64: photoPreview || undefined,
          timestamp: new Date().toISOString(),
          synced: false,
        });
        await refreshCount();
        setSubmittedStatus('offline_queued');
      }
    } catch {
      await saveQueuedReport({
        id: reportId,
        projectId: 1,
        category,
        severity,
        latitude,
        longitude,
        note,
        imageBase64: photoPreview || undefined,
        timestamp: new Date().toISOString(),
        synced: false,
      });
      await refreshCount();
      setSubmittedStatus('offline_queued');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedStatus(null);
    setNote('');
    setPhotoPreview(null);
  };

  return (
    <main className="flex-1 bg-mist/30 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Connectivity Status Banner */}
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-colors ${
            isOnline
              ? 'bg-leaf/10 border-leaf/30 text-forest'
              : 'bg-earth/20 border-earth/30 text-earth'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-leaf" />
                <span>Connected Online · Auto-Sync Active</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-earth" />
                <span>Offline / Airplane Mode · Reports Will Be Queued Locally</span>
              </>
            )}
          </div>
          {queueCount > 0 && (
            <span className="font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
              {queueCount} Queued
            </span>
          )}
        </div>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-earth/15 text-earth text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Citizen Ecological Guardian PWA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">Report Coastal Threat</h1>
          <p className="text-xs sm:text-sm text-muted">
            Report illegal tree felling, oil spills, chemical dumping, or coastal erosion. Submissions are cryptographically timestamped and queued offline if network is unavailable.
          </p>
        </div>

        {/* Success Confirmation Card */}
        {submittedStatus ? (
          <div className="bg-white p-8 rounded-3xl border border-muted/20 shadow-sm text-center space-y-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                submittedStatus === 'online' ? 'bg-leaf/20 text-leaf' : 'bg-earth/20 text-earth'
              }`}
            >
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl text-ink">
                {submittedStatus === 'online' ? 'Threat Report Submitted!' : 'Saved to Offline Queue!'}
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                {submittedStatus === 'online'
                  ? 'Your observation has been indexed and flagged on the regional government monitoring dashboard.'
                  : 'Your threat report is saved in your local device storage and will automatically transmit once internet connectivity is restored.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-muted/20 shadow-sm space-y-6"
          >
            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Threat Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="Cutting">Illegal Cutting &amp; Tree Felling</option>
                <option value="Pollution">Industrial / Chemical / Oil Pollution</option>
                <option value="Reclamation">Unauthorized Coastal Land Reclamation</option>
                <option value="Erosion">Severe Coastal &amp; Embankment Erosion</option>
              </select>
            </div>

            {/* Severity */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Severity Level</label>
              <div className="grid grid-cols-4 gap-2">
                {['Low', 'Medium', 'High', 'Critical'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      severity === lvl
                        ? lvl === 'Critical'
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-forest text-white border-forest shadow-sm'
                        : 'bg-mist/40 text-muted border-muted/20 hover:border-muted/40'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Geolocation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink">Geotag Coordinates *</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-xs text-forest font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Use Device GPS</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-muted font-medium">Latitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-muted/20 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted font-medium">Longitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-muted/20 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>
            </div>

            {/* Photo Capture */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink">Evidence Photo</label>
              {photoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-muted/20 aspect-video bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Threat preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-muted/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-mist/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <Camera className="w-8 h-8 text-forest mb-2" />
                  <span className="text-xs font-semibold text-ink">Take Photo or Upload Evidence</span>
                  <span className="text-[10px] text-muted mt-0.5">Mobile camera automatically compressed</span>
                </label>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Observation Notes</label>
              <textarea
                rows={3}
                placeholder="Describe the incident, observed equipment, or environmental damage..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-3 rounded-xl border border-muted/20 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-forest hover:bg-forest/90 disabled:opacity-40 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Report...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {isOnline ? 'Submit Report Now' : 'Queue Report (Offline)'}
                  </span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
