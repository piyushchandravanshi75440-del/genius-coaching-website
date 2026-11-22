import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  deletePdfFromSupabase,
  getTemporaryPdfUrl,
  uploadPdfToSupabase,
} from '../lib/supabaseStorage';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Loader2,
  Lock,
  LogOut,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';
import {
  auth,
  AUTHORIZED_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  isAuthorizedAdmin,
  MAX_PDF_SIZE_BYTES,
  OperationType,
} from '../lib/firebase';
import {
  BOARD_OPTIONS,
  BoardType,
  CLASS_OPTIONS,
  ClassLevel,
  MATERIAL_TYPE_OPTIONS,
  MaterialStatus,
  MaterialType,
  normalizeMaterialType,
  StudyMaterial,
  SUBJECT_OPTIONS,
  SubjectType,
} from '../types/studyMaterial';

function generateMaterialId(): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `mat_${Date.now()}_${randomPart}`;
}

export const AdminStudyMaterialDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  // Dashboard UI state
  const [activeTab, setActiveTab] = useState<'manage' | 'upload'>('manage');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');

  // Upload / Edit Form State
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [title, setTitle] = useState('');
  const [classLevel, setClassLevel] = useState<ClassLevel>('Class 10');
  const [board, setBoard] = useState<BoardType>('BSEB');
  const [subject, setSubject] = useState<SubjectType>('Mathematics');
  const [chapter, setChapter] = useState('');
  const [examYear, setExamYear] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType>('Notes');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFailedStatus, setLastFailedStatus] = useState<MaterialStatus | null>(null);
  const submittingRef = useRef(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Delete confirmation & PDF preview
  const [deleteTarget, setDeleteTarget] = useState<StudyMaterial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<{
    material: StudyMaterial;
    url: string;
  } | null>(null);

  const authorized = isAuthorizedAdmin(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Only attach Firestore listener when auth is ready AND user is the verified authorized admin
  useEffect(() => {
    if (!authReady || !authorized) {
      setMaterials([]);
      return;
    }

    setLoadingMaterials(true);
    const materialsRef = collection(db, 'studyMaterials');
    const unsubscribe = onSnapshot(
      materialsRef,
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
            status: data.status || 'draft',
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            createdBy: data.createdBy || '',
          };
        });
        items.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() ?? 0;
          const timeB = b.createdAt?.toMillis?.() ?? 0;
          return timeB - timeA;
        });
        setMaterials(items);
        setLoadingMaterials(false);
      },
      (error) => {
        setLoadingMaterials(false);
        setFeedback({
          type: 'error',
          message: 'Permission error loading materials. Verify Firestore Security Rules.',
        });
        try {
          handleFirestoreError(error, OperationType.LIST, 'studyMaterials');
        } catch {
          // Logged by handleFirestoreError
        }
      }
    );

    return () => unsubscribe();
  }, [authReady, authorized]);

  const stats = useMemo(() => {
    const total = materials.length;
    const published = materials.filter((m) => m.status === 'published').length;
    const unpublished = total - published;
    const notes = materials.filter((m) => normalizeMaterialType(m.materialType) === 'Notes').length;
    const revision = materials.filter(
      (m) => normalizeMaterialType(m.materialType) === 'Revision'
    ).length;
    const pyqs = materials.filter(
      (m) => normalizeMaterialType(m.materialType) === 'Previous Year Question (PYQ)'
    ).length;
    const samplePapers = materials.filter(
      (m) => normalizeMaterialType(m.materialType) === 'Sample Paper'
    ).length;
    const modelPapers = materials.filter(
      (m) => normalizeMaterialType(m.materialType) === 'Model Paper'
    ).length;
    return { total, published, unpublished, notes, revision, pyqs, samplePapers, modelPapers };
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return materials.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (typeFilter !== 'All' && normalizeMaterialType(m.materialType) !== typeFilter) {
        return false;
      }
      if (classFilter !== 'All' && m.class !== classFilter) return false;
      if (subjectFilter !== 'All' && m.subject !== subjectFilter) return false;
      if (q) {
        return (
          m.title.toLowerCase().includes(q) ||
          m.chapter.toLowerCase().includes(q) ||
          (m.examYear || '').toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.class.toLowerCase().includes(q) ||
          m.board.toLowerCase().includes(q) ||
          m.materialType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [materials, searchQuery, statusFilter, typeFilter, classFilter, subjectFilter]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      setAuthError(msg);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setAuthError(null);
    setFeedback(null);
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setTitle('');
    setClassLevel('Class 10');
    setBoard('BSEB');
    setSubject('Mathematics');
    setChapter('');
    setExamYear('');
    setMaterialType('Notes');
    setDescription('');
    setPdfFile(null);
    setUploadProgress(0);
    setUploadStage('');
    setLastFailedStatus(null);
  };

  const startEdit = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setTitle(material.title);
    setClassLevel(material.class);
    setBoard(material.board);
    setSubject(material.subject);
    setChapter(material.chapter || '');
    setExamYear(material.examYear || '');
    setMaterialType(normalizeMaterialType(material.materialType));
    setDescription(material.description || '');
    setPdfFile(null);
    setUploadProgress(0);
    setUploadStage('');
    setFeedback(null);
    setActiveTab('upload');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(null);
    const file = e.target.files?.[0] || null;
    if (!file) {
      setPdfFile(null);
      return;
    }

    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !isPdfExt) {
      setFeedback({ type: 'error', message: 'Invalid file type. Only PDF files (.pdf) are allowed.' });
      e.target.value = '';
      setPdfFile(null);
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      setFeedback({
        type: 'error',
        message: 'File size exceeds the 20 MB maximum limit. Please compress the PDF and try again.',
      });
      e.target.value = '';
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
  };

  const uploadPdf = async (materialId: string, file: File): Promise<string> => {
    if (!user) throw new Error('Admin session expired. Please sign in again.');
    const idToken = await user.getIdToken();
    const { storagePath } = await uploadPdfToSupabase({
      materialId,
      file,
      idToken,
      onProgress: (pct) => setUploadProgress(pct),
    });
    return storagePath;
  };

  const handleSubmitMaterial = async (targetStatus: MaterialStatus) => {
    if (!user || !authorized || submittingRef.current) return;

    const cleanTitle = title.trim().slice(0, 160);
    const usesChapter = materialType === 'Notes' || materialType === 'Revision';
    const cleanChapter = usesChapter ? chapter.trim().slice(0, 140) : '';
    const cleanExamYear = !usesChapter ? examYear.trim().slice(0, 20) : '';
    const cleanDesc = description.trim().slice(0, 500);

    if (cleanTitle.length < 2) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid Material Title (min 2 characters).',
      });
      return;
    }

    if (materialType === 'Notes' && cleanChapter.length < 1) {
      setFeedback({ type: 'error', message: 'Please enter the Chapter Name for Notes.' });
      return;
    }

    if (
      (materialType === 'Model Paper' || materialType === 'Previous Year Question (PYQ)') &&
      cleanExamYear.length < 2
    ) {
      setFeedback({
        type: 'error',
        message: `Please enter the Exam Year for ${materialType} (e.g. 2025).`,
      });
      return;
    }

    if (!editingMaterial && !pdfFile) {
      setFeedback({ type: 'error', message: 'Please select a PDF file to upload.' });
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setFeedback(null);
    setLastFailedStatus(null);
    setUploadProgress(0);

    let newlyUploadedStoragePath: string | null = null;

    try {
      if (editingMaterial) {
        let storagePath = editingMaterial.storagePath;

        if (pdfFile) {
          setUploadStage('Uploading replacement PDF to Supabase Storage...');
          storagePath = await uploadPdf(editingMaterial.materialId, pdfFile);
        }

        setUploadStage('Saving material details to Firestore...');
        const docPath = `studyMaterials/${editingMaterial.materialId}`;
        try {
          await updateDoc(doc(db, 'studyMaterials', editingMaterial.materialId), {
            title: cleanTitle,
            class: classLevel,
            board,
            subject,
            chapter: cleanChapter,
            examYear: cleanExamYear,
            materialType,
            description: cleanDesc,
            storagePath,
            downloadUrl: '',
            status: targetStatus,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, docPath);
        }

        setFeedback({
          type: 'success',
          message:
            targetStatus === 'published'
              ? `Published Successfully! "${cleanTitle}" has been updated.`
              : `Material "${cleanTitle}" updated and saved as a private draft.`,
        });
        resetForm();
        setActiveTab('manage');
      } else {
        const materialId = generateMaterialId();

        setUploadStage('Uploading PDF to Supabase Storage...');
        const storagePath = await uploadPdf(materialId, pdfFile!);
        newlyUploadedStoragePath = storagePath;

        setUploadStage('Saving material record to Firestore...');
        const docPath = `studyMaterials/${materialId}`;
        try {
          await setDoc(doc(db, 'studyMaterials', materialId), {
            materialId,
            title: cleanTitle,
            class: classLevel,
            board,
            subject,
            chapter: cleanChapter,
            examYear: cleanExamYear,
            materialType,
            description: cleanDesc,
            storagePath,
            downloadUrl: '',
            status: targetStatus,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: user.uid,
          });
          newlyUploadedStoragePath = null; // Successfully linked in Firestore
        } catch (err) {
          // Clean up orphaned PDF in Supabase Storage if Firestore save fails
          if (newlyUploadedStoragePath) {
            try {
              const idToken = await user.getIdToken();
              await deletePdfFromSupabase(newlyUploadedStoragePath, idToken);
            } catch (cleanupErr) {
              console.warn('Failed to clean up orphaned Supabase PDF:', cleanupErr);
            }
          }
          handleFirestoreError(err, OperationType.CREATE, docPath);
        }

        setFeedback({
          type: 'success',
          message:
            targetStatus === 'published'
              ? `Published Successfully! "${cleanTitle}" is now live in the Student Library.`
              : `Material "${cleanTitle}" saved as a private draft.`,
        });
        resetForm();
        setActiveTab('manage');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to upload study material. Please check Supabase Storage & Firestore configuration.';
      setLastFailedStatus(targetStatus);
      setFeedback({ type: 'error', message: msg });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
      setUploadStage('');
    }
  };

  const handleToggleStatus = async (material: StudyMaterial) => {
    if (!authorized) return;
    const nextStatus: MaterialStatus = material.status === 'published' ? 'draft' : 'published';
    const docPath = `studyMaterials/${material.materialId}`;
    try {
      await updateDoc(doc(db, 'studyMaterials', material.materialId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      setFeedback({
        type: 'success',
        message:
          nextStatus === 'published'
            ? `"${material.title}" is now published and visible to students.`
            : `"${material.title}" has been unpublished and hidden from students.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update publication status.' });
      try {
        handleFirestoreError(err, OperationType.UPDATE, docPath);
      } catch {
        // Logged
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !authorized || !user) return;
    setDeleting(true);
    const target = deleteTarget;
    try {
      // Delete PDF from private Supabase Storage bucket first
      if (target.storagePath) {
        try {
          const idToken = await user.getIdToken();
          await deletePdfFromSupabase(target.storagePath, idToken);
        } catch (storageErr) {
          console.warn('Supabase Storage file deletion note:', storageErr);
        }
      }

      // Delete metadata document from Firestore
      const docPath = `studyMaterials/${target.materialId}`;
      try {
        await deleteDoc(doc(db, 'studyMaterials', target.materialId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }

      setFeedback({
        type: 'success',
        message: `Material "${target.title}" was permanently deleted.`,
      });
      setDeleteTarget(null);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to delete study material.' });
    } finally {
      setDeleting(false);
    }
  };

  const handlePreview = async (material: StudyMaterial) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const { signedUrl } = await getTemporaryPdfUrl(material.materialId, idToken);
      setPreviewMaterial({ material, url: signedUrl });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to preview PDF. Check Supabase Storage configuration.';
      setFeedback({ type: 'error', message: msg });
    }
  };

  // Loading state while Firebase Auth initializes
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-sm font-semibold text-slate-300">Verifying administrator session...</p>
      </div>
    );
  }

  // Not Signed In -> Strict Google Sign-In Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800">
            <div className="flex justify-center mb-3">
              <OfficialLogo size={64} />
            </div>
            <h1 className="text-xl font-extrabold font-display tracking-tight uppercase">
              GCC Admin Portal
            </h1>
            <p className="text-xs text-amber-400 font-semibold mt-1">
              Study Material Management System
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-slate-900" />
              <span>Authorized Administrator Access Only</span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Sign in with the authorized Genius Coaching Centre Google account to upload, publish, and manage Class 9 &amp; 10 study materials.
            </p>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-left">
                {authError}
              </div>
            )}

            <button
              type="button"
              disabled={signingIn}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {signingIn ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              )}
              <span>Sign in with Google</span>
            </button>

            <div className="pt-2">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Website</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signed in with an UNAUTHORIZED Google account -> Strict Access Denied
  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
          <div className="bg-red-700 text-white p-6 text-center">
            <ShieldAlert className="w-12 h-12 mx-auto mb-2 text-amber-300" />
            <h1 className="text-lg font-extrabold font-display uppercase tracking-tight">
              Access Denied
            </h1>
          </div>

          <div className="p-6 sm:p-8 text-center space-y-5">
            <p className="text-sm font-bold text-slate-900">
              Access Denied. You are not authorized to manage study materials.
            </p>
            <p className="text-xs text-slate-500">
              Signed in as: <span className="font-semibold text-slate-700">{user.email}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <a
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go to Homepage</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <OfficialLogo size={42} />
            <div className="min-w-0">
              <h1 className="font-extrabold text-sm sm:text-base uppercase tracking-tight font-display truncate">
                GCC Study Material Admin
              </h1>
              <p className="text-[11px] text-amber-400 font-semibold truncate">
                Verified Admin: {AUTHORIZED_ADMIN_EMAIL}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="/admin/ai-assistant"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Teacher Assistant</span>
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">View Public Site</span>
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-200 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Summary Stats Cards */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Uploaded Materials
                </p>
                <p className="text-3xl font-black text-slate-900 mt-1 font-display">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Published Materials
                </p>
                <p className="text-3xl font-black text-emerald-700 mt-1 font-display">
                  {stats.published}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Unpublished Materials
                </p>
                <p className="text-3xl font-black text-amber-600 mt-1 font-display">
                  {stats.unpublished}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <EyeOff className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Notes
                </p>
                <p className="text-2xl font-black text-slate-900 mt-0.5 font-display">
                  {stats.notes}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-extrabold">
                Notes
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Revision
                </p>
                <p className="text-2xl font-black text-slate-900 mt-0.5 font-display">
                  {stats.revision}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-extrabold">
                Revision
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total PYQs
                </p>
                <p className="text-2xl font-black text-slate-900 mt-0.5 font-display">
                  {stats.pyqs}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-extrabold">
                PYQ
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Sample Papers
                </p>
                <p className="text-2xl font-black text-slate-900 mt-0.5 font-display">
                  {stats.samplePapers}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-extrabold">
                Sample
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Model Papers
                </p>
                <p className="text-2xl font-black text-slate-900 mt-0.5 font-display">
                  {stats.modelPapers}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-extrabold">
                Model
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {feedback.type === 'error' && activeTab === 'upload' && lastFailedStatus && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitMaterial(lastFailedStatus)}
                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-extrabold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Retry Upload
                </button>
              )}
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="p-1 rounded-md hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('manage');
                resetForm();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'manage'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manage Study Materials ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab('upload');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingMaterial ? 'Edit Material' : 'Upload New Material'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: UPLOAD / EDIT FORM */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-amber-400" />
                <h2 className="font-extrabold text-base font-display">
                  {editingMaterial ? `Edit: ${editingMaterial.title}` : 'Upload New Study Material (PDF)'}
                </h2>
              </div>
              {editingMaterial && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('manage');
                  }}
                  className="text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Material Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    1. Material Title *
                  </label>
                  <input
                    type="text"
                    maxLength={160}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Class 10 Trigonometry Complete Formula Sheet"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                  />
                </div>

                {/* 2. Class */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    2. Class *
                  </label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
                    className="w-full px-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {CLASS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Board */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    3. Board *
                  </label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value as BoardType)}
                    className="w-full px-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {BOARD_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    4. Subject *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectType)}
                    className="w-full px-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Material Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    5. Material Type *
                  </label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                    className="w-full px-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {MATERIAL_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Dynamic Field: Chapter Name (Notes / Revision) OR Exam Year (PYQ / Sample Paper / Model Paper) */}
                {materialType === 'Notes' || materialType === 'Revision' ? (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      6. Chapter Name {materialType === 'Notes' ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      maxLength={140}
                      value={chapter}
                      onChange={(e) => setChapter(e.target.value)}
                      placeholder="e.g. Chapter 8: Introduction to Trigonometry"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                    />
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      6. Exam Year {materialType === 'Sample Paper' ? '(Optional)' : '*'}
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={examYear}
                      onChange={(e) => setExamYear(e.target.value)}
                      placeholder="e.g. 2025 or 2024-25"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                    />
                  </div>
                )}

                {/* 7. Short Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    7. Short Description
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what this PDF covers for students..."
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                  />
                </div>

                {/* 8. Upload PDF File */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    8. Upload PDF File {editingMaterial ? '(Optional: replace existing PDF)' : '*'}
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 bg-slate-50 hover:border-amber-400 transition-colors">
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-extrabold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      PDF files only (.pdf) • Maximum file size: 20 MB.
                    </p>
                    {pdfFile && (
                      <p className="text-xs font-bold text-emerald-700 mt-2">
                        Selected: {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {isSubmitting && (
                <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{uploadStage || 'Processing upload...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-200"
                      style={{ width: `${Math.max(uploadProgress, 4)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitMaterial('draft')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-extrabold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                  <span>Save as Draft</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitMaterial('published')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{editingMaterial ? 'Save & Publish' : 'Upload & Publish'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE STUDY MATERIALS */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search & Filters */}
            <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, chapter, year, subject..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {(['all', 'published', 'draft'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="All">All Material Types</option>
                  {MATERIAL_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="All">All Classes</option>
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>

                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="All">All Subjects</option>
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Materials Table / List */}
            {loadingMaterials ? (
              <div className="p-12 text-center text-slate-500">
                <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-slate-900" />
                <p className="text-xs font-semibold">Loading study materials...</p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No study materials found.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Click "Upload New Material" to add your first PDF note or sample paper.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredMaterials.map((item) => (
                  <div
                    key={item.materialId}
                    className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                              item.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.class} • {item.board}
                          </span>
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            {item.subject}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {item.materialType}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {item.chapter
                            ? `Chapter: ${item.chapter}`
                            : item.examYear
                            ? `Exam Year: ${item.examYear}`
                            : item.description || 'PDF Study Material'}
                        </p>
                      </div>
                    </div>

                    {/* Row Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePreview(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          item.status === 'published'
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {item.status === 'published' ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Unpublish</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Publish</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-display">
                  Delete Study Material?
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-700">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-950">"{deleteTarget.title}"</strong> and its PDF file?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold cursor-pointer disabled:opacity-60"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin PDF Preview Modal */}
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
                  Status: {previewMaterial.material.status.toUpperCase()} •{' '}
                  {previewMaterial.material.class} ({previewMaterial.material.board})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMaterial(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={previewMaterial.url}
                title={previewMaterial.material.title}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudyMaterialDashboard;
