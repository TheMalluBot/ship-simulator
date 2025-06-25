import React, { useState } from 'react';
import { AlertTriangle, Clock, Play, Square, CheckCircle, X, Gauge, Thermometer } from 'lucide-react';
import { useProceduralTraining } from '../../contexts/ProceduralTrainingContext';
import { motion, AnimatePresence } from 'framer-motion';

// Interactive Control Components
interface ControlButtonProps {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant: 'primary' | 'secondary' | 'danger' | 'emergency';
  size?: 'small' | 'medium' | 'large';
  isActive?: boolean;
}

function ControlButton({ id, label, onClick, disabled, variant, size = 'medium', isActive }: ControlButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
    secondary: 'bg-slate-600 hover:bg-slate-700 border-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 border-red-500',
    emergency: 'bg-red-700 hover:bg-red-800 border-red-600'
  };

  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        metallic-button text-white font-bold border-2 rounded-lg transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-600 border-slate-500' : variants[variant]}
        ${sizes[size]}
        ${isActive ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}
        ${variant === 'emergency' ? 'shadow-lg shadow-red-500/50' : ''}
      `}
    >
      {label}
    </motion.button>
  );
}

interface StatusLightProps {
  status: 'off' | 'on' | 'warning' | 'error';
  label: string;
  size?: 'small' | 'medium' | 'large';
}

function StatusLight({ status, label, size = 'medium' }: StatusLightProps) {
  const colors = {
    off: 'bg-slate-600 border-slate-500',
    on: 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50',
    warning: 'bg-yellow-500 border-yellow-400 shadow-lg shadow-yellow-500/50',
    error: 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50'
  };

  const sizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-6 h-6'
  };

  return (
    <div className="flex items-center space-x-2">
      <motion.div
        animate={{ opacity: status === 'off' ? 0.5 : [1, 0.7, 1] }}
        transition={{ duration: 1, repeat: status === 'off' ? 0 : Infinity }}
        className={`
          ${sizes[size]} rounded-full border-2 led-indicator
          ${colors[status]}
        `}
      />
      <span className="text-slate-300 text-sm">{label}</span>
    </div>
  );
}

interface GaugeDisplayProps {
  label: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  target?: number;
  status: 'normal' | 'warning' | 'critical';
  size?: 'small' | 'medium' | 'large';
}

function GaugeDisplay({ label, value, unit, min = 0, max = 100, target, status, size = 'medium' }: GaugeDisplayProps) {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  
  const statusColors = {
    normal: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400'
  };

  const sizes = {
    small: { container: 'w-16 h-16', text: 'text-xs' },
    medium: { container: 'w-20 h-20', text: 'text-sm' },
    large: { container: 'w-24 h-24', text: 'text-base' }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-600">
      <div className="text-center mb-2">
        <span className="text-slate-300 text-xs font-medium">{label}</span>
      </div>
      
      <div className={`relative mx-auto ${sizes[size].container}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-600"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={statusColors[status]}
            strokeDasharray={`${2 * Math.PI * 40}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
            animate={{ 
              strokeDashoffset: 2 * Math.PI * 40 - (percentage / 100) * 2 * Math.PI * 40 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          {/* Target indicator */}
          {target && (
            <line
              x1="50"
              y1="10"
              x2="50"
              y2="15"
              stroke="white"
              strokeWidth="2"
              transform={`rotate(${((target - min) / (max - min)) * 360} 50 50)`}
            />
          )}
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold maritime-display ${sizes[size].text} ${statusColors[status]}`}>
            {value.toFixed(1)}
          </span>
          <span className="text-slate-400 text-xs">{unit}</span>
        </div>
      </div>
      
      {/* Range indicators */}
      <div className="flex justify-between text-xs text-slate-400 mt-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

interface TimerDisplayProps {
  timeRemaining: number;
  label: string;
  isActive: boolean;
}

function TimerDisplay({ timeRemaining, label, isActive }: TimerDisplayProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className={`bg-slate-800 rounded-lg p-4 border-2 ${
      isActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600'
    }`}>
      <div className="text-center">
        <span className="text-slate-300 text-sm font-medium block mb-2">{label}</span>
        <motion.div
          animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
          className={`text-2xl font-mono font-bold ${
            isActive ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </motion.div>
      </div>
    </div>
  );
}

// Emergency Generator Control Panel
function EmergencyGeneratorPanel() {
  const { state, executeStep, getStepData, getStepStatus, activateControl, isControlActive } = useProceduralTraining();
  const [crankTurns, setCrankTurns] = useState(0);
  const [isManualCranking, setIsManualCranking] = useState(false);

  const stepData = getStepData('EMERGENCY_GEN_START');
  const stepStatus = getStepStatus('EMERGENCY_GEN_START');
  const emergencyGen = state.systemStates.emergencyGenerator || {};

  const handleManualCrank = async () => {
    if (stepStatus !== 'available') return;
    
    setIsManualCranking(true);
    activateControl('manual_crank');
    
    // Simulate manual cranking
    const crankInterval = setInterval(() => {
      setCrankTurns(prev => {
        const newTurns = prev + 1;
        if (newTurns >= 20) {
          clearInterval(crankInterval);
          setIsManualCranking(false);
          executeStep('EMERGENCY_GEN_START', stepData);
        }
        return newTurns;
      });
    }, 500);
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="bg-gradient-to-r from-red-900 to-red-800 p-4 rounded-lg mb-4 border border-red-600">
        <h3 className="text-white font-bold text-lg flex items-center space-x-2">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <span>Emergency Generator Control</span>
        </h3>
        <p className="text-red-200 text-sm mt-1">Manual start required - No electric start available</p>
      </div>

      {/* Pre-Start Checks */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Pre-Start Checks</h4>
          <div className="space-y-2">
            <StatusLight 
              status={emergencyGen.fuelLevel >= 80 ? 'on' : 'error'} 
              label={`Fuel Level: ${emergencyGen.fuelLevel || 95}%`} 
            />
            <StatusLight 
              status="on" 
              label="Oil Level: Normal" 
            />
            <StatusLight 
              status="on" 
              label="Cooling Water: OK" 
            />
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Engine Parameters</h4>
          <div className="grid grid-cols-2 gap-2">
            <GaugeDisplay
              label="Oil Pressure"
              value={emergencyGen.oilPressure || 0}
              unit="bar"
              min={0}
              max={5}
              target={3.5}
              status={emergencyGen.oilPressure >= 2.5 ? 'normal' : 'critical'}
              size="small"
            />
            <GaugeDisplay
              label="RPM"
              value={emergencyGen.rpm || 0}
              unit="rpm"
              min={0}
              max={2000}
              target={1800}
              status={emergencyGen.rpm >= 1500 ? 'normal' : 'warning'}
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Manual Crank Control */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium mb-3">Manual Crank Start</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <motion.div
                animate={{ rotate: isManualCranking ? [0, 45, 0] : 0 }}
                transition={{ duration: 0.5, repeat: isManualCranking ? Infinity : 0 }}
                className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full border-4 border-slate-500 flex items-center justify-center"
              >
                <div className="w-8 h-2 bg-slate-400 rounded"></div>
              </motion.div>
              <span className="text-xs text-slate-400 mt-1 block text-center">Crank Handle</span>
            </div>
            
            <div className="text-center">
              <span className="text-slate-300 text-sm">Turns Completed</span>
              <div className="text-2xl font-mono font-bold text-blue-400">
                {crankTurns}/20
              </div>
            </div>
          </div>

          <ControlButton
            id="manual_crank"
            label={isManualCranking ? "Cranking..." : "Start Manual Crank"}
            onClick={handleManualCrank}
            disabled={stepStatus !== 'available' || isManualCranking}
            variant="primary"
            size="large"
            isActive={isControlActive('manual_crank')}
          />
        </div>
      </div>

      {/* Emergency Stop */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="emergency-stop-mushroom"
          onClick={() => {
            // Emergency stop logic
          }}
        >
          EMERGENCY<br/>STOP
        </motion.button>
      </div>

      {/* Status Display */}
      <div className="mt-4 bg-slate-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Generator Status</span>
          <div className="flex items-center space-x-2">
            <StatusLight 
              status={emergencyGen.status === 'running' ? 'on' : 'off'} 
              label={emergencyGen.status || 'Stopped'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Diesel Generator Oil Heating Control
function DieselGeneratorOilHeating() {
  const { state, executeStep, getStepData, getStepStatus } = useProceduralTraining();
  const [heatingActive, setHeatingActive] = useState(false);

  const stepData = getStepData('DG1_OIL_HEATING');
  const stepStatus = getStepStatus('DG1_OIL_HEATING');
  const dieselGen = state.systemStates.dieselGenerator1 || {};

  const handleStartHeating = async () => {
    if (stepStatus !== 'available') return;
    
    setHeatingActive(true);
    await executeStep('DG1_OIL_HEATING', stepData);
  };

  const heatingProgress = dieselGen.oilTemp ? ((dieselGen.oilTemp - 22) / (45 - 22)) * 100 : 0;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
        <Thermometer className="h-6 w-6 text-orange-400" />
        <span>DG#1 Oil Heating System</span>
      </h3>

      {/* Prerequisites Check */}
      <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <span className="text-yellow-200 text-sm">
            Cooling water circulation must be started first
          </span>
        </div>
        <StatusLight 
          status={state.completedSteps.includes('DG1_COOLING_PREP') ? 'on' : 'off'} 
          label="Cooling Prep Complete" 
        />
      </div>

      {/* Oil Temperature Monitoring */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <GaugeDisplay
            label="Oil Temperature"
            value={dieselGen.oilTemp || 22}
            unit="°C"
            min={20}
            max={50}
            target={45}
            status={dieselGen.oilTemp >= 43 ? 'normal' : dieselGen.oilTemp >= 40 ? 'warning' : 'critical'}
            size="medium"
          />
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <GaugeDisplay
            label="Oil Pressure"
            value={dieselGen.oilPressure || 0}
            unit="bar"
            min={0}
            max={6}
            target={4.5}
            status={dieselGen.oilPressure >= 3.5 ? 'normal' : 'critical'}
            size="medium"
          />
        </div>
      </div>

      {/* Heating Progress */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium mb-3">Heating Progress</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-300">
            <span>Current: {(dieselGen.oilTemp || 22).toFixed(1)}°C</span>
            <span>Target: 45°C</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-3">
            <motion.div
              className="startup-progress h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, heatingProgress)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-center text-sm text-slate-400">
            {heatingProgress.toFixed(1)}% Complete
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <ControlButton
            id="oil_pump"
            label="Start Oil Circulation"
            onClick={() => {}}
            disabled={stepStatus !== 'available'}
            variant="secondary"
            isActive={dieselGen.oilPressure > 0}
          />
          
          <ControlButton
            id="oil_heater"
            label={heatingActive ? "Heating..." : "Start Oil Heater"}
            onClick={handleStartHeating}
            disabled={stepStatus !== 'available' || heatingActive}
            variant="primary"
            isActive={heatingActive}
          />
        </div>

        {stepStatus === 'in_progress' && (
          <div className="mt-4 text-center">
            <TimerDisplay
              timeRemaining={600} // 10 minutes
              label="Heating Time Remaining"
              isActive={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Main Procedural Training Interface
export function ProceduralTrainingInterface() {
  const { 
    state, 
    startProcedure, 
    emergencyStop, 
    getCurrentPhaseData,
    getPhaseProgress,
    formatTime,
    getMistakeCount,
    getCriticalMistakeCount 
  } = useProceduralTraining();

  const currentPhase = getCurrentPhaseData();
  const phaseProgress = getPhaseProgress(state.currentPhase);

  return (
    <div className="space-y-6">
      {/* Procedural Training Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
              <div className="bg-orange-600 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <span>Professional Maritime Trainer</span>
            </h1>
            <p className="text-slate-300 mt-2">
              54-Minute Cold Ship to Main Engine Startup Procedure
            </p>
          </div>

          <div className="flex space-x-4">
            {!state.isStartupInProgress ? (
              <ControlButton
                id="start_procedure"
                label="Start Cold Ship Procedure"
                onClick={startProcedure}
                disabled={false}
                variant="primary"
                size="large"
              />
            ) : (
              <ControlButton
                id="emergency_stop"
                label="EMERGENCY STOP"
                onClick={emergencyStop}
                disabled={false}
                variant="emergency"
                size="large"
              />
            )}
          </div>
        </div>

        {/* Progress Overview */}
        {state.isStartupInProgress && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <span className="text-slate-300 text-sm">Elapsed Time</span>
              <div className="text-xl font-mono font-bold text-blue-400">
                {formatTime(state.elapsedTime)}
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <span className="text-slate-300 text-sm">Current Phase</span>
              <div className="text-lg font-bold text-white">
                {currentPhase?.name || 'Unknown'}
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <span className="text-slate-300 text-sm">Phase Progress</span>
              <div className="text-xl font-bold text-green-400">
                {phaseProgress.toFixed(0)}%
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <span className="text-slate-300 text-sm">Mistakes</span>
              <div className={`text-xl font-bold ${
                getCriticalMistakeCount() > 0 ? 'text-red-400' : 
                getMistakeCount() > 0 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {getMistakeCount()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Procedure Controls */}
      {state.isStartupInProgress && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emergency Generator Panel */}
          <EmergencyGeneratorPanel />
          
          {/* DG1 Oil Heating Panel */}
          <DieselGeneratorOilHeating />
        </div>
      )}

      {/* Procedure Status */}
      {!state.isStartupInProgress && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
          <div className="text-slate-400 mb-4">
            <Play className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Ready to Begin</h2>
            <p>Click "Start Cold Ship Procedure" to begin the 54-minute authentic startup sequence</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">54</div>
              <div className="text-sm text-slate-400">Minutes Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">35+</div>
              <div className="text-sm text-slate-400">Sequential Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">6</div>
              <div className="text-sm text-slate-400">Major Phases</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
