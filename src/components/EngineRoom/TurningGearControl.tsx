import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useProceduralTraining } from '../../contexts/ProceduralTrainingContext';
import { motion } from 'framer-motion';

export function TurningGearControl() {
  const { state, executeStep, getStepData, getStepStatus, activateControl, isControlActive } = useProceduralTraining();
  const [isEngaging, setIsEngaging] = useState(false);
  const [rotationInProgress, setRotationInProgress] = useState(false);

  const stepData = getStepData('TURNING_GEAR_ENGAGE');
  const stepStatus = getStepStatus('TURNING_GEAR_ENGAGE');
  const mainEngine = state.systemStates.mainEngine || {};

  const handleEngageTurningGear = async () => {
    if (stepStatus !== 'available') return;
    
    // Safety interlock check
    if (mainEngine.status !== 'stopped') {
      // This would trigger a mistake in the system
      return;
    }

    setIsEngaging(true);
    setRotationInProgress(true);
    activateControl('turning_gear');
    
    await executeStep('TURNING_GEAR_ENGAGE', stepData);
    
    setIsEngaging(false);
    setRotationInProgress(false);
  };

  const handleDisengageTurningGear = async () => {
    if (!mainEngine.turningGearEngaged) return;
    
    const disengageStepData = getStepData('TURNING_GEAR_DISENGAGE');
    if (disengageStepData) {
      await executeStep('TURNING_GEAR_DISENGAGE', disengageStepData);
    }
  };

  const rotationProgress = mainEngine.rotationCount ? (mainEngine.rotationCount / 5) * 100 : 0;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="bg-gradient-to-r from-purple-900 to-purple-800 p-4 rounded-lg mb-4 border border-purple-600">
        <h3 className="text-white font-bold text-lg flex items-center space-x-2">
          <RotateCcw className="h-6 w-6 text-purple-400" />
          <span>Main Engine Turning Gear</span>
        </h3>
        <p className="text-purple-200 text-sm mt-1">Slow rotation system for engine preparation</p>
      </div>

      {/* Safety Interlocks */}
      <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-4">
        <h4 className="text-red-200 font-medium mb-3 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>Safety Interlocks</span>
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            {mainEngine.status === 'stopped' ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <X className="h-5 w-5 text-red-400" />
            )}
            <span className="text-sm text-slate-300">Engine Stopped</span>
          </div>
          <div className="flex items-center space-x-2">
            {mainEngine.rpm === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <X className="h-5 w-5 text-red-400" />
            )}
            <span className="text-sm text-slate-300">Zero RPM</span>
          </div>
          <div className="flex items-center space-x-2">
            {state.completedSteps.includes('COMPRESSED_AIR_MAIN') ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <X className="h-5 w-5 text-red-400" />
            )}
            <span className="text-sm text-slate-300">Air System Ready</span>
          </div>
          <div className="flex items-center space-x-2">
            {!mainEngine.turningGearEngaged ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <X className="h-5 w-5 text-red-400" />
            )}
            <span className="text-sm text-slate-300">Gear Disengaged</span>
          </div>
        </div>
      </div>

      {/* Turning Gear Visualization */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium mb-3">Turning Gear Status</h4>
        <div className="flex items-center justify-center space-x-8">
          {/* Engine Flywheel */}
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: rotationInProgress ? [0, 360] : 0,
                scale: mainEngine.turningGearEngaged ? 1.1 : 1
              }}
              transition={{ 
                rotate: { duration: 20, repeat: rotationInProgress ? Infinity : 0, ease: "linear" },
                scale: { duration: 0.3 }
              }}
              className={`w-24 h-24 rounded-full border-8 flex items-center justify-center ${
                mainEngine.turningGearEngaged 
                  ? 'border-green-400 bg-green-500/20' 
                  : 'border-slate-500 bg-slate-600/20'
              }`}
            >
              <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
              {/* Flywheel teeth */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-4 bg-slate-400"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-14px)`,
                    transformOrigin: 'center 14px'
                  }}
                />
              ))}
            </motion.div>
            <span className="text-xs text-slate-400 mt-2 block text-center">Engine Flywheel</span>
          </div>

          {/* Turning Gear Motor */}
          <div className="relative">
            <motion.div
              animate={{ 
                backgroundColor: mainEngine.turningGearEngaged 
                  ? ["#059669", "#10b981", "#059669"] 
                  : "#64748b"
              }}
              transition={{ duration: 1, repeat: mainEngine.turningGearEngaged ? Infinity : 0 }}
              className="w-16 h-16 rounded-lg border-4 border-slate-500 flex items-center justify-center"
            >
              <RotateCcw className="h-8 w-8 text-white" />
            </motion.div>
            <span className="text-xs text-slate-400 mt-2 block text-center">Turning Motor</span>
          </div>
        </div>

        {/* Rotation Counter */}
        <div className="mt-4 text-center">
          <div className="bg-slate-800 rounded-lg p-3 inline-block">
            <span className="text-slate-300 text-sm block">Rotation Count</span>
            <span className="text-2xl font-mono font-bold text-blue-400">
              {(mainEngine.rotationCount || 0).toFixed(1)}/5.0
            </span>
            <span className="text-slate-400 text-sm block">rotations</span>
          </div>
        </div>

        {/* Progress Bar */}
        {rotationInProgress && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-300 mb-2">
              <span>Rotation Progress</span>
              <span>{rotationProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, rotationProgress)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: stepStatus === 'available' ? 1.02 : 1 }}
          whileTap={{ scale: stepStatus === 'available' ? 0.98 : 1 }}
          onClick={handleEngageTurningGear}
          disabled={stepStatus !== 'available' || isEngaging}
          className={`
            px-4 py-3 rounded-lg font-bold border-2 transition-all duration-200
            ${stepStatus === 'available' && !isEngaging
              ? 'bg-green-600 hover:bg-green-700 border-green-500 text-white'
              : 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-60'
            }
            ${isControlActive('turning_gear') ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}
          `}
        >
          {isEngaging ? "Engaging..." : "Engage Turning Gear"}
        </motion.button>

        <motion.button
          whileHover={{ scale: mainEngine.turningGearEngaged ? 1.02 : 1 }}
          whileTap={{ scale: mainEngine.turningGearEngaged ? 0.98 : 1 }}
          onClick={handleDisengageTurningGear}
          disabled={!mainEngine.turningGearEngaged}
          className={`
            px-4 py-3 rounded-lg font-bold border-2 transition-all duration-200
            ${mainEngine.turningGearEngaged
              ? 'bg-red-600 hover:bg-red-700 border-red-500 text-white'
              : 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-60'
            }
          `}
        >
          Disengage Turning Gear
        </motion.button>
      </div>

      {/* Procedure Instructions */}
      {stepStatus === 'available' && (
        <div className="mt-4 bg-blue-900/30 border border-blue-600 rounded-lg p-3">
          <h5 className="text-blue-200 font-medium mb-2">Procedure Instructions</h5>
          <ol className="text-sm text-blue-100 space-y-1">
            <li>1. Verify engine is completely stopped</li>
            <li>2. Check all safety interlocks</li>
            <li>3. Engage turning gear motor</li>
            <li>4. Complete minimum 5 full rotations</li>
            <li>5. Listen for unusual sounds during rotation</li>
          </ol>
        </div>
      )}

      {/* Warning Messages */}
      {stepStatus === 'locked' && (
        <div className="mt-4 bg-yellow-900/30 border border-yellow-600 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-200 text-sm">
              Complete compressed air system preparation first
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
