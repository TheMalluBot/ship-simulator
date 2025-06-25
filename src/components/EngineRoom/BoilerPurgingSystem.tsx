import React, { useState, useEffect } from 'react';
import { Flame, Wind, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useProceduralTraining } from '../../contexts/ProceduralTrainingContext';
import { motion, AnimatePresence } from 'framer-motion';

export function BoilerPurgingSystem() {
  const { state, executeStep, getStepData, getStepStatus } = useProceduralTraining();
  const [purgeTimeRemaining, setPurgeTimeRemaining] = useState(300); // 5 minutes
  const [isPurging, setIsPurging] = useState(false);
  const [purgeComplete, setPurgeComplete] = useState(false);

  const stepData = getStepData('PURGING_SEQUENCE');
  const stepStatus = getStepStatus('PURGING_SEQUENCE');
  const boilerSystem = state.systemStates.boilerSystem || {};

  useEffect(() => {
    if (isPurging && purgeTimeRemaining > 0) {
      const timer = setInterval(() => {
        setPurgeTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPurging(false);
            setPurgeComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPurging, purgeTimeRemaining]);

  const handleStartPurge = async () => {
    if (stepStatus !== 'available') return;
    
    setIsPurging(true);
    setPurgeTimeRemaining(300);
    
    await executeStep('PURGING_SEQUENCE', stepData);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const purgeProgress = ((300 - purgeTimeRemaining) / 300) * 100;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="bg-gradient-to-r from-orange-900 to-red-800 p-4 rounded-lg mb-4 border border-red-600">
        <h3 className="text-white font-bold text-lg flex items-center space-x-2">
          <Wind className="h-6 w-6 text-orange-400" />
          <span>Boiler Purging System</span>
        </h3>
        <p className="text-orange-200 text-sm mt-1">Mandatory 5-minute safety purge before ignition</p>
      </div>

      {/* Safety Warning */}
      <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4 mb-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0" />
          <div>
            <h4 className="text-red-200 font-bold">CRITICAL SAFETY PROCEDURE</h4>
            <p className="text-red-300 text-sm mt-1">
              Purging removes combustible gases from boiler. Cannot be shortened or bypassed. 
              Minimum 5 minutes required by maritime safety regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Prerequisites Check */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium mb-3">Pre-Purge Prerequisites</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            {state.completedSteps.includes('FUEL_OIL_HEATING') ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-slate-500" />
            )}
            <span className="text-sm text-slate-300">Fuel Oil Heated (98°C)</span>
          </div>
          <div className="flex items-center space-x-2">
            {state.completedSteps.includes('COMBUSTION_AIR_PREP') ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-slate-500" />
            )}
            <span className="text-sm text-slate-300">Combustion Air Ready</span>
          </div>
          <div className="flex items-center space-x-2">
            {boilerSystem.waterLevel >= 60 ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-slate-500" />
            )}
            <span className="text-sm text-slate-300">Water Level Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            {boilerSystem.flameStatus === 'off' ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-slate-500" />
            )}
            <span className="text-sm text-slate-300">No Flame Present</span>
          </div>
        </div>
      </div>

      {/* Purge Visualization */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium mb-3">Purge Process</h4>
        
        <div className="relative">
          {/* Boiler Chamber Visualization */}
          <div className="relative w-full h-32 bg-slate-800 rounded-lg border-2 border-slate-600 overflow-hidden">
            {/* Air Flow Animation */}
            <AnimatePresence>
              {isPurging && Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-70"
                  initial={{ x: -10, y: Math.random() * 120 }}
                  animate={{ x: '100vw' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "linear"
                  }}
                />
              ))}
            </AnimatePresence>
            
            {/* Combustion Chamber */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className={`w-16 h-8 rounded border-2 ${
                isPurging ? 'border-blue-400 bg-blue-500/20' : 'border-slate-500 bg-slate-600/20'
              }`}>
                <div className="flex items-center justify-center h-full">
                  <Flame className={`h-4 w-4 ${isPurging ? 'text-blue-400' : 'text-slate-500'}`} />
                </div>
              </div>
            </div>

            {/* Fan Indicator */}
            <div className="absolute top-4 right-4">
              <motion.div
                animate={{ rotate: isPurging ? [0, 360] : 0 }}
                transition={{ duration: 1, repeat: isPurging ? Infinity : 0, ease: "linear" }}
                className={`w-8 h-8 rounded-full border-4 ${
                  isPurging ? 'border-blue-400' : 'border-slate-500'
                }`}
              >
                <Wind className="h-4 w-4 text-slate-300" />
              </motion.div>
            </div>
          </div>

          {/* Air Pressure Indicator */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-slate-300 text-sm">Air Pressure:</span>
            <span className={`font-mono text-lg ${
              isPurging ? 'text-blue-400' : 'text-slate-400'
            }`}>
              {isPurging ? '150' : '0'} mbar
            </span>
          </div>
        </div>
      </div>

      {/* Purge Timer */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4">
        <div className="text-center">
          <h4 className="text-white font-medium mb-3">Purge Timer</h4>
          
          <motion.div
            animate={{ 
              scale: isPurging ? [1, 1.05, 1] : 1,
              color: purgeTimeRemaining <= 30 ? ["#ef4444", "#fbbf24", "#ef4444"] : "#3b82f6"
            }}
            transition={{ 
              scale: { duration: 1, repeat: isPurging ? Infinity : 0 },
              color: { duration: 0.5, repeat: purgeTimeRemaining <= 30 ? Infinity : 0 }
            }}
            className="text-6xl font-mono font-bold mb-2"
          >
            {formatTime(purgeTimeRemaining)}
          </motion.div>
          
          <div className="text-slate-400 text-sm mb-3">
            {isPurging ? 'Purging in progress...' : purgeComplete ? 'Purge complete' : 'Ready to start purge'}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-600 rounded-full h-3 mb-3">
            <motion.div
              className={`h-3 rounded-full ${
                purgeComplete ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${purgeProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {isPurging && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-blue-900/50 border border-blue-500 rounded-lg p-2"
              >
                <p className="text-blue-200 text-sm">
                  Mandatory safety purge in progress. Please wait...
                </p>
              </motion.div>
            )}
            
            {purgeComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-900/50 border border-green-500 rounded-lg p-2"
              >
                <p className="text-green-200 text-sm font-medium">
                  ✓ Purge complete - Safe to proceed with ignition
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Control Panel */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: stepStatus === 'available' && !isPurging ? 1.02 : 1 }}
          whileTap={{ scale: stepStatus === 'available' && !isPurging ? 0.98 : 1 }}
          onClick={handleStartPurge}
          disabled={stepStatus !== 'available' || isPurging || purgeComplete}
          className={`
            w-full px-4 py-3 rounded-lg font-bold border-2 transition-all duration-200
            ${stepStatus === 'available' && !isPurging && !purgeComplete
              ? 'bg-orange-600 hover:bg-orange-700 border-orange-500 text-white'
              : 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-60'
            }
          `}
        >
          {isPurging ? 'Purging...' : purgeComplete ? 'Purge Complete' : 'Start Mandatory Purge'}
        </motion.button>

        {/* Emergency Stop */}
        <motion.button
          whileHover={{ scale: isPurging ? 1.02 : 1 }}
          whileTap={{ scale: isPurging ? 0.98 : 1 }}
          disabled={!isPurging}
          className={`
            w-full px-4 py-2 rounded-lg font-bold border-2 transition-all duration-200
            ${isPurging
              ? 'bg-red-600 hover:bg-red-700 border-red-500 text-white'
              : 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-60'
            }
          `}
        >
          Emergency Stop Purge
        </motion.button>
      </div>

      {/* Procedure Notes */}
      <div className="mt-4 bg-yellow-900/30 border border-yellow-600 rounded-lg p-3">
        <h5 className="text-yellow-200 font-medium mb-2 flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Regulatory Requirements</span>
        </h5>
        <ul className="text-yellow-100 text-sm space-y-1">
          <li>• Minimum 5-minute purge required by SOLAS</li>
          <li>• Cannot be shortened under any circumstances</li>
          <li>• Must achieve 150% air change rate</li>
          <li>• All dampers must be fully open</li>
          <li>• Forced draft fan at maximum speed</li>
        </ul>
      </div>
    </div>
  );
}
