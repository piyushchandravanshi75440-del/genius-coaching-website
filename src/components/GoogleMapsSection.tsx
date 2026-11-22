import React from 'react';
import { BRAND_INFO } from '../data/coachingData';
import { MapPin, Navigation, ExternalLink, Info } from 'lucide-react';

export const GoogleMapsSection: React.FC = () => {
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Genius Coaching Centre Bhabua Kaimur Bihar'
  )}`;

  return (
    <section className="py-14 sm:py-16 bg-slate-100 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-slate-800 text-xs font-bold uppercase tracking-wider mb-2.5 border border-slate-200 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>Institute Location</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Find Us in Bhabua
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
            Conveniently located in Bhabua, Kaimur, Bihar for students from Class 9 & 10.
          </p>
        </div>

        {/* Map & Location Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Map Embed / Location Viewer */}
            <div className="lg:col-span-8 relative aspect-[16/9] lg:aspect-auto lg:min-h-[380px] bg-slate-200 overflow-hidden">
              <iframe
                title="Genius Coaching Centre Bhabua Location Map"
                src="https://maps.google.com/maps?q=Bhabua%2C+Kaimur%2C+Bihar&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                className="w-full h-full border-0"
                loading="lazy"
                aria-label="Map showing Bhabua Kaimur Bihar"
              />
              
              {/* Overlay location marker pin */}
              <div className="absolute top-4 left-4 bg-slate-950/90 text-white backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 shadow-lg flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold">Bhabua, Kaimur (Bihar)</span>
              </div>
            </div>

            {/* Location Details & Directions Panel */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200">
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                    Centre Address
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    {BRAND_INFO.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {BRAND_INFO.location}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    District: Kaimur, Bihar – 821101
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Accessible Location:</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Centrally positioned in Bhabua town for easy commute from local schools and residential areas.
                  </p>
                </div>

                {/* Location Accuracy notice strictly as required */}
                <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Location centered on Bhabua, Kaimur. Exact street landmark can be confirmed via phone before your visit.
                  </span>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow transition-all active:scale-[0.98]"
                >
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-1" />
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
export default GoogleMapsSection;
