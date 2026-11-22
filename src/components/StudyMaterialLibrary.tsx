import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
  BookOpen,
  Download,
  Eye,
  FileText,
  Filter,
  Loader2,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { getTemporaryPdfUrl } from '../lib/supabaseStorage';
import {
  BOARD_OPTIONS,
  CLASS_OPTIONS,
  MATERIAL_TYPE_OPTIONS,
  normalizeMaterialType,
  SUBJECT_OPTIONS,
  StudyMaterial,
} from '../types/studyMaterial';

export const StudyMaterialLibrary: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedBoard, setSelectedBoard] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [previewMaterial, setPreviewMaterial] = useState<{
    material: StudyMaterial;
    url: string;
  } | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    const materialsRef = collection(db, 'studyMaterials');
    // Strictly query only published materials to comply with Firestore Security Rules
    const publishedQuery = query(materialsRef, where('status', '==', 'published'));

    const unsubscribe = onSnapshot(
      publishedQuery,
      (snapshot) => {
        const items: StudyMaterial[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            materialId: data.materialId || docSnap.id,
            title: data.title || '',
            class: data.class || 'Class 10',
            board: data.board || 'BSEB',
            subject: data.subject || 'Mathematics',
            chapter: data.chapter || '',
            examYear: data.examYear || '',
            materialType: normalizeMaterialType(data.materialType || 'Notes'),
            description: data.description || '',
            storagePath: data.storagePath || '',
            downloadUrl: data.downloadUrl || '',
            status: data.status || 'published',
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            createdBy: data.createdBy || '',
          };
        });

        // Sort newest first client-side (avoids requiring composite index)
        items.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() ?? 0;
          const timeB = b.createdAt?.toMillis?.() ?? 0;
          return timeB - timeA;
        });

        setMaterials(items);
        setLoading(false);
        setErrorMessage(null);
      },
      (error) => {
        setLoading(false);
        setErrorMessage('Unable to load study materials right now. Please try again shortly.');
        try {
          handleFirestoreError(error, OperationType.LIST, 'studyMaterials');
        } catch {
          // Logged by handleFirestoreError
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredMaterials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return materials.filter((item) => {
      if (selectedClass !== 'All' && item.class !== selectedClass) return false;
      if (selectedBoard !== 'All' && item.board !== selectedBoard) return false;
      if (selectedSubject !== 'All' && item.subject !== selectedSubject) return false;
      if (selectedType !== 'All' && normalizeMaterialType(item.materialType) !== selectedType) {
        return false;
      }
      if (q) {
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchChapter = item.chapter.toLowerCase().includes(q);
        const matchYear = (item.examYear || '').toLowerCase().includes(q);
        const matchSubject = item.subject.toLowerCase().includes(q);
        const matchType = item.materialType.toLowerCase().includes(q);
        if (!matchTitle && !matchChapter && !matchYear && !matchSubject && !matchType) return false;
      }
      return true;
    });
  }, [materials, selectedClass, selectedBoard, selectedSubject, selectedType, searchQuery]);

  const resolvePdfUrl = async (item: StudyMaterial): Promise<string | null> => {
    try {
      const { signedUrl } = await getTemporaryPdfUrl(item.materialId);
      return signedUrl;
    } catch (err) {
      console.error('Failed to resolve temporary PDF URL:', err);
      if (item.downloadUrl) return item.downloadUrl;
      return null;
    }
  };

  const handleViewPdf = async (item: StudyMaterial) => {
    setResolvingId(item.materialId);
    const url = await resolvePdfUrl(item);
    setResolvingId(null);
    if (url) {
      setPreviewMaterial({ material: item, url });
    }
  };

  const handleDownloadPdf = async (item: StudyMaterial) => {
    setResolvingId(item.materialId);
    const url = await resolvePdfUrl(item);
    setResolvingId(null);
    if (!url) return;

    const safeFileName = `${item.title.replace(/[^a-zA-Z0-9_-]+/g, '_')}.pdf`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = safeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSelectedClass('All');
    setSelectedBoard('All');
    setSelectedSubject('All');
    setSelectedType('All');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedClass !== 'All' ||
    selectedBoard !== 'All' ||
    selectedSubject !== 'All' ||
    selectedType !== 'All' ||
    searchQuery.trim() !== '';

  return (
    <section
      id="study-material"
      className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-400/20 text-slate-900 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-400/40">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Free Student Resource Library</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Study Material Library
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Download chapter-wise PDF notes, formula sheets, important questions, and sample papers for Class 9 &amp; 10 (BSEB &amp; CBSE). No login required.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Search Material, Chapter or Year
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Trigonometry, 2025, Model Paper..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Class Filter */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="All">All Classes</option>
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Board Filter */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Board
              </label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="All">All Boards</option>
                {BOARD_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="All">All Subjects</option>
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Material Type Filter */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="All">All Types</option>
                {MATERIAL_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-600 font-medium inline-flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Showing <strong className="text-slate-900">{filteredMaterials.length}</strong> of{' '}
                {materials.length} published materials
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-slate-700 hover:text-slate-950 font-bold underline underline-offset-2 cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Content States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-slate-900 mb-3" />
            <p className="text-sm font-semibold">Loading study materials...</p>
          </div>
        ) : errorMessage ? (
          <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">{errorMessage}</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 font-display">
              {materials.length === 0
                ? 'Study materials will be available soon.'
                : 'No matching study materials found.'}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {materials.length === 0
                ? 'Our teachers are preparing chapter-wise PDF notes, formula sheets, and sample papers for Class 9 & 10.'
                : 'Try selecting a different class, board, or subject filter.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => {
              const isResolving = resolvingId === item.materialId;
              return (
                <article
                  key={item.materialId}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Navy Accent Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-slate-900 via-blue-900 to-amber-400" />

                  <div className="p-6 flex-1 flex flex-col">
                    {/* PDF Icon + Badges */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wide">
                          {item.class}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-400/25 text-slate-900 border border-amber-400/40 text-[11px] font-bold uppercase tracking-wide">
                          {item.board}
                        </span>
                      </div>
                    </div>

                    {/* Material Type Pill */}
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        {item.materialType}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-extrabold text-slate-900 font-display leading-snug mb-2">
                      {item.title}
                    </h3>

                    {/* Subject & Chapter / Exam Year */}
                    <div className="text-xs font-semibold text-slate-600 space-y-1 mb-3">
                      <p>
                        <span className="text-slate-400">Subject:</span>{' '}
                        <span className="text-slate-800">{item.subject}</span>
                      </p>
                      {item.chapter && (
                        <p>
                          <span className="text-slate-400">Chapter:</span>{' '}
                          <span className="text-slate-800">{item.chapter}</span>
                        </p>
                      )}
                      {item.examYear && (
                        <p>
                          <span className="text-slate-400">Exam Year:</span>{' '}
                          <span className="text-slate-800">{item.examYear}</span>
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mt-auto">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={isResolving}
                      onClick={() => handleViewPdf(item)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isResolving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-slate-700" />
                      )}
                      <span>View PDF</span>
                    </button>

                    <button
                      type="button"
                      disabled={isResolving}
                      onClick={() => handleDownloadPdf(item)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewMaterial && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setPreviewMaterial(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm sm:text-base truncate font-display">
                  {previewMaterial.material.title}
                </h3>
                <p className="text-xs text-amber-400 font-medium truncate">
                  {previewMaterial.material.class} • {previewMaterial.material.board} •{' '}
                  {previewMaterial.material.subject}
                  {previewMaterial.material.chapter
                    ? ` — ${previewMaterial.material.chapter}`
                    : previewMaterial.material.examYear
                    ? ` — ${previewMaterial.material.examYear}`
                    : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewMaterial.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Open / Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewMaterial(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close PDF preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 relative">
              <iframe
                src={previewMaterial.url}
                title={previewMaterial.material.title}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudyMaterialLibrary;
