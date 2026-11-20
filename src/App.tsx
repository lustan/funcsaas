import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DemoProvider } from './context/DemoContext';
import { TopNav } from './components/layout/TopNav';
import { HubPage } from './pages/HubPage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { SandboxPage } from './pages/SandboxPage';
import { GatesPage } from './pages/GatesPage';
import { AiOpsPage } from './pages/AiOpsPage';

export default function App() {
  return (
    <DemoProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
          <TopNav />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/hub" replace />} />
              <Route path="/hub" element={<HubPage />} />
              <Route path="/studio/discovery" element={<DiscoveryPage />} />
              <Route path="/studio/sandbox" element={<SandboxPage />} />
              <Route path="/studio/gates" element={<GatesPage />} />
              <Route path="/studio/aiops" element={<AiOpsPage />} />
              <Route path="*" element={<Navigate to="/hub" replace />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </DemoProvider>
  );
}
