import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { simulationEngine, GeneratorState } from '../simulation';
import { 
  MaritimeSystem, 
  LearningMission, 
  MissionStep, 
  PerformanceMetrics, 
  GeneratorData, 
  NavigationState, 
  LearningProgress,
  ShipIdentity 
} from '../types/maritime';

interface ModernMaritimeState {
  systems: MaritimeSystem[];
  generators: GeneratorData[];
  missions: LearningMission[];
  shipIdentity: ShipIdentity;
  navigation: NavigationState;
  learningProgress: LearningProgress;
  performance: PerformanceMetrics;
  isLoading: boolean;
  selectedSystem?: MaritimeSystem;
  activeMission?: LearningMission;
  currentStep?: MissionStep;
  showHints: boolean;
  showTheory: boolean;
  audioEnabled: boolean;
  mobileLayout: boolean;
}

type ModernMaritimeAction =
  | { type: 'LOAD_DATA'; payload: { systems: MaritimeSystem[]; generators: GeneratorData[]; missions: LearningMission[]; shipIdentity: ShipIdentity } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'NAVIGATE_TO_DEPARTMENT'; payload: 'engine-room' | 'bridge' | 'cargo' }
  | { type: 'SELECT_SYSTEM'; payload: MaritimeSystem }
  | { type: 'UPDATE_SYSTEM_STATUS'; payload: { systemId: string; status: MaritimeSystem['status'] } }
  | { type: 'START_MISSION'; payload: string }
  | { type: 'COMPLETE_STEP'; payload: { missionId: string; stepId: string } }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'TOGGLE_HINTS' }
  | { type: 'TOGGLE_THEORY' }
  | { type: 'TOGGLE_AUDIO' }
  | { type: 'TOGGLE_LEFT_PANEL' }
  | { type: 'TOGGLE_RIGHT_PANEL' }
  | { type: 'UPDATE_GENERATOR'; payload: { generatorId: string; updates: Partial<GeneratorData> } }
  | { type: 'RECORD_MISTAKE'; payload: { type: string; description: string } }
  | { type: 'SET_MOBILE_LAYOUT'; payload: boolean }
  | { type: 'UPDATE_BREADCRUMB'; payload: string[] };

const initialState: ModernMaritimeState = {
  systems: [],
  generators: [],
  missions: [],
  shipIdentity: {
    name: 'MV Maritime Explorer',
    type: 'Container Vessel',
    imo: 'IMO 9123456',
    flag: 'Liberia',
    status: 'in-port',
    currentOperation: 'Cold Ship Startup'
  },
  navigation: {
    currentDepartment: 'engine-room',
    breadcrumb: ['Ship', 'Engine Room'],
    leftPanelOpen: true,
    rightPanelOpen: true
  },
  learningProgress: {
    currentStepIndex: 0,
    showHints: true,
    showTheory: false,
    completedMissions: [],
    achievements: [],
    totalScore: 0,
    timeSpent: 0
  },
  performance: {
    score: 100,
    timeElapsed: 0,
    mistakeCount: 0,
    efficiency: 100,
    safetyScore: 100,
    achievements: [],
    completedSteps: 0,
    totalSteps: 0
  },
  isLoading: true,
  showHints: true,
  showTheory: false,
  audioEnabled: true,
  mobileLayout: false
};

function modernMaritimeReducer(state: ModernMaritimeState, action: ModernMaritimeAction): ModernMaritimeState {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        systems: action.payload.systems,
        generators: action.payload.generators,
        missions: action.payload.missions,
        shipIdentity: action.payload.shipIdentity,
        isLoading: false,
        performance: {
          ...state.performance,
          totalSteps: action.payload.missions[0]?.steps.length || 0
        }
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'NAVIGATE_TO_DEPARTMENT':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentDepartment: action.payload,
          breadcrumb: ['Ship', action.payload === 'engine-room' ? 'Engine Room' : 
                              action.payload === 'bridge' ? 'Bridge' : 'Cargo'],
          currentSystem: undefined
        },
        selectedSystem: undefined
      };

    case 'SELECT_SYSTEM':
      return {
        ...state,
        selectedSystem: action.payload,
        navigation: {
          ...state.navigation,
          currentSystem: action.payload.id,
          breadcrumb: [
            'Ship',
            state.navigation.currentDepartment === 'engine-room' ? 'Engine Room' : 
            state.navigation.currentDepartment === 'bridge' ? 'Bridge' : 'Cargo',
            action.payload.name
          ]
        }
      };

    case 'UPDATE_SYSTEM_STATUS':
      return {
        ...state,
        systems: state.systems.map(sys => 
          sys.id === action.payload.systemId 
            ? { ...sys, status: action.payload.status }
            : sys
        )
      };

    case 'START_MISSION':
      const mission = state.missions.find(m => m.id === action.payload);
      if (!mission) return state;

      // Reset all steps
      const resetMission = {
        ...mission,
        steps: mission.steps.map((step, index) => ({
          ...step,
          isCompleted: false,
          isActive: index === 0
        }))
      };

      return {
        ...state,
        activeMission: resetMission,
        currentStep: resetMission.steps[0],
        learningProgress: {
          ...state.learningProgress,
          currentMissionId: action.payload,
          currentStepIndex: 0
        },
        performance: {
          ...state.performance,
          score: 100,
          timeElapsed: 0,
          mistakeCount: 0,
          efficiency: 100,
          safetyScore: 100,
          completedSteps: 0,
          totalSteps: mission.steps.length
        }
      };

    case 'COMPLETE_STEP':
      if (!state.activeMission) return state;

      const updatedSteps = state.activeMission.steps.map(step => {
        if (step.id === action.payload.stepId) {
          return { ...step, isCompleted: true, isActive: false };
        }
        return step;
      });

      const currentIndex = state.learningProgress.currentStepIndex;
      const nextIndex = currentIndex + 1;
      const nextStep = updatedSteps[nextIndex];

      if (nextStep) {
        updatedSteps[nextIndex] = { ...nextStep, isActive: true };
      }

      const completedCount = updatedSteps.filter(s => s.isCompleted).length;

      return {
        ...state,
        activeMission: {
          ...state.activeMission,
          steps: updatedSteps
        },
        currentStep: nextStep,
        learningProgress: {
          ...state.learningProgress,
          currentStepIndex: nextStep ? nextIndex : currentIndex
        },
        performance: {
          ...state.performance,
          completedSteps: completedCount,
          score: Math.round((completedCount / state.performance.totalSteps) * 100)
        }
      };

    case 'NEXT_STEP':
      if (!state.activeMission) return state;
      
      const nextStepIndex = Math.min(
        state.learningProgress.currentStepIndex + 1,
        state.activeMission.steps.length - 1
      );

      return {
        ...state,
        learningProgress: {
          ...state.learningProgress,
          currentStepIndex: nextStepIndex
        },
        currentStep: state.activeMission.steps[nextStepIndex]
      };

    case 'PREVIOUS_STEP':
      if (!state.activeMission) return state;
      
      const prevStepIndex = Math.max(state.learningProgress.currentStepIndex - 1, 0);

      return {
        ...state,
        learningProgress: {
          ...state.learningProgress,
          currentStepIndex: prevStepIndex
        },
        currentStep: state.activeMission.steps[prevStepIndex]
      };

    case 'TOGGLE_HINTS':
      return {
        ...state,
        showHints: !state.showHints,
        learningProgress: {
          ...state.learningProgress,
          showHints: !state.showHints
        }
      };

    case 'TOGGLE_THEORY':
      return {
        ...state,
        showTheory: !state.showTheory,
        learningProgress: {
          ...state.learningProgress,
          showTheory: !state.showTheory
        }
      };

    case 'TOGGLE_AUDIO':
      return { ...state, audioEnabled: !state.audioEnabled };

    case 'TOGGLE_LEFT_PANEL':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          leftPanelOpen: !state.navigation.leftPanelOpen
        }
      };

    case 'TOGGLE_RIGHT_PANEL':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          rightPanelOpen: !state.navigation.rightPanelOpen
        }
      };
      
    case 'UPDATE_GENERATOR': {
      const { generatorId, updates } = action.payload;
      // Use the simulation engine to update the generator state
      if (generatorId !== 'performance-timer') {
        try {
          simulationEngine.updateGeneratorParameters(generatorId, updates as Partial<GeneratorState>);
          // Get the latest state from the simulation engine
          const latestState = simulationEngine.getGeneratorState(generatorId);
          if (latestState) {
            return {
              ...state,
              generators: state.generators.map(gen =>
                gen.id === generatorId ? { ...gen, ...latestState } : gen
              )
            };
          }
        } catch (error) {
          console.error(`Error updating generator ${generatorId}:`, error);
        }
      }
      
      // Fall back to the original behavior for performance-timer or if engine update failed
      return {
        ...state,
        generators: state.generators.map(gen =>
          gen.id === generatorId ? { ...gen, ...updates } : gen
        )
      };
    }
    
    case 'RECORD_MISTAKE': {
      const newMistakeCount = state.performance.mistakeCount + 1;
      const efficiencyPenalty = Math.min(20, newMistakeCount * 5);
      
      return {
        ...state,
        performance: {
          ...state.performance,
          mistakeCount: newMistakeCount,
          efficiency: Math.max(0, 100 - efficiencyPenalty),
          score: Math.max(0, state.performance.score - 10)
        }
      };
    }

    case 'SET_MOBILE_LAYOUT':
      return { 
        ...state, 
        mobileLayout: action.payload,
        navigation: {
          ...state.navigation,
          leftPanelOpen: !action.payload,
          rightPanelOpen: !action.payload
        }
      };

    case 'UPDATE_BREADCRUMB':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          breadcrumb: action.payload
        }
      };

    default:
      return state;
  }
}

interface ModernMaritimeContextType {
  state: ModernMaritimeState;
  navigateToDepartment: (department: 'engine-room' | 'bridge' | 'cargo') => void;
  selectSystem: (system: MaritimeSystem) => void;
  updateSystemStatus: (systemId: string, status: MaritimeSystem['status']) => void;
  startMission: (missionId: string) => void;
  completeStep: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  toggleHints: () => void;
  toggleTheory: () => void;
  toggleAudio: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  updateGenerator: (generatorId: string, updates: Partial<GeneratorData>) => void;
  recordMistake: (type: string, description: string) => void;
  setMobileLayout: (isMobile: boolean) => void;
  getSystemById: (id: string) => MaritimeSystem | undefined;
  getGeneratorById: (id: string) => GeneratorData | undefined;
  getMissionById: (id: string) => LearningMission | undefined;
  getSystemsByCategory: (category: MaritimeSystem['category']) => MaritimeSystem[];
  isSystemHighlighted: (systemId: string) => boolean;
  canStartSystem: (systemId: string) => boolean;
  formatTime: (seconds: number) => string;
}

const ModernMaritimeContext = createContext<ModernMaritimeContextType | undefined>(undefined);

export function ModernMaritimeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(modernMaritimeReducer, initialState);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const [systemsResponse, missionsResponse] = await Promise.all([
          fetch('/data/maritime-systems.json'),
          fetch('/data/learning-missions.json')
        ]);

        const systemsData = await systemsResponse.json();
        const missionsData = await missionsResponse.json();

        dispatch({
          type: 'LOAD_DATA',
          payload: {
            systems: systemsData.systems,
            generators: systemsData.generators,
            missions: missionsData.missions,
            shipIdentity: systemsData.shipIdentity
          }
        });
      } catch (error) {
        console.error('Failed to load maritime data:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  // Mobile layout detection
  useEffect(() => {
    const checkMobileLayout = () => {
      const isMobile = window.innerWidth < 768;
      dispatch({ type: 'SET_MOBILE_LAYOUT', payload: isMobile });
    };

    checkMobileLayout();
    window.addEventListener('resize', checkMobileLayout);
    return () => window.removeEventListener('resize', checkMobileLayout);
  }, []);

  // Performance timer
  useEffect(() => {
    if (!state.activeMission) return;

    const timer = setInterval(() => {
      dispatch({
        type: 'UPDATE_GENERATOR',
        payload: {
          generatorId: 'performance-timer',
          updates: {}
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.activeMission]);

  // Context methods
  const navigateToDepartment = useCallback((department: 'engine-room' | 'bridge' | 'cargo') => {
    dispatch({ type: 'NAVIGATE_TO_DEPARTMENT', payload: department });
  }, []);

  const selectSystem = useCallback((system: MaritimeSystem) => {
    dispatch({ type: 'SELECT_SYSTEM', payload: system });
  }, []);

  const updateSystemStatus = useCallback((systemId: string, status: MaritimeSystem['status']) => {
    dispatch({ type: 'UPDATE_SYSTEM_STATUS', payload: { systemId, status } });
  }, []);

  const startMission = useCallback((missionId: string) => {
    dispatch({ type: 'START_MISSION', payload: missionId });
  }, []);

  const completeStep = useCallback((stepId: string) => {
    if (!state.activeMission) return;
    dispatch({ 
      type: 'COMPLETE_STEP', 
      payload: { missionId: state.activeMission.id, stepId } 
    });
  }, [state.activeMission]);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const previousStep = useCallback(() => {
    dispatch({ type: 'PREVIOUS_STEP' });
  }, []);

  const toggleHints = useCallback(() => {
    dispatch({ type: 'TOGGLE_HINTS' });
  }, []);

  const toggleTheory = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEORY' });
  }, []);

  const toggleAudio = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUDIO' });
  }, []);

  const toggleLeftPanel = useCallback(() => {
    dispatch({ type: 'TOGGLE_LEFT_PANEL' });
  }, []);

  const toggleRightPanel = useCallback(() => {
    dispatch({ type: 'TOGGLE_RIGHT_PANEL' });
  }, []);

  const updateGenerator = useCallback((generatorId: string, updates: Partial<GeneratorData>) => {
    // For start/stop operations, use the simulation engine directly
    if ('status' in updates) {
      if (updates.status === 'running') {
        simulationEngine.startGenerator(generatorId)
          .then(() => {
            // Update the UI state after the engine finishes startup
            dispatch({ type: 'UPDATE_GENERATOR', payload: { generatorId, updates } });
          })
          .catch(error => {
            console.error(`Failed to start generator ${generatorId}:`, error);
          });
        return;
      } else if (updates.status === 'stopped') {
        simulationEngine.stopGenerator(generatorId)
          .then(() => {
            // Update the UI state after the engine finishes shutdown
            dispatch({ type: 'UPDATE_GENERATOR', payload: { generatorId, updates } });
          })
          .catch(error => {
            console.error(`Failed to stop generator ${generatorId}:`, error);
          });
        return;
      }
    }
    
    // For other parameter updates, dispatch normally
    dispatch({ type: 'UPDATE_GENERATOR', payload: { generatorId, updates } });
  }, []);

  const recordMistake = useCallback((type: string, description: string) => {
    dispatch({ type: 'RECORD_MISTAKE', payload: { type, description } });
  }, []);

  const setMobileLayout = useCallback((isMobile: boolean) => {
    dispatch({ type: 'SET_MOBILE_LAYOUT', payload: isMobile });
  }, []);

  // Utility functions
  const getSystemById = useCallback((id: string) => {
    return state.systems.find(sys => sys.id === id);
  }, [state.systems]);

  const getGeneratorById = useCallback((id: string) => {
    return state.generators.find(gen => gen.id === id);
  }, [state.generators]);

  const getMissionById = useCallback((id: string) => {
    return state.missions.find(mission => mission.id === id);
  }, [state.missions]);

  const getSystemsByCategory = useCallback((category: MaritimeSystem['category']) => {
    return state.systems.filter(sys => sys.category === category);
  }, [state.systems]);

  const isSystemHighlighted = useCallback((systemId: string) => {
    if (!state.currentStep) return false;
    return state.currentStep.targetSystem === systemId;
  }, [state.currentStep]);

  const canStartSystem = useCallback((systemId: string) => {
    const system = getSystemById(systemId);
    if (!system) return false;

    // Check dependencies
    if (system.dependencies) {
      return system.dependencies.every(depId => {
        const depSystem = getSystemById(depId);
        return depSystem?.status === 'running';
      });
    }

    return true;
  }, [getSystemById]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const value = {
    state,
    navigateToDepartment,
    selectSystem,
    updateSystemStatus,
    startMission,
    completeStep,
    nextStep,
    previousStep,
    toggleHints,
    toggleTheory,
    toggleAudio,
    toggleLeftPanel,
    toggleRightPanel,
    updateGenerator,
    recordMistake,
    setMobileLayout,
    getSystemById,
    getGeneratorById,
    getMissionById,
    getSystemsByCategory,
    isSystemHighlighted,
    canStartSystem,
    formatTime
  };

  return (
    <ModernMaritimeContext.Provider value={value}>
      {children}
    </ModernMaritimeContext.Provider>
  );
}

export function useModernMaritime() {
  const context = useContext(ModernMaritimeContext);
  if (context === undefined) {
    throw new Error('useModernMaritime must be used within a ModernMaritimeProvider');
  }
  return context;
}
