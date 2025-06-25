import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
export interface EngineStep {
  step: number;
  title: string;
  description: string;
  duration: number;
  critical: boolean;
  checks: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timeRemaining?: number;
}

export interface EngineParameters {
  oilPressure: { min: number; max: number; unit: string; current: number };
  oilTemperature: { min: number; max: number; unit: string; current: number };
  coolantTemperature: { min: number; max: number; unit: string; current: number };
  fuelPressure: { min: number; max: number; unit: string; current: number };
  airPressure: { min: number; max: number; unit: string; current: number };
}

export interface NavigationData {
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
}

export interface RadarTarget {
  id: string;
  name: string;
  distance: number;
  bearing: number;
  course: number;
  speed: number;
  cpa: number;
  tcpa: number;
}

export interface AlarmState {
  generalAlarm: boolean;
  fireAlarm: boolean;
  engineAlarm: boolean;
  navigationAlarm: boolean;
  activeAlarms: string[];
}

export interface ShipState {
  engineRoom: {
    startupProcedure: EngineStep[];
    currentStep: number;
    isStartupInProgress: boolean;
    engineParameters: EngineParameters;
    systems: {
      mainEngine: { status: string; rpm: number };
      auxiliaryEngine: { status: string; load: number };
      fuelSystem: { mainTank: number; dayTank: number };
    };
  };
  bridge: {
    navigation: NavigationData;
    radar: {
      status: string;
      range: number;
      targets: RadarTarget[];
    };
    helm: {
      rudderAngle: number;
      steeringMode: string;
    };
    telegraph: {
      bridgeOrder: string;
      engineResponse: string;
    };
    alarms: AlarmState;
  };
  isConnected: boolean;
  lastUpdate: number;
}

// Actions
type ShipAction =
  | { type: 'LOAD_ENGINE_DATA'; payload: any }
  | { type: 'LOAD_BRIDGE_DATA'; payload: any }
  | { type: 'START_ENGINE_PROCEDURE' }
  | { type: 'COMPLETE_STEP'; payload: number }
  | { type: 'UPDATE_ENGINE_PARAMETERS'; payload: Partial<EngineParameters> }
  | { type: 'UPDATE_NAVIGATION'; payload: Partial<NavigationData> }
  | { type: 'UPDATE_HELM'; payload: { rudderAngle?: number; steeringMode?: string } }
  | { type: 'UPDATE_TELEGRAPH'; payload: { bridgeOrder?: string; engineResponse?: string } }
  | { type: 'TRIGGER_ALARM'; payload: { type: string; active: boolean } }
  | { type: 'SET_CONNECTION'; payload: boolean }
  | { type: 'TICK' };

// Initial state
const initialState: ShipState = {
  engineRoom: {
    startupProcedure: [],
    currentStep: 0,
    isStartupInProgress: false,
    engineParameters: {
      oilPressure: { min: 3.5, max: 5.0, unit: 'bar', current: 0 },
      oilTemperature: { min: 60, max: 85, unit: '°C', current: 20 },
      coolantTemperature: { min: 75, max: 95, unit: '°C', current: 20 },
      fuelPressure: { min: 8, max: 12, unit: 'bar', current: 0 },
      airPressure: { min: 25, max: 30, unit: 'bar', current: 0 },
    },
    systems: {
      mainEngine: { status: 'stopped', rpm: 0 },
      auxiliaryEngine: { status: 'stopped', load: 0 },
      fuelSystem: { mainTank: 1800, dayTank: 95 },
    },
  },
  bridge: {
    navigation: {
      latitude: 55.7558,
      longitude: 12.4784,
      course: 0,
      speed: 0,
    },
    radar: {
      status: 'standby',
      range: 12,
      targets: [],
    },
    helm: {
      rudderAngle: 0,
      steeringMode: 'hand',
    },
    telegraph: {
      bridgeOrder: 'stop',
      engineResponse: 'stop',
    },
    alarms: {
      generalAlarm: false,
      fireAlarm: false,
      engineAlarm: false,
      navigationAlarm: false,
      activeAlarms: [],
    },
  },
  isConnected: false,
  lastUpdate: Date.now(),
};

// Reducer
function shipReducer(state: ShipState, action: ShipAction): ShipState {
  switch (action.type) {
    case 'LOAD_ENGINE_DATA':
      return {
        ...state,
        engineRoom: {
          ...state.engineRoom,
          startupProcedure: action.payload.engineStartupProcedure || [],
        },
      };

    case 'LOAD_BRIDGE_DATA':
      return {
        ...state,
        bridge: {
          ...state.bridge,
          navigation: {
            ...state.bridge.navigation,
            ...action.payload.navigationSystems?.gps?.position,
          },
        },
      };

    case 'START_ENGINE_PROCEDURE':
      return {
        ...state,
        engineRoom: {
          ...state.engineRoom,
          isStartupInProgress: true,
          currentStep: 0,
        },
      };

    case 'COMPLETE_STEP':
      const updatedProcedure = state.engineRoom.startupProcedure.map((step, index) =>
        index === action.payload ? { ...step, status: 'completed' as const } : step
      );
      return {
        ...state,
        engineRoom: {
          ...state.engineRoom,
          startupProcedure: updatedProcedure,
          currentStep: Math.min(action.payload + 1, state.engineRoom.startupProcedure.length - 1),
        },
      };

    case 'UPDATE_ENGINE_PARAMETERS':
      return {
        ...state,
        engineRoom: {
          ...state.engineRoom,
          engineParameters: {
            ...state.engineRoom.engineParameters,
            ...action.payload,
          },
        },
      };

    case 'UPDATE_NAVIGATION':
      return {
        ...state,
        bridge: {
          ...state.bridge,
          navigation: {
            ...state.bridge.navigation,
            ...action.payload,
          },
        },
      };

    case 'UPDATE_HELM':
      return {
        ...state,
        bridge: {
          ...state.bridge,
          helm: {
            ...state.bridge.helm,
            ...action.payload,
          },
        },
      };

    case 'UPDATE_TELEGRAPH':
      return {
        ...state,
        bridge: {
          ...state.bridge,
          telegraph: {
            ...state.bridge.telegraph,
            ...action.payload,
          },
        },
      };

    case 'TRIGGER_ALARM':
      const updatedAlarms = {
        ...state.bridge.alarms,
        [action.payload.type]: action.payload.active,
        activeAlarms: action.payload.active
          ? [...state.bridge.alarms.activeAlarms, action.payload.type]
          : state.bridge.alarms.activeAlarms.filter(alarm => alarm !== action.payload.type),
      };
      return {
        ...state,
        bridge: {
          ...state.bridge,
          alarms: updatedAlarms,
        },
      };

    case 'SET_CONNECTION':
      return {
        ...state,
        isConnected: action.payload,
      };

    case 'TICK':
      return {
        ...state,
        lastUpdate: Date.now(),
      };

    default:
      return state;
  }
}

// Context
interface ShipSimulatorContextValue {
  state: ShipState;
  dispatch: React.Dispatch<ShipAction>;
  socket: Socket | null;
  playSound: (soundName: string) => void;
  startEngineStartup: () => void;
  completeCurrentStep: () => void;
  updateHelm: (angle: number) => void;
  sendTelegraphOrder: (order: string) => void;
  triggerAlarm: (type: string, active: boolean) => void;
}

const ShipSimulatorContext = createContext<ShipSimulatorContextValue | undefined>(undefined);

// Provider
interface ShipSimulatorProviderProps {
  children: ReactNode;
}

export function ShipSimulatorProvider({ children }: ShipSimulatorProviderProps) {
  const [state, dispatch] = useReducer(shipReducer, initialState);
  const [socket, setSocket] = React.useState<Socket | null>(null);

  // Initialize WebSocket connection (simulation)
  useEffect(() => {
    // In a real implementation, you would connect to an actual WebSocket server
    // For this demo, we'll simulate the connection
    dispatch({ type: 'SET_CONNECTION', payload: true });
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
      
      // Simulate engine parameter changes during startup
      if (state.engineRoom.isStartupInProgress) {
        const randomVariation = () => Math.random() * 0.1 - 0.05;
        dispatch({
          type: 'UPDATE_ENGINE_PARAMETERS',
          payload: {
            oilPressure: {
              ...state.engineRoom.engineParameters.oilPressure,
              current: Math.max(0, state.engineRoom.engineParameters.oilPressure.current + randomVariation()),
            },
            oilTemperature: {
              ...state.engineRoom.engineParameters.oilTemperature,
              current: Math.min(85, state.engineRoom.engineParameters.oilTemperature.current + 0.1),
            },
          },
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.engineRoom.isStartupInProgress]);

  // Load initial data
  useEffect(() => {
    Promise.all([
      fetch('/data/engine-startup-procedure.json').then(res => res.json()),
      fetch('/data/bridge-systems.json').then(res => res.json()),
    ]).then(([engineData, bridgeData]) => {
      dispatch({ type: 'LOAD_ENGINE_DATA', payload: engineData });
      dispatch({ type: 'LOAD_BRIDGE_DATA', payload: bridgeData });
    }).catch(console.error);
  }, []);

  // Helper functions
  const playSound = (soundName: string) => {
    // In a real implementation, you would use Howler.js to play sounds
    console.log(`Playing sound: ${soundName}`);
  };

  const startEngineStartup = () => {
    dispatch({ type: 'START_ENGINE_PROCEDURE' });
    playSound('engine-startup');
  };

  const completeCurrentStep = () => {
    if (state.engineRoom.currentStep < state.engineRoom.startupProcedure.length) {
      dispatch({ type: 'COMPLETE_STEP', payload: state.engineRoom.currentStep });
      playSound('step-complete');
    }
  };

  const updateHelm = (angle: number) => {
    dispatch({ type: 'UPDATE_HELM', payload: { rudderAngle: angle } });
    playSound('helm-move');
  };

  const sendTelegraphOrder = (order: string) => {
    dispatch({ type: 'UPDATE_TELEGRAPH', payload: { bridgeOrder: order } });
    // Simulate engine response after a delay
    setTimeout(() => {
      dispatch({ type: 'UPDATE_TELEGRAPH', payload: { engineResponse: order } });
    }, 1000);
    playSound('telegraph');
  };

  const triggerAlarm = (type: string, active: boolean) => {
    dispatch({ type: 'TRIGGER_ALARM', payload: { type, active } });
    if (active) {
      playSound('alarm');
    }
  };

  const value: ShipSimulatorContextValue = {
    state,
    dispatch,
    socket,
    playSound,
    startEngineStartup,
    completeCurrentStep,
    updateHelm,
    sendTelegraphOrder,
    triggerAlarm,
  };

  return (
    <ShipSimulatorContext.Provider value={value}>
      {children}
    </ShipSimulatorContext.Provider>
  );
}

// Hook
export function useShipSimulator() {
  const context = useContext(ShipSimulatorContext);
  if (context === undefined) {
    throw new Error('useShipSimulator must be used within a ShipSimulatorProvider');
  }
  return context;
}
