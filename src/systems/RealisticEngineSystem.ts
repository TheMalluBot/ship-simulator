// Realistic Maritime Engine System - Professional Procedural Trainer
export interface SystemParameter {
  current: number;
  target?: number;
  min?: number;
  max?: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
}

export interface ProcedureStep {
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
}

export interface Mistake {
  timestamp: number;
  stepId: string;
  type: 'sequence_violation' | 'parameter_out_of_range' | 'safety_interlock_bypass' | 'insufficient_warmup_time' | 'missing_prerequisite' | 'emergency_procedure_error';
  description: string;
  severity: 'minor' | 'major' | 'critical';
  phase: string;
}

export interface PerformanceAssessment {
  totalTime: number;
  mistakes: Mistake[];
  efficiency: number;
  safetyScore: number;
  proceduralCompliance: number;
  certification: 'master' | 'advanced' | 'competent' | 'basic' | 'failed';
  improvements: string[];
}

export class RealisticEngineSystem {
  private startTime: number | null = null;
  private currentPhase: string = 'PHASE_1_EMERGENCY';
  private currentStep: string | null = null;
  private mistakes: Mistake[] = [];
  private completedSteps: Set<string> = new Set();
  private stepStartTimes: Map<string, number> = new Map();
  private realTimeProcesses: Map<string, NodeJS.Timeout> = new Map();
  private audioSystem: AudioSystem | null = null;
  
  // System States
  public emergencyGenerator = {
    status: 'stopped',
    fuelLevel: 95,
    oilPressure: 0,
    rpm: 0,
    voltage: 0,
    frequency: 0,
    crankTurns: 0
  };

  public dieselGenerator1 = {
    status: 'stopped',
    coolingWaterFlow: false,
    oilTemp: 22,
    oilPressure: 0,
    fuelPressure: 0,
    rpm: 0,
    load: 0,
    voltage: 0,
    frequency: 0
  };

  public boilerSystem = {
    status: 'cold',
    waterLevel: 70,
    steamPressure: 0,
    fuelTemp: 22,
    combustionAirPressure: 0,
    purgeComplete: false,
    flameStatus: 'off',
    purgeTimeRemaining: 0
  };

  public mainEngine = {
    status: 'stopped',
    turningGearEngaged: false,
    oilTemp: 22,
    oilPressure: 0,
    fuelTemp: 22,
    coolingWaterFlow: false,
    scavengeAirPressure: 0,
    startingAirPressure: 0,
    rpm: 0,
    cylinderTemps: [22, 22, 22, 22, 22, 22],
    rotationCount: 0
  };

  public supportSystems = {
    seaWaterCooling: {
      status: 'stopped',
      flowRate: 0,
      pressure: 0
    },
    compressedAir: {
      mainPressure: 0,
      emergencyPressure: 0,
      comp1Status: 'stopped',
      comp2Status: 'stopped'
    },
    fuelPurification: {
      status: 'stopped',
      separatorRpm: 0,
      fuelTemp: 22,
      waterContent: 2.5
    }
  };

  private listeners: ((state: any) => void)[] = [];

  constructor() {
    this.initializeAudioSystem();
  }

  private initializeAudioSystem() {
    this.audioSystem = new AudioSystem();
  }

  public subscribe(listener: (state: any) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const state = {
      currentPhase: this.currentPhase,
      currentStep: this.currentStep,
      mistakes: this.mistakes,
      completedSteps: Array.from(this.completedSteps),
      emergencyGenerator: { ...this.emergencyGenerator },
      dieselGenerator1: { ...this.dieselGenerator1 },
      boilerSystem: { ...this.boilerSystem },
      mainEngine: { ...this.mainEngine },
      supportSystems: { ...this.supportSystems },
      startTime: this.startTime,
      isStartupInProgress: this.startTime !== null
    };
    this.listeners.forEach(listener => listener(state));
  }

  public startColdShipProcedure(): boolean {
    if (this.startTime !== null) {
      this.logMistake('PROCEDURE_START', 'sequence_violation', 'Attempted to start procedure while already in progress', 'major');
      return false;
    }

    this.startTime = Date.now();
    this.currentPhase = 'PHASE_1_EMERGENCY';
    this.currentStep = null;
    this.mistakes = [];
    this.completedSteps.clear();
    this.stepStartTimes.clear();
    this.audioSystem?.playSound('procedure_start');
    
    this.notifyListeners();
    return true;
  }

  public isStepAvailable(stepId: string, prerequisites: string[]): boolean {
    // Check if all prerequisites are completed
    for (const prereq of prerequisites) {
      if (!this.completedSteps.has(prereq)) {
        return false;
      }
    }
    return true;
  }

  public async executeStep(stepId: string, stepData: any): Promise<boolean> {
    if (!this.isStepAvailable(stepId, stepData.prerequisites)) {
      this.logMistake(stepId, 'missing_prerequisite', `Attempted step ${stepId} without completing prerequisites`, 'major');
      this.audioSystem?.playSound('error_alarm');
      return false;
    }

    if (this.currentStep !== null && this.currentStep !== stepId) {
      this.logMistake(stepId, 'sequence_violation', `Attempted ${stepId} while ${this.currentStep} is in progress`, 'major');
      this.audioSystem?.playSound('error_alarm');
      return false;
    }

    this.currentStep = stepId;
    this.stepStartTimes.set(stepId, Date.now());
    this.audioSystem?.playSound('step_start');
    
    this.notifyListeners();

    // Execute step-specific logic
    const success = await this.executeStepLogic(stepId, stepData);
    
    if (success) {
      this.completedSteps.add(stepId);
      this.currentStep = null;
      this.audioSystem?.playSound('step_complete');
    } else {
      this.currentStep = null;
      this.audioSystem?.playSound('step_failed');
    }

    this.notifyListeners();
    return success;
  }

  private async executeStepLogic(stepId: string, stepData: any): Promise<boolean> {
    switch (stepId) {
      case 'EMERGENCY_GEN_START':
        return this.executeEmergencyGeneratorStart(stepData);
      
      case 'DG1_OIL_HEATING':
        return this.executeDG1OilHeating(stepData);
        
      case 'DG1_COOLING_PREP':
        return this.executeDG1CoolingPrep(stepData);
        
      case 'TURNING_GEAR_ENGAGE':
        return this.executeTurningGearEngage(stepData);
        
      case 'MAIN_ENGINE_LUBE':
        return this.executeMainEngineLube(stepData);
        
      case 'PURGING_SEQUENCE':
        return this.executePurgingSequence(stepData);
        
      default:
        return this.executeGenericStep(stepId, stepData);
    }
  }

  private async executeEmergencyGeneratorStart(stepData: any): Promise<boolean> {
    this.audioSystem?.playSound('manual_crank');
    
    // Check fuel level
    if (this.emergencyGenerator.fuelLevel < 80) {
      this.logMistake('EMERGENCY_GEN_START', 'parameter_out_of_range', 'Insufficient fuel level for emergency generator', 'critical');
      return false;
    }

    // Simulate manual cranking process
    await this.simulateRealTimeProcess('cranking', 20000, () => {
      this.emergencyGenerator.crankTurns++;
      if (this.emergencyGenerator.crankTurns >= 20) {
        this.emergencyGenerator.status = 'starting';
        this.audioSystem?.playSound('engine_ignition');
      }
    }, 1000);

    // Engine start sequence
    await this.simulateRealTimeProcess('startup', 30000, () => {
      this.emergencyGenerator.rpm = Math.min(1800, this.emergencyGenerator.rpm + 100);
      this.emergencyGenerator.oilPressure = Math.min(4.0, this.emergencyGenerator.oilPressure + 0.2);
      this.emergencyGenerator.voltage = Math.min(440, this.emergencyGenerator.voltage + 25);
      this.emergencyGenerator.frequency = Math.min(60, this.emergencyGenerator.frequency + 3);
    }, 2000);

    // Check critical parameters
    if (this.emergencyGenerator.oilPressure < 2.5) {
      this.logMistake('EMERGENCY_GEN_START', 'parameter_out_of_range', 'Emergency generator oil pressure too low', 'critical');
      return false;
    }

    this.emergencyGenerator.status = 'running';
    this.audioSystem?.playSound('steady_idle');
    return true;
  }

  private async executeDG1OilHeating(stepData: any): Promise<boolean> {
    if (!this.completedSteps.has('DG1_COOLING_PREP')) {
      this.logMistake('DG1_OIL_HEATING', 'missing_prerequisite', 'Cooling water circulation must be started first', 'major');
      return false;
    }

    this.audioSystem?.playSound('oil_heater_start');
    
    // Real-time oil heating simulation (10 minutes = 600 seconds)
    const heatingDuration = 600000; // 10 minutes in milliseconds
    const heatingRate = 1.2; // degrees per minute
    const targetTemp = 45;
    
    await this.simulateRealTimeProcess('oil_heating', heatingDuration, () => {
      if (this.dieselGenerator1.oilTemp < targetTemp) {
        this.dieselGenerator1.oilTemp = Math.min(targetTemp, this.dieselGenerator1.oilTemp + (heatingRate / 60)); // per second
        this.dieselGenerator1.oilPressure = Math.min(5.0, this.dieselGenerator1.oilPressure + 0.05);
      }
    }, 1000);

    if (this.dieselGenerator1.oilTemp < 43) {
      this.logMistake('DG1_OIL_HEATING', 'parameter_out_of_range', 'Oil temperature insufficient for safe operation', 'major');
      return false;
    }

    return true;
  }

  private async executeDG1CoolingPrep(stepData: any): Promise<boolean> {
    if (!this.completedSteps.has('EMERGENCY_SWITCHBOARD')) {
      this.logMistake('DG1_COOLING_PREP', 'missing_prerequisite', 'Emergency power must be established first', 'major');
      return false;
    }

    this.audioSystem?.playSound('pump_start');
    
    // Cooling water circulation startup (2 minutes)
    await this.simulateRealTimeProcess('cooling_prep', 120000, () => {
      this.supportSystems.seaWaterCooling.flowRate = Math.min(150, this.supportSystems.seaWaterCooling.flowRate + 10);
      this.supportSystems.seaWaterCooling.pressure = Math.min(4.0, this.supportSystems.seaWaterCooling.pressure + 0.2);
    }, 5000);

    this.dieselGenerator1.coolingWaterFlow = true;
    this.supportSystems.seaWaterCooling.status = 'running';
    return true;
  }

  private async executeTurningGearEngage(stepData: any): Promise<boolean> {
    if (this.mainEngine.status !== 'stopped') {
      this.logMistake('TURNING_GEAR_ENGAGE', 'safety_interlock_bypass', 'Cannot engage turning gear while engine is running', 'critical');
      return false;
    }

    this.audioSystem?.playSound('turning_gear_engage');
    this.mainEngine.turningGearEngaged = true;
    
    // Slow rotation process (5 minutes minimum)
    await this.simulateRealTimeProcess('turning_gear', 300000, () => {
      this.mainEngine.rotationCount += 0.05; // 3 RPM = 0.05 per second
      if (this.mainEngine.rotationCount >= 5) {
        this.audioSystem?.playSound('turning_complete');
      }
    }, 1000);

    if (this.mainEngine.rotationCount < 5) {
      this.logMistake('TURNING_GEAR_ENGAGE', 'insufficient_warmup_time', 'Insufficient rotation count for safety', 'major');
      return false;
    }

    return true;
  }

  private async executeMainEngineLube(stepData: any): Promise<boolean> {
    if (!this.mainEngine.turningGearEngaged) {
      this.logMistake('MAIN_ENGINE_LUBE', 'missing_prerequisite', 'Turning gear must be engaged first', 'major');
      return false;
    }

    this.audioSystem?.playSound('lube_pump_start');
    
    // Oil heating process (8 minutes)
    const heatingDuration = 480000;
    const heatingRate = 0.8;
    const targetTemp = 45;
    
    await this.simulateRealTimeProcess('main_lube_heating', heatingDuration, () => {
      if (this.mainEngine.oilTemp < targetTemp) {
        this.mainEngine.oilTemp = Math.min(targetTemp, this.mainEngine.oilTemp + (heatingRate / 60));
        this.mainEngine.oilPressure = Math.min(6.0, this.mainEngine.oilPressure + 0.08);
      }
    }, 1000);

    if (this.mainEngine.oilTemp < 42) {
      this.logMistake('MAIN_ENGINE_LUBE', 'parameter_out_of_range', 'Main engine oil temperature insufficient', 'major');
      return false;
    }

    return true;
  }

  private async executePurgingSequence(stepData: any): Promise<boolean> {
    // Mandatory 5-minute purge - cannot be shortened
    this.audioSystem?.playSound('purge_alarm');
    this.boilerSystem.purgeTimeRemaining = 300; // 5 minutes
    
    await this.simulateRealTimeProcess('purging', 300000, () => {
      this.boilerSystem.purgeTimeRemaining--;
      this.boilerSystem.combustionAirPressure = 150; // Maximum air flow
    }, 1000);

    this.boilerSystem.purgeComplete = true;
    this.audioSystem?.playSound('purge_complete');
    return true;
  }

  private async executeGenericStep(stepId: string, stepData: any): Promise<boolean> {
    // Generic step execution with duration
    await this.delay(stepData.duration * 1000);
    return true;
  }

  private async simulateRealTimeProcess(
    processId: string,
    duration: number,
    updateCallback: () => void,
    interval: number = 1000
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const timer = setInterval(() => {
        updateCallback();
        this.notifyListeners();
        
        if (Date.now() - startTime >= duration) {
          clearInterval(timer);
          this.realTimeProcesses.delete(processId);
          resolve();
        }
      }, interval);
      
      this.realTimeProcesses.set(processId, timer);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logMistake(stepId: string, type: Mistake['type'], description: string, severity: Mistake['severity']) {
    const mistake: Mistake = {
      timestamp: Date.now(),
      stepId,
      type,
      description,
      severity,
      phase: this.currentPhase
    };
    
    this.mistakes.push(mistake);
    console.warn(`MISTAKE [${severity.toUpperCase()}]: ${description}`);
    this.notifyListeners();
  }

  public emergencyStop(): void {
    // Stop all processes
    this.realTimeProcesses.forEach((timer) => clearInterval(timer));
    this.realTimeProcesses.clear();
    
    // Reset all systems to safe state
    this.emergencyGenerator.status = 'emergency_stop';
    this.dieselGenerator1.status = 'emergency_stop';
    this.mainEngine.status = 'emergency_stop';
    this.boilerSystem.status = 'emergency_stop';
    
    this.currentStep = null;
    this.audioSystem?.playSound('emergency_alarm');
    
    this.logMistake('EMERGENCY_STOP', 'emergency_procedure_error', 'Emergency stop activated', 'critical');
    this.notifyListeners();
  }

  public calculatePerformance(): PerformanceAssessment {
    if (!this.startTime) {
      throw new Error('Procedure not started');
    }

    const totalTime = Date.now() - this.startTime;
    const targetTime = 3240000; // 54 minutes in milliseconds
    
    const timeEfficiency = Math.max(0, Math.min(100, (targetTime / totalTime) * 100));
    const mistakeCount = this.mistakes.length;
    const criticalMistakes = this.mistakes.filter(m => m.severity === 'critical').length;
    const majorMistakes = this.mistakes.filter(m => m.severity === 'major').length;
    
    const safetyScore = Math.max(0, 100 - (criticalMistakes * 25) - (majorMistakes * 10) - (this.mistakes.length * 2));
    const proceduralCompliance = Math.max(0, 100 - (mistakeCount * 5));
    const efficiency = (timeEfficiency + proceduralCompliance + safetyScore) / 3;

    // Determine certification level
    let certification: PerformanceAssessment['certification'] = 'failed';
    if (criticalMistakes === 0 && mistakeCount <= 2 && timeEfficiency >= 90) {
      certification = 'master';
    } else if (criticalMistakes === 0 && mistakeCount <= 5 && timeEfficiency >= 80) {
      certification = 'advanced';
    } else if (criticalMistakes <= 1 && mistakeCount <= 10 && timeEfficiency >= 70) {
      certification = 'competent';
    } else if (criticalMistakes <= 2 && mistakeCount <= 15 && timeEfficiency >= 60) {
      certification = 'basic';
    }

    const improvements: string[] = [];
    if (timeEfficiency < 80) improvements.push('Work on procedure efficiency and timing');
    if (criticalMistakes > 0) improvements.push('Focus on safety procedures and critical system operations');
    if (majorMistakes > 5) improvements.push('Review sequential procedure requirements');
    if (mistakeCount > 10) improvements.push('Practice basic procedural compliance');

    return {
      totalTime,
      mistakes: this.mistakes,
      efficiency,
      safetyScore,
      proceduralCompliance,
      certification,
      improvements
    };
  }

  public getSystemState() {
    return {
      currentPhase: this.currentPhase,
      currentStep: this.currentStep,
      mistakes: this.mistakes,
      completedSteps: Array.from(this.completedSteps),
      emergencyGenerator: { ...this.emergencyGenerator },
      dieselGenerator1: { ...this.dieselGenerator1 },
      boilerSystem: { ...this.boilerSystem },
      mainEngine: { ...this.mainEngine },
      supportSystems: { ...this.supportSystems },
      startTime: this.startTime,
      isStartupInProgress: this.startTime !== null
    };
  }
}

// Audio System for Maritime Sounds
class AudioSystem {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadSounds();
    } catch (error) {
      console.warn('Audio system initialization failed:', error);
    }
  }

  private async loadSounds() {
    const soundFiles = [
      'procedure_start', 'step_start', 'step_complete', 'step_failed',
      'manual_crank', 'engine_ignition', 'steady_idle', 'pump_start',
      'turning_gear_engage', 'lube_pump_start', 'purge_alarm',
      'emergency_alarm', 'error_alarm'
    ];

    // Generate synthetic sounds for now (in production, load actual audio files)
    for (const soundName of soundFiles) {
      this.sounds.set(soundName, await this.generateSound(soundName));
    }
  }

  private async generateSound(soundName: string): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = this.getSoundDuration(soundName);
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate different waveforms based on sound type
    for (let i = 0; i < data.length; i++) {
      const frequency = this.getSoundFrequency(soundName);
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 0.3;
    }
    
    return buffer;
  }

  private getSoundDuration(soundName: string): number {
    const durations: Record<string, number> = {
      'procedure_start': 2,
      'step_start': 0.5,
      'step_complete': 1,
      'step_failed': 1.5,
      'manual_crank': 0.3,
      'engine_ignition': 2,
      'steady_idle': 0.5,
      'pump_start': 1,
      'turning_gear_engage': 1.5,
      'lube_pump_start': 1,
      'purge_alarm': 3,
      'emergency_alarm': 2,
      'error_alarm': 1
    };
    return durations[soundName] || 1;
  }

  private getSoundFrequency(soundName: string): number {
    const frequencies: Record<string, number> = {
      'procedure_start': 440,
      'step_start': 880,
      'step_complete': 660,
      'step_failed': 220,
      'manual_crank': 150,
      'engine_ignition': 300,
      'steady_idle': 100,
      'pump_start': 400,
      'turning_gear_engage': 250,
      'lube_pump_start': 350,
      'purge_alarm': 800,
      'emergency_alarm': 1000,
      'error_alarm': 600
    };
    return frequencies[soundName] || 440;
  }

  public playSound(soundName: string, volume: number = 0.3): void {
    if (!this.audioContext || !this.sounds.has(soundName)) {
      console.log(`Playing sound: ${soundName}`); // Fallback logging
      return;
    }

    const buffer = this.sounds.get(soundName)!;
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }
}

export { AudioSystem };
