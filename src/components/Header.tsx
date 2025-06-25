import React from 'react';
import { Anchor, Gauge, Radio, AlertTriangle } from 'lucide-react';
import { useShipSimulator } from '../contexts/ShipSimulatorContext';

export function Header() {
  const { state } = useShipSimulator();

  return (
    <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Anchor className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Ship Simulator Pro</h1>
              <p className="text-slate-300 text-sm">Advanced Maritime Training System</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-6">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${state.isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-slate-300 text-sm">
                {state.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Engine Status */}
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300 text-sm">
                Engine: {state.engineRoom.systems.mainEngine.status}
              </span>
            </div>

            {/* Speed */}
            <div className="flex items-center space-x-2">
              <Radio className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300 text-sm">
                {state.bridge.navigation.speed.toFixed(1)} kts
              </span>
            </div>

            {/* Active Alarms */}
            {state.bridge.alarms.activeAlarms.length > 0 && (
              <div className="flex items-center space-x-2 bg-red-900 px-3 py-1 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
                <span className="text-red-300 text-sm font-medium">
                  {state.bridge.alarms.activeAlarms.length} Active Alarm(s)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="mt-4 flex items-center space-x-8">
          <div className="text-slate-300 text-sm">
            <span className="font-medium">Position:</span>{' '}
            {state.bridge.navigation.latitude.toFixed(4)}°N, {state.bridge.navigation.longitude.toFixed(4)}°E
          </div>
          <div className="text-slate-300 text-sm">
            <span className="font-medium">Course:</span> {state.bridge.navigation.course.toFixed(1)}°
          </div>
          <div className="text-slate-300 text-sm">
            <span className="font-medium">Time:</span> {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </header>
  );
}
