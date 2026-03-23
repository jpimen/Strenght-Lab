import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './presentation/components/layout/Layout';
import DashboardView from './presentation/views/dashboard/DashboardView';
import AthleteView from './presentation/views/athlete/AthleteView';
import RosterSelectorView from './presentation/views/program/RosterSelectorView';
import ProgramView from './presentation/views/program/ProgramView';
import AnalyticsView from './presentation/views/analytics/AnalyticsView';
import InventoryView from './presentation/views/inventory/InventoryView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="athletes" element={<AthleteView />} />
        <Route path="program-builder" element={<RosterSelectorView />} />
        <Route path="program-builder/editor/:athleteId" element={<ProgramView />} />
        <Route path="analytics" element={<AnalyticsView />} />
        <Route path="inventory" element={<InventoryView />} />
      </Route>
    </Routes>
  );
}

export default App;
