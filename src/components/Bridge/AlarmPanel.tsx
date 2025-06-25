import React, { useState } from 'react';
import { AlertTriangle, Bell, Volume2, VolumeX, CheckCircle, X } from 'lucide-react';
import { useShipSimulator } from '../../contexts/ShipSimulatorContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AlarmItemProps {
  id: string;
  type: 'fire' | 'engine' | 'navigation' | 'general' | 'security';
  message: string;
  priority: 'critical' | 'warning' | 'info';
  timestamp: Date;
  acknowledged: boolean;
  onAcknowledge: () => void;
  onReset: () => void;
}

function AlarmItem({ id, type, message, priority, timestamp, acknowledged, onAcknowledge, onReset }: AlarmItemProps) {
  const getAlarmColor = () => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-500/20 text-red-300';
      case 'warning': return 'border-yellow-500 bg-yellow-500/20 text-yellow-300';
      case 'info': return 'border-blue-500 bg-blue-500/20 text-blue-300';
      default: return 'border-slate-500 bg-slate-500/20 text-slate-300';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'fire': return '🔥';
      case 'engine': return '⚙️';
      case 'navigation': return '🧭';
      case 'security': return '🔒';
      default: return '⚠️';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: acknowledged ? 0.95 : [1, 1.02, 1]
      }}
      transition={{ 
        duration: 0.3,
        scale: { duration: 2, repeat: acknowledged ? 0 : Infinity }
      }}
      className={`border rounded-lg p-3 transition-all ${getAlarmColor()} ${
        acknowledged ? 'opacity-60' : 'shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getTypeIcon()}</div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{message}</span>
              {priority === 'critical' && !acknowledged && (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                >
                  CRITICAL
                </motion.div>
              )}
            </div>
            <div className="text-sm opacity-75">
              {timestamp.toLocaleTimeString()} | {type.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!acknowledged ? (
            <button
              onClick={onAcknowledge}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              ACK
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <button
                onClick={onReset}
                className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                RESET
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AlarmPanel() {
  const { state, triggerAlarm, playSound } = useShipSimulator();
  const [alarmVolume, setAlarmVolume] = useState(8);
  const [isMuted, setIsMuted] = useState(false);
  const [alarms, setAlarms] = useState([
    {
      id: '1',
      type: 'engine' as const,
      message: 'Engine Room High Temperature',
      priority: 'warning' as const,
      timestamp: new Date(),
      acknowledged: false,
    },
    {
      id: '2',
      type: 'navigation' as const,
      message: 'GPS Signal Lost',
      priority: 'critical' as const,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      acknowledged: true,
    },
  ]);

  const acknowledgeAlarm = (alarmId: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
    ));
    playSound('acknowledge');
  };

  const resetAlarm = (alarmId: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== alarmId));
  };

  const testAlarm = (type: string) => {
    const newAlarm = {
      id: Date.now().toString(),
      type: type as any,
      message: `Test ${type} alarm`,
      priority: 'warning' as const,
      timestamp: new Date(),
      acknowledged: false,
    };
    setAlarms(prev => [newAlarm, ...prev]);
    triggerAlarm(type, true);
    if (!isMuted) {
      playSound('alarm');
    }
  };

  const acknowledgeAll = () => {
    setAlarms(prev => prev.map(alarm => ({ ...alarm, acknowledged: true })));
    playSound('acknowledge-all');
  };

  const resetAll = () => {
    setAlarms(prev => prev.filter(alarm => alarm.acknowledged));
  };

  const activeAlarms = alarms.filter(alarm => !alarm.acknowledged);
  const criticalAlarms = activeAlarms.filter(alarm => alarm.priority === 'critical');

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${activeAlarms.length > 0 ? 'bg-red-600' : 'bg-slate-600'}`}>
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <span>Alarm System</span>
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              {activeAlarms.length} active alarm(s) | {criticalAlarms.length} critical
            </p>
          </div>

          {/* Global Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-600 hover:bg-slate-700'
              }`}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </button>

            {activeAlarms.length > 0 && (
              <>
                <button
                  onClick={acknowledgeAll}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  ACK ALL
                </button>
                <button
                  onClick={resetAll}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  RESET
                </button>
              </>
            )}
          </div>
        </div>

        {/* Volume Control */}
        <div className="mt-4 flex items-center space-x-4">
          <span className="text-slate-300 text-sm">Alarm Volume:</span>
          <input
            type="range"
            min="0"
            max="10"
            value={isMuted ? 0 : alarmVolume}
            onChange={(e) => setAlarmVolume(Number(e.target.value))}
            className="flex-1 max-w-32"
            disabled={isMuted}
          />
          <span className="text-slate-400 text-sm w-6">
            {isMuted ? '0' : alarmVolume}
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Alarms', value: alarms.length, color: 'text-slate-300' },
            { label: 'Active', value: activeAlarms.length, color: 'text-yellow-400' },
            { label: 'Critical', value: criticalAlarms.length, color: 'text-red-400' },
            { label: 'Acknowledged', value: alarms.filter(a => a.acknowledged).length, color: 'text-green-400' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-700 rounded-lg p-3 text-center"
            >
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-slate-400 text-sm">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Active Alarms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Active Alarms</h3>
            <div className="flex space-x-2">
              {activeAlarms.length > 0 && (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center space-x-2 bg-red-500/20 border border-red-500 px-3 py-1 rounded-lg"
                >
                  <Bell className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 text-sm">ALARMS ACTIVE</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {alarms.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-slate-400"
                >
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
                  <p>No alarms active</p>
                  <p className="text-sm">All systems normal</p>
                </motion.div>
              ) : (
                alarms.map((alarm) => (
                  <AlarmItem
                    key={alarm.id}
                    {...alarm}
                    onAcknowledge={() => acknowledgeAlarm(alarm.id)}
                    onReset={() => resetAlarm(alarm.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Test Controls */}
        <div className="mt-6 pt-6 border-t border-slate-600">
          <h3 className="text-white font-medium text-sm mb-3">Alarm Tests</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { type: 'fire', label: 'Fire Alarm', color: 'bg-red-600 hover:bg-red-700' },
              { type: 'engine', label: 'Engine Alarm', color: 'bg-orange-600 hover:bg-orange-700' },
              { type: 'navigation', label: 'Nav Alarm', color: 'bg-blue-600 hover:bg-blue-700' },
              { type: 'general', label: 'General Alarm', color: 'bg-purple-600 hover:bg-purple-700' },
            ].map((test) => (
              <button
                key={test.type}
                onClick={() => testAlarm(test.type)}
                className={`${test.color} text-white px-3 py-2 rounded-lg transition-colors text-sm`}
              >
                {test.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
