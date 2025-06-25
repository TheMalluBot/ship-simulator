import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AcceleratedSimulation, TimeScale, DifficultyMode, ProcedurePhase, ProcedureStep } from '../systems/AcceleratedSimulation';
import { MaritimeAudioSystem } from '../systems/MaritimeAudioSystem';
import { PerformanceAssessment } from '../systems/PerformanceAssessment';

// Enhanced training state for accelerated realism
interface AcceleratedTrainingState {
  simulation: AcceleratedSimulation;
  audioSystem: MaritimeAudioSystem;
  performanceAssessment: PerformanceAssessment;
  
  // Simulation state
  isTrainingActive: boolean;
  startTime: number | null;
  elapsedTime: number;
  currentTimeScale: TimeScale;
  currentDifficulty: DifficultyMode;
  
  // Procedure state
  phases: ProcedurePhase[];
  currentPhase: ProcedurePhase | null;
  completedSteps: string[];
  availableSteps: string[];
  currentStep: string | null;
  
  // System states
  systems: any;
  overallProgress: number;
  estimatedTimeRemaining: number;
  
  // Performance tracking
  mistakes: number;
  efficiency: number;
  safetyScore: number;
  timeScore: number;
  
  // UI state
  showTutorial: boolean;
  tutorialStep: number;
  showHints: boolean;
  highlightedElement: string | null;
}

type AcceleratedTrainingAction =
  | { type: 'START_TRAINING' }
  | { type: 'STOP_TRAINING' }
  | { type: 'RESET_TRAINING' }
  | { type: 'SET_TIME_SCALE'; payload: TimeScale }
  | { type: 'SET_DIFFICULTY'; payload: DifficultyMode }
  | { type: 'EXECUTE_STEP'; payload: string }
  | { type: 'STEP_COMPLETED'; payload: string }
  | { type: 'UPDATE_SIMULATION_STATE'; payload: any }
  | { type: 'UPDATE_ELAPSED_TIME'; payload: number }
  | { type: 'RECORD_MISTAKE'; payload: { action: string; expected: string; phase: string } }
  | { type: 'START_TUTORIAL' }
  | { type: 'NEXT_TUTORIAL_STEP' }
  | { type: 'END_TUTORIAL' }
  | { type: 'HIGHLIGHT_ELEMENT'; payload: string | null };

const initialState: AcceleratedTrainingState = {
  simulation: new AcceleratedSimulation(),
  audioSystem: new MaritimeAudioSystem(),
  performanceAssessment: new PerformanceAssessment(),
  
  isTrainingActive: false,
  startTime: null,
  elapsedTime: 0,
  currentTimeScale: 'TRAINING',
  currentDifficulty: 'INTERMEDIATE',
  
  phases: [],
  currentPhase: null,
  completedSteps: [],
  availableSteps: [],
  currentStep: null,
  
  systems: {},
  overallProgress: 0,
  estimatedTimeRemaining: 0,
  
  mistakes: 0,
  efficiency: 100,
  safetyScore: 100,
  timeScore: 100,
  
  showTutorial: false,
  tutorialStep: 0,
  showHints: true,
  highlightedElement: null,
};

function acceleratedTrainingReducer(state: AcceleratedTrainingState, action: AcceleratedTrainingAction): AcceleratedTrainingState {
  switch (action.type) {
    case 'START_TRAINING':
      state.simulation.reset();
      state.performanceAssessment.startAssessment();
      state.audioSystem.playSuccess();
      
      return {
        ...state,
        isTrainingActive: true,
        startTime: Date.now(),
        elapsedTime: 0,
        mistakes: 0,
        efficiency: 100,
        safetyScore: 100,
        timeScore: 100,
        phases: state.simulation.getPhases(),
        currentPhase: state.simulation.getCurrentPhase(),
        completedSteps: Array.from(state.simulation.getCompletedSteps()),
        availableSteps: Array.from(state.simulation.getAvailableSteps()),
        overallProgress: 0,
      };

    case 'STOP_TRAINING':
      state.audioSystem.stopAll();
      return {
        ...state,
        isTrainingActive: false,
        currentStep: null,
      };

    case 'RESET_TRAINING':
      state.simulation.reset();
      state.performanceAssessment.reset();
      state.audioSystem.stopAll();
      
      return {
        ...state,
        isTrainingActive: false,
        startTime: null,
        elapsedTime: 0,
        currentStep: null,
        mistakes: 0,
        efficiency: 100,
        safetyScore: 100,
        timeScore: 100,
        completedSteps: [],
        availableSteps: Array.from(state.simulation.getAvailableSteps()),
        overallProgress: 0,
        estimatedTimeRemaining: 0,
      };

    case 'SET_TIME_SCALE':
      state.simulation.setTimeScale(action.payload);
      return {
        ...state,
        currentTimeScale: action.payload,
      };

    case 'SET_DIFFICULTY':
      state.simulation.setDifficulty(action.payload);
      const difficultyConfig = state.simulation.getDifficultyConfig();
      
      return {
        ...state,
        currentDifficulty: action.payload,
        currentTimeScale: difficultyConfig.defaultTimeScale,
        showHints: difficultyConfig.showHints,
        showTutorial: difficultyConfig.tutorialEnabled,
      };

    case 'EXECUTE_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };

    case 'STEP_COMPLETED':
      state.audioSystem.playSuccess();
      state.performanceAssessment.recordStep(action.payload, state.currentPhase?.name || 'Unknown', Date.now() - (state.startTime || 0));
      
      return {
        ...state,
        currentStep: null,
        completedSteps: [...state.completedSteps, action.payload],
      };

    case 'UPDATE_SIMULATION_STATE':
      return {
        ...state,
        systems: action.payload.systems,
        phases: action.payload.phases,
        currentPhase: action.payload.currentPhase,
        completedSteps: action.payload.completedSteps,
        availableSteps: action.payload.availableSteps,
        overallProgress: action.payload.overallProgress,
        estimatedTimeRemaining: action.payload.estimatedTimeRemaining,
      };

    case 'UPDATE_ELAPSED_TIME':
      return {
        ...state,
        elapsedTime: action.payload,
      };

    case 'RECORD_MISTAKE':
      state.audioSystem.playError();
      state.performanceAssessment.recordMistake(action.payload.action, action.payload.expected, action.payload.phase);
      
      return {
        ...state,
        mistakes: state.mistakes + 1,
        efficiency: Math.max(0, state.efficiency - 10),
        safetyScore: Math.max(0, state.safetyScore - 5),
      };

    case 'START_TUTORIAL':
      return {
        ...state,
        showTutorial: true,
        tutorialStep: 0,
      };

    case 'NEXT_TUTORIAL_STEP':
      return {
        ...state,
        tutorialStep: state.tutorialStep + 1,
      };

    case 'END_TUTORIAL':
      return {
        ...state,
        showTutorial: false,
        tutorialStep: 0,
        highlightedElement: null,
      };

    case 'HIGHLIGHT_ELEMENT':
      return {
        ...state,
        highlightedElement: action.payload,
      };

    default:
      return state;
  }
}

// Context interface
interface AcceleratedTrainingContextValue {
  state: AcceleratedTrainingState;
  
  // Training control
  startTraining: () => void;
  stopTraining: () => void;
  resetTraining: () => void;
  
  // Configuration
  setTimeScale: (scale: TimeScale) => void;
  setDifficulty: (difficulty: DifficultyMode) => void;
  
  // Step execution
  executeStep: (stepId: string) => Promise<boolean>;
  canExecuteStep: (stepId: string) => boolean;
  getStepData: (stepId: string) => ProcedureStep | null;
  
  // System queries
  getSystemState: (systemId: string) => any;
  canStartSystem: (systemId: string) => boolean;
  
  // Tutorial system
  startTutorial: () => void;
  nextTutorialStep: () => void;
  endTutorial: () => void;
  highlightElement: (elementId: string | null) => void;
  
  // Performance
  getFinalAssessment: () => any;
  getCurrentPerformance: () => {
    mistakes: number;
    efficiency: number;
    safetyScore: number;
    timeScore: number;
  };
  
  // Utilities
  formatTime: (milliseconds: number) => string;
  getProgressPercentage: () => number;
  getEstimatedCompletion: () => string;
}

const AcceleratedTrainingContext = createContext<AcceleratedTrainingContextValue | undefined>(undefined);

interface AcceleratedTrainingProviderProps {
  children: ReactNode;
}

export function AcceleratedTrainingProvider({ children }: AcceleratedTrainingProviderProps) {
  const [state, dispatch] = useReducer(acceleratedTrainingReducer, initialState);

  // Subscribe to simulation updates
  useEffect(() => {
    const unsubscribe = state.simulation.subscribe((simulationState) => {
      dispatch({ type: 'UPDATE_SIMULATION_STATE', payload: simulationState });
    });

    return unsubscribe;
  }, [state.simulation]);

  // Update elapsed time
  useEffect(() => {
    if (state.isTrainingActive && state.startTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - state.startTime!;
        dispatch({ type: 'UPDATE_ELAPSED_TIME', payload: elapsed });
        
        // Update time score in performance assessment
        state.performanceAssessment.updateTimeScore(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.isTrainingActive, state.startTime]);

  // Training control functions
  const startTraining = () => {
    dispatch({ type: 'START_TRAINING' });
  };

  const stopTraining = () => {
    dispatch({ type: 'STOP_TRAINING' });
  };

  const resetTraining = () => {
    dispatch({ type: 'RESET_TRAINING' });
  };

  // Configuration functions
  const setTimeScale = (scale: TimeScale) => {
    dispatch({ type: 'SET_TIME_SCALE', payload: scale });
  };

  const setDifficulty = (difficulty: DifficultyMode) => {
    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
  };

  // Step execution functions
  const executeStep = async (stepId: string): Promise<boolean> => {
    if (!canExecuteStep(stepId)) {
      // Record mistake for trying to execute unavailable step
      const expectedSteps = Array.from(state.availableSteps);
      dispatch({ 
        type: 'RECORD_MISTAKE', 
        payload: { 
          action: stepId, 
          expected: expectedSteps.join(' or '), 
          phase: state.currentPhase?.name || 'Unknown' 
        } 
      });
      return false;
    }

    dispatch({ type: 'EXECUTE_STEP', payload: stepId });
    
    try {
      const success = await state.simulation.executeStep(stepId);
      
      if (success) {
        dispatch({ type: 'STEP_COMPLETED', payload: stepId });
        
        // Play step-specific audio feedback
        const stepData = getStepData(stepId);
        if (stepData && stepData.audioFeedback) {
          state.audioSystem.playSound(stepData.audioFeedback);
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Step execution failed:', error);
      return false;
    }
  };

  const canExecuteStep = (stepId: string): boolean => {
    return state.availableSteps.includes(stepId);
  };

  const getStepData = (stepId: string): ProcedureStep | null => {
    for (const phase of state.phases) {
      const step = phase.steps.find(s => s.id === stepId);
      if (step) return step;
    }
    return null;
  };

  // System query functions
  const getSystemState = (systemId: string) => {
    return state.simulation.getSystemState(systemId);
  };

  const canStartSystem = (systemId: string): boolean => {
    return state.simulation.canStartSystem(systemId);
  };

  // Tutorial functions
  const startTutorial = () => {
    dispatch({ type: 'START_TUTORIAL' });
  };

  const nextTutorialStep = () => {
    dispatch({ type: 'NEXT_TUTORIAL_STEP' });
  };

  const endTutorial = () => {
    dispatch({ type: 'END_TUTORIAL' });
  };

  const highlightElement = (elementId: string | null) => {
    dispatch({ type: 'HIGHLIGHT_ELEMENT', payload: elementId });
  };

  // Performance functions
  const getFinalAssessment = () => {
    return state.performanceAssessment.calculateFinalScore();
  };

  const getCurrentPerformance = () => {
    return {
      mistakes: state.mistakes,
      efficiency: state.efficiency,
      safetyScore: state.safetyScore,
      timeScore: state.timeScore,
    };
  };

  // Utility functions
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return state.overallProgress;
  };

  const getEstimatedCompletion = (): string => {
    if (state.estimatedTimeRemaining <= 0) return '00:00';
    return formatTime(state.estimatedTimeRemaining);
  };

  const contextValue: AcceleratedTrainingContextValue = {
    state,
    
    // Training control
    startTraining,
    stopTraining,
    resetTraining,
    
    // Configuration
    setTimeScale,
    setDifficulty,
    
    // Step execution
    executeStep,
    canExecuteStep,
    getStepData,
    
    // System queries
    getSystemState,
    canStartSystem,
    
    // Tutorial system
    startTutorial,
    nextTutorialStep,
    endTutorial,
    highlightElement,
    
    // Performance
    getFinalAssessment,
    getCurrentPerformance,
    
    // Utilities
    formatTime,
    getProgressPercentage,
    getEstimatedCompletion,
  };

  return (
    <AcceleratedTrainingContext.Provider value={contextValue}>
      {children}
    </AcceleratedTrainingContext.Provider>
  );
}

export function useAcceleratedTraining() {
  const context = useContext(AcceleratedTrainingContext);
  if (context === undefined) {
    throw new Error('useAcceleratedTraining must be used within an AcceleratedTrainingProvider');
  }
  return context;
}
