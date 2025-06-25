import React from 'react';
import { motion } from 'framer-motion';
import {
  Anchor, Settings, AlertTriangle, Menu, X, 
  Shield, Navigation, Package, Zap, Users, MapPin,
  ChevronDown, Clock, Trophy, Target
} from 'lucide-react';
import { useModernMaritime } from '../contexts/ModernMaritimeContext';
import { cn } from '../lib/utils';

interface StatusChipProps {
  status: 'at-sea' | 'in-port' | 'anchored' | 'emergency';
  operation: string;
}

function StatusChip({ status, operation }: StatusChipProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'at-sea':
        return { color: 'bg-blue-500', text: 'At Sea', icon: Navigation };
      case 'in-port':
        return { color: 'bg-green-500', text: 'In Port', icon: MapPin };
      case 'anchored':
        return { color: 'bg-yellow-500', text: 'Anchored', icon: Anchor };
      case 'emergency':
        return { color: 'bg-red-500', text: 'Emergency', icon: AlertTriangle };
      default:
        return { color: 'bg-slate-500', text: 'Unknown', icon: Shield };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-3">
      <div className={cn(
        "flex items-center space-x-2 px-3 py-1 rounded-full text-white text-sm font-medium backdrop-blur-sm",
        config.color
      )}>
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </div>
      <div className="text-slate-300 text-sm font-medium">
        {operation}
      </div>
    </div>
  );
}

export function ModernMaritimeHeader() {
  const { 
    state, 
    navigateToDepartment, 
    toggleLeftPanel, 
    toggleRightPanel,
    getSystemsByCategory 
  } = useModernMaritime();

  const departments = [
    {
      id: 'engine-room' as const,
      label: 'Engine Room',
      icon: Zap,
      systemCount: getSystemsByCategory('power').length + getSystemsByCategory('propulsion').length + getSystemsByCategory('fluid').length
    },
    {
      id: 'bridge' as const,
      label: 'Bridge',
      icon: Navigation,
      systemCount: getSystemsByCategory('navigation').length + 2
    },
    {
      id: 'cargo' as const,
      label: 'Cargo',
      icon: Package,
      systemCount: getSystemsByCategory('safety').length
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Ship Identity */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white">
                  {state.shipIdentity.name}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <span>{state.shipIdentity.type}</span>
                  <span>•</span>
                  <span>{state.shipIdentity.imo}</span>
                  <span>•</span>
                  <span>{state.shipIdentity.flag}</span>
                </div>
              </div>
            </div>

            <StatusChip 
              status={state.shipIdentity.status} 
              operation={state.shipIdentity.currentOperation}
            />
          </div>

          {/* Center Section - Department Navigation */}
          <div className="flex items-center space-x-2">
            {departments.map((dept) => (
              <motion.button
                key={dept.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateToDepartment(dept.id)}
                className={cn(
                  "relative flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300",
                  state.navigation.currentDepartment === dept.id
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/50 backdrop-blur-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                )}
              >
                <dept.icon className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">{dept.label}</span>
                  <span className="text-xs opacity-70">{dept.systemCount} systems</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
              Emergency
            </button>
            <button className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm">
              Settings
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
