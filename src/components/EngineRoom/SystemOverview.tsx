import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Monitor, Activity, Database, Zap, Droplets, Wind, AlertTriangle, ShieldAlert, XCircle, Loader } from 'lucide-react';
import { useShipSimulator } from '../../contexts/ShipSimulatorContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemStatusProps {
  name: string;
  status: 'running' | 'stopped' | 'warning' | 'error';
  value?: number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
}

function SystemStatus({ name, status, value, unit, icon: Icon }: SystemStatusProps) {
  const statusColors = {
    running: 'text-green-400 bg-green-500/20 border-green-500',
    stopped: 'text-slate-400 bg-slate-500/20 border-slate-500',
    warning: 'text-yellow-400 bg-yellow-500/20 border-yellow-500',
    error: 'text-red-400 bg-red-500/20 border-red-500',
  };

  const statusTexts = {
    running: 'Running',
    stopped: 'Stopped',
    warning: 'Warning',
    error: 'Error',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg border ${statusColors[status]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <span className="text-white font-medium text-sm">{name}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${statusColors[status]}`}>
          {statusTexts[status]}
        </span>
      </div>
      
      {value !== undefined && (
        <div className="text-lg font-mono text-white">
          {value.toFixed(1)} {unit}
        </div>
      )}
      
      {status === 'running' && (
        <motion.div
          className="mt-2 h-1 bg-green-500 rounded"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      )}
    </motion.div>
  );
}

// Error message component for displaying operation errors
function ErrorMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 mb-4 rounded-lg"
    >
      <div className="flex items-center space-x-2">
        <ShieldAlert className="h-4 w-4" />
        <span className="flex-1">{message}</span>
        <button 
          onClick={onDismiss} 
          className="text-red-200 hover:text-white"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Loading indicator component
function LoadingIndicator({ message }: { message: string }) {
  return (
    <div className="flex items-center space-x-3 bg-blue-500/20 border border-blue-500 text-blue-200 px-4 py-2 mb-4 rounded-lg">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-4 w-4 border-t-2 border-r-2 border-blue-400 rounded-full"
      />
      <span>{message}</span>
    </div>
  );
}

// Error boundary for SystemOverview component
class SystemOverviewErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error in SystemOverview component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">System Overview Error</h3>
            <p className="text-slate-300 mb-6">We encountered a problem with the system overview display.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main component content
function SystemOverviewContent() {
  const { state } = useShipSimulator();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { systems } = state.engineRoom;

  const systemsData = [
    {
      name: 'Main Engine',
      status: systems.mainEngine.status === 'running' ? 'running' as const : 'stopped' as const,
      value: systems.mainEngine.rpm,
      unit: 'RPM',
      icon: Monitor,
    },
    {
      name: 'Auxiliary Engine',
      status: systems.auxiliaryEngine.status === 'running' ? 'running' as const : 'stopped' as const,
      value: systems.auxiliaryEngine.load,
      unit: '%',
      icon: Zap,
    },
    {
      name: 'Fuel System',
      status: systems.fuelSystem.mainTank > 200 ? 'running' as const : 'warning' as const,
      value: systems.fuelSystem.mainTank,
      unit: 'm³',
      icon: Droplets,
    },
    {
      name: 'Day Tank',
      status: systems.fuelSystem.dayTank > 20 ? 'running' as const : 'warning' as const,
      value: systems.fuelSystem.dayTank,
      unit: 'm³',
      icon: Database,
    },
    {
      name: 'Cooling System',
      status: 'running' as const,
      value: 82.5,
      unit: '°C',
      icon: Activity,
    },
    {
      name: 'Air System',
      status: 'running' as const,
      value: 28.3,
      unit: 'bar',
      icon: Wind,
    },
  ];

  const refreshSystemData = () => {
    try {
      setRefreshing(true);
      setIsLoading(true);
      
      // Simulate network delay for demonstration purposes
      setTimeout(() => {
        // In a real implementation, this would fetch fresh data
        setRefreshing(false);
        setIsLoading(false);
      }, 1200);
    } catch (err) {
      setError(`Failed to refresh system data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      refreshSystemData();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Error and Loading States */}
      <AnimatePresence>
        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        )}
      </AnimatePresence>
      
      {isLoading && (
        <LoadingIndicator message="Updating system overview data..." />
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span>System Overview</span>
            </h2>
            <p className="text-slate-300 text-sm mt-1">Engine room systems status</p>
          </div>
          <button 
            onClick={refreshSystemData}
            disabled={refreshing}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-lg transition-colors"
          >
            {refreshing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5 border-t-2 border-r-2 border-slate-400 rounded-full"
              />
            ) : (
              <Activity className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Systems Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemsData.map((system, index) => (
            <motion.div
              key={system.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SystemStatus {...system} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Engine Room Schematic */}
      <div className="bg-slate-700 p-4 border-t border-slate-600">
        <h3 className="text-white font-medium text-sm mb-4">Engine Room Layout</h3>
        <div className="relative bg-slate-800 rounded-lg p-6 h-48 overflow-hidden">
          {/* Background image overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 rounded-lg"
            style={{ backgroundImage: 'url(/images/engine-machinery.jpg)' }}
          />
          
          {/* Interactive elements */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="grid grid-cols-3 gap-8 w-full max-w-md">
              {/* Main Engine */}
              <motion.div
                animate={{ 
                  scale: systems.mainEngine.status === 'running' ? [1, 1.05, 1] : 1,
                  opacity: systems.mainEngine.status === 'running' ? [0.8, 1, 0.8] : 0.6
                }}
                transition={{ 
                  duration: 2, 
                  repeat: systems.mainEngine.status === 'running' ? Infinity : 0 
                }}
                className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center ${
                  systems.mainEngine.status === 'running' 
                    ? 'border-green-400 bg-green-500/20' 
                    : 'border-slate-500 bg-slate-500/20'
                }`}
              >
                <Monitor className="h-8 w-8 text-white" />
              </motion.div>

              {/* Auxiliary Engine */}
              <motion.div
                animate={{ 
                  scale: systems.auxiliaryEngine.status === 'running' ? [1, 1.03, 1] : 1,
                  opacity: systems.auxiliaryEngine.status === 'running' ? [0.8, 1, 0.8] : 0.6
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: systems.auxiliaryEngine.status === 'running' ? Infinity : 0 
                }}
                className={`w-12 h-12 rounded border-2 flex items-center justify-center ${
                  systems.auxiliaryEngine.status === 'running' 
                    ? 'border-blue-400 bg-blue-500/20' 
                    : 'border-slate-500 bg-slate-500/20'
                }`}
              >
                <Zap className="h-6 w-6 text-white" />
              </motion.div>

              {/* Fuel System */}
              <div className={`w-12 h-12 rounded border-2 flex items-center justify-center ${
                systems.fuelSystem.mainTank > 200 
                  ? 'border-yellow-400 bg-yellow-500/20' 
                  : 'border-red-400 bg-red-500/20'
              }`}>
                <Droplets className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-300">Live Data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
