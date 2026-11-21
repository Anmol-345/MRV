import React from 'react';
import { Waves, Trees, ShieldCheck, ArrowRight, Activity, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-deep-green text-white py-16 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/80 border border-leaf/30 text-lime text-xs font-medium">
            <Activity className="w-3.5 h-3.5" />
            Vara Network · Sails Framework · MRV Engine
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
            India&apos;s Blue Carbon Registry &amp; MRV Platform
          </h1>

          <p className="text-lg md:text-xl text-mist/80 max-w-2xl leading-relaxed">
            Transparent monitoring, reporting, and verification for India&apos;s coastal ecosystems. Empowering coastal communities through on-chain revenue sharing and auditable carbon conservation.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href="/projects"
              className="inline-flex items-center gap-2 bg-leaf hover:bg-leaf/90 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors text-sm"
            >
              Explore Registry <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/map"
              className="inline-flex items-center gap-2 bg-forest hover:bg-forest/80 border border-leaf/40 text-mist font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              <MapPin className="w-4 h-4 text-lime" /> View Ecosystem Map
            </a>
          </div>
        </div>
      </section>

      {/* Ecosystem Highlights */}
      <section className="py-12 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-serif font-bold text-forest mb-6">Target Ecosystems</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-muted/20 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center text-forest">
              <Trees className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-ink">Mangroves</h3>
            <p className="text-sm text-muted">
              Sundarbans, Andaman, Gujarat &amp; Tamil Nadu coastal forests with deep sediment carbon pools.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-muted/20 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
              <Waves className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-ink">Seagrass Meadows</h3>
            <p className="text-sm text-muted">
              Gulf of Mannar and Palk Bay underwater meadows sequestering sediment carbon for centuries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-muted/20 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-leaf/10 flex items-center justify-center text-leaf">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-ink">Salt Marshes</h3>
            <p className="text-sm text-muted">
              Intertidal wetland zones across Kutch and coastal estuaries protecting shorelines from erosion.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
