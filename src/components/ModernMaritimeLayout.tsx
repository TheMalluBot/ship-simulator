import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useModernMaritime } from '../contexts/ModernMaritimeContext';
import { SystemDirectory } from './panels/SystemDirectory';
import { ControlInterface } from './panels/ControlInterface';
import { LearningPanel } from './panels/LearningPanel';
import { cn } from '../lib/utils';

// Error boundary component to catch errors in child components
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Component error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  title?: string;
  side?: 'left' | 'right';
}

function Panel({ children, className, isOpen = true, onToggle, title, side }: PanelProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ 
            width: 0, 
            opacity: 0,
            x: side === 'left' ? -100 : 100
          }}
          animate={{ 
            width: 'auto', 
            opacity: 1,
            x: 0
          }}
          exit={{ 
            width: 0, 
            opacity: 0,
            x: side === 'left' ? -100 : 100
          }}
          transition={{ 
            type: "spring", 
            bounce: 0.2, 
            duration: 0.6
          }}
          className={cn(
            "relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden",
            className
          )}
        >
          {/* Panel Header */}
          {(title || onToggle) && (
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              {title && (
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              )}
              {onToggle && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggle}
                  className="p-1 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                >
                  {side === 'left' ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </motion.button>
              )}
            </div>
          )}
          
          {/* Panel Content */}
          <div className="h-full overflow-hidden">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ModernMaritimeLayout() {
  const { 
    state, 
    toggleLeftPanel, 
    toggleRightPanel 
  } = useModernMaritime();

  return (
    <div className="maritime-three-column-layout">
      {/* Left Panel - System Directory */}
      <div className="maritime-directory-panel">
        <div className="maritime-panel-header">
          <h3 className="text-lg font-semibold">System Directory</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLeftPanel}
            className="p-1 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
        </div>
        <AnimatePresence>
          {(!state.mobileLayout || state.navigation.leftPanelOpen) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="maritime-panel-content"
            >
              <ErrorBoundary fallback={<div className="text-red-500 p-4">Error loading System Directory</div>}>
                <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div></div>}>
                  <SystemDirectory />
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Center Panel - Control Interface */}
      <div className="maritime-main-panel">
        <div className="maritime-panel-header">
          <div className="flex items-center space-x-2">
            {state.mobileLayout && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleLeftPanel}
                className="p-1 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors lg:hidden"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            )}
            <h3 className="text-lg font-semibold">Control Interface</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">System Active</span>
            {state.mobileLayout && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleRightPanel}
                className="p-1 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors lg:hidden ml-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>
        <div className="maritime-panel-content">
          <ErrorBoundary fallback={<div className="text-red-500 p-4">Error loading Control Interface</div>}>
            <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div></div>}>
              <ControlInterface />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Right Panel - Learning Panel */}
      <div className="maritime-learning-panel">
        <div className="maritime-panel-header">
          <h3 className="text-lg font-semibold">Learning Mission</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleRightPanel}
            className="p-1 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors lg:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
        <AnimatePresence>
          {(!state.mobileLayout || state.navigation.rightPanelOpen) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="maritime-panel-content"
            >
              <ErrorBoundary fallback={<div className="text-red-500 p-4">Error loading Learning Panel</div>}>
                <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div></div>}>
                  <LearningPanel />
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Overlay */}
      {state.mobileLayout && (state.navigation.leftPanelOpen || state.navigation.rightPanelOpen) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => {
            if (state.navigation.leftPanelOpen) toggleLeftPanel();
            if (state.navigation.rightPanelOpen) toggleRightPanel();
          }}
        />
      )}
    </div>
  );
}
