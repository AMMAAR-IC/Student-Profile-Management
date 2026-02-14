import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import StudentFormPage from './pages/StudentFormPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AnalyticsPage from './pages/AnalyticsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function AppContent() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/new" element={<StudentFormPage />} />
          <Route path="/students/:id" element={<StudentDetailPage />} />
          <Route path="/students/:id/edit" element={<StudentFormPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
