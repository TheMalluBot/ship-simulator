import React, { useState } from 'react';
import { Anchor, RotateCcw, Target } from 'lucide-react';
import { useShipSimulator } from '../../contexts/ShipSimulatorContext';
import { motion } from 'framer-motion';

export function HelmControls() {
  const { state, updateHelm } = useShipSimulator();
  const [rudderOrder, setRudderOrder] = useState(0);
  const [steeringMode, setSteeringMode] = useState<'hand' | 'auto' | 'emergency'>('hand');
  const [autopilotHeading, setAutopilotHeading] = useState(0);

  const { rudderAngle } = state.bridge.helm;
  const currentHeading = state.bridge.navigation.course;

  const handleRudderChange = (angle: number) => {
    setRudderOrder(angle);
    updateHelm(angle);
  };

  const quickRudderCommands = [
    { label: 'Hard Port', angle: -35 },
    { label: 'Port 20', angle: -20 },
    { label: 'Port 10', angle: -10 },
    { label: 'Midships', angle: 0 },
    { label: 'Starboard 10', angle: 10 },
    { label: 'Starboard 20', angle: 20 },
    { label: 'Hard Starboard', angle: 35 },
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-600">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <div className="bg-cyan-600 p-2 rounded-lg">
            <Anchor className="h-5 w-5 text-white" />
          </div>
          <span>Helm Controls</span>
        </h2>
        <p className="text-slate-300 text-sm mt-1">Steering & Autopilot</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Steering Mode Selection */}
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">Steering Mode</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: 'hand' as const, label: 'Hand Steering' },
              { mode: 'auto' as const, label: 'Autopilot' },
              { mode: 'emergency' as const, label: 'Emergency' },
            ].map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setSteeringMode(mode)}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  steeringMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Ship's Wheel Visualization */}
        <div className="relative">
          <h3 className="text-white font-medium text-sm mb-4">Ship's Wheel</h3>
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              {/* Background wheel image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 rounded-full"
                style={{ backgroundImage: 'url(/images/ship-helm.jpg)' }}
              />
              
              {/* Wheel SVG */}
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Outer rim */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgb(148 163 184)"
                  strokeWidth="6"
                />
                
                {/* Spokes */}
                {Array.from({ length: 8 }, (_, i) => {
                  const angle = (i * 45 * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1="100"
                      y1="100"
                      x2={100 + 80 * Math.cos(angle - Math.PI / 2)}
                      y2={100 + 80 * Math.sin(angle - Math.PI / 2)}
                      stroke="rgb(148 163 184)"
                      strokeWidth="3"
                    />
                  );
                })}
                
                {/* Center hub */}
                <circle
                  cx="100"
                  cy="100"
                  r="15"
                  fill="rgb(71 85 105)"
                  stroke="rgb(148 163 184)"
                  strokeWidth="3"
                />
                
                {/* Rudder indicator */}
                <motion.line
                  x1="100"
                  y1="100"
                  x2={100 + 60 * Math.sin((rudderAngle * Math.PI) / 180)}
                  y2={100 - 60 * Math.cos((rudderAngle * Math.PI) / 180)}
                  stroke="rgb(239 68 68)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  animate={{
                    x2: 100 + 60 * Math.sin((rudderAngle * Math.PI) / 180),
                    y2: 100 - 60 * Math.cos((rudderAngle * Math.PI) / 180),
                  }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              
              {/* Rudder angle display */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8">
                <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-sm font-mono">
                  {rudderAngle > 0 ? 'S' : rudderAngle < 0 ? 'P' : 'M'} {Math.abs(rudderAngle).toFixed(0)}°
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rudder Control Slider */}
        {steeringMode === 'hand' && (
          <div className="space-y-3">
            <h3 className="text-white font-medium text-sm">Rudder Control</h3>
            <div className="relative">
              <input
                type="range"
                min="-35"
                max="35"
                value={rudderOrder}
                onChange={(e) => handleRudderChange(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    rgb(239 68 68) 0%, 
                    rgb(239 68 68) ${((rudderOrder + 35) / 70) * 50}%, 
                    rgb(71 85 105) 50%, 
                    rgb(34 197 94) 50%, 
                    rgb(34 197 94) ${((rudderOrder + 35) / 70) * 100}%)`
                }}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Port 35°</span>
                <span>Midships</span>
                <span>Starboard 35°</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Rudder Commands */}
        {steeringMode === 'hand' && (
          <div className="space-y-3">
            <h3 className="text-white font-medium text-sm">Quick Commands</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickRudderCommands.map((command) => (
                <button
                  key={command.label}
                  onClick={() => handleRudderChange(command.angle)}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                    rudderOrder === command.angle
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {command.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Autopilot Controls */}
        {steeringMode === 'auto' && (
          <div className="space-y-4">
            <h3 className="text-white font-medium text-sm flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-400" />
              <span>Autopilot</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-slate-300 text-sm">Current Heading</label>
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="text-xl font-mono text-white">
                    {currentHeading.toFixed(0)}°
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-slate-300 text-sm">Set Heading</label>
                <input
                  type="number"
                  min="0"
                  max="359"
                  value={autopilotHeading}
                  onChange={(e) => setAutopilotHeading(Number(e.target.value))}
                  className="w-full bg-slate-700 text-white px-3 py-3 rounded-lg border border-slate-600"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                Engage
              </button>
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                Disengage
              </button>
            </div>
          </div>
        )}

        {/* Status Information */}
        <div className="bg-slate-700 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-slate-300 text-sm">Rate of Turn</span>
              <div className="text-white font-mono">
                {(rudderAngle * 0.1).toFixed(1)}°/min
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-300 text-sm">Helm Response</span>
              <div className={`text-sm font-medium ${
                Math.abs(rudderAngle - rudderOrder) < 1 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {Math.abs(rudderAngle - rudderOrder) < 1 ? 'Following' : 'Responding'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
