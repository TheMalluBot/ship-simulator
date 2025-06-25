import React from 'react';
import { Settings, Navigation } from 'lucide-react';

interface SimulatorTabsProps {
  activeView: 'engine-room' | 'bridge';
  onViewChange: (view: 'engine-room' | 'bridge') => void;
}

export function SimulatorTabs({ activeView, onViewChange }: SimulatorTabsProps) {
  const tabs = [
    {
      id: 'bridge' as const,
      name: 'Bridge',
      icon: Navigation,
      description: 'Navigation & Communication Systems',
    },
    {
      id: 'engine-room' as const,
      name: 'Engine Room',
      icon: Settings,
      description: 'Propulsion & Power Systems',
    },
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{tab.name}</div>
                <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
