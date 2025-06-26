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
   * Currently this is only a stub – it flips `running` to true immediately.
   */
  async start(): Promise<boolean> {
    if (this.state.running) return true;
    // TODO: Add realistic delayed startup sequence.
    this.state = { ...this.state, running: true, rpm: 720, load: 10 };
    return true;
  }

  async stop(): Promise<boolean> {
    if (!this.state.running) return true;
    // TODO: Add cooldown behaviour.
    this.state = { ...this.state, running: false, rpm: 0, load: 0 };
    return true;
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
    // Register initial sample generator so UI has something to bind to.
    this.generators.set(
      'dg1',
      new GeneratorSimulator({ id: 'dg1', label: 'Diesel Gen-1', startupTimeMs: 15000, cooldownTimeMs: 120000 })
    );

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
