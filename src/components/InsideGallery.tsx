import React, { useState } from 'react';
import { Camera, X, ZoomIn } from 'lucide-react';

interface InsideGalleryProps {
  onOpenLogoInspector?: () => void;
}

interface RealClassroomPhoto {
  id: string;
  title: string;
  caption: string;
  imageSrc: string;
  objectPosition: string;
}

const REAL_CLASSROOM_PHOTOS: RealClassroomPhoto[] = [
  {
    id: 'gcc-classroom-wide',
    title: 'Digital Smart Classroom — Full View',
    caption: 'Interactive Maxhub digital board, whiteboard, and focused seating at Genius Coaching Centre, Bhabua.',
    imageSrc: '/assets/aistudio/file_000000003d988211ae397c998fb5c86e_980fd299.png',
    objectPosition: 'object-center',
  },
  {
    id: 'gcc-teacher-board',
    title: 'Concept-Based Teaching on Smart Board',
    caption: 'Prince Sir explaining Mathematics and Science concepts clearly on the interactive digital panel.',
    imageSrc: '/assets/aistudio/file_00000000cf3882119547c5b8f54511ac_93b50ac2.png',
    objectPosition: 'object-top',
  },
  {
    id: 'gcc-interactive-session',
    title: 'Interactive Digital Board Session',
    caption: 'Live step-by-step problem solving and visual demonstrations for Class 9 & 10 students.',
    imageSrc: '/assets/aistudio/file_0000000037ac8211968b3619660dd716_55a5e334.png',
    objectPosition: 'object-center',
  },
];

export const InsideGallery: React.FC<InsideGalleryProps> = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<RealClassroomPhoto | null>(null);

  return (
    <section id="gallery" className="py-14 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-xs">
            <Camera className="w-3.5 h-3.5" />
            <span>CLASSROOM GALLERY</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#06183A] tracking-tight font-display">
            Inside Genius Coaching Centre
          </h2>
          <p className="mt-2 text-sm sm:text-base font-medium text-slate-600">
            Real photographs from our Digital Smart Classroom in Bhabua, Kaimur.
          </p>
        </div>

        {/* 3 Real Classroom Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REAL_CLASSROOM_PHOTOS.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className="group text-left bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col"
            >
              <div className="relative h-64 w-full overflow-hidden bg-[#06183A]">
                <img
                  src={photo.imageSrc}
                  alt={photo.title}
                  className={`w-full h-full object-cover ${photo.objectPosition} group-hover:scale-105 transition-transform duration-300`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#06183A]/0 group-hover:bg-[#06183A]/25 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>View Photo</span>
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1">
                <h3 className="text-sm sm:text-base font-extrabold text-[#06183A] font-display">
                  {photo.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{photo.caption}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#06183A] text-white px-5 py-3.5 flex items-center justify-between gap-4">
              <h3 className="font-extrabold text-sm sm:text-base font-display truncate">
                {selectedPhoto.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Close photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-950">
              <img
                src={selectedPhoto.imageSrc}
                alt={selectedPhoto.title}
                className="w-full max-h-[75vh] object-contain mx-auto"
              />
            </div>
            <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 font-medium">
              {selectedPhoto.caption}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default InsideGallery;
