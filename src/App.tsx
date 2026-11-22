/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Courses from './components/Courses';
import WhyGenius from './components/WhyGenius';
import TeachersAndSmartClassroom from './components/TeachersAndSmartClassroom';
import InsideGallery from './components/InsideGallery';
import TestRankAppSection from './components/TestRankAppSection';
import StudyMaterialLibrary from './components/StudyMaterialLibrary';
import ReviewsSection from './components/ReviewsSection';
import AdmissionProcess from './components/AdmissionProcess';
import GoogleMapsSection from './components/GoogleMapsSection';
import ContactCTA from './components/ContactCTA';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import EnquiryModal from './components/EnquiryModal';
import LogoInspectorModal from './components/LogoInspectorModal';
import AdminStudyMaterialDashboard from './components/AdminStudyMaterialDashboard';
import GccMicrophoneTest from './components/GccMicrophoneTest';
import GccAiTeacherAssistant from './components/GccAiTeacherAssistant';
import { isAndroidAssistantShell } from './lib/apiConfig';

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '');
}

function isAdminRoutePath(pathname: string): boolean {
  return normalizePath(pathname) === '/admin/study-material';
}

function isMicTestRoutePath(pathname: string): boolean {
  return normalizePath(pathname) === '/admin/microphone-test';
}

function isAiAssistantRoutePath(pathname: string): boolean {
  return normalizePath(pathname) === '/admin/ai-assistant';
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() =>
    typeof window !== 'undefined' ? isAdminRoutePath(window.location.pathname) : false
  );
  const [isMicTestRoute, setIsMicTestRoute] = useState<boolean>(() =>
    typeof window !== 'undefined' ? isMicTestRoutePath(window.location.pathname) : false
  );
  const [isAiAssistantRoute, setIsAiAssistantRoute] = useState<boolean>(() =>
    typeof window !== 'undefined' ? isAiAssistantRoutePath(window.location.pathname) : false
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargetClass, setModalTargetClass] = useState('Class 10');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(isAdminRoutePath(window.location.pathname));
      setIsMicTestRoute(isMicTestRoutePath(window.location.pathname));
      setIsAiAssistantRoute(isAiAssistantRoutePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Private Admin Route (/admin/study-material)
  if (isAdminRoute) {
    return <AdminStudyMaterialDashboard />;
  }

  // Private Teacher-Only Diagnostic Route (/admin/microphone-test)
  if (isMicTestRoute) {
    return <GccMicrophoneTest />;
  }

  // Private Teacher-Only AI Assistant Route (/admin/ai-assistant)
  // Also launches directly when bundled for the GCC AI Android shell (VITE_APP_TARGET=android-assistant)
  if (isAiAssistantRoute || isAndroidAssistantShell()) {
    return <GccAiTeacherAssistant />;
  }

  const handleOpenGeneralEnquiry = () => {
    setModalTargetClass('Class 10');
    setIsModalOpen(true);
  };

  const handleOpenClassEnquiry = (className: string) => {
    setModalTargetClass(className);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenLogoInspector = () => {
    setIsLogoModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* 1. Header */}
      <Header
        onOpenEnquiryModal={handleOpenGeneralEnquiry}
        onOpenLogoInspector={handleOpenLogoInspector}
      />

      <main className="flex-1 w-full">
        {/* 2. Hero Section */}
        <Hero
          onOpenEnquiryModal={handleOpenGeneralEnquiry}
          onOpenLogoInspector={handleOpenLogoInspector}
        />

        {/* 3. Courses: Class 9 & Class 10 */}
        <Courses onOpenClassEnquiry={handleOpenClassEnquiry} />

        {/* 4. Why Choose GCC */}
        <WhyGenius />

        {/* 5. Teachers & 6. Digital Smart Classroom */}
        <TeachersAndSmartClassroom />

        {/* Real GCC Classroom Gallery */}
        <InsideGallery onOpenLogoInspector={handleOpenLogoInspector} />

        {/* 7. GCC Test Rank App & Free Study Resources */}
        <TestRankAppSection />

        {/* 8. Study Material Library (Firebase-powered, published only) */}
        <StudyMaterialLibrary />

        {/* 9. Parents' Feedback */}
        <ReviewsSection />

        {/* 10. Admission Process */}
        <AdmissionProcess onOpenEnquiryModal={handleOpenGeneralEnquiry} />

        {/* 11. Location & Contact */}
        <GoogleMapsSection />
        <ContactCTA onOpenLogoInspector={handleOpenLogoInspector} />
      </main>

      {/* 12. Footer */}
      <Footer onOpenLogoInspector={handleOpenLogoInspector} />

      {/* Floating WhatsApp & Call Action */}
      <FloatingWhatsApp />

      {/* Admission Enquiry Modal */}
      <EnquiryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialClass={modalTargetClass}
      />

      {/* Official Logo Inspector Modal */}
      <LogoInspectorModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />
    </div>
  );
}
