import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Volume2, VolumeX, CheckCircle, X, Loader, RefreshCw, ShieldAlert, XCircle } from 'lucide-react';
import { useShipSimulator } from '../../contexts/ShipSimulatorContext';
import { motion, AnimatePresence } from 'framer-motion';

// Error message component for displaying operation errors
function ErrorMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
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

interface AlarmItemProps {
  id: string;
  type: 'fire' | 'engine' | 'navigation' | 'general' | 'security';
  message: string;
  priority: 'critical' | 'warning' | 'info';
  timestamp: Date;
  acknowledged: boolean;
  onAcknowledge: () => void;
  onReset: () => void;
}

interface AlarmItemProps {
  id: string;
  type: 'fire' | 'engine' | 'navigation' | 'general' | 'security';
  message: string;
  priority: 'critical' | 'warning' | 'info';
  timestamp: Date;
  acknowledged: boolean;
  onAcknowledge: () => void;
  onReset: () => void;
  isProcessing?: boolean;
}

function AlarmItem({ id, type, message, priority, timestamp, acknowledged, onAcknowledge, onReset, isProcessing = false }: AlarmItemProps) {
  const getAlarmColor = () => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-500/20 text-red-300';
      case 'warning': return 'border-yellow-500 bg-yellow-500/20 text-yellow-300';
      case 'info': return 'border-blue-500 bg-blue-500/20 text-blue-300';
      default: return 'border-slate-500 bg-slate-500/20 text-slate-300';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'fire': return '🔥';
      case 'engine': return '⚙️';
      case 'navigation': return '🧭';
      case 'security': return '🔒';
      default: return '⚠️';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: acknowledged ? 0.95 : [1, 1.02, 1]
      }}
      transition={{ 
        duration: 0.3,
        scale: { duration: 2, repeat: acknowledged ? 0 : Infinity }
      }}
      className={`border rounded-lg p-3 transition-all ${getAlarmColor()} ${
        acknowledged ? 'opacity-60' : 'shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getTypeIcon()}</div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{message}</span>
              {priority === 'critical' && !acknowledged && (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                >
                  CRITICAL
                </motion.div>
              )}
            </div>
            <div className="text-sm opacity-75">
              {timestamp.toLocaleTimeString()} | {type.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isProcessing ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-5 w-5 border-t-2 border-r-2 border-yellow-400 rounded-full"
            />
          ) : !acknowledged ? (
            <button
              onClick={onAcknowledge}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
              disabled={isProcessing}
            >
              ACK
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <button
                onClick={onReset}
                className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm transition-colors"
                disabled={isProcessing}
              >
                RESET
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Error boundary component for AlarmPanel
class AlarmPanelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-800 rounded-lg border border-red-500 overflow-hidden p-6 flex flex-col items-center justify-center">
          <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Alarm System Error</h3>
          <p className="text-sm text-slate-400 text-center mb-4">
            The alarm panel encountered an error and couldn't be displayed.
          </p>
          <p className="text-xs text-red-400 bg-red-400/10 p-2 rounded mb-4 max-w-full overflow-auto">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload System</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main AlarmPanel component content
function AlarmPanelContent() {
  const { state, triggerAlarm, playSound } = useShipSimulator();
  const [alarmVolume, setAlarmVolume] = useState(8);
  const [isMuted, setIsMuted] = useState(false);
  
  // Error and loading states
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processingAlarmId, setProcessingAlarmId] = useState<string | null>(null);
  
  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const [alarms, setAlarms] = useState([
    {
      id: '1',
      type: 'engine' as const,
      message: 'Engine Room High Temperature',
      priority: 'warning' as const,
      timestamp: new Date(),
      acknowledged: false,
    },
    {
      id: '2',
      type: 'navigation' as const,
      message: 'GPS Signal Lost',
      priority: 'critical' as const,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      acknowledged: true,
    },
  ]);

  const acknowledgeAlarm = (alarmId: string) => {
    try {
      setProcessingAlarmId(alarmId);
      // Simulate network delay for demonstration purposes
      setTimeout(() => {
        setAlarms(prev => prev.map(alarm => 
          alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
        ));
        playSound('acknowledge');
        setProcessingAlarmId(null);
      }, 500);
    } catch (err) {
      setError(`Failed to acknowledge alarm: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setProcessingAlarmId(null);
    }
  };

  const resetAlarm = (alarmId: string) => {
    try {
      setProcessingAlarmId(alarmId);
      // Simulate network delay for demonstration purposes
      setTimeout(() => {
        setAlarms(prev => prev.filter(alarm => alarm.id !== alarmId));
        setProcessingAlarmId(null);
      }, 500);
    } catch (err) {
      setError(`Failed to reset alarm: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setProcessingAlarmId(null);
    }
  };

  const testAlarm = (type: string) => {
    try {
      setIsLoading(true);
      const newAlarm = {
        id: Date.now().toString(),
        type: type as any,
        message: `Test ${type} alarm`,
        priority: 'warning' as const,
        timestamp: new Date(),
        acknowledged: false,
      };
      
      // Simulate network delay for demonstration purposes
      setTimeout(() => {
        setAlarms(prev => [newAlarm, ...prev]);
        triggerAlarm(type, true);
        if (!isMuted) {
          playSound('alarm');
        }
        setIsLoading(false);
      }, 800);
    } catch (err) {
      setError(`Failed to create test alarm: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const acknowledgeAll = () => {
    try {
      setIsLoading(true);
      // Simulate network delay for demonstration purposes
      setTimeout(() => {
        setAlarms(prev => prev.map(alarm => ({ ...alarm, acknowledged: true })));
        playSound('acknowledge-all');
        setIsLoading(false);
      }, 800);
    } catch (err) {
      setError(`Failed to acknowledge all alarms: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    try {
      setIsLoading(true);
      // Simulate network delay for demonstration purposes
      setTimeout(() => {
        setAlarms(prev => prev.filter(alarm => alarm.acknowledged));
        setIsLoading(false);
      }, 800);
    } catch (err) {
      setError(`Failed to reset all alarms: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const activeAlarms = alarms.filter(alarm => !alarm.acknowledged);
  const criticalAlarms = activeAlarms.filter(alarm => alarm.priority === 'critical');

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Error and Loading States */}
      <AnimatePresence>
        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        )}
      </AnimatePresence>
      
      {isLoading && (
        <LoadingIndicator message="Processing alarm system operation..." />
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${activeAlarms.length > 0 ? 'bg-red-600' : 'bg-slate-600'}`}>
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <span>Alarm System</span>
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              {activeAlarms.length} active alarm(s) | {criticalAlarms.length} critical
            </p>
          </div>

          {/* Global Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-600 hover:bg-slate-700'
              }`}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </button>

            {activeAlarms.length > 0 && (
              <>
                <button
                  onClick={acknowledgeAll}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  ACK ALL
                </button>
                <button
                  onClick={resetAll}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  RESET
                </button>
              </>
            )}
          </div>
        </div>

        {/* Volume Control */}
        <div className="mt-4 flex items-center space-x-4">
          <span className="text-slate-300 text-sm">Alarm Volume:</span>
          <input
            type="range"
            min="0"
            max="10"
            value={isMuted ? 0 : alarmVolume}
            onChange={(e) => setAlarmVolume(Number(e.target.value))}
            className="flex-1 max-w-32"
            disabled={isMuted}
          />
          <span className="text-slate-400 text-sm w-6">
            {isMuted ? '0' : alarmVolume}
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Alarms', value: alarms.length, color: 'text-slate-300' },
            { label: 'Active', value: activeAlarms.length, color: 'text-yellow-400' },
            { label: 'Critical', value: criticalAlarms.length, color: 'text-red-400' },
            { label: 'Acknowledged', value: alarms.filter(a => a.acknowledged).length, color: 'text-green-400' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-700 rounded-lg p-3 text-center"
            >
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-slate-400 text-sm">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Active Alarms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Active Alarms</h3>
            <div className="flex space-x-2">
              {activeAlarms.length > 0 && (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center space-x-2 bg-red-500/20 border border-red-500 px-3 py-1 rounded-lg"
                >
                  <Bell className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 text-sm">ALARMS ACTIVE</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <AnimatePresence>
              {alarms.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-slate-400"
                >
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No alarms in the system</p>
                </motion.div>
              ) : (
                alarms.map(alarm => (
                  <AlarmItem
                    key={alarm.id}
                    id={alarm.id}
                    type={alarm.type}
                    message={alarm.message}
                    priority={alarm.priority}
                    timestamp={alarm.timestamp}
                    acknowledged={alarm.acknowledged}
                    onAcknowledge={() => acknowledgeAlarm(alarm.id)}
                    onReset={() => resetAlarm(alarm.id)}
                    isProcessing={processingAlarmId === alarm.id}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Test Controls */}
        <div className="mt-6 pt-6 border-t border-slate-600">
          <h3 className="text-white font-medium text-sm mb-3">Alarm Tests</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {['fire', 'engine', 'navigation', 'security', 'general'].map(type => (
              <button
                key={type}
                onClick={() => testAlarm(type)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded text-sm capitalize transition-colors flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-t-2 border-r-2 border-slate-400 rounded-full"
                  />
                ) : type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
