import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Power, RotateCcw, AlertTriangle, CheckCircle, ShieldAlert, XCircle, Loader } from 'lucide-react';
import { useShipSimulator } from '../../contexts/ShipSimulatorContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SwitchProps {
  label: string;
  isOn: boolean;
  onToggle: () => void;
  critical?: boolean;
  disabled?: boolean;
}

function Switch({ label, isOn, onToggle, critical, disabled }: SwitchProps) {
  return (
    <div className={`bg-slate-700 rounded-lg p-3 border ${critical ? 'border-orange-500' : 'border-slate-600'}`}>
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-medium">{label}</span>
        <button
          onClick={onToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            disabled 
              ? 'bg-slate-600 cursor-not-allowed' 
              : isOn 
                ? 'bg-green-600' 
                : 'bg-slate-500'
          }`}
        >
          <motion.span
            layout
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              isOn ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <div className="mt-2 flex items-center space-x-1">
        {isOn ? (
          <CheckCircle className="h-4 w-4 text-green-400" />
        ) : (
          <div className="h-4 w-4 rounded-full border-2 border-slate-500" />
        )}
        <span className={`text-xs ${isOn ? 'text-green-400' : 'text-slate-400'}`}>
          {isOn ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  );
}

interface ButtonControlProps {
  label: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

function ButtonControl({ label, onClick, variant, disabled, icon: Icon }: ButtonControlProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
        disabled ? 'bg-slate-600 cursor-not-allowed opacity-50' : variants[variant]
      }`}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span className="font-medium">{label}</span>
    </motion.button>
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

// Error boundary for EngineControls component
class EngineControlsErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error in EngineControls component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Engine Control System Error</h3>
            <p className="text-slate-300 mb-6">We encountered a problem with the engine control systems.</p>
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
function EngineControlsContent() {
  const { state, playSound, triggerAlarm } = useShipSimulator();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processingSystem, setProcessingSystem] = useState<string | null>(null);
  // System states
  const [systems, setSystems] = useState({
    mainEngine: false,
    auxiliaryEngine: false,
    fuelPumps: false,
    coolingPumps: false,
    lubricationPump: false,
    airCompressor: false,
    emergencyStop: false,
  });

  const toggleSystem = (systemName: keyof typeof systems) => {
    try {
      setProcessingSystem(systemName);
      setIsLoading(true);
      
      // Simulate network delay for demonstration purposes
      setTimeout(() => {
        setSystems(prev => ({
          ...prev,
          [systemName]: !prev[systemName],
        }));
        playSound('switch');
        setProcessingSystem(null);
        setIsLoading(false);
      }, 800);
    } catch (err) {
      setError(`Failed to toggle ${systemName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setProcessingSystem(null);
      setIsLoading(false);
    }
  };

  const handleEmergencyStop = () => {
    try {
      setIsLoading(true);
      
      // Simulate network delay for demonstration purposes
      setTimeout(() => {
        setSystems({
          mainEngine: false,
          auxiliaryEngine: false,
          fuelPumps: false,
          coolingPumps: false,
          lubricationPump: false,
          airCompressor: false,
          emergencyStop: true,
        });
        triggerAlarm('emergency', true);
        playSound('emergency-alarm');
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError(`Failed to execute emergency stop: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    try {
      setIsLoading(true);
      
      // Simulate network delay for demonstration purposes
      setTimeout(() => {
        setSystems(prev => ({
          ...prev,
          emergencyStop: false,
        }));
        triggerAlarm('emergency', false);
        playSound('reset');
        setIsLoading(false);
      }, 800);
    } catch (err) {
      setError(`Failed to reset systems: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Error and Loading States */}
      <AnimatePresence>
        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        )}
      </AnimatePresence>
      
      {isLoading && (
        <LoadingIndicator message="Processing engine control operation..." />
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-600">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Power className="h-5 w-5 text-white" />
          </div>
          <span>Engine Controls</span>
        </h2>
        <p className="text-slate-300 text-sm mt-1">System switches & controls</p>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Main Systems */}
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">Main Systems</h3>
          
          <Switch
            label="Main Engine"
            isOn={systems.mainEngine}
            onToggle={() => toggleSystem('mainEngine')}
            critical
            disabled={systems.emergencyStop || isLoading || processingSystem === 'mainEngine'}
          />
          
          <Switch
            label="Auxiliary Engine"
            isOn={systems.auxiliaryEngine}
            onToggle={() => toggleSystem('auxiliaryEngine')}
            disabled={systems.emergencyStop || isLoading || processingSystem === 'auxiliaryEngine'}
          />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Main Systems */}
          <div className="space-y-3">
            <h3 className="text-white font-medium text-sm">Main Systems</h3>
            
            <Switch
              label="Main Engine"
              isOn={systems.mainEngine}
              onToggle={() => toggleSystem('mainEngine')}
              critical
              disabled={systems.emergencyStop || isLoading || processingSystem === 'mainEngine'}
            />
            
            <Switch
              label="Auxiliary Engine"
              isOn={systems.auxiliaryEngine}
              onToggle={() => toggleSystem('auxiliaryEngine')}
              disabled={systems.emergencyStop || isLoading || processingSystem === 'auxiliaryEngine'}
            />
          </div>

          {/* Support Systems */}
          <div className="space-y-3">
            <h3 className="text-white font-medium text-sm">Support Systems</h3>
            
            <Switch
              label="Fuel Pumps"
              isOn={systems.fuelPumps}
              onToggle={() => toggleSystem('fuelPumps')}
              disabled={systems.emergencyStop || isLoading || processingSystem === 'fuelPumps'}
            />
            
            <Switch
              label="Cooling Pumps"
              isOn={systems.coolingPumps}
              onToggle={() => toggleSystem('coolingPumps')}
              critical
              disabled={systems.emergencyStop || isLoading || processingSystem === 'coolingPumps'}
            />
            
            <Switch
              label="Lubrication Pump"
              isOn={systems.lubricationPump}
              onToggle={() => toggleSystem('lubricationPump')}
              critical
              disabled={systems.emergencyStop || isLoading || processingSystem === 'lubricationPump'}
            />
            
            <Switch
              label="Air Compressor"
              isOn={systems.airCompressor}
              onToggle={() => toggleSystem('airCompressor')}
              disabled={systems.emergencyStop || isLoading || processingSystem === 'airCompressor'}
            />
          </div>

          {/* Emergency Controls */}
          <div className="space-y-3 pt-4 border-t border-slate-600">
            <h3 className="text-white font-medium text-sm flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <span>Emergency Controls</span>
            </h3>
            
            <ButtonControl
              label="Emergency Stop"
              onClick={handleEmergencyStop}
              variant="danger"
              icon={isLoading ? Loader : AlertTriangle}
              disabled={systems.emergencyStop || isLoading}
            />
            
            {systems.emergencyStop && (
              <ButtonControl
                label="Reset Systems"
                onClick={handleReset}
                variant="secondary"
                icon={RotateCcw}
                disabled={!systems.emergencyStop || isLoading}
              />
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 pt-4 border-t border-slate-600">
            <h3 className="text-white font-medium text-sm">Quick Actions</h3>
            
            <ButtonControl
              label="Start All Systems"
              onClick={() => setSystems(prev => ({
                ...prev,
                mainEngine: true,
                auxiliaryEngine: true,
                fuelPumps: true,
                coolingPumps: true,
                lubricationPump: true,
                airCompressor: true,
              }))}
              variant="primary"
              disabled={systems.emergencyStop}
            />
            
            <ButtonControl
              label="Stop All Systems"
              onClick={() => setSystems(prev => ({
                ...prev,
                mainEngine: false,
                auxiliaryEngine: false,
                fuelPumps: false,
                coolingPumps: false,
                lubricationPump: false,
                airCompressor: false,
              }))}
              variant="secondary"
              disabled={systems.emergencyStop}
            />
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Systems Status</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              systems.emergencyStop 
                ? 'bg-red-400' 
                : (systems.mainEngine && systems.auxiliaryEngine) 
                  ? 'bg-green-400' 
                  : 'bg-yellow-400'
            }`} />
            <span className={`text-sm font-medium ${
              systems.emergencyStop 
                ? 'text-red-400' 
                : (systems.mainEngine && systems.auxiliaryEngine) 
                  ? 'text-green-400' 
                  : 'text-yellow-400'
            }`}>
              {systems.emergencyStop 
                ? 'Emergency Stop' 
                : (systems.mainEngine && systems.auxiliaryEngine) 
                  ? 'All Systems Go' 
                  : 'Partial Operation'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
