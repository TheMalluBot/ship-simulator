import React, { useState, useEffect } from 'react';
import { Radar, Target, RotateCcw, Settings } from 'lucide-react';
import { useShipSimulator } from '../../contexts/ShipSimulatorContext';
import { motion } from 'framer-motion';

interface RadarTarget {
  id: string;
  angle: number;
  distance: number;
  name: string;
  speed: number;
  course: number;
}

export function RadarDisplay() {
  const { state } = useShipSimulator();
  const [radarRange, setRadarRange] = useState(12);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [seaClutter, setSeaClutter] = useState(20);
  const [rainClutter, setRainClutter] = useState(10);

  // Mock radar targets
  const [targets] = useState<RadarTarget[]>([
    { id: 'T1', angle: 45, distance: 2.5, name: 'MERCHANT VESSEL', speed: 12, course: 180 },
    { id: 'T2', angle: 120, distance: 5.8, name: 'FISHING VESSEL', speed: 8, course: 90 },
    { id: 'T3', angle: 280, distance: 8.2, name: 'CONTAINER SHIP', speed: 15, course: 45 },
  ]);

  // Animate radar sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle(prev => (prev + 2) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const radarRanges = [3, 6, 12, 24, 48];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-600">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <div className="bg-green-600 p-2 rounded-lg">
            <Radar className="h-5 w-5 text-white" />
          </div>
          <span>Radar Display</span>
        </h2>
        <p className="text-slate-300 text-sm mt-1">ARPA Navigation Radar</p>
      </div>

      {/* Radar Display */}
      <div className="p-4">
        <div className="relative">
          {/* Radar Screen */}
          <div className="relative w-80 h-80 mx-auto bg-black rounded-full border-2 border-green-500 overflow-hidden">
            {/* Background image overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-10 rounded-full"
              style={{ backgroundImage: 'url(/images/radar-display.jpg)' }}
            />
            
            {/* Radar grid */}
            <svg className="absolute inset-0 w-full h-full">
              {/* Range rings */}
              {[1, 2, 3, 4].map(ring => (
                <circle
                  key={ring}
                  cx="50%"
                  cy="50%"
                  r={`${ring * 22.5}%`}
                  fill="none"
                  stroke="rgb(34 197 94)"
                  strokeWidth="1"
                  opacity="0.3"
                />
              ))}
              
              {/* Bearing lines */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map(bearing => (
                <line
                  key={bearing}
                  x1="50%"
                  y1="50%"
                  x2={`${50 + 45 * Math.sin((bearing * Math.PI) / 180)}%`}
                  y2={`${50 - 45 * Math.cos((bearing * Math.PI) / 180)}%`}
                  stroke="rgb(34 197 94)"
                  strokeWidth="1"
                  opacity="0.3"
                />
              ))}

              {/* Radar sweep */}
              <motion.line
                x1="50%"
                y1="50%"
                x2={`${50 + 45 * Math.sin((sweepAngle * Math.PI) / 180)}%`}
                y2={`${50 - 45 * Math.cos((sweepAngle * Math.PI) / 180)}%`}
                stroke="rgb(34 197 94)"
                strokeWidth="2"
                animate={{
                  x2: `${50 + 45 * Math.sin((sweepAngle * Math.PI) / 180)}%`,
                  y2: `${50 - 45 * Math.cos((sweepAngle * Math.PI) / 180)}%`,
                }}
                transition={{ duration: 0.1 }}
              />

              {/* Targets */}
              {targets
                .filter(target => target.distance <= radarRange)
                .map(target => {
                  const x = 50 + (target.distance / radarRange) * 45 * Math.sin((target.angle * Math.PI) / 180);
                  const y = 50 - (target.distance / radarRange) * 45 * Math.cos((target.angle * Math.PI) / 180);
                  
                  return (
                    <g key={target.id}>
                      <motion.circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="3"
                        fill="rgb(234 179 8)"
                        stroke="rgb(255 255 255)"
                        strokeWidth="1"
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <text
                        x={`${x + 2}%`}
                        y={`${y - 2}%`}
                        fill="rgb(234 179 8)"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        {target.id}
                      </text>
                    </g>
                  );
                })}

              {/* Own ship */}
              <circle
                cx="50%"
                cy="50%"
                r="4"
                fill="rgb(239 68 68)"
                stroke="rgb(255 255 255)"
                strokeWidth="2"
              />
            </svg>

            {/* Range indicators */}
            <div className="absolute top-2 left-2 text-green-400 text-xs font-mono">
              {radarRanges.map((range, index) => (
                <div key={range} style={{ marginTop: index * 22 }}>
                  {range}nm
                </div>
              ))}
            </div>

            {/* Bearing scale */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-green-400 text-xs font-mono">
              000°
            </div>
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-green-400 text-xs font-mono">
              090°
            </div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-green-400 text-xs font-mono">
              180°
            </div>
            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-green-400 text-xs font-mono">
              270°
            </div>
          </div>

          {/* Radar Controls */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            {/* Range Control */}
            <div className="bg-slate-700 p-3 rounded-lg">
              <label className="text-slate-300 text-sm mb-2 block">Range</label>
              <select
                value={radarRange}
                onChange={(e) => setRadarRange(Number(e.target.value))}
                className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500"
              >
                {radarRanges.map(range => (
                  <option key={range} value={range}>{range} nm</option>
                ))}
              </select>
            </div>

            {/* Gain Control */}
            <div className="bg-slate-700 p-3 rounded-lg">
              <label className="text-slate-300 text-sm mb-2 block">Gain</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                className="w-full"
              />
            </div>

            {/* Sea Clutter */}
            <div className="bg-slate-700 p-3 rounded-lg">
              <label className="text-slate-300 text-sm mb-2 block">Sea Clutter</label>
              <input
                type="range"
                min="0"
                max="100"
                value={seaClutter}
                onChange={(e) => setSeaClutter(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-slate-400">{seaClutter}%</span>
            </div>

            {/* Rain Clutter */}
            <div className="bg-slate-700 p-3 rounded-lg">
              <label className="text-slate-300 text-sm mb-2 block">Rain Clutter</label>
              <input
                type="range"
                min="0"
                max="100"
                value={rainClutter}
                onChange={(e) => setRainClutter(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-slate-400">{rainClutter}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Information */}
      <div className="bg-slate-700 p-4 border-t border-slate-600">
        <h3 className="text-white font-medium text-sm mb-3 flex items-center space-x-2">
          <Target className="h-4 w-4 text-yellow-400" />
          <span>Tracked Targets</span>
        </h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {targets
            .filter(target => target.distance <= radarRange)
            .map(target => (
              <div key={target.id} className="bg-slate-800 p-2 rounded border border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-yellow-400 font-mono text-sm">{target.id}</span>
                    <span className="text-slate-300 text-xs ml-2">{target.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">{target.distance.toFixed(1)} nm</div>
                    <div className="text-slate-400 text-xs">{target.angle.toFixed(0)}° | {target.speed} kts</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
