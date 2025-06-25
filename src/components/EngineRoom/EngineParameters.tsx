import React from 'react';
import { Gauge as GaugeIcon, Thermometer, Droplets, Wind } from 'lucide-react';
import { useShipSimulator } from '../../contexts/ShipSimulatorContext';
import { motion } from 'framer-motion';

interface ParameterGaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  critical?: boolean;
}

function ParameterGauge({ label, value, min, max, unit, icon: Icon, color, critical }: ParameterGaugeProps) {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const isInRange = value >= min && value <= max;
  
  return (
    <div className={`bg-slate-700 rounded-lg p-4 border ${critical && !isInRange ? 'border-red-500' : 'border-slate-600'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <span className="text-white font-medium text-sm">{label}</span>
        </div>
        <span className={`text-sm font-mono ${isInRange ? 'text-green-400' : 'text-red-400'}`}>
          {value.toFixed(1)} {unit}
        </span>
      </div>
      
      {/* Circular Gauge */}
      <div className="relative w-24 h-24 mx-auto">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-600"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={isInRange ? color : 'text-red-400'}
            strokeDasharray={`${2 * Math.PI * 40}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
            animate={{ 
              strokeDashoffset: 2 * Math.PI * 40 - (percentage / 100) * 2 * Math.PI * 40 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${isInRange ? 'text-white' : 'text-red-400'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      {/* Range indicators */}
      <div className="mt-3 flex justify-between text-xs text-slate-400">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

export function EngineParameters() {
  const { state } = useShipSimulator();
  const { engineParameters } = state.engineRoom;

  const parameters = [
    {
      label: 'Oil Pressure',
      value: engineParameters.oilPressure.current,
      min: engineParameters.oilPressure.min,
      max: engineParameters.oilPressure.max,
      unit: engineParameters.oilPressure.unit,
      icon: Droplets,
      color: 'text-blue-400',
      critical: true,
    },
    {
      label: 'Oil Temperature',
      value: engineParameters.oilTemperature.current,
      min: engineParameters.oilTemperature.min,
      max: engineParameters.oilTemperature.max,
      unit: engineParameters.oilTemperature.unit,
      icon: Thermometer,
      color: 'text-orange-400',
      critical: true,
    },
    {
      label: 'Coolant Temp',
      value: engineParameters.coolantTemperature.current,
      min: engineParameters.coolantTemperature.min,
      max: engineParameters.coolantTemperature.max,
      unit: engineParameters.coolantTemperature.unit,
      icon: Thermometer,
      color: 'text-cyan-400',
      critical: true,
    },
    {
      label: 'Fuel Pressure',
      value: engineParameters.fuelPressure.current,
      min: engineParameters.fuelPressure.min,
      max: engineParameters.fuelPressure.max,
      unit: engineParameters.fuelPressure.unit,
      icon: GaugeIcon,
      color: 'text-yellow-400',
      critical: false,
    },
    {
      label: 'Air Pressure',
      value: engineParameters.airPressure.current,
      min: engineParameters.airPressure.min,
      max: engineParameters.airPressure.max,
      unit: engineParameters.airPressure.unit,
      icon: Wind,
      color: 'text-green-400',
      critical: true,
    },
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-600">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <div className="bg-green-600 p-2 rounded-lg">
            <GaugeIcon className="h-5 w-5 text-white" />
          </div>
          <span>Engine Parameters</span>
        </h2>
        <p className="text-slate-300 text-sm mt-1">Real-time monitoring</p>
      </div>

      {/* Parameters Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {parameters.map((param, index) => (
            <motion.div
              key={param.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ParameterGauge {...param} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-slate-700 p-4 border-t border-slate-600">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Overall Status</span>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-green-400 text-sm font-medium">Normal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
