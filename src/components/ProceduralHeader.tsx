import React from 'react';
import { Anchor, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProceduralTraining } from '../contexts/ProceduralTrainingContext';
import { motion } from 'framer-motion';

export function ProceduralHeader() {
  const { 
    state, 
    formatTime, 
    getMistakeCount, 
    getCriticalMistakeCount,
    getCurrentPhaseData 
  } = useProceduralTraining();

  const currentPhase = getCurrentPhaseData();
  const mistakeCount = getMistakeCount();
  const criticalMistakes = getCriticalMistakeCount();

  return (
    <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Anchor className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Professional Maritime Trainer</h1>
              <p className="text-slate-300 text-sm">
                {state.isStartupInProgress 
                  ? "54-Minute Cold Ship Startup Procedure" 
                  : "Superior Ship Simulator - Exceeding Kongsberg Standards"}
              </p>
            </div>
          </div>

          {/* Procedure Status */}
          <div className="flex items-center space-x-6">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <motion.div 
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-green-400" 
              />
              <span className="text-slate-300 text-sm">Training System Active</span>
            </div>

            {/* Procedure Timer */}
            {state.isStartupInProgress && (
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <div className="text-center">
                  <div className="text-lg font-mono font-bold text-blue-400">
                    {formatTime(state.elapsedTime)}
                  </div>
                  <div className="text-xs text-slate-400">/ 54:00</div>
                </div>
              </div>
            )}

            {/* Current Phase */}
            {state.isStartupInProgress && currentPhase && (
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1 rounded">
                  <div className="text-white text-xs font-bold">
                    PHASE {currentPhase.id.split('_')[1]}
                  </div>
                </div>
                <div className="text-slate-300 text-sm max-w-32 truncate">
                  {currentPhase.name}
                </div>
              </div>
            )}

            {/* Mistake Counter */}
            {mistakeCount > 0 && (
              <motion.div
                animate={{ 
                  scale: criticalMistakes > 0 ? [1, 1.1, 1] : 1,
                  backgroundColor: criticalMistakes > 0 ? ["#dc2626", "#b91c1c", "#dc2626"] : "#d97706"
                }}
                transition={{ duration: 1, repeat: criticalMistakes > 0 ? Infinity : 0 }}
                className="flex items-center space-x-2 px-3 py-1 rounded-lg"
              >
                <AlertTriangle className="h-5 w-5 text-white" />
                <span className="text-white text-sm font-medium">
                  {mistakeCount} Mistake{mistakeCount !== 1 ? 's' : ''}
                  {criticalMistakes > 0 && ` (${criticalMistakes} Critical)`}
                </span>
              </motion.div>
            )}

            {/* Perfect Performance Indicator */}
            {state.isStartupInProgress && mistakeCount === 0 && state.completedSteps.length > 5 && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center space-x-2 bg-green-500/20 border border-green-500 px-3 py-1 rounded-lg"
              >
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-300 text-sm font-medium">Perfect Performance</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Procedure Progress Bar */}
        {state.isStartupInProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
              <span>Startup Progress</span>
              <span>
                {state.completedSteps.length}/35 steps 
                ({((state.completedSteps.length / 35) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div
                className="startup-progress h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(state.completedSteps.length / 35) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Current Step Information */}
        {state.currentStep && (
          <div className="mt-3 bg-blue-500/20 border border-blue-500 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
              />
              <div>
                <span className="text-blue-200 font-medium text-sm">
                  Currently Executing: {state.currentStep.replace('_', ' ')}
                </span>
                <div className="text-blue-300 text-xs mt-1">
                  Follow all procedural steps - safety interlocks active
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
