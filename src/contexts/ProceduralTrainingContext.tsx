import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { RealisticEngineSystem, Mistake, PerformanceAssessment } from '../systems/RealisticEngineSystem';

// Enhanced context for procedural training
interface ProcedureStep {
  id: string;
  name: string;
  duration: number;
  prerequisites: string[];
  description: string;
  procedure: string;
  criticalParameters?: Record<string, any>;
  interactive: boolean;
  controls?: string[];
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
  mistakes: string[];
  realTimeProcess?: boolean;
  phase: string;
}

interface TrainingState {
  engineSystem: RealisticEngineSystem;
  procedureData: any;
  currentPhase: string;
  currentStep: string | null;
  availableSteps: string[];
  completedSteps: string[];
  mistakes: Mistake[];
  isStartupInProgress: boolean;
  startTime: number | null;
  elapsedTime: number;
  performance: PerformanceAssessment | null;
  systemStates: any;
  activeControls: Set<string>;
  realTimeProcesses: Map<string, any>;
}

type TrainingAction =
  | { type: 'LOAD_PROCEDURE_DATA'; payload: any }
  | { type: 'START_PROCEDURE' }
  | { type: 'EXECUTE_STEP'; payload: { stepId: string; stepData: any } }
  | { type: 'STEP_COMPLETED'; payload: string }
  | { type: 'STEP_FAILED'; payload: { stepId: string; error: string } }
  | { type: 'MISTAKE_LOGGED'; payload: Mistake }
  | { type: 'EMERGENCY_STOP' }
  | { type: 'UPDATE_SYSTEM_STATE'; payload: any }
  | { type: 'UPDATE_ELAPSED_TIME'; payload: number }
  | { type: 'ACTIVATE_CONTROL'; payload: string }
  | { type: 'DEACTIVATE_CONTROL'; payload: string }
  | { type: 'UPDATE_REAL_TIME_PROCESS'; payload: { processId: string; data: any } };

const initialState: TrainingState = {
  engineSystem: new RealisticEngineSystem(),
  procedureData: null,
  currentPhase: 'PHASE_1_EMERGENCY',
  currentStep: null,
  availableSteps: [],
  completedSteps: [],
  mistakes: [],
  isStartupInProgress: false,
  startTime: null,
  elapsedTime: 0,
  performance: null,
  systemStates: {},
  activeControls: new Set(),
  realTimeProcesses: new Map(),
};

function trainingReducer(state: TrainingState, action: TrainingAction): TrainingState {
  switch (action.type) {
    case 'LOAD_PROCEDURE_DATA':
      return {
        ...state,
        procedureData: action.payload,
        availableSteps: action.payload.coldShipStartupProcedure.phases[0].steps
          .filter((step: any) => step.prerequisites.length === 0)
          .map((step: any) => step.id),
      };

    case 'START_PROCEDURE':
      const success = state.engineSystem.startColdShipProcedure();
      if (success) {
        return {
          ...state,
          isStartupInProgress: true,
          startTime: Date.now(),
          mistakes: [],
          completedSteps: [],
          currentStep: null,
        };
      }
      return state;

    case 'EXECUTE_STEP':
      return {
        ...state,
        currentStep: action.payload.stepId,
      };

    case 'STEP_COMPLETED':
      const newCompletedSteps = [...state.completedSteps, action.payload];
      const newAvailableSteps = state.procedureData 
        ? getAvailableSteps(state.procedureData, newCompletedSteps)
        : state.availableSteps;
      
      return {
        ...state,
        completedSteps: newCompletedSteps,
        availableSteps: newAvailableSteps,
        currentStep: null,
      };

    case 'STEP_FAILED':
      return {
        ...state,
        currentStep: null,
      };

    case 'MISTAKE_LOGGED':
      return {
        ...state,
        mistakes: [...state.mistakes, action.payload],
      };

    case 'EMERGENCY_STOP':
      state.engineSystem.emergencyStop();
      return {
        ...state,
        isStartupInProgress: false,
        currentStep: null,
      };

    case 'UPDATE_SYSTEM_STATE':
      return {
        ...state,
        systemStates: action.payload,
        mistakes: action.payload.mistakes || state.mistakes,
        completedSteps: action.payload.completedSteps || state.completedSteps,
        currentStep: action.payload.currentStep || state.currentStep,
        currentPhase: action.payload.currentPhase || state.currentPhase,
        isStartupInProgress: action.payload.isStartupInProgress,
      };

    case 'UPDATE_ELAPSED_TIME':
      return {
        ...state,
        elapsedTime: action.payload,
      };

    case 'ACTIVATE_CONTROL':
      const newActiveControls = new Set(state.activeControls);
      newActiveControls.add(action.payload);
      return {
        ...state,
        activeControls: newActiveControls,
      };

    case 'DEACTIVATE_CONTROL':
      const updatedActiveControls = new Set(state.activeControls);
      updatedActiveControls.delete(action.payload);
      return {
        ...state,
        activeControls: updatedActiveControls,
      };

    default:
      return state;
  }
}

function getAvailableSteps(procedureData: any, completedSteps: string[]): string[] {
  const allSteps: any[] = [];
  procedureData.coldShipStartupProcedure.phases.forEach((phase: any) => {
    allSteps.push(...phase.steps);
  });

  return allSteps
    .filter((step: any) => {
      // Step not already completed
      if (completedSteps.includes(step.id)) return false;
      
      // All prerequisites completed
      return step.prerequisites.every((prereq: string) => completedSteps.includes(prereq));
    })
    .map((step: any) => step.id);
}

interface ProceduralTrainingContextValue {
  state: TrainingState;
  dispatch: React.Dispatch<TrainingAction>;
  
  // Actions
  startProcedure: () => void;
  executeStep: (stepId: string, stepData: any) => Promise<boolean>;
  emergencyStop: () => void;
  activateControl: (controlId: string) => void;
  deactivateControl: (controlId: string) => void;
  
  // Getters
  getStepData: (stepId: string) => any;
  getStepStatus: (stepId: string) => 'locked' | 'available' | 'in_progress' | 'completed' | 'failed';
  isControlActive: (controlId: string) => boolean;
  getPhaseProgress: (phaseId: string) => number;
  getCurrentPhaseData: () => any;
  getPerformanceAssessment: () => PerformanceAssessment | null;
  
  // Utilities
  formatTime: (seconds: number) => string;
  getTimeRemaining: () => number;
  getMistakeCount: () => number;
  getCriticalMistakeCount: () => number;
}

const ProceduralTrainingContext = createContext<ProceduralTrainingContextValue | undefined>(undefined);

interface ProceduralTrainingProviderProps {
  children: ReactNode;
}

export function ProceduralTrainingProvider({ children }: ProceduralTrainingProviderProps) {
  const [state, dispatch] = useReducer(trainingReducer, initialState);

  // Load procedure data on initialization
  useEffect(() => {
    fetch('/data/authentic-startup-procedure.json')
      .then(res => res.json())
      .then(data => {
        dispatch({ type: 'LOAD_PROCEDURE_DATA', payload: data });
      })
      .catch(console.error);
  }, []);

  // Subscribe to engine system updates
  useEffect(() => {
    const unsubscribe = state.engineSystem.subscribe((systemState) => {
      dispatch({ type: 'UPDATE_SYSTEM_STATE', payload: systemState });
    });

    return unsubscribe;
  }, [state.engineSystem]);

  // Update elapsed time
  useEffect(() => {
    if (state.isStartupInProgress && state.startTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - state.startTime!;
        dispatch({ type: 'UPDATE_ELAPSED_TIME', payload: elapsed });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.isStartupInProgress, state.startTime]);

  // Actions
  const startProcedure = () => {
    dispatch({ type: 'START_PROCEDURE' });
  };

  const executeStep = async (stepId: string, stepData: any): Promise<boolean> => {
    dispatch({ type: 'EXECUTE_STEP', payload: { stepId, stepData } });
    
    try {
      const success = await state.engineSystem.executeStep(stepId, stepData);
      
      if (success) {
        dispatch({ type: 'STEP_COMPLETED', payload: stepId });
      } else {
        dispatch({ type: 'STEP_FAILED', payload: { stepId, error: 'Step execution failed' } });
      }
      
      return success;
    } catch (error) {
      dispatch({ type: 'STEP_FAILED', payload: { stepId, error: error.message } });
      return false;
    }
  };

  const emergencyStop = () => {
    dispatch({ type: 'EMERGENCY_STOP' });
  };

  const activateControl = (controlId: string) => {
    dispatch({ type: 'ACTIVATE_CONTROL', payload: controlId });
  };

  const deactivateControl = (controlId: string) => {
    dispatch({ type: 'DEACTIVATE_CONTROL', payload: controlId });
  };

  // Getters
  const getStepData = (stepId: string): any => {
    if (!state.procedureData) return null;
    
    for (const phase of state.procedureData.coldShipStartupProcedure.phases) {
      const step = phase.steps.find((s: any) => s.id === stepId);
      if (step) {
        return { ...step, phase: phase.id };
      }
    }
    return null;
  };

  const getStepStatus = (stepId: string): 'locked' | 'available' | 'in_progress' | 'completed' | 'failed' => {
    if (state.completedSteps.includes(stepId)) return 'completed';
    if (state.currentStep === stepId) return 'in_progress';
    if (state.availableSteps.includes(stepId)) return 'available';
    return 'locked';
  };

  const isControlActive = (controlId: string): boolean => {
    return state.activeControls.has(controlId);
  };

  const getPhaseProgress = (phaseId: string): number => {
    if (!state.procedureData) return 0;
    
    const phase = state.procedureData.coldShipStartupProcedure.phases.find((p: any) => p.id === phaseId);
    if (!phase) return 0;
    
    const totalSteps = phase.steps.length;
    const completedStepsInPhase = phase.steps.filter((step: any) => 
      state.completedSteps.includes(step.id)
    ).length;
    
    return (completedStepsInPhase / totalSteps) * 100;
  };

  const getCurrentPhaseData = (): any => {
    if (!state.procedureData) return null;
    return state.procedureData.coldShipStartupProcedure.phases.find((p: any) => p.id === state.currentPhase);
  };

  const getPerformanceAssessment = (): PerformanceAssessment | null => {
    if (!state.startTime) return null;
    
    try {
      return state.engineSystem.calculatePerformance();
    } catch (error) {
      return null;
    }
  };

  // Utilities
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = (): number => {
    const targetTime = 54 * 60 * 1000; // 54 minutes in milliseconds
    return Math.max(0, targetTime - state.elapsedTime);
  };

  const getMistakeCount = (): number => {
    return state.mistakes.length;
  };

  const getCriticalMistakeCount = (): number => {
    return state.mistakes.filter(m => m.severity === 'critical').length;
  };

  const value: ProceduralTrainingContextValue = {
    state,
    dispatch,
    startProcedure,
    executeStep,
    emergencyStop,
    activateControl,
    deactivateControl,
    getStepData,
    getStepStatus,
    isControlActive,
    getPhaseProgress,
    getCurrentPhaseData,
    getPerformanceAssessment,
    formatTime,
    getTimeRemaining,
    getMistakeCount,
    getCriticalMistakeCount,
  };

  return (
    <ProceduralTrainingContext.Provider value={value}>
      {children}
    </ProceduralTrainingContext.Provider>
  );
}

export function useProceduralTraining() {
  const context = useContext(ProceduralTrainingContext);
  if (context === undefined) {
    throw new Error('useProceduralTraining must be used within a ProceduralTrainingProvider');
  }
  return context;
}

export type { TrainingState, ProcedureStep, Mistake, PerformanceAssessment };
