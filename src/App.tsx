import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// We will build these components in the next phase
const Dashboard = React.lazy(() => import('./features/dashboard/Dashboard'));
const ActiveExam = React.lazy(() => import('./features/exam/ActiveExam'));
const Results = React.lazy(() => import('./features/results/Results'));
const Layout = React.lazy(() => import('./components/layout/PageWrapper'));

const App: React.FC = () => {
  return (
    <Router>
      <React.Suspense fallback={<div className="flex h-screen w-full items-center justify-center font-semibold text-gray-500">Loading App...</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exam" element={<ActiveExam />} />
            <Route path="/results" element={<Results />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
  );
};

export default App;