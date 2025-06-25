import React, { useState } from 'react';
import { Play, CheckCircle, Clock, AlertTriangle, Pause } from 'lucide-react';
import { useShipSimulator } from '../../contexts/ShipSimulatorContext';
import { motion, AnimatePresence } from 'framer-motion';

export function EngineStartupProcedure() {
  const { state, startEngineStartup, completeCurrentStep } = useShipSimulator();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const { startupProcedure, currentStep, isStartupInProgress } = state.engineRoom;

  const getStepIcon = (step: typeof startupProcedure[0], index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    } else if (index === currentStep && isStartupInProgress) {
      return <Clock className="h-5 w-5 text-blue-400 animate-pulse" />;
    } else if (step.critical) {
      return <AlertTriangle className="h-5 w-5 text-orange-400" />;
    } else {
      return <div className="h-5 w-5 rounded-full border-2 border-slate-500" />;
    }
  };

  const getStepStatus = (step: typeof startupProcedure[0], index: number) => {
    if (step.status === 'completed') return 'completed';
    if (index === currentStep && isStartupInProgress) return 'active';
    if (index < currentStep) return 'completed';
    return 'pending';
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Play className="h-5 w-5 text-white" />
              </div>
              <span>Engine Startup Procedure</span>
            </h2>
            <p className="text-slate-300 mt-1">
              {isStartupInProgress 
                ? `Step ${currentStep + 1} of ${startupProcedure.length} - In Progress`
                : `Ready to start - ${startupProcedure.length} steps`}
            </p>
          </div>
          
          <div className="flex space-x-2">
            {!isStartupInProgress ? (
              <button
                onClick={startEngineStartup}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>Start Procedure</span>
              </button>
            ) : (
              <button
                onClick={completeCurrentStep}
                disabled={currentStep >= startupProcedure.length}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete Step</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentStep / Math.max(startupProcedure.length - 1, 1)) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(currentStep / Math.max(startupProcedure.length - 1, 1)) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          <AnimatePresence>
            {startupProcedure.map((step, index) => {
              const status = getStepStatus(step, index);
              const isExpanded = expandedStep === index;
              
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-lg transition-all duration-200 ${
                    status === 'completed'
                      ? 'border-green-500 bg-green-500/10'
                      : status === 'active'
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                      : 'border-slate-600 bg-slate-700/50'
                  }`}
                >
                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : index)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStepIcon(step, index)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${
                              status === 'active' ? 'text-blue-300' : 'text-white'
                            }`}>
                              Step {step.step}: {step.title}
                            </span>
                            {step.critical && (
                              <span className="bg-orange-600 text-orange-100 text-xs px-2 py-1 rounded">
                                Critical
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 text-sm mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {status === 'active' && (
                          <span className="text-blue-300 text-sm">
                            {step.duration}s
                          </span>
                        )}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-600 px-4 pb-4"
                      >
                        <div className="pt-4">
                          <h4 className="text-sm font-medium text-white mb-2">Checks Required:</h4>
                          <ul className="space-y-1">
                            {step.checks.map((check, checkIndex) => (
                              <li key={checkIndex} className="flex items-center space-x-2 text-sm text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-slate-500" />
                                <span>{check}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-600">
                            <span className="text-sm text-slate-400">
                              Duration: {step.duration} seconds
                            </span>
                            {status === 'active' && (
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs"
                              >
                                In Progress
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
