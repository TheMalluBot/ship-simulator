import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Clock, Trophy, CheckCircle, AlertCircle,
  ChevronRight, BookOpen, Info, HelpCircle, Star,
  Play, Pause, SkipForward, RotateCcw, Loader,
  XCircle, AlertTriangle, RefreshCw, ShieldAlert
} from 'lucide-react';
import { useModernMaritime } from '../../contexts/ModernMaritimeContext';
import { LearningMission, MissionStep } from '../../types/maritime';
import { cn } from '../../lib/utils';

// Error message component for displaying operation errors
function ErrorMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
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

interface MissionCardProps {
  mission: LearningMission;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

function MissionCard({ mission, isActive, isCompleted, onClick }: MissionCardProps) {
  const getDifficultyColor = (difficulty: LearningMission['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getDifficultyStars = (difficulty: LearningMission['difficulty']) => {
    const starCount = difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3;
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'h-3 w-3',
          i < starCount ? 'text-yellow-400 fill-current' : 'text-slate-500'
        )}
      />
    ));
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-lg border cursor-pointer transition-all duration-200',
        isActive
          ? 'bg-blue-500/20 border-blue-500 shadow-lg'
          : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 hover:bg-slate-700/70',
        isCompleted && 'border-green-500/50 bg-green-500/10'
      )}
    >
      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Mission Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-white text-sm leading-tight">
            {mission.title}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            {mission.description}
          </p>
        </div>
      </div>

      {/* Mission Metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {getDifficultyStars(mission.difficulty)}
          </div>
          <span className="text-xs text-slate-400 capitalize">
            {mission.difficulty}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Clock className="h-3 w-3" />
          <span>{mission.estimatedTime} min</span>
        </div>
      </div>

      {/* Progress Bar */}
      {isActive && mission.steps && (
        <div className="mt-3">
          <div className="w-full bg-slate-600 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface MissionStepProps {
  step: MissionStep;
  isActive: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
  isLoading?: boolean;
  onActivate: () => void;
}

function MissionStepCard({ step, isActive, isCompleted, isUnlocked, isLoading, onActivate }: MissionStepProps) {
  return (
    <motion.div
      layout
      className={cn(
        'p-4 rounded-lg border transition-all duration-200',
        isActive
          ? 'bg-blue-500/20 border-blue-500'
          : isCompleted
          ? 'bg-green-500/10 border-green-500/50'
          : isUnlocked
          ? 'bg-slate-700/50 border-slate-600 hover:border-slate-500 cursor-pointer'
          : 'bg-slate-800/50 border-slate-700 opacity-50',
        isLoading && 'opacity-70'
      )}
      onClick={isUnlocked && !isLoading ? onActivate : undefined}
    >
      {/* Step Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
            isCompleted
              ? 'bg-green-500 text-white'
              : isActive
              ? 'bg-blue-500 text-white'
              : isUnlocked
              ? 'bg-slate-600 text-slate-200'
              : 'bg-slate-700 text-slate-500'
          )}>
            {isLoading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-3 w-3 border-t-2 border-r-2 border-white rounded-full"
              />
            ) : isCompleted ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              step.number
            )}
          </div>
          <h5 className="font-medium text-white text-sm">
            {step.title}
          </h5>
        </div>

      </div>

      {/* Step Description */}
      <p className="text-xs text-slate-400 mb-3 pl-9">
        {step.description}
      </p>

      {/* Step Actions/Info */}
      {isActive && (
        <div className="pl-9 space-y-2">
          {step.hint && (
            <div className="flex items-start space-x-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
              <Info className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-blue-300">
                {step.hint}
              </span>
            </div>
          )}
          
          {step.theory && (
            <div className="flex items-start space-x-2 p-2 bg-slate-700/50 border border-slate-600 rounded">
              <BookOpen className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-300">
                {step.theory}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function PerformanceMetrics() {
  const { state } = useModernMaritime();
  const [error, setError] = useState<string | null>(null);
  
  // Error handling wrapper for performance metrics
  const safePerformance = {
    score: 0,
    completedSteps: 0,
    timeElapsed: 0,
    mistakeCount: 0,
    achievements: []
  };
  
  try {
    // Safely access performance metrics with fallbacks
    if (state && state.performance) {
      safePerformance.score = state.performance.score || 0;
      safePerformance.completedSteps = state.performance.completedSteps || 0;
      safePerformance.timeElapsed = state.performance.timeElapsed || 0;
      safePerformance.mistakeCount = state.performance.mistakeCount || 0;
      safePerformance.achievements = state.performance.achievements || [];
    }
  } catch (err) {
    setError(`Failed to load performance metrics: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Performance</h3>
        <Trophy className="h-5 w-5 text-yellow-400" />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-2 mb-3 rounded-lg text-xs flex items-center space-x-2"
          >
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="text-red-200 hover:text-white"
            >
              <XCircle className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
          <div className="text-xl font-bold text-yellow-400">
            {safePerformance.score}
          </div>
          <div className="text-xs text-slate-400">Score</div>
        </div>
        
        <div className="text-center p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
          <div className="text-xl font-bold text-blue-400">
            {safePerformance.completedSteps}
          </div>
          <div className="text-xs text-slate-400">Steps</div>
        </div>
        
        <div className="text-center p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
          <div className="text-xl font-bold text-green-400">
            {Math.floor(safePerformance.timeElapsed / 60)}m
          </div>
          <div className="text-xs text-slate-400">Time</div>
        </div>
        
        <div className="text-center p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
          <div className="text-xl font-bold text-red-400">
            {safePerformance.mistakeCount}
          </div>
          <div className="text-xs text-slate-400">Mistakes</div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-white mb-2">Achievements</h4>
        <div className="flex flex-wrap gap-1">
          {safePerformance.achievements.map((achievement, index) => (
            <div
              key={index}
              className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs text-yellow-300"
            >
              {achievement}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error boundary component for LearningPanel
class LearningPanelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-800/50 border border-red-500/50 rounded-lg">
          <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-sm text-slate-400 text-center mb-4">
            The learning panel encountered an error and couldn't be displayed.
          </p>
          <p className="text-xs text-red-400 bg-red-400/10 p-2 rounded mb-4 max-w-full overflow-auto">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main LearningPanel component wrapped in error boundary
function LearningPanelContent() {
  const { 
    state, 
    startMission
  } = useModernMaritime();

  // Error and loading states
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMission, setIsLoadingMission] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const availableMissions = state.missions || [];
  
  // Enhanced methods with error handling and loading states
  const handleStartMission = (missionId: string) => {
    try {
      setIsLoadingMission(true);
      startMission(missionId);
      setIsLoadingMission(false);
    } catch (err) {
      setError(`Failed to start mission: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoadingMission(false);
    }
  };

  const activateStep = (stepId: string) => {
    try {
      setLoadingStep(stepId);
      // Original placeholder functionality
      console.log('Activate step:', stepId);
      // Simulate async operation
      setTimeout(() => setLoadingStep(null), 500);
    } catch (err) {
      setError(`Failed to activate step: ${err instanceof Error ? err.message : String(err)}`);
      setLoadingStep(null);
    }
  };

  const pauseTraining = () => {
    try {
      console.log('Pause training');
    } catch (err) {
      setError(`Failed to pause training: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const resumeTraining = () => {
    try {
      console.log('Resume training');
    } catch (err) {
      setError(`Failed to resume training: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const resetMission = () => {
    try {
      setIsResetting(true);
      console.log('Reset mission');
      // Simulate async operation
      setTimeout(() => setIsResetting(false), 1000);
    } catch (err) {
      setError(`Failed to reset mission: ${err instanceof Error ? err.message : String(err)}`);
      setIsResetting(false);
    }
  };
  
  // Function to dismiss error messages
  const dismissError = () => setError(null);

  return (  
    <div className="h-full flex flex-col">
      {/* Learning Panel Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Interactive Training</h2>
            <p className="text-sm text-slate-400">
              Step-by-step guided missions
            </p>
          </div>
          <Target className="h-5 w-5 text-green-400" />
        </div>
        
        {/* Error Messages */}
        <AnimatePresence>
          {error && <ErrorMessage message={error} onDismiss={dismissError} />}
        </AnimatePresence>
        
        {/* Loading States */}
        <AnimatePresence>
          {isLoadingMission && <LoadingIndicator message="Loading mission..." />}
          {isResetting && <LoadingIndicator message="Resetting mission..." />}
        </AnimatePresence>

        {/* Training Controls */}
        {state.activeMission && (
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={pauseTraining}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
            >
              <Pause className="h-3 w-3" />
              <span>Pause</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetMission}
              className="flex items-center space-x-1 px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {!state.activeMission ? (
          /* Mission Selection */
          <div className="p-4 space-y-4">
            <h3 className="text-md font-semibold text-white">Available Missions</h3>
            <div className="space-y-3">
              {availableMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  isActive={false}
                  isCompleted={false}
                  onClick={() => handleStartMission(mission.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Active Mission Steps */
          <div className="space-y-4">
            {/* Mission Progress Header */}
            <div className="p-4 bg-slate-800/50 border-b border-slate-700/50">
              <h3 className="font-semibold text-white mb-1">
                {state.activeMission.title}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {state.activeMission.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Step {state.learningProgress.currentStepIndex + 1} of {state.activeMission.steps.length}
                </span>
                <span className="text-blue-400">
                  {Math.round((state.learningProgress.currentStepIndex / state.activeMission.steps.length) * 100)}%
                </span>
              </div>
              
              <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(state.learningProgress.currentStepIndex / state.activeMission.steps.length) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Mission Steps */}
            <div className="p-4 space-y-3">
              {state.activeMission.steps.map((step, index) => (
                <MissionStepCard
                  key={step.id}
                  step={step}
                  isActive={index === state.learningProgress.currentStepIndex}
                  isCompleted={index < state.learningProgress.currentStepIndex}
                  isUnlocked={index <= state.learningProgress.currentStepIndex}
                  isLoading={loadingStep === step.id}
                  onActivate={() => activateStep(step.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="p-4 border-t border-slate-700/50">
        <PerformanceMetrics />
      </div>
    </div>
  );
}

// Export the LearningPanel component wrapped in an error boundary
export function LearningPanel() {
  return (
    <LearningPanelErrorBoundary>
      <LearningPanelContent />
    </LearningPanelErrorBoundary>
  );
}
