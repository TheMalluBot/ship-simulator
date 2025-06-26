// Modern Maritime Simulator Types

export interface MaritimeSystem {
  id: string;
  number: string;
  name: string;
  category: 'power' | 'propulsion' | 'fluid' | 'safety' | 'navigation' | 'auxiliary';
  status: 'running' | 'stopped' | 'starting' | 'error' | 'standby';
  priority: number;
  dependencies?: string[];
  icon: string;
  description: string;
}

export interface LearningMission {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  estimatedTime: number; // minutes
  prerequisites?: string[];
  steps: MissionStep[];
  achievements: string[];
  category: string;
}

export interface MissionStep {
  id: string;
  number: number;
  title: string;
  description: string;
  hint?: string;
  theory?: string;
  targetSystem?: string;
  targetAction?: string;
  validationFn?: () => boolean;
  timeLimit?: number;
  isCompleted: boolean;
  isActive: boolean;
}

export interface PerformanceMetrics {
  score: number;
  timeElapsed: number;
  mistakeCount: number;
  efficiency: number;
  safetyScore: number;
  achievements: string[];
  completedSteps: number;
  totalSteps: number;
}

export interface GeneratorData {
  id: string;
  name: string;
  type: 'shaft' | 'diesel' | 'turbo' | 'emergency';
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  power: number; // kW
  voltage: number; // V
  frequency: number; // Hz
  load: number; // %
  temperature: number; // °C
  hours: number;
  priority: number;
  isSelected: boolean;
  canStart: boolean;
  canStop: boolean;
}

export interface ModernGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  color?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  size?: 'small' | 'medium' | 'large';
}

export interface NavigationState {
  currentDepartment: 'engine-room' | 'bridge' | 'cargo';
  currentSystem?: string;
  breadcrumb: string[];
  activeMission?: string;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
}

export interface LearningProgress {
  currentMissionId?: string;
  currentStepIndex: number;
  showHints: boolean;
  showTheory: boolean;
  completedMissions: string[];
  achievements: string[];
  totalScore: number;
  timeSpent: number;
}

export interface ShipIdentity {
  name: string;
  type: string;
  imo: string;
  flag: string;
  status: 'at-sea' | 'in-port' | 'anchored' | 'emergency';
  currentOperation: string;
}
