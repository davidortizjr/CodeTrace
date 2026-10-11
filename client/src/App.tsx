import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Spinner } from './components/ui';
import { AuthProvider, useAuth } from './lib/auth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// The editor pulls in CodeMirror, so only load it when a problem is opened.
const ProblemPage = lazy(() => import('./pages/Problem'));
const Practice = lazy(() => import('./pages/Practice'));
const Skills = lazy(() => import('./pages/Skills'));
const Mistakes = lazy(() => import('./pages/Mistakes'));
const Drill = lazy(() => import('./pages/Drill'));
const Coach = lazy(() => import('./pages/Coach'));

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Signing you in" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Shell />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<Protected />}>
              <Route index element={<Dashboard />} />
              <Route path="practice" element={<Practice />} />
              <Route path="problem/:id" element={<ProblemPage />} />
              <Route path="skills" element={<Skills />} />
              <Route path="mistakes" element={<Mistakes />} />
              <Route path="drill" element={<Drill />} />
              <Route path="coach" element={<Coach />} />
            </Route>
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
