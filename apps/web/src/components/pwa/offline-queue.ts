'use client';

import { useEffect, useState } from 'react';

export interface QueuedThreatReport {
  id: string;
  projectId?: number;
  category: string;
  severity: string;
  latitude: number;
  longitude: number;
  note: string;
  imageBase64?: string;
  timestamp: string;
  synced: boolean;
}

const DB_NAME = 'blutoken_offline_db';
const STORE_NAME = 'threat_reports';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveQueuedReport(report: QueuedThreatReport): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(report);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getQueuedReports(): Promise<QueuedThreatReport[]> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function deleteQueuedReport(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queueCount, setQueueCount] = useState<number>(0);

  const refreshCount = async () => {
    const reports = await getQueuedReports();
    setQueueCount(reports.length);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    refreshCount();

    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-flush pending queue
      const reports = await getQueuedReports();
      for (const report of reports) {
        try {
          const res = await fetch('/api/citizen-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: report.projectId || 1,
              category: report.category,
              severity: report.severity,
              latitude: report.latitude,
              longitude: report.longitude,
              note: report.note,
              photoCid: report.imageBase64 ? 'bafkreiphotosynced' : undefined,
            }),
          });
          if (res.ok) {
            await deleteQueuedReport(report.id);
          }
        } catch {
          // Retry later
        }
      }
      refreshCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, queueCount, refreshCount };
}
