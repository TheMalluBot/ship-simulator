/*
 * Simple skeleton for the maritime simulation engine.
 * This provides a pluggable structure where individual subsystem simulators
 * (generators, pumps, etc.) can be registered and updated on a fixed time-step.
 *
 * The current implementation is intentionally minimal – it only logs actions.
 * Phase-1 goal: integrate with the React context so UI code can invoke
 * start/stop and parameter-update APIs without `console.log` placeholders.
 */

export interface GeneratorConfig {
  id: string;
  label: string;
  startupTimeMs: number;
  cooldownTimeMs: number;
  type?: 'emergency' | 'diesel' | 'shaft' | 'turbo';
  maxPower?: number; // Maximum power output in kW
  fuelConsumption?: number; // Fuel consumption rate
  maintenanceInterval?: number; // Hours between maintenance
}

export interface GeneratorState {
  running: boolean;
  rpm: number;
  load: number; // kW or % depending on later choice
  temperature: number; // °C
  voltage: number; // V
  frequency: number; // Hz
  hours: number; // Running hours
  faults: string[]; // Any active fault conditions
  status?: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
}

class GeneratorSimulator {
  public state: GeneratorState;
  private readonly cfg: GeneratorConfig;

  constructor(cfg: GeneratorConfig) {
    this.cfg = cfg;
    this.state = { 
      running: false, 
      rpm: 0, 
      load: 0,
      temperature: 25, // Ambient temperature in °C
      voltage: 0,
      frequency: 0,
      hours: 0,
      faults: [],
      status: 'stopped'
    };
  }

  /**
   * Starts the generator asynchronously, respecting startup time.
   * Simulates a realistic startup sequence with status transitions.
   */
  async start(): Promise<boolean> {
    if (this.state.running || this.state.status === 'starting') return true;
    
    // Update status to starting
    this.state = { ...this.state, status: 'starting' };
    
    // Simulate startup sequence with realistic timing
    return new Promise((resolve) => {
      setTimeout(() => {
        // Set running parameters based on generator type
        const ratedFrequency = 60; // Hz
        const nominalVoltage = this.cfg.type === 'emergency' ? 440 : 480; // V
        const startupTemp = this.state.temperature + 15;
        
        this.state = { 
          ...this.state, 
          running: true, 
          status: 'running',
          rpm: this.cfg.type === 'turbo' ? 1800 : 720,
          load: this.cfg.type === 'emergency' ? 15 : 25,
          temperature: startupTemp,
          voltage: nominalVoltage,
          frequency: ratedFrequency,
          faults: []
        };
        
        resolve(true);
      }, this.cfg.startupTimeMs);
    });
  }

  async stop(): Promise<boolean> {
    if (!this.state.running || this.state.status === 'stopping') return true;
    
    // Update status to stopping
    this.state = { ...this.state, status: 'stopping' };
    
    // Simulate shutdown sequence with realistic timing
    return new Promise((resolve) => {
      setTimeout(() => {
        this.state = { 
          ...this.state, 
          running: false, 
          status: 'stopped',
          rpm: 0, 
          load: 0,
          voltage: 0,
          frequency: 0,
          temperature: Math.max(25, this.state.temperature - 15)
        };
        resolve(true);
      }, this.cfg.cooldownTimeMs / 3); // Using a shorter time for UI responsiveness
    });
  }

  /** Merge arbitrary parameter updates coming from the UI */
  update(updates: Partial<GeneratorState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export class SimulationEngine {
  private generators = new Map<string, GeneratorSimulator>();
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private timeStepMs = 100; // default 10 Hz

  constructor() {
    // Register all generators
    
    // Emergency Generator
    this.generators.set('emergency-gen', new GeneratorSimulator({ 
      id: 'emergency-gen', 
      label: 'Emergency Generator', 
      startupTimeMs: 10000, 
      cooldownTimeMs: 60000,
      type: 'emergency',
      maxPower: 550,
      fuelConsumption: 0.3
    }));
    
    // Diesel Generators
    this.generators.set('dg1', new GeneratorSimulator({ 
      id: 'dg1', 
      label: 'Diesel Generator #1', 
      startupTimeMs: 15000, 
      cooldownTimeMs: 120000,
      type: 'diesel',
      maxPower: 2400,
      fuelConsumption: 0.42
    }));
    
    this.generators.set('dg2', new GeneratorSimulator({ 
      id: 'dg2', 
      label: 'Diesel Generator #2', 
      startupTimeMs: 15000, 
      cooldownTimeMs: 120000,
      type: 'diesel',
      maxPower: 2400,
      fuelConsumption: 0.42
    }));
    
    // Shaft Generator
    this.generators.set('shaft-gen', new GeneratorSimulator({ 
      id: 'shaft-gen', 
      label: 'Shaft Generator', 
      startupTimeMs: 20000, 
      cooldownTimeMs: 180000,
      type: 'shaft',
      maxPower: 1800,
      fuelConsumption: 0.38
    }));
    
    // Turbo Generator
    this.generators.set('turbo-gen', new GeneratorSimulator({ 
      id: 'turbo-gen', 
      label: 'Turbo Generator', 
      startupTimeMs: 25000, 
      cooldownTimeMs: 200000,
      type: 'turbo',
      maxPower: 850,
      fuelConsumption: 0.35
    }));

    // Begin physics tick loop (currently just a placeholder)
    this.startLoop();
  }

  /* --------------------------------------------------------------------- */
  /* Public API                                                             */
  /* --------------------------------------------------------------------- */

  startGenerator(id: string): Promise<boolean> {
    const gen = this.generators.get(id);
    if (!gen) throw new Error(`Generator ${id} not found`);
    return gen.start();
  }

  stopGenerator(id: string): Promise<boolean> {
    const gen = this.generators.get(id);
    if (!gen) throw new Error(`Generator ${id} not found`);
    return gen.stop();
  }

  /** Called by UI when manual parameter tweaks are performed. */
  updateGeneratorParameters(id: string, updates: Partial<GeneratorState>): void {
    const gen = this.generators.get(id);
    if (!gen) throw new Error(`Generator ${id} not found`);
    gen.update(updates);
  }

  /** Return a lightweight snapshot suitable for React state */
  getGeneratorState(id: string): GeneratorState | undefined {
    return this.generators.get(id)?.state;
  }

  /* --------------------------------------------------------------------- */
  /* Internal loop – will eventually update thermodynamics each tick        */
  /* --------------------------------------------------------------------- */

  private startLoop(): void {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => {
      // Placeholder – later: integrate physics & raise events.
    }, this.timeStepMs);
  }

  stopLoop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}

// Export a singleton so context/hooks can share one engine instance.
export const simulationEngine = new SimulationEngine();
