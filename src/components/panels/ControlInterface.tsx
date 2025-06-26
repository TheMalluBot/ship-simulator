import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Power, Play, Square, RotateCw, Thermometer, Zap,
  Gauge, Clock, Settings, AlertTriangle, CheckCircle,
  ArrowUp, ArrowDown, RefreshCw
} from 'lucide-react';
import { useModernMaritime } from '../../contexts/ModernMaritimeContext';
import { GeneratorData, ModernGaugeProps } from '../../types/maritime';
import { cn } from '../../lib/utils';

// Modern Maritime Gauge Component
function ModernGauge({ 
  value, 
  min, 
  max, 
  unit, 
  label, 
  color = '#0ea5e9', 
  warningThreshold, 
  criticalThreshold,
  size = 'medium' 
}: ModernGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const dimensions = {
    small: { size: 80, strokeWidth: 8 },
    medium: { size: 120, strokeWidth: 12 },
    large: { size: 160, strokeWidth: 16 }
  };
  
  const { size: canvasSize, strokeWidth } = dimensions[size];
  const center = canvasSize / 2;
  const radius = center - strokeWidth;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Calculate angle
    const normalizedValue = Math.max(min, Math.min(max, value));
    const percentage = (normalizedValue - min) / (max - min);
    const angle = percentage * 2 * Math.PI - Math.PI / 2;
    
    // Background circle
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    
    // Value arc
    ctx.beginPath();
    ctx.arc(center, center, radius, -Math.PI / 2, angle);
    
    // Determine color based on thresholds
    let strokeColor = color;
    if (criticalThreshold && value >= criticalThreshold) {
      strokeColor = '#ef4444';
    } else if (warningThreshold && value >= warningThreshold) {
      strokeColor = '#f59e0b';
    }
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, strokeWidth / 2, 0, 2 * Math.PI);
    ctx.fillStyle = strokeColor;
    ctx.fill();
    
  }, [value, min, max, color, warningThreshold, criticalThreshold, canvasSize, center, radius, strokeWidth]);
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="drop-shadow-lg"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 uppercase">
            {unit}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-300 text-center">
        {label}
      </span>
    </div>
  );
}

// Generator Control Card
interface GeneratorCardProps {
  generator: GeneratorData;
  onStart: () => void;
  onStop: () => void;
  onSelect: () => void;
}

function GeneratorCard({ generator, onStart, onStop, onSelect }: GeneratorCardProps) {
  const getTypeColor = (type: GeneratorData['type']) => {
    switch (type) {
      case 'emergency': return 'border-red-500 bg-red-500/10';
      case 'diesel': return 'border-blue-500 bg-blue-500/10';
      case 'shaft': return 'border-green-500 bg-green-500/10';
      case 'turbo': return 'border-purple-500 bg-purple-500/10';
      default: return 'border-slate-500 bg-slate-500/10';
    }
  };
  
  const getStatusIcon = () => {
    switch (generator.status) {
      case 'running': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'starting': return <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <Power className="h-4 w-4 text-slate-400" />;
    }
  };
  
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      className={cn(
        "maritime-generator-card",
        getTypeColor(generator.type),
        generator.isSelected && "selected"
      )}
      onClick={onSelect}
    >
      {/* Priority Badge */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 border-2 border-slate-600 rounded-full flex items-center justify-center">
        <span className="text-xs font-bold text-white">{generator.priority}</span>
      </div>
      
      {/* Generator Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white text-sm">{generator.name}</h3>
          <p className="text-xs text-slate-400 uppercase">{generator.type} Generator</p>
        </div>
        {getStatusIcon()}
      </div>
      
      {/* Status and Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center p-2 bg-slate-700/50 rounded-lg">
          <div className="text-sm font-bold text-white">{generator.power}</div>
          <div className="text-xs text-slate-400">kW</div>
        </div>
        <div className="text-center p-2 bg-slate-700/50 rounded-lg">
          <div className="text-sm font-bold text-white">{generator.load}</div>
          <div className="text-xs text-slate-400">% Load</div>
        </div>
      </div>
      
      {/* Additional Metrics */}
      <div className="grid grid-cols-3 gap-1 mb-3 text-xs">
        <div className="text-center">
          <div className="text-white font-medium">{generator.voltage}V</div>
          <div className="text-slate-400">Voltage</div>
        </div>
        <div className="text-center">
          <div className="text-white font-medium">{generator.frequency}Hz</div>
          <div className="text-slate-400">Frequency</div>
        </div>
        <div className="text-center">
          <div className="text-white font-medium">{generator.temperature}°C</div>
          <div className="text-slate-400">Temp</div>
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          disabled={!generator.canStart || generator.status === 'running'}
          className={cn(
            "flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg font-medium text-sm transition-all",
            generator.canStart && generator.status !== 'running'
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-slate-600 text-slate-400 cursor-not-allowed"
          )}
        >
          <Play className="h-3 w-3" />
          <span>START</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onStop();
          }}
          disabled={!generator.canStop || generator.status === 'stopped'}
          className={cn(
            "flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg font-medium text-sm transition-all",
            generator.canStop && generator.status !== 'stopped'
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-slate-600 text-slate-400 cursor-not-allowed"
          )}
        >
          <Square className="h-3 w-3" />
          <span>STOP</span>
        </motion.button>
      </div>
      
      {/* Running Hours */}
      <div className="mt-2 text-center">
        <span className="text-xs text-slate-400">
          Running Hours: <span className="text-white font-medium">{generator.hours.toLocaleString()}</span>
        </span>
      </div>
    </motion.div>
  );
}

// Power Distribution Panel
function PowerDistributionPanel() {
  const totalLoad = 2450; // kW
  const maxCapacity = 8000; // kW
  const efficiency = 92; // %
  const powerFactor = 0.87;
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Power Distribution</h3>
        <Zap className="h-5 w-5 text-yellow-400" />
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernGauge
          value={totalLoad}
          min={0}
          max={maxCapacity}
          unit="kW"
          label="Total Load"
          warningThreshold={6000}
          criticalThreshold={7500}
        />
        <ModernGauge
          value={efficiency}
          min={0}
          max={100}
          unit="%"
          label="Efficiency"
          color="#22c55e"
          warningThreshold={85}
          criticalThreshold={80}
        />
        <ModernGauge
          value={powerFactor * 100}
          min={0}
          max={100}
          unit="%"
          label="Power Factor"
          color="#8b5cf6"
          warningThreshold={90}
          criticalThreshold={95}
        />
        <ModernGauge
          value={65}
          min={0}
          max={100}
          unit="°C"
          label="Avg Temp"
          color="#f59e0b"
          warningThreshold={80}
          criticalThreshold={90}
        />
      </div>
    </div>
  );
}

export function ControlInterface() {
  const { 
    state,
    updateGenerator,
    updateSystemStatus,
    recordMistake,
    completeStep
  } = useModernMaritime();
  
  const handleGeneratorStart = (generatorId: string) => {
    const generator = state.generators.find(g => g.id === generatorId);
    if (!generator || !generator.canStart) {
      recordMistake('invalid_action', `Cannot start ${generator?.name || 'generator'}`);
      return;
    }
    
    // Update generator status to starting
    // The context's updateGenerator method already integrates with the simulation engine
    updateGenerator(generatorId, { status: 'starting' });
    
    // The simulation engine will handle the transition from 'starting' to 'running'
    // and the context will update the UI accordingly
    
    // We still need to update related systems when the generator is started
    // This should be handled in the simulation engine, but we'll set a listener here
    const checkGeneratorStatus = setInterval(() => {
      const updatedGenerator = state.generators.find(g => g.id === generatorId);
      if (updatedGenerator?.status === 'running') {
        clearInterval(checkGeneratorStatus);
        
        // Update related system status
        if (generatorId === 'emergency-gen') {
          updateSystemStatus('emergency-power', 'running');
        } else if (generatorId.startsWith('dg')) {
          updateSystemStatus('power-chief-101', 'running');
        }
        
        // Check if this completes a mission step
        if (state.currentStep?.targetAction === 'start' && 
            state.currentStep?.targetSystem === 'emergency-power' && 
            generatorId === 'emergency-gen') {
          completeStep(state.currentStep.id);
        }
      }
    }, 500); // Check every half second
    
    // Clean up interval if component unmounts
    return () => clearInterval(checkGeneratorStatus);
  };
  
  const handleGeneratorStop = (generatorId: string) => {
    const generator = state.generators.find(g => g.id === generatorId);
    if (!generator || !generator.canStop) {
      recordMistake('invalid_action', `Cannot stop ${generator?.name || 'generator'}`);
      return;
    }
    
    // The context's updateGenerator method handles the simulation engine integration
    updateGenerator(generatorId, { status: 'stopped' });
    
    // We need to update related systems when the generator is stopped
    // This should ideally be handled in the simulation engine
    const checkGeneratorStatus = setInterval(() => {
      const updatedGenerator = state.generators.find(g => g.id === generatorId);
      if (updatedGenerator?.status === 'stopped') {
        clearInterval(checkGeneratorStatus);
        
        // Update related system status
        if (generatorId === 'emergency-gen') {
          updateSystemStatus('emergency-power', 'stopped');
        } else if (generatorId.startsWith('dg')) {
          // Check if any other diesel generators are running before stopping the power system
          const otherRunningDGs = state.generators.filter(g => 
            g.id.startsWith('dg') && 
            g.id !== generatorId && 
            g.status === 'running'
          );
          
          if (otherRunningDGs.length === 0) {
            updateSystemStatus('power-chief-101', 'stopped');
          }
        }
      }
    }, 500); // Check every half second
    
    // Clean up interval if component unmounts
    return () => clearInterval(checkGeneratorStatus);
  };
  
  const handleGeneratorSelect = (generatorId: string) => {
    // Update generator selection
    state.generators.forEach(gen => {
      updateGenerator(gen.id, { isSelected: gen.id === generatorId });
    });
  };
  
  if (!state.selectedSystem) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Select a System</h2>
          <p className="text-slate-400">
            Choose a system from the directory to view its controls
          </p>
        </div>
      </div>
    );
  }
  
  // Render different control interfaces based on selected system
  if (state.selectedSystem.category === 'power') {
    return (
      <div className="space-y-6">
        {/* Power Distribution Overview */}
        <PowerDistributionPanel />
        
        {/* Generator Control Grid */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Generator Control</h3>
            <Power className="h-5 w-5 text-blue-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.generators.map((generator) => (
              <GeneratorCard
                key={generator.id}
                generator={generator}
                onStart={() => handleGeneratorStart(generator.id)}
                onStop={() => handleGeneratorStop(generator.id)}
                onSelect={() => handleGeneratorSelect(generator.id)}
              />
            ))}
          </div>
          
          {/* Load Priority Controls */}
          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
            <h4 className="font-semibold text-white mb-3">Load Priority Control</h4>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((priority) => (
                <button
                  key={priority}
                  className="w-10 h-10 bg-slate-600 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default system control interface
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            {state.selectedSystem.name}
          </h3>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              state.selectedSystem.status === 'running' ? 'bg-green-500' :
              state.selectedSystem.status === 'starting' ? 'bg-yellow-500 animate-pulse' :
              state.selectedSystem.status === 'error' ? 'bg-red-500' : 'bg-slate-500'
            )} />
            <span className="text-sm text-slate-400 uppercase">
              {state.selectedSystem.status}
            </span>
          </div>
        </div>
        
        <p className="text-slate-300 mb-6">
          {state.selectedSystem.description}
        </p>
        
        {/* System Control Buttons */}
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>START</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            <Square className="h-4 w-4" />
            <span>STOP</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>CONFIGURE</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
