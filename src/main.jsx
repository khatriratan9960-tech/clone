import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';
import ChartPage from './components/ChartPage.jsx';
import { AuthProvider } from './admin/AuthContext.jsx';
import './styles/live-matka.css';

const path = window.location.pathname;
const isChartPage =
  path.startsWith('/jodi-chart-record/') ||
  path.startsWith('/panel-chart-record/') ||
  path.startsWith('/chart/');

// The admin panel is a separate entry with its own stylesheet and a plain,
// high-contrast look - the loud live.matka styling is only for the public site.
if (window.location.pathname.startsWith('/admin')) {
  document.body.classList.add('admin-mode');
  import('./admin/admin.css');

  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <AuthProvider>
        <AdminApp />
      </AuthProvider>
    </React.StrictMode>
  );
} else if (isChartPage) {
  // FAKE chart history (UI preview). Real Result-backed API comes later.
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ChartPage />
    </React.StrictMode>
  );
} else {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
