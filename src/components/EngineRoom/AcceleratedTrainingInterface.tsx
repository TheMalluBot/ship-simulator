import React, { useState, useEffect } from 'react';
import { 
  Clock, Play, Square, Settings, Trophy, Zap, Target, AlertTriangle, 
  CheckCircle, X, Volume2, VolumeX, Info, ArrowRight, Gauge, Flame,
  Power, Droplets, Wind, RotateCw, Wrench, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAcceleratedTraining } from '../../contexts/AcceleratedTrainingContext';
import { TimeScale, DifficultyMode } from '../../systems/AcceleratedSimulation';

// Time Scale Configuration Display
function TimeScaleSelector() {
  const { state, setTimeScale } = useAcceleratedTraining();

  const timeScales: Array<{ value: TimeScale; label: string; description: string; duration: string }> = [
    { value: 'INSTANT', label: '🚀 Instant', description: 'Demo Mode', duration: '< 1 min' },
    { value: 'DEMO', label: '⚡ Demo', description: 'Quick Overview', duration: '1 min' },
    { value: 'TRAINING', label: '🎯 Training', description: 'Optimal Learning', duration: '3 min' },
    { value: 'FAST', label: '🔄 Fast', description: 'Accelerated', duration: '6 min' },
    { value: 'REAL_TIME', label: '🐌 Real Time', description: 'Full Realism', duration: '54 min' }
  ];

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600 p-4">
      <h3 className="text-white font-bold text-lg mb-3 flex items-center space-x-2">
        <Zap className="h-5 w-5 text-yellow-400" />
        <span>Simulation Speed</span>
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
        {timeScales.map((scale) => (
          <motion.button
            key={scale.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTimeScale(scale.value)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200 text-center
              ${state.currentTimeScale === scale.value
                ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                : 'border-slate-500 bg-slate-700/50 text-slate-300 hover:border-slate-400'
              }
            `}
          >
            <div className="text-lg font-bold">{scale.label}</div>
            <div className="text-xs opacity-80">{scale.description}</div>
            <div className="text-xs font-mono text-green-400">{scale.duration}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Difficulty Mode Selector
function DifficultySelector() {
  const { state, setDifficulty } = useAcceleratedTraining();

  const difficulties: Array<{ value: DifficultyMode; config: any }> = [
    { value: 'BEGINNER', config: state.simulation.getDifficultyConfig() },
    { value: 'INTERMEDIATE', config: state.simulation.getDifficultyConfig() },
    { value: 'EXPERT', config: state.simulation.getDifficultyConfig() },
    { value: 'REALISTIC', config: state.simulation.getDifficultyConfig() }
  ];

  return (
    <div className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-lg border border-purple-600 p-4">
      <h3 className="text-white font-bold text-lg mb-3 flex items-center space-x-2">
        <Target className="h-5 w-5 text-purple-400" />
        <span>Training Difficulty</span>
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {difficulties.map((diff) => (
          <motion.button
            key={diff.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDifficulty(diff.value)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200 text-center
              ${state.currentDifficulty === diff.value
                ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                : 'border-slate-500 bg-slate-700/50 text-slate-300 hover:border-slate-400'
              }
            `}
          >
            <div className="text-sm font-bold">
              {diff.value === 'BEGINNER' && '🟢 Beginner'}
              {diff.value === 'INTERMEDIATE' && '🟡 Intermediate'}
              {diff.value === 'EXPERT' && '🟠 Expert'}
              {diff.value === 'REALISTIC' && '🔴 Realistic'}
            </div>
            <div className="text-xs opacity-80 mt-1">
              {diff.value === 'BEGINNER' && 'Guided with hints'}
              {diff.value === 'INTERMEDIATE' && 'Standard training'}
              {diff.value === 'EXPERT' && 'No hints, failures'}
              {diff.value === 'REALISTIC' && 'Full 54-min realism'}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// System Status Dashboard
function SystemStatusDashboard() {
  const { state, getSystemState } = useAcceleratedTraining();

  const systemConfigs = [
    { id: 'emergency-power', name: 'Emergency Power', icon: Power, color: 'red' },
    { id: 'diesel-gen-1', name: 'DG #1', icon: Zap, color: 'blue' },
    { id: 'diesel-gen-2', name: 'DG #2', icon: Zap, color: 'blue' },
    { id: 'steam-boiler', name: 'Steam Boiler', icon: Flame, color: 'orange' },
    { id: 'cooling-system', name: 'Cooling', icon: Droplets, color: 'cyan' },
    { id: 'lubrication-system', name: 'Lubrication', icon: Droplets, color: 'amber' },
    { id: 'air-system', name: 'Compressed Air', icon: Wind, color: 'indigo' },
    { id: 'fuel-system', name: 'Fuel System', icon: Gauge, color: 'yellow' },
    { id: 'main-engine', name: 'Main Engine', icon: RotateCw, color: 'green' }
  ];

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600 p-4">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
        <Shield className="h-5 w-5 text-green-400" />
        <span>System Status Overview</span>
      </h3>
      
      <div className="grid grid-cols-3 lg:grid-cols-9 gap-3">
        {systemConfigs.map((config) => {
          const system = getSystemState(config.id);
          const IconComponent = config.icon;
          
          return (
            <motion.div
              key={config.id}
              className="bg-slate-700 rounded-lg p-3 text-center border-2 border-slate-600"
              animate={{
                borderColor: system?.state === 'RUNNING' ? '#10b981' : 
                           system?.state === 'STARTING' ? '#f59e0b' : '#64748b'
              }}
            >
              <div className="flex justify-center mb-2">
                <IconComponent 
                  className={`h-6 w-6 ${
                    system?.state === 'RUNNING' ? 'text-green-400' :
                    system?.state === 'STARTING' ? 'text-yellow-400' : 'text-slate-400'
                  }`}
                />
              </div>
              
              <div className="text-xs text-slate-300 font-medium mb-1">
                {config.name}
              </div>
              
              <div className={`text-xs font-bold ${
                system?.state === 'RUNNING' ? 'text-green-400' :
                system?.state === 'STARTING' ? 'text-yellow-400' : 'text-slate-400'
              }`}>
                {system?.state || 'OFF'}
              </div>
              
              {system?.progress !== undefined && system.progress < 100 && (
                <div className="w-full bg-slate-600 rounded-full h-1 mt-1">
                  <motion.div
                    className="startup-progress h-1 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${system.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Sequential Control Panel
function SequentialControlPanel() {
  const { 
    state, 
    executeStep, 
    canExecuteStep, 
    getStepData, 
    highlightElement,
    startTutorial
  } = useAcceleratedTraining();

  const [executingStep, setExecutingStep] = useState<string | null>(null);

  const handleStepExecution = async (stepId: string) => {
    if (!canExecuteStep(stepId) || executingStep) return;

    setExecutingStep(stepId);
    state.audioSystem.playButtonClick();
    
    try {
      const success = await executeStep(stepId);
      if (!success) {
        state.audioSystem.playError();
      }
    } finally {
      setExecutingStep(null);
    }
  };

  const getStepButtonClass = (stepId: string) => {
    const isAvailable = canExecuteStep(stepId);
    const isExecuting = executingStep === stepId;
    const isCompleted = state.completedSteps.includes(stepId);
    const isHighlighted = state.highlightedElement === stepId;
    
    if (isCompleted) {
      return 'bg-green-600 border-green-500 text-white cursor-default';
    }
    
    if (isExecuting) {
      return 'bg-blue-600 border-blue-500 text-white animate-pulse';
    }
    
    if (isAvailable) {
      return `control-button enabled ${isHighlighted ? 'tutorial-highlight' : ''}`;
    }
    
    return 'control-button disabled';
  };

  const getStepIcon = (stepId: string) => {
    const isCompleted = state.completedSteps.includes(stepId);
    const isExecuting = executingStep === stepId;
    
    if (isCompleted) return <CheckCircle className="h-4 w-4" />;
    if (isExecuting) return <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />;
    return <ArrowRight className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Tutorial Controls */}
      {state.showHints && !state.showTutorial && (
        <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-200 text-sm">Need guidance? Start the interactive tutorial</span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startTutorial}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium"
            >
              Start Tutorial
            </motion.button>
          </div>
        </div>
      )}

      {/* Phase-based Controls */}
      {state.phases.map((phase, phaseIndex) => {
        const phaseCompleted = phase.steps.every(step => state.completedSteps.includes(step.id));
        const phaseActive = phase.steps.some(step => canExecuteStep(step.id));
        const phaseStarted = phase.steps.some(step => state.completedSteps.includes(step.id));
        
        return (
          <motion.div
            key={phase.id}
            className={`bg-slate-800 rounded-lg border-2 p-4 ${
              phaseActive ? 'border-blue-500' : 
              phaseCompleted ? 'border-green-500' : 'border-slate-600'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: phaseIndex * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-bold text-lg ${
                phaseCompleted ? 'text-green-400' :
                phaseActive ? 'text-blue-400' : 'text-slate-400'
              }`}>
                Phase {phaseIndex + 1}: {phase.name}
              </h4>
              
              <div className="flex items-center space-x-2">
                {phaseCompleted && <CheckCircle className="h-5 w-5 text-green-400" />}
                {phaseActive && <Clock className="h-5 w-5 text-blue-400" />}
                
                <span className="text-sm text-slate-400">
                  {Math.round(phase.duration / state.simulation.getTimeMultiplier())}s
                </span>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm mb-4">{phase.description}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {phase.steps.map((step) => {
                const stepData = getStepData(step.id);
                
                return (
                  <motion.button
                    key={step.id}
                    id={step.id}
                    whileHover={{ 
                      scale: canExecuteStep(step.id) && !executingStep ? 1.02 : 1 
                    }}
                    whileTap={{ 
                      scale: canExecuteStep(step.id) && !executingStep ? 0.98 : 1 
                    }}
                    onClick={() => handleStepExecution(step.id)}
                    disabled={!canExecuteStep(step.id) || !!executingStep}
                    className={`
                      ${getStepButtonClass(step.id)}
                      p-3 rounded-lg font-medium text-left transition-all duration-200
                      flex items-center justify-between
                    `}
                  >
                    <div className="flex-1">
                      <div className="font-bold">{step.name}</div>
                      <div className="text-xs opacity-80 mt-1">{step.description}</div>
                      {stepData?.instructions && state.showHints && (
                        <div className="text-xs opacity-60 mt-1">
                          Next: {stepData.instructions[0]}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-3">
                      {getStepIcon(step.id)}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Performance Display
function PerformanceDisplay() {
  const { state, getCurrentPerformance, formatTime } = useAcceleratedTraining();
  const performance = getCurrentPerformance();

  return (
    <div className="bg-gradient-to-r from-indigo-900 to-purple-800 rounded-lg border border-indigo-600 p-4">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
        <Trophy className="h-5 w-5 text-indigo-400" />
        <span>Live Performance Metrics</span>
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Overall Score */}
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {Math.round((performance.efficiency + performance.safetyScore + performance.timeScore) / 3) || 100}
          </div>
          <div className="text-sm text-indigo-200">Overall</div>
          <div className="text-xs text-indigo-300">Score</div>
        </div>
        
        {/* Time */}
        <div className="text-center">
          <div className="text-xl font-mono font-bold text-blue-400 mb-1">
            {formatTime(state.elapsedTime)}
          </div>
          <div className="text-sm text-blue-200">Elapsed</div>
          <div className="text-xs text-blue-300">
            Target: {formatTime(state.simulation.getDifficultyConfig().targetTime * 1000)}
          </div>
        </div>
        
        {/* Efficiency */}
        <div className="text-center">
          <div className="text-xl font-bold text-green-400 mb-1">
            {performance.efficiency || 100}%
          </div>
          <div className="text-sm text-green-200">Efficiency</div>
          <div className="text-xs text-green-300">Procedure</div>
        </div>
        
        {/* Safety */}
        <div className="text-center">
          <div className="text-xl font-bold text-yellow-400 mb-1">
            {performance.safetyScore || 100}%
          </div>
          <div className="text-sm text-yellow-200">Safety</div>
          <div className="text-xs text-yellow-300">Protocol</div>
        </div>
        
        {/* Mistakes */}
        <div className="text-center">
          <div className={`text-xl font-bold mb-1 ${
            state.mistakes === 0 ? 'text-green-400' :
            state.mistakes <= 2 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {state.mistakes}
          </div>
          <div className="text-sm text-slate-200">Mistakes</div>
          <div className="text-xs text-slate-300">Total</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-slate-300 mb-2">
          <span>Training Progress</span>
          <span>{state.overallProgress.toFixed(1)}% Complete</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <motion.div
            className="startup-progress h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${state.overallProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}

// Main Accelerated Training Interface
export function AcceleratedTrainingInterface() {
  const { 
    state, 
    startTraining, 
    stopTraining, 
    resetTraining, 
    formatTime,
    getEstimatedCompletion
  } = useAcceleratedTraining();

  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    state.audioSystem.setEnabled(audioEnabled);
  }, [audioEnabled, state.audioSystem]);

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      state.audioSystem.playButtonClick();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <div className="bg-orange-600 p-3 rounded-lg">
                <Wrench className="h-8 w-8 text-white" />
              </div>
              <span>Accelerated Realism Trainer</span>
            </h1>
            <p className="text-slate-300 mt-2">
              Superior maritime training with time-optimized procedures
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Audio Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAudio}
              className={`p-3 rounded-lg border-2 transition-colors ${
                audioEnabled 
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : 'border-slate-500 bg-slate-500/20 text-slate-400'
              }`}
            >
              {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </motion.button>

            {/* Main Training Controls */}
            {!state.isTrainingActive ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startTraining}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 border-2 border-green-500 text-white font-bold rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Start Accelerated Training</span>
              </motion.button>
            ) : (
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stopTraining}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 border-2 border-red-500 text-white font-bold rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <Square className="h-5 w-5" />
                  <span>Stop</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetTraining}
                  className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-500 text-white font-bold rounded-lg transition-all duration-200"
                >
                  Reset
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Training Status */}
        {state.isTrainingActive && (
          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-200 font-medium">
                    {formatTime(state.elapsedTime)} / {formatTime(state.simulation.getDifficultyConfig().targetTime * 1000)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-400" />
                  <span className="text-green-200 font-medium">
                    ETA: {getEstimatedCompletion()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-slate-300 text-sm">
                  {state.currentPhase?.name || 'Initializing...'}
                </span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Controls */}
      {!state.isTrainingActive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimeScaleSelector />
          <DifficultySelector />
        </div>
      )}

      {/* Performance Display */}
      {state.isTrainingActive && <PerformanceDisplay />}

      {/* System Status Dashboard */}
      <SystemStatusDashboard />

      {/* Sequential Control Panel */}
      {state.isTrainingActive && <SequentialControlPanel />}

      {/* Getting Started Guide */}
      {!state.isTrainingActive && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
          <div className="text-slate-400 mb-4">
            <Info className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Ready to Begin</h2>
            <p>Configure your training settings and click "Start Accelerated Training"</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">10</div>
              <div className="text-sm text-slate-400">Minutes (Training Mode)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">16+</div>
              <div className="text-sm text-slate-400">Sequential Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">5</div>
              <div className="text-sm text-slate-400">Training Phases</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
