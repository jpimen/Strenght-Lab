import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './presentation/components/layout/Layout';
import DashboardView from './presentation/views/dashboard/DashboardView';
import AthleteView from './presentation/views/athlete/AthleteView';
import ProgramView from './presentation/views/program/ProgramView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="athletes" element={<AthleteView />} />
        <Route path="program-builder" element={<ProgramView />} />
      </Route>
    </Routes>
  );
}

export default App;
