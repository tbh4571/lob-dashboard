import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { ComponentsPage } from './pages/ComponentsPage';
import { ComponentDetailPage } from './pages/ComponentDetailPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { RunsPage } from './pages/RunsPage';
import { RunDetailPage } from './pages/RunDetailPage';
import { DeploymentsPage } from './pages/DeploymentsPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="applications/:appSlug" element={<ApplicationDetailPage />} />
        <Route path="components" element={<ComponentsPage />} />
        <Route path="components/:appSlug/:componentSlug" element={<ComponentDetailPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="rebases" element={<RunsPage />} />
        <Route path="rebases/:id" element={<RunDetailPage />} />
        <Route path="repaves" element={<DeploymentsPage />} />
        <Route path="repaves/:id" element={<RunDetailPage />} />
      </Route>
    </Routes>
  );
}
