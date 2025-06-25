// Export the SimulationEngine singleton instance
import { SimulationEngine } from './SimulationEngine';

// Create a singleton instance that will be used throughout the application
export const simulationEngine = new SimulationEngine();

// Re-export types for use elsewhere
export type { GeneratorState, GeneratorConfig } from './SimulationEngine';
