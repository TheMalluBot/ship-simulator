import React from 'react';
import { Trophy, AlertTriangle, Clock, CheckCircle, X, TrendingUp } from 'lucide-react';
import { useProceduralTraining } from '../../contexts/ProceduralTrainingContext';
import { motion } from 'framer-motion';

export function PerformanceAssessment() {
  const { 
    state, 
    getPerformanceAssessment, 
    formatTime, 
    getMistakeCount, 
    getCriticalMistakeCount 
  } = useProceduralTraining();

  const performance = getPerformanceAssessment();
  const mistakeCount = getMistakeCount();
  const criticalMistakes = getCriticalMistakeCount();
  const elapsedTime = state.elapsedTime;
  const targetTime = 54 * 60 * 1000; // 54 minutes in milliseconds
  const timeEfficiency = elapsedTime > 0 ? Math.min(100, (targetTime / elapsedTime) * 100) : 0;

  const getCertificationColor = (cert: string) => {
    switch (cert) {
      case 'master': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
      case 'advanced': return 'text-green-400 bg-green-500/20 border-green-500';
      case 'competent': return 'text-blue-400 bg-blue-500/20 border-blue-500';
      case 'basic': return 'text-orange-400 bg-orange-500/20 border-orange-500';
      default: return 'text-red-400 bg-red-500/20 border-red-500';
    }
  };

  const getCertificationIcon = (cert: string) => {
    switch (cert) {
      case 'master': return '🏆';
      case 'advanced': return '🥇';
      case 'competent': return '🥈';
      case 'basic': return '🥉';
      default: return '❌';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 p-4 rounded-lg mb-6 border border-indigo-600">
        <h2 className="text-white font-bold text-xl flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-indigo-400" />
          <span>Performance Assessment</span>
        </h2>
        <p className="text-indigo-200 text-sm mt-1">Professional maritime training evaluation</p>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-700 rounded-lg p-4 text-center"
        >
          <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</div>
          <div className="text-sm text-slate-400">Elapsed Time</div>
          <div className="text-xs text-slate-500 mt-1">Target: 54:00</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-700 rounded-lg p-4 text-center"
        >
          <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{timeEfficiency.toFixed(0)}%</div>
          <div className="text-sm text-slate-400">Efficiency</div>
          <div className="text-xs text-slate-500 mt-1">Time vs Target</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-700 rounded-lg p-4 text-center"
        >
          <AlertTriangle className={`h-8 w-8 mx-auto mb-2 ${
            mistakeCount === 0 ? 'text-green-400' : 
            mistakeCount <= 5 ? 'text-yellow-400' : 'text-red-400'
          }`} />
          <div className={`text-2xl font-bold ${
            mistakeCount === 0 ? 'text-green-400' : 
            mistakeCount <= 5 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {mistakeCount}
          </div>
          <div className="text-sm text-slate-400">Total Mistakes</div>
          <div className="text-xs text-slate-500 mt-1">
            {criticalMistakes} Critical
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-700 rounded-lg p-4 text-center"
        >
          <CheckCircle className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{state.completedSteps.length}</div>
          <div className="text-sm text-slate-400">Steps Complete</div>
          <div className="text-xs text-slate-500 mt-1">
            Phase: {state.currentPhase.split('_')[1]}
          </div>
        </motion.div>
      </div>

      {/* Performance Details */}
      {performance && (
        <div className="space-y-4">
          {/* Certification Level */}
          <div className={`rounded-lg p-4 border-2 ${getCertificationColor(performance.certification)}`}>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-4xl">{getCertificationIcon(performance.certification)}</span>
              <div className="text-center">
                <div className="text-xl font-bold capitalize">
                  {performance.certification} Level
                </div>
                <div className="text-sm opacity-80">
                  Maritime Training Certification
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Time Efficiency</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Score</span>
                  <span className="text-blue-400 font-mono">{timeEfficiency.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${timeEfficiency}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Safety Score</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Score</span>
                  <span className="text-green-400 font-mono">{performance.safetyScore.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <motion.div
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${performance.safetyScore}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Procedural Compliance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Score</span>
                  <span className="text-purple-400 font-mono">{performance.proceduralCompliance.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <motion.div
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${performance.proceduralCompliance}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mistake Breakdown */}
          {state.mistakes.length > 0 && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Mistake Analysis</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {state.mistakes.map((mistake, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-2 p-2 rounded border ${
                      mistake.severity === 'critical' 
                        ? 'border-red-500 bg-red-500/10' 
                        : mistake.severity === 'major'
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-blue-500 bg-blue-500/10'
                    }`}
                  >
                    {mistake.severity === 'critical' ? (
                      <X className="h-4 w-4 text-red-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm text-white">{mistake.description}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(mistake.timestamp).toLocaleTimeString()} - {mistake.stepId}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      mistake.severity === 'critical' 
                        ? 'bg-red-600 text-red-100' 
                        : mistake.severity === 'major'
                        ? 'bg-yellow-600 text-yellow-100'
                        : 'bg-blue-600 text-blue-100'
                    }`}>
                      {mistake.severity}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Suggestions */}
          {performance.improvements.length > 0 && (
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h4 className="text-blue-200 font-medium mb-3">Improvement Suggestions</h4>
              <ul className="space-y-2">
                {performance.improvements.map((improvement, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-2 text-sm text-blue-100"
                  >
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{improvement}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Live Progress Indicator */}
      {state.isStartupInProgress && (
        <div className="mt-6 bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Overall Progress</span>
            <span className="text-slate-300 text-sm">
              {((state.completedSteps.length / 35) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-3">
            <motion.div
              className="startup-progress h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(state.completedSteps.length / 35) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-2 text-center">
            {state.completedSteps.length}/35 steps completed
          </div>
        </div>
      )}
    </div>
  );
}
