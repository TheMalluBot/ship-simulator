import React, { useState } from 'react';
import { Navigation, MapPin, Compass, Route, Settings } from 'lucide-react';
import { useShipSimulator } from '../../contexts/ShipSimulatorContext';
import { motion } from 'framer-motion';

interface NavigationDisplayProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function NavigationDisplay({ title, value, unit, icon: Icon, color }: NavigationDisplayProps) {
  return (
    <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-slate-300 text-sm">{title}</span>
      </div>
      <div className="text-xl font-mono text-white">
        {typeof value === 'number' ? value.toFixed(4) : value}
        {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

export function NavigationPanel() {
  const { state } = useShipSimulator();
  const { navigation } = state.bridge;
  const [chartScale, setChartScale] = useState(25000);
  const [activeTab, setActiveTab] = useState<'gps' | 'ecdis' | 'route'>('gps');

  const navigationData = [
    {
      title: 'Latitude',
      value: navigation.latitude,
      unit: '°N',
      icon: MapPin,
      color: 'text-blue-400',
    },
    {
      title: 'Longitude',
      value: navigation.longitude,
      unit: '°E',
      icon: MapPin,
      color: 'text-blue-400',
    },
    {
      title: 'Course',
      value: navigation.course,
      unit: '°',
      icon: Compass,
      color: 'text-green-400',
    },
    {
      title: 'Speed',
      value: navigation.speed,
      unit: 'kts',
      icon: Navigation,
      color: 'text-orange-400',
    },
  ];

  const tabs = [
    { id: 'gps' as const, name: 'GPS', icon: MapPin },
    { id: 'ecdis' as const, name: 'ECDIS', icon: Route },
    { id: 'route' as const, name: 'Route', icon: Navigation },
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-600">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Navigation className="h-5 w-5 text-white" />
          </div>
          <span>Navigation Systems</span>
        </h2>
        <p className="text-slate-300 text-sm mt-1">GPS, ECDIS & Route Planning</p>
      </div>

      {/* Navigation Data */}
      <div className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {navigationData.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavigationDisplay {...item} />
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 bg-slate-700 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-700 rounded-lg p-4 min-h-64">
          {activeTab === 'gps' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="text-white font-medium flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span>GPS Status</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-slate-300 text-sm">Satellites in View</span>
                  <div className="text-xl font-mono text-green-400">12</div>
                </div>
                <div className="space-y-2">
                  <span className="text-slate-300 text-sm">Accuracy</span>
                  <div className="text-xl font-mono text-green-400">5m</div>
                </div>
                <div className="space-y-2">
                  <span className="text-slate-300 text-sm">HDOP</span>
                  <div className="text-xl font-mono text-green-400">1.2</div>
                </div>
                <div className="space-y-2">
                  <span className="text-slate-300 text-sm">Fix Type</span>
                  <div className="text-xl font-mono text-green-400">3D</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 font-medium">GPS Active - High Precision</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ecdis' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="text-white font-medium flex items-center space-x-2">
                <Route className="h-5 w-5 text-green-400" />
                <span>ECDIS Display</span>
              </h3>
              
              {/* Chart Display Simulation */}
              <div className="relative bg-slate-800 rounded-lg h-48 border border-slate-600 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: 'url(/images/bridge-navigation.jpg)' }}
                />
                
                {/* Chart Grid */}
                <div className="absolute inset-0">
                  <svg className="w-full h-full">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(71 85 105)" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Ship position */}
                    <circle 
                      cx="50%" 
                      cy="50%" 
                      r="4" 
                      fill="red" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                    
                    {/* Course line */}
                    <line 
                      x1="50%" 
                      y1="50%" 
                      x2="60%" 
                      y2="30%" 
                      stroke="red" 
                      strokeWidth="2" 
                      strokeDasharray="5,5"
                    />
                  </svg>
                </div>

                {/* Chart controls */}
                <div className="absolute top-2 left-2 space-y-2">
                  <div className="bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                    Scale: 1:{chartScale.toLocaleString()}
                  </div>
                  <div className="bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                    Depth: 10m
                  </div>
                </div>

                <div className="absolute bottom-2 right-2">
                  <div className="bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                    Chart: DK50_2024_01
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => setChartScale(Math.max(5000, chartScale / 2))}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Zoom In
                </button>
                <button 
                  onClick={() => setChartScale(Math.min(100000, chartScale * 2))}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Zoom Out
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'route' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="text-white font-medium flex items-center space-x-2">
                <Navigation className="h-5 w-5 text-orange-400" />
                <span>Route Planning</span>
              </h3>
              
              <div className="space-y-3">
                {[
                  { name: 'Departure', lat: '55.7558°N', lon: '12.4784°E', eta: '20:12' },
                  { name: 'WP1', lat: '55.8000°N', lon: '12.5000°E', eta: '21:30' },
                  { name: 'Arrival', lat: '56.0000°N', lon: '12.6000°E', eta: '23:00' },
                ].map((waypoint, index) => (
                  <div key={index} className="bg-slate-800 p-3 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{waypoint.name}</div>
                        <div className="text-slate-300 text-sm">
                          {waypoint.lat}, {waypoint.lon}
                        </div>
                      </div>
                      <div className="text-orange-400 font-mono">{waypoint.eta}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-600">
                <div className="space-y-1">
                  <span className="text-slate-300 text-sm">Total Distance</span>
                  <div className="text-lg font-mono text-white">25.6 nm</div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-300 text-sm">ETA</span>
                  <div className="text-lg font-mono text-white">2h 48m</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
