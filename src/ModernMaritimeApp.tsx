import React from 'react';
import { ModernMaritimeProvider } from './contexts/ModernMaritimeContext';
import { ModernMaritimeHeader } from './components/ModernMaritimeHeader';
import { ModernMaritimeLayout } from './components/ModernMaritimeLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/modern-maritime.css';
import './index.css';

export function ModernMaritimeApp() {
  return (
    <ErrorBoundary>
      <ModernMaritimeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
          {/* Modern Maritime Header */}
          <ModernMaritimeHeader />
          
          {/* Main Content Layout */}
          <ModernMaritimeLayout />
        </div>
      </ModernMaritimeProvider>
    </ErrorBoundary>
  );
}