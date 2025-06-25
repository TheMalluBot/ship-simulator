import React from 'react';
import { Anchor, Clock, Zap, Target, Trophy, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAcceleratedTraining } from '../contexts/AcceleratedTrainingContext';
import { motion } from 'framer-motion';

export function AcceleratedHeader() {
  const { 
    state, 
    formatTime, 
    getCurrentPerformance,
    getEstimatedCompletion
  } = useAcceleratedTraining();

  const performance = getCurrentPerformance();

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
              <h1 className="text-2xl font-bold text-white">Accelerated Realism Maritime Trainer</h1>
              <p className="text-slate-300 text-sm">
                {state.isTrainingActive 
                  ? `${state.currentTimeScale} Mode - ${state.currentDifficulty} Difficulty` 
                  : "Superior Ship Simulator - Time-Optimized Training Excellence"}
              </p>
            </div>
          </div>

          {/* Training Status */}
          <div className="flex items-center space-x-6">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <motion.div 
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-green-400" 
              />
              <span className="text-slate-300 text-sm">System Ready</span>
            </div>

            {/* Training Timer */}
            {state.isTrainingActive && (
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <div className="text-center">
                  <div className="text-lg font-mono font-bold text-blue-400">
                    {formatTime(state.elapsedTime)}
                  </div>
                  <div className="text-xs text-slate-400">
                    ETA: {getEstimatedCompletion()}
                  </div>
                </div>
              </div>
            )}

            {/* Time Scale Indicator */}
            {state.isTrainingActive && (
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <div className="text-center">
                  <div className="text-sm font-bold text-yellow-400">
                    {state.currentTimeScale}
                  </div>
                  <div className="text-xs text-slate-400">
                    {state.simulation.getTimeMultiplier()}x Speed
                  </div>
                </div>
              </div>
            )}

            {/* Current Performance */}
            {state.isTrainingActive && (
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-purple-400" />
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {Math.round((performance.efficiency + performance.safetyScore + performance.timeScore) / 3) || 100}
                  </div>
                  <div className="text-xs text-slate-400">Score</div>
                </div>
              </div>
            )}

            {/* Current Phase */}
            {state.isTrainingActive && state.currentPhase && (
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1 rounded">
                  <div className="text-white text-xs font-bold">
                    PHASE {state.phases.findIndex(p => p.id === state.currentPhase?.id) + 1}
                  </div>
                </div>
                <div className="text-slate-300 text-sm max-w-32 truncate">
                  {state.currentPhase.name}
                </div>
              </div>
            )}

            {/* Mistake Counter */}
            {state.mistakes > 0 && (
              <motion.div
                animate={{ 
                  scale: state.mistakes > 3 ? [1, 1.1, 1] : 1,
                  backgroundColor: state.mistakes > 3 ? ["#dc2626", "#b91c1c", "#dc2626"] : "#d97706"
                }}
                transition={{ duration: 1, repeat: state.mistakes > 3 ? Infinity : 0 }}
                className="flex items-center space-x-2 px-3 py-1 rounded-lg"
              >
                <AlertTriangle className="h-5 w-5 text-white" />
                <span className="text-white text-sm font-medium">
                  {state.mistakes} Mistake{state.mistakes !== 1 ? 's' : ''}
                </span>
              </motion.div>
            )}

            {/* Perfect Performance Indicator */}
            {state.isTrainingActive && state.mistakes === 0 && state.completedSteps.length > 3 && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center space-x-2 bg-green-500/20 border border-green-500 px-3 py-1 rounded-lg"
              >
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-300 text-sm font-medium">Perfect Performance</span>
              </motion.div>
            )}

            {/* Difficulty Badge */}
            {state.isTrainingActive && (
              <div className={`px-3 py-1 rounded-lg border-2 ${
                state.currentDifficulty === 'REALISTIC' ? 'border-red-500 bg-red-500/20 text-red-300' :
                state.currentDifficulty === 'EXPERT' ? 'border-orange-500 bg-orange-500/20 text-orange-300' :
                state.currentDifficulty === 'INTERMEDIATE' ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300' :
                'border-green-500 bg-green-500/20 text-green-300'
              }`}>
                <span className="text-sm font-medium">
                  {state.currentDifficulty === 'REALISTIC' && '🔴 Realistic'}
                  {state.currentDifficulty === 'EXPERT' && '🟠 Expert'}
                  {state.currentDifficulty === 'INTERMEDIATE' && '🟡 Intermediate'}
                  {state.currentDifficulty === 'BEGINNER' && '🟢 Beginner'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {state.isTrainingActive && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
              <span>Training Progress</span>
              <span>
                {state.completedSteps.length}/{state.phases.reduce((total, phase) => total + phase.steps.length, 0)} steps 
                ({state.overallProgress.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div
                className="startup-progress h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${state.overallProgress}%` }}
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
                  Currently Executing: {state.currentStep.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <div className="text-blue-300 text-xs mt-1">
                  Follow sequential procedure - safety interlocks active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats for Non-Active Training */}
        {!state.isTrainingActive && (
          <div className="mt-3 bg-slate-700/50 rounded-lg p-3">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-400">
                  {state.currentTimeScale === 'DEMO' ? '1' : 
                   state.currentTimeScale === 'TRAINING' ? '3' :
                   state.currentTimeScale === 'FAST' ? '6' : '54'}
                </div>
                <div className="text-xs text-slate-400">Minutes Duration</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">16+</div>
                <div className="text-xs text-slate-400">Sequential Steps</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-400">5</div>
                <div className="text-xs text-slate-400">Training Phases</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-400">
                  {state.currentTimeScale === 'INSTANT' ? '∞' : 
                   state.currentTimeScale === 'DEMO' ? '50' :
                   state.currentTimeScale === 'TRAINING' ? '20' :
                   state.currentTimeScale === 'FAST' ? '10' : '1'}x
                </div>
                <div className="text-xs text-slate-400">Acceleration</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
