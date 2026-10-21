import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { TopBar } from './components/TopBar';
import { StudentNav } from './components/StudentNav';
import { OfficerSidebar } from './components/OfficerSidebar';
import { OfflineBanner } from './components/OfflineBanner';
import { JagoPanel } from './ui/JagoPanel';

// Student Pages
import { StudentHome } from './pages/StudentHome';
import { SchemesDirectory } from './pages/SchemesDirectory';
import { SchemeApply } from './pages/SchemeApply';
import { DocumentWallet } from './pages/DocumentWallet';
import { NotificationsPage } from './pages/NotificationsPage';
import { Profile } from './pages/Profile';

// Officer Pages
import { OfficerQueue } from './pages/OfficerQueue';
import { CoverageGapFinder } from './pages/CoverageGapFinder';
import { OfficerAnalytics } from './pages/OfficerAnalytics';

import { Login } from './pages/Login';
import { Register } from './pages/Register';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <span className="text-small text-ink-muted">Loading Shiksha Setu session...</span>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'officer' ? '/officer/queue' : '/'} replace />;
  }
  return children;
}

export function App() {
  const { user } = useAuth();
  const [jagoOpen, setJagoOpen] = useState(false);
  const location = useLocation();

  const isOfficer = user?.role === 'officer';
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <OfflineBanner />

      {/* OFFICER LAYOUT */}
      {isOfficer ? (
        <div className="flex flex-1 min-h-screen">
          <OfficerSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-y-auto">
              <Routes>
                <Route
                  path="/officer/queue"
                  element={
                    <ProtectedRoute allowedRole="officer">
                      <OfficerQueue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/officer/coverage-gaps"
                  element={
                    <ProtectedRoute allowedRole="officer">
                      <CoverageGapFinder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/officer/analytics"
                  element={
                    <ProtectedRoute allowedRole="officer">
                      <OfficerAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/officer/queue" replace />} />
              </Routes>
            </main>
            <footer className="py-3 px-4 sm:px-6 border-t border-line text-caption text-ink-muted bg-surface flex flex-col sm:flex-row items-center justify-between gap-1 mb-14 md:mb-0 text-center sm:text-left">
              <span>Demo uses simulated government data.</span>
              <span>Ministry of Tribal Affairs | bytecodex</span>
            </footer>
          </div>
        </div>
      ) : (
        /* STUDENT & PUBLIC LAYOUT */
        <div className="flex-1 flex flex-col">
          {!isAuthPage && (
            <>
              <TopBar onToggleJago={() => setJagoOpen((prev) => !prev)} />
              {user && <StudentNav />}
            </>
          )}

          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schemes"
                element={
                  <ProtectedRoute allowedRole="student">
                    <SchemesDirectory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schemes/:code/apply"
                element={
                  <ProtectedRoute allowedRole="student">
                    <SchemeApply />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute allowedRole="student">
                    <DocumentWallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRole="student">
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRole="student">
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jago"
                element={
                  <ProtectedRoute allowedRole="student">
                    <div className="max-w-[800px] mx-auto p-4 h-[calc(100vh-140px)]">
                      <JagoPanel isOpen={true} isMobileTab={true} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
            </Routes>
          </main>

          {!isAuthPage && (
            <footer className="py-4 px-6 border-t border-line text-caption text-ink-muted bg-surface text-center mb-14 sm:mb-0">
              Demo uses simulated government data. Ministry of Tribal Affairs Hackathon Prototype by Team "bytecodex".
            </footer>
          )}

          {/* Desktop Docked JAGO Drawer */}
          <JagoPanel isOpen={jagoOpen} onClose={() => setJagoOpen(false)} />
        </div>
      )}
    </div>
  );
}
