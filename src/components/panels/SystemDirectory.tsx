import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Battery, ShieldAlert, Settings, RotateCw, Wind,
  Waves, Droplets, Thermometer, Scale, Flame, Siren, Bell,
  ChevronDown, ChevronRight, Search, Filter, Power, Navigation,
  Ship, Cog, Gauge
} from 'lucide-react';
import { useModernMaritime } from '../../contexts/ModernMaritimeContext';
import { MaritimeSystem } from '../../types/maritime';
import { cn } from '../../lib/utils';

interface SystemCardProps {
  system: MaritimeSystem;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}

function SystemCard({ system, isSelected, isHighlighted, onClick }: SystemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const getSystemIcon = (system: MaritimeSystem) => {
    const iconMap = {
      'power-chief-101': Zap,
      'power-chief-102': Zap,
      'power-chief-103': Gauge,
      'electric-power-70': Battery,
      'emergency-power': ShieldAlert,
      'auto-chief-104': Settings,
      'main-engine-110': Ship,
      'auxiliary-systems-111': Cog,
      'ship-propulsion-56': RotateCw,
      'auxiliary-propulsion': Wind,
      'sea-water-01': Waves,
      'fresh-water-10': Droplets,
      'cooling-water-15': Thermometer,
      'ballast-system-20': Scale,
      'fire-protection-30': Flame,
      'emergency-systems-35': Siren,
      'alarm-management-40': Bell
    };
    
    return iconMap[system.id as keyof typeof iconMap] || Power;
  };



  const Icon = getSystemIcon(system);

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "maritime-system-card relative",
        isSelected && "selected",
        isHighlighted && "ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-800"
      )}
    >
      {/* Header with Number, Name, and Status */}
      <div className="flex items-center gap-3 mb-3">
        <div className="maritime-system-number">
          {system.number}
        </div>
        <div className="maritime-system-name">
          {system.name}
        </div>
        <div className={cn("maritime-status-indicator", system.status)} />
      </div>

      {/* System Info */}
      <div className="flex items-start space-x-3">
        <div className={cn(
          "p-2 rounded-lg transition-colors",
          isSelected ? "bg-blue-500/30" : "bg-slate-600/50"
        )}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 leading-relaxed">
            {system.description}
          </p>
          
          {/* Priority Level */}
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs text-slate-500">Priority:</span>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    i < system.priority ? "bg-yellow-400" : "bg-slate-600"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Highlight Border */}
      {isHighlighted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 border-2 border-yellow-400 rounded-lg pointer-events-none"
        />
      )}
      
      {/* Interactive Hover Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-2 top-2 bg-slate-700/80 p-1 rounded-lg"
          >
            <div className="flex space-x-1">
              <div className="text-blue-300 text-xs px-2 py-0.5 rounded bg-blue-500/20">
                Details
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SystemCategoryProps {
  title: string;
  systems: MaritimeSystem[];
  icon: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
  onToggle: () => void;
}

function SystemCategory({ title, systems, icon: Icon, isExpanded, onToggle }: SystemCategoryProps) {
  const { state, selectSystem, isSystemHighlighted } = useModernMaritime();
  
  const runningCount = systems.filter(s => s.status === 'running').length;
  const totalCount = systems.length;

  return (
    <div className="mb-4">
      {/* Category Header */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-700/70 border border-slate-600 hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-blue-400" />
          <span className="font-semibold text-white">{title}</span>
          <span className="text-xs text-slate-400">
            ({runningCount}/{totalCount} running)
          </span>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </motion.div>
      </motion.button>

      {/* Category Systems */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 mt-3 pl-4">
              {systems.map((system) => (
                <SystemCard
                  key={system.id}
                  system={system}
                  isSelected={state.selectedSystem?.id === system.id}
                  isHighlighted={isSystemHighlighted(system.id)}
                  onClick={() => selectSystem(system)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SystemDirectory() {
  const { state, getSystemsByCategory } = useModernMaritime();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    power: true,
    propulsion: true,
    fluid: true,
    safety: true,
    auxiliary: true
  });
  const [error, setError] = useState<string | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const categories = [
    {
      id: 'power',
      title: 'Power Generation Systems',
      icon: Zap,
      systems: getSystemsByCategory('power')
    },
    {
      id: 'propulsion',
      title: 'Propulsion Systems',
      icon: RotateCw,
      systems: getSystemsByCategory('propulsion')
    },
    {
      id: 'fluid',
      title: 'Fluid Systems',
      icon: Droplets,
      systems: getSystemsByCategory('fluid')
    },
    {
      id: 'safety',
      title: 'Safety Systems',
      icon: ShieldAlert,
      systems: getSystemsByCategory('safety')
    },
    {
      id: 'auxiliary',
      title: 'Auxiliary Systems',
      icon: Settings,
      systems: getSystemsByCategory('auxiliary')
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const filteredCategories = React.useMemo(() => {
    try {
      return categories.map(category => ({
        ...category,
        systems: category.systems.filter(system =>
          system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          system.number.includes(searchTerm)
        )
      })).filter(category => category.systems.length > 0);
    } catch (err) {
      setError(`Error filtering systems: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
  }, [categories, searchTerm]);

  const totalSystems = state.systems.length;
  const runningSystems = state.systems.filter(s => s.status === 'running').length;

  // Handle any errors that might occur when interacting with systems
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Simulate a local loading state when filtering changes
  React.useEffect(() => {
    setIsLocalLoading(true);
    const timer = setTimeout(() => setIsLocalLoading(false), 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  return (
    <div className="h-full flex flex-col">
      {/* Error message display */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 mx-4 mt-2 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4" />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)} 
                className="ml-auto text-red-200 hover:text-white"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Directory Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">System Directory</h2>
            <p className="text-sm text-slate-400">
              {runningSystems}/{totalSystems} systems operational
            </p>
          </div>
          <Navigation className="h-5 w-5 text-blue-400" />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search systems..."
            value={searchTerm}
            onChange={(e) => {
              try {
                setSearchTerm(e.target.value);
              } catch (err) {
                setError(`Search error: ${err instanceof Error ? err.message : String(err)}`);
              }
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="text-center p-2 bg-green-500/20 border border-green-500/30 rounded-lg"
          >
            <div className="text-lg font-bold text-green-400">{runningSystems}</div>
            <div className="text-xs text-green-300">Running</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="text-center p-2 bg-slate-700/50 border border-slate-600 rounded-lg"
          >
            <div className="text-lg font-bold text-slate-300">{totalSystems - runningSystems}</div>
            <div className="text-xs text-slate-400">Stopped</div>
          </motion.div>
        </div>
      </div>

      {/* System Categories */}
      <div className="flex-1 p-4 overflow-y-auto">
        {state.isLoading || isLocalLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-12 w-12 border-t-2 border-r-2 border-blue-400"
            />
            <p className="text-slate-400 text-sm">Loading ship systems...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {filteredCategories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SystemCategory
                  title={category.title}
                  systems={category.systems}
                  icon={category.icon}
                  isExpanded={expandedCategories[category.id]}
                  onToggle={() => {
                    try {
                      toggleCategory(category.id);
                    } catch (err) {
                      setError(`Failed to toggle category: ${err instanceof Error ? err.message : String(err)}`);
                    }
                  }}
                />
              </motion.div>
            ))}
            
            {filteredCategories.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-slate-400"
              >
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No systems found matching "<span className="text-white">{searchTerm}</span>"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-blue-500/30 hover:bg-blue-500/50 rounded-lg text-blue-200 text-sm transition-colors"
                >
                  Clear search
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
