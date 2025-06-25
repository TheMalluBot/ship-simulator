// Accelerated Realism Framework - Superior Maritime Training System
export type TimeScale = 'INSTANT' | 'FAST' | 'TRAINING' | 'DEMO' | 'REAL_TIME';
export type DifficultyMode = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'REALISTIC';

export interface AcceleratedSystemState {
  id: string;
  name: string;
  state: 'OFF' | 'STARTING' | 'RUNNING' | 'FAILED';
  progress: number;
  temperature?: number;
  pressure?: number;
  rpm?: number;
  voltage?: number;
  frequency?: number;
  ready: boolean;
  dependencies: string[];
  startTime?: number;
  estimatedCompletion?: number;
}

export interface ProcedurePhase {
  id: string;
  name: string;
  duration: number; // base duration in seconds
  steps: ProcedureStep[];
  prerequisites: string[];
  description: string;
}

export interface ProcedureStep {
  id: string;
  name: string;
  phaseId: string;
  duration: number; // base duration in seconds
  dependencies: string[];
  description: string;
  instructions: string[];
  critical: boolean;
  audioFeedback?: string;
  visualEffects?: string[];
}

export class AcceleratedSimulation {
  private timeScales: Record<TimeScale, number> = {
    'INSTANT': 0,           // Skip waiting - immediate response (for demos)
    'FAST': 10,             // 10x speed (54 min → 5.4 min)
    'TRAINING': 20,         // 20x speed (54 min → 2.7 min) - DEFAULT
    'DEMO': 50,             // 50x speed (54 min → 1 min)
    'REAL_TIME': 1          // Full realism for advanced users
  };

  private difficultyModes: Record<DifficultyMode, any> = {
    BEGINNER: {
      name: '🟢 Beginner',
      defaultTimeScale: 'DEMO' as TimeScale,
      showHints: true,
      allowSkips: true,
      autoProgression: true,
      mistakeTolerance: 5,
      tutorialEnabled: true,
      targetTime: 60, // 1 minute
      description: 'Perfect for first-time users. Guided tutorial with hints.'
    },
    
    INTERMEDIATE: {
      name: '🟡 Intermediate', 
      defaultTimeScale: 'TRAINING' as TimeScale,
      showHints: true,
      allowSkips: false,
      autoProgression: false,
      mistakeTolerance: 3,
      tutorialEnabled: false,
      targetTime: 180, // 3 minutes
      description: 'Standard training mode with some assistance.'
    },
    
    EXPERT: {
      name: '🟠 Expert',
      defaultTimeScale: 'FAST' as TimeScale,
      showHints: false,
      allowSkips: false,
      mistakeTolerance: 2,
      includeFailures: true,
      tutorialEnabled: false,
      targetTime: 360, // 6 minutes
      description: 'Advanced training with system failures and no hints.'
    },
    
    REALISTIC: {
      name: '🔴 Realistic',
      defaultTimeScale: 'REAL_TIME' as TimeScale,
      showHints: false,
      allowSkips: false,
      mistakeTolerance: 1,
      includeFailures: true,
      requireProcedures: true,
      tutorialEnabled: false,
      targetTime: 3240, // 54 minutes
      description: 'Full realism matching actual ship operations.'
    }
  };

  private currentTimeScale: TimeScale = 'TRAINING';
  private currentDifficulty: DifficultyMode = 'INTERMEDIATE';
  private systems: Map<string, AcceleratedSystemState> = new Map();
  private phases: ProcedurePhase[] = [];
  private currentPhaseIndex: number = 0;
  private completedSteps: Set<string> = new Set();
  private availableSteps: Set<string> = new Set();
  private listeners: ((state: any) => void)[] = [];

  constructor() {
    this.initializeSystems();
    this.initializeProcedurePhases();
  }

  private initializeSystems() {
    const systemConfigs = [
      {
        id: 'emergency-power',
        name: 'Emergency Generator',
        dependencies: [],
        baseValues: { voltage: 440, frequency: 60 }
      },
      {
        id: 'diesel-gen-1',
        name: 'Diesel Generator #1',
        dependencies: ['emergency-power'],
        baseValues: { rpm: 1800, voltage: 6600, frequency: 60 }
      },
      {
        id: 'diesel-gen-2',
        name: 'Diesel Generator #2',
        dependencies: ['emergency-power', 'diesel-gen-1'],
        baseValues: { rpm: 1800, voltage: 6600, frequency: 60 }
      },
      {
        id: 'steam-boiler',
        name: 'Steam Boiler System',
        dependencies: ['emergency-power', 'diesel-gen-1'],
        baseValues: { pressure: 7, temperature: 180 }
      },
      {
        id: 'cooling-system',
        name: 'Sea Water Cooling',
        dependencies: ['emergency-power'],
        baseValues: { pressure: 3, temperature: 18 }
      },
      {
        id: 'lubrication-system',
        name: 'Lubrication System',
        dependencies: ['emergency-power', 'steam-boiler'],
        baseValues: { pressure: 4.5, temperature: 45 }
      },
      {
        id: 'air-system',
        name: 'Compressed Air',
        dependencies: ['emergency-power', 'diesel-gen-1'],
        baseValues: { pressure: 25 }
      },
      {
        id: 'fuel-system',
        name: 'Fuel Oil System',
        dependencies: ['emergency-power', 'steam-boiler'],
        baseValues: { pressure: 12, temperature: 98 }
      },
      {
        id: 'main-engine',
        name: 'Main Engine',
        dependencies: ['diesel-gen-1', 'diesel-gen-2', 'steam-boiler', 'cooling-system', 'lubrication-system', 'air-system', 'fuel-system'],
        baseValues: { rpm: 0, temperature: 22 }
      }
    ];

    systemConfigs.forEach(config => {
      this.systems.set(config.id, {
        id: config.id,
        name: config.name,
        state: 'OFF',
        progress: 0,
        ready: false,
        dependencies: config.dependencies,
        ...config.baseValues
      });
    });
  }

  private initializeProcedurePhases() {
    this.phases = [
      {
        id: 'phase-1',
        name: 'Emergency Power Systems',
        duration: 60, // 1 minute
        prerequisites: [],
        description: 'Initialize emergency power and safety systems',
        steps: [
          {
            id: 'emergency-gen-start',
            name: 'Start Emergency Generator',
            phaseId: 'phase-1',
            duration: 30,
            dependencies: [],
            description: 'Manual start emergency generator for critical power',
            instructions: [
              'Check fuel level and oil pressure',
              'Engage manual start handle',
              'Monitor voltage and frequency stabilization'
            ],
            critical: true,
            audioFeedback: 'generator-start',
            visualEffects: ['power-indicator-green']
          },
          {
            id: 'emergency-systems-check',
            name: 'Emergency Systems Check',
            phaseId: 'phase-1',
            duration: 30,
            dependencies: ['emergency-gen-start'],
            description: 'Verify all emergency systems operational',
            instructions: [
              'Check emergency lighting',
              'Test communication systems',
              'Verify fire suppression ready'
            ],
            critical: true,
            audioFeedback: 'systems-check'
          }
        ]
      },
      {
        id: 'phase-2',
        name: 'Main Power Generation',
        duration: 120, // 2 minutes
        prerequisites: ['emergency-gen-start'],
        description: 'Start and synchronize main diesel generators',
        steps: [
          {
            id: 'dg1-prep',
            name: 'DG#1 Preparation',
            phaseId: 'phase-2',
            duration: 60,
            dependencies: ['emergency-gen-start'],
            description: 'Prepare Diesel Generator #1 for startup',
            instructions: [
              'Start cooling water circulation',
              'Begin oil heating sequence',
              'Check fuel system pressure'
            ],
            critical: true,
            audioFeedback: 'oil-heating'
          },
          {
            id: 'dg1-start',
            name: 'Start DG#1',
            phaseId: 'phase-2',
            duration: 30,
            dependencies: ['dg1-prep'],
            description: 'Start and stabilize Diesel Generator #1',
            instructions: [
              'Engage starting sequence',
              'Monitor RPM stabilization',
              'Check voltage and frequency'
            ],
            critical: true,
            audioFeedback: 'diesel-engine-start'
          },
          {
            id: 'dg2-start',
            name: 'Start & Sync DG#2',
            phaseId: 'phase-2',
            duration: 30,
            dependencies: ['dg1-start'],
            description: 'Start DG#2 and synchronize with DG#1',
            instructions: [
              'Start Diesel Generator #2',
              'Match frequency and phase',
              'Close synchronizing breaker'
            ],
            critical: true,
            audioFeedback: 'synchronization'
          }
        ]
      },
      {
        id: 'phase-3',
        name: 'Support Systems',
        duration: 180, // 3 minutes
        prerequisites: ['dg1-start'],
        description: 'Initialize all support systems required for main engine',
        steps: [
          {
            id: 'cooling-system-start',
            name: 'Sea Water Cooling',
            phaseId: 'phase-3',
            duration: 45,
            dependencies: ['dg1-start'],
            description: 'Start sea water cooling circulation',
            instructions: [
              'Open sea suction valves',
              'Start cooling water pumps',
              'Check circulation flow'
            ],
            critical: true,
            audioFeedback: 'pump-start'
          },
          {
            id: 'steam-boiler-start',
            name: 'Steam System',
            phaseId: 'phase-3',
            duration: 45,
            dependencies: ['dg1-start'],
            description: 'Start steam boiler and build pressure',
            instructions: [
              'Light boiler burners',
              'Build steam pressure to 7 bar',
              'Check safety valves'
            ],
            critical: true,
            audioFeedback: 'boiler-ignition'
          },
          {
            id: 'air-system-start',
            name: 'Compressed Air',
            phaseId: 'phase-3',
            duration: 45,
            dependencies: ['dg1-start'],
            description: 'Start air compressors and build pressure',
            instructions: [
              'Start main air compressor',
              'Build pressure to 25 bar',
              'Test starting air system'
            ],
            critical: true,
            audioFeedback: 'compressor-start'
          },
          {
            id: 'fuel-system-start',
            name: 'Fuel Oil System',
            phaseId: 'phase-3',
            duration: 45,
            dependencies: ['steam-boiler-start'],
            description: 'Start fuel heating and circulation',
            instructions: [
              'Start fuel circulation pumps',
              'Heat fuel oil to 98°C',
              'Check fuel pressure'
            ],
            critical: true,
            audioFeedback: 'fuel-heating'
          }
        ]
      },
      {
        id: 'phase-4',
        name: 'Main Engine Preparation',
        duration: 180, // 3 minutes
        prerequisites: ['steam-boiler-start'],
        description: 'Prepare main engine systems for startup',
        steps: [
          {
            id: 'lubrication-start',
            name: 'Lubrication System',
            phaseId: 'phase-4',
            duration: 60,
            dependencies: ['steam-boiler-start'],
            description: 'Start lubrication oil system',
            instructions: [
              'Start lube oil pumps',
              'Heat oil to 45°C',
              'Build pressure to 4.5 bar'
            ],
            critical: true,
            audioFeedback: 'lube-pump'
          },
          {
            id: 'turning-gear',
            name: 'Turning Gear Operation',
            phaseId: 'phase-4',
            duration: 30,
            dependencies: ['lubrication-start'],
            description: 'Engage turning gear and rotate engine',
            instructions: [
              'Engage turning gear motor',
              'Complete 5 full rotations',
              'Listen for unusual sounds'
            ],
            critical: true,
            audioFeedback: 'turning-gear'
          },
          {
            id: 'engine-cooling',
            name: 'Engine Cooling',
            phaseId: 'phase-4',
            duration: 45,
            dependencies: ['cooling-system-start'],
            description: 'Start engine cooling circulation',
            instructions: [
              'Start engine cooling pumps',
              'Open cooling valves',
              'Check circulation flow'
            ],
            critical: true,
            audioFeedback: 'cooling-circulation'
          },
          {
            id: 'starting-air-prep',
            name: 'Starting Air System',
            phaseId: 'phase-4',
            duration: 45,
            dependencies: ['air-system-start'],
            description: 'Prepare starting air for main engine',
            instructions: [
              'Check starting air pressure',
              'Test air starting valves',
              'Verify safety interlocks'
            ],
            critical: true,
            audioFeedback: 'air-test'
          }
        ]
      },
      {
        id: 'phase-5',
        name: 'Main Engine Start',
        duration: 60, // 1 minute
        prerequisites: ['lubrication-start', 'turning-gear', 'engine-cooling', 'starting-air-prep'],
        description: 'Final checks and main engine startup',
        steps: [
          {
            id: 'final-safety-checks',
            name: 'Final Safety Checks',
            phaseId: 'phase-5',
            duration: 15,
            dependencies: ['lubrication-start', 'turning-gear', 'engine-cooling', 'starting-air-prep'],
            description: 'Perform final safety verification',
            instructions: [
              'Verify all systems ready',
              'Check safety interlocks',
              'Confirm bridge authorization'
            ],
            critical: true,
            audioFeedback: 'safety-check'
          },
          {
            id: 'main-engine-first-fire',
            name: 'Main Engine First Fire',
            phaseId: 'phase-5',
            duration: 20,
            dependencies: ['final-safety-checks'],
            description: 'Initial engine firing and startup',
            instructions: [
              'Disengage turning gear',
              'Give starting air kick',
              'Monitor initial firing'
            ],
            critical: true,
            audioFeedback: 'main-engine-start'
          },
          {
            id: 'engine-stabilization',
            name: 'Engine Stabilization',
            phaseId: 'phase-5',
            duration: 15,
            dependencies: ['main-engine-first-fire'],
            description: 'Stabilize RPM and transfer control',
            instructions: [
              'Stabilize at 60 RPM',
              'Check all parameters',
              'Transfer control to bridge'
            ],
            critical: true,
            audioFeedback: 'engine-stable'
          },
          {
            id: 'bridge-control-transfer',
            name: 'Bridge Control Transfer',
            phaseId: 'phase-5',
            duration: 10,
            dependencies: ['engine-stabilization'],
            description: 'Transfer engine control to bridge',
            instructions: [
              'Confirm bridge ready',
              'Transfer telegraph control',
              'Main engine ready for service'
            ],
            critical: true,
            audioFeedback: 'control-transfer'
          }
        ]
      }
    ];

    // Initialize available steps
    this.updateAvailableSteps();
  }

  // Public methods for time scale management
  public setTimeScale(scale: TimeScale): void {
    this.currentTimeScale = scale;
    this.notifyListeners();
  }

  public getTimeScale(): TimeScale {
    return this.currentTimeScale;
  }

  public getTimeMultiplier(): number {
    return this.timeScales[this.currentTimeScale];
  }

  public setDifficulty(difficulty: DifficultyMode): void {
    this.currentDifficulty = difficulty;
    const config = this.difficultyModes[difficulty];
    this.setTimeScale(config.defaultTimeScale);
    this.notifyListeners();
  }

  public getDifficulty(): DifficultyMode {
    return this.currentDifficulty;
  }

  public getDifficultyConfig() {
    return this.difficultyModes[this.currentDifficulty];
  }

  // System management methods
  public canStartSystem(systemId: string): boolean {
    const system = this.systems.get(systemId);
    if (!system) return false;

    return system.dependencies.every(depId => {
      const dep = this.systems.get(depId);
      return dep && dep.ready;
    });
  }

  public async startSystem(systemId: string): Promise<boolean> {
    if (!this.canStartSystem(systemId)) {
      return false;
    }

    const system = this.systems.get(systemId);
    if (!system) return false;

    system.state = 'STARTING';
    system.startTime = Date.now();
    this.notifyListeners();

    // Simulate system startup with accelerated time
    const timeMultiplier = this.getTimeMultiplier();
    if (timeMultiplier === 0) {
      // INSTANT mode
      system.progress = 100;
      system.state = 'RUNNING';
      system.ready = true;
      this.notifyListeners();
      return true;
    }

    // Progressive startup simulation
    const baseDuration = this.getSystemStartupDuration(systemId);
    const acceleratedDuration = baseDuration / timeMultiplier;
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!system.startTime) {
          clearInterval(interval);
          resolve(false);
          return;
        }

        const elapsed = Date.now() - system.startTime;
        const progress = Math.min(100, (elapsed / acceleratedDuration) * 100);
        
        system.progress = progress;
        system.estimatedCompletion = system.startTime + acceleratedDuration;
        
        // Update system parameters based on progress
        this.updateSystemParameters(systemId, progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          system.state = 'RUNNING';
          system.ready = true;
          system.progress = 100;
          this.updateAvailableSteps();
          this.notifyListeners();
          resolve(true);
        } else {
          this.notifyListeners();
        }
      }, 100); // Update every 100ms for smooth progress
    });
  }

  private getSystemStartupDuration(systemId: string): number {
    // Base startup durations in milliseconds
    const durations: Record<string, number> = {
      'emergency-power': 30000,    // 30 seconds
      'diesel-gen-1': 60000,       // 1 minute
      'diesel-gen-2': 30000,       // 30 seconds
      'steam-boiler': 45000,       // 45 seconds
      'cooling-system': 45000,     // 45 seconds
      'lubrication-system': 60000, // 1 minute
      'air-system': 45000,         // 45 seconds
      'fuel-system': 45000,        // 45 seconds
      'main-engine': 60000         // 1 minute
    };

    return durations[systemId] || 30000;
  }

  private updateSystemParameters(systemId: string, progress: number) {
    const system = this.systems.get(systemId);
    if (!system) return;

    const progressRatio = progress / 100;

    switch (systemId) {
      case 'emergency-power':
        system.voltage = progressRatio * 440;
        system.frequency = progressRatio * 60;
        break;
      case 'diesel-gen-1':
      case 'diesel-gen-2':
        system.rpm = progressRatio * 1800;
        system.voltage = progressRatio * 6600;
        system.frequency = progressRatio * 60;
        system.temperature = 22 + (progressRatio * 58); // Heat up to 80°C
        break;
      case 'steam-boiler':
        system.pressure = progressRatio * 7;
        system.temperature = 20 + (progressRatio * 160); // Heat up to 180°C
        break;
      case 'cooling-system':
        system.pressure = progressRatio * 3;
        break;
      case 'lubrication-system':
        system.pressure = progressRatio * 4.5;
        system.temperature = 22 + (progressRatio * 23); // Heat up to 45°C
        break;
      case 'air-system':
        system.pressure = progressRatio * 25;
        break;
      case 'fuel-system':
        system.pressure = progressRatio * 12;
        system.temperature = 22 + (progressRatio * 76); // Heat up to 98°C
        break;
      case 'main-engine':
        system.rpm = progressRatio * 60; // Start at 60 RPM
        system.temperature = 22 + (progressRatio * 58); // Heat up
        break;
    }
  }

  // Step management methods
  public async executeStep(stepId: string): Promise<boolean> {
    if (!this.availableSteps.has(stepId)) {
      return false;
    }

    const step = this.findStep(stepId);
    if (!step) return false;

    // Find associated system and start it
    const systemId = this.getSystemIdForStep(stepId);
    if (systemId) {
      const success = await this.startSystem(systemId);
      if (success) {
        this.completedSteps.add(stepId);
        this.availableSteps.delete(stepId);
        this.updateAvailableSteps();
        this.notifyListeners();
        return true;
      }
    }

    return false;
  }

  private findStep(stepId: string): ProcedureStep | null {
    for (const phase of this.phases) {
      const step = phase.steps.find(s => s.id === stepId);
      if (step) return step;
    }
    return null;
  }

  private getSystemIdForStep(stepId: string): string | null {
    const stepToSystemMap: Record<string, string> = {
      'emergency-gen-start': 'emergency-power',
      'dg1-prep': 'diesel-gen-1',
      'dg1-start': 'diesel-gen-1',
      'dg2-start': 'diesel-gen-2',
      'cooling-system-start': 'cooling-system',
      'steam-boiler-start': 'steam-boiler',
      'air-system-start': 'air-system',
      'fuel-system-start': 'fuel-system',
      'lubrication-start': 'lubrication-system',
      'main-engine-first-fire': 'main-engine'
    };

    return stepToSystemMap[stepId] || null;
  }

  private updateAvailableSteps() {
    this.availableSteps.clear();

    for (const phase of this.phases) {
      for (const step of phase.steps) {
        if (this.completedSteps.has(step.id)) continue;

        const dependenciesMet = step.dependencies.every(depId => 
          this.completedSteps.has(depId)
        );

        if (dependenciesMet) {
          this.availableSteps.add(step.id);
        }
      }
    }
  }

  // State access methods
  public getCurrentPhase(): ProcedurePhase | null {
    return this.phases[this.currentPhaseIndex] || null;
  }

  public getPhases(): ProcedurePhase[] {
    return this.phases;
  }

  public getCompletedSteps(): Set<string> {
    return new Set(this.completedSteps);
  }

  public getAvailableSteps(): Set<string> {
    return new Set(this.availableSteps);
  }

  public getSystemState(systemId: string): AcceleratedSystemState | null {
    return this.systems.get(systemId) || null;
  }

  public getAllSystems(): Map<string, AcceleratedSystemState> {
    return new Map(this.systems);
  }

  public getOverallProgress(): number {
    const totalSteps = this.phases.reduce((total, phase) => total + phase.steps.length, 0);
    return totalSteps > 0 ? (this.completedSteps.size / totalSteps) * 100 : 0;
  }

  public getEstimatedTimeRemaining(): number {
    const currentConfig = this.getDifficultyConfig();
    const totalTime = currentConfig.targetTime * 1000; // Convert to milliseconds
    const progress = this.getOverallProgress() / 100;
    return Math.max(0, totalTime * (1 - progress));
  }

  // Event system
  public subscribe(callback: (state: any) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    const state = {
      currentTimeScale: this.currentTimeScale,
      currentDifficulty: this.currentDifficulty,
      difficultyConfig: this.getDifficultyConfig(),
      timeMultiplier: this.getTimeMultiplier(),
      systems: Object.fromEntries(this.systems),
      phases: this.phases,
      currentPhase: this.getCurrentPhase(),
      completedSteps: Array.from(this.completedSteps),
      availableSteps: Array.from(this.availableSteps),
      overallProgress: this.getOverallProgress(),
      estimatedTimeRemaining: this.getEstimatedTimeRemaining()
    };

    this.listeners.forEach(callback => callback(state));
  }

  // Reset functionality
  public reset(): void {
    this.completedSteps.clear();
    this.availableSteps.clear();
    this.currentPhaseIndex = 0;
    
    // Reset all systems
    this.systems.forEach(system => {
      system.state = 'OFF';
      system.progress = 0;
      system.ready = false;
      system.startTime = undefined;
      system.estimatedCompletion = undefined;
      
      // Reset parameters to initial values
      if (system.id === 'emergency-power') {
        system.voltage = 0;
        system.frequency = 0;
      } else if (system.id.includes('diesel-gen')) {
        system.rpm = 0;
        system.voltage = 0;
        system.frequency = 0;
        system.temperature = 22;
      } else if (system.id === 'steam-boiler') {
        system.pressure = 0;
        system.temperature = 20;
      } else if (system.id.includes('system')) {
        if (system.pressure !== undefined) system.pressure = 0;
        if (system.temperature !== undefined) system.temperature = 22;
      }
    });

    this.updateAvailableSteps();
    this.notifyListeners();
  }
}
