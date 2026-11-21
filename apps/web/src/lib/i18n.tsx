'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'en' | 'hi';

export interface I18nDictionary {
  nav: {
    projects: string;
    market: string;
    audit: string;
    map: string;
    connect: string;
    connected: string;
    disconnect: string;
  };
  notice: {
    pilotTitle: string;
    pilotText: string;
  };
  common: {
    loading: string;
    viewDetails: string;
    filter: string;
    all: string;
    search: string;
    back: string;
    status: string;
    ecosystem: string;
    state: string;
    area: string;
    owner: string;
    beneficiaries: string;
    reports: string;
    observations: string;
    listings: string;
    date: string;
    txHash: string;
    block: string;
    service: string;
    event: string;
    price: string;
    remaining: string;
    seller: string;
    buy: string;
    retire: string;
  };
  stats: {
    totalArea: string;
    totalMinted: string;
    totalRetired: string;
    activeProjects: string;
    bufferHeld: string;
    activeListings: string;
  };
  ecosystem: {
    Mangrove: string;
    Seagrass: string;
    SaltMarsh: string;
  };
  status: {
    Active: string;
    Pending: string;
    Suspended: string;
    Closed: string;
    Verified: string;
    Submitted: string;
    Rejected: string;
    Cancelled: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    explore: string;
    viewMap: string;
    targetEcosystems: string;
  };
}

const dictionaries: Record<Locale, I18nDictionary> = {
  en: {
    nav: {
      projects: 'Registry',
      market: 'Marketplace',
      audit: 'Audit Explorer',
      map: 'Ecosystem Map',
      connect: 'Connect Wallet',
      connected: 'Connected',
      disconnect: 'Disconnect',
    },
    notice: {
      pilotTitle: 'Pilot Registry Notice:',
      pilotText: 'BluTokens are pilot registry tokens, not government-certified credits.',
    },
    common: {
      loading: 'Loading data...',
      viewDetails: 'View Details',
      filter: 'Filter',
      all: 'All',
      search: 'Search by name or state...',
      back: 'Back to Registry',
      status: 'Status',
      ecosystem: 'Ecosystem',
      state: 'State',
      area: 'Area',
      owner: 'Project Developer',
      beneficiaries: 'Beneficiaries',
      reports: 'MRV Reports',
      observations: 'Satellite Observations',
      listings: 'Market Listings',
      date: 'Date',
      txHash: 'Transaction Hash',
      block: 'Block',
      service: 'Service',
      event: 'Event',
      price: 'Price',
      remaining: 'Remaining',
      seller: 'Seller',
      buy: 'Buy Credits',
      retire: 'Buy & Retire',
    },
    stats: {
      totalArea: 'Total Area Monitored',
      totalMinted: 'BluTokens Minted',
      totalRetired: 'BluTokens Retired',
      activeProjects: 'Active Projects',
      bufferHeld: 'Buffer Reserve Held',
      activeListings: 'Active Marketplace Listings',
    },
    ecosystem: {
      Mangrove: 'Mangroves',
      Seagrass: 'Seagrass Meadows',
      SaltMarsh: 'Salt Marshes',
    },
    status: {
      Active: 'Active',
      Pending: 'Pending Review',
      Suspended: 'Suspended',
      Closed: 'Closed',
      Verified: 'Verified & Minted',
      Submitted: 'Submitted for Review',
      Rejected: 'Rejected',
      Cancelled: 'Cancelled',
    },
    hero: {
      badge: 'Vara Network · Sails Framework · MRV Engine',
      title: "India's Blue Carbon Registry & MRV Platform",
      subtitle:
        "Transparent monitoring, reporting, and verification for India's coastal ecosystems. Empowering coastal communities through on-chain revenue sharing and auditable carbon conservation.",
      explore: 'Explore Registry',
      viewMap: 'View Ecosystem Map',
      targetEcosystems: 'Target Coastal Ecosystems',
    },
  },
  hi: {
    nav: {
      projects: 'रजिस्ट्री',
      market: 'मार्केटप्लेस',
      audit: 'ऑडिट एक्सप्लोरर',
      map: 'इकोसिस्टम मैप',
      connect: 'वॉलेट जोड़ें',
      connected: 'जुड़ा हुआ',
      disconnect: 'डिस्कनेक्ट करें',
    },
    notice: {
      pilotTitle: 'पायलट रजिस्ट्री सूचना:',
      pilotText: 'ब्लूटोकन पायलट रजिस्ट्री टोकन हैं, सरकारी प्रमाणित क्रेडिट नहीं।',
    },
    common: {
      loading: 'डेटा लोड हो रहा है...',
      viewDetails: 'विवरण देखें',
      filter: 'फ़िल्टर',
      all: 'सभी',
      search: 'नाम या राज्य से खोजें...',
      back: 'रजिस्ट्री पर वापस जाएं',
      status: 'स्थिति',
      ecosystem: 'पारिस्थितिकी तंत्र',
      state: 'राज्य',
      area: 'क्षेत्रफल',
      owner: 'परियोजना डेवलपर',
      beneficiaries: 'लाभार्थी समुदाय',
      reports: 'MRV रिपोर्ट',
      observations: 'उपग्रह डेटा',
      listings: 'बाजार लिस्टिंग',
      date: 'तारीख',
      txHash: 'लेनदेन हैश',
      block: 'ब्लॉक संख्या',
      service: 'सेवा',
      event: 'घटना',
      price: 'कीमत',
      remaining: 'शेष क्रेडिट',
      seller: 'विक्रेता',
      buy: 'क्रेडिट खरीदें',
      retire: 'खरीदें और रिटायर करें',
    },
    stats: {
      totalArea: 'निगरानी क्षेत्र',
      totalMinted: 'जारी किए गए ब्लूटोकन',
      totalRetired: 'रिटायर किए गए ब्लूटोकन',
      activeProjects: 'सक्रिय परियोजनाएं',
      bufferHeld: 'बफर रिजर्व पूल',
      activeListings: 'सक्रिय बाजार लिस्टिंग',
    },
    ecosystem: {
      Mangrove: 'मैंग्रोव वन',
      Seagrass: 'समुद्री घास के मैदान',
      SaltMarsh: 'खारे दलदल (साल्ट मार्श)',
    },
    status: {
      Active: 'सक्रिय',
      Pending: 'समीक्षाधीन',
      Suspended: 'निलंबित',
      Closed: 'समाप्त',
      Verified: 'सत्यापित और जारी',
      Submitted: 'समीक्षा हेतु प्रस्तुत',
      Rejected: 'अस्वीकृत',
      Cancelled: 'रद्द',
    },
    hero: {
      badge: 'वारा नेटवर्क · सेल्स फ्रेमवर्क · MRV इंजन',
      title: 'भारत की ब्लू कार्बन रजिस्ट्री और MRV प्लेटफॉर्म',
      subtitle:
        'भारत के तटीय पारिस्थितिक तंत्र के लिए पारदर्शी निगरानी, रिपोर्टिंग और सत्यापन। ऑन-चेन राजस्व साझाकरण और कार्बन संरक्षण के माध्यम से तटीय समुदायों का सशक्तिकरण।',
      explore: 'रजिस्ट्री देखें',
      viewMap: 'इकोसिस्टम मैप देखें',
      targetEcosystems: 'लक्षित तटीय पारिस्थितिकी तंत्र',
    },
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: I18nDictionary;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: dictionaries.en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('blutoken_locale') as Locale | null;
      if (saved === 'en' || saved === 'hi') {
        setLocaleState(saved);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('blutoken_locale', newLocale);
    } catch {
      // Ignore
    }
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t: dictionaries[locale] || dictionaries.en,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  return useContext(I18nContext);
}
