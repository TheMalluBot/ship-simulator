import React, { useState } from 'react';
import { Zap, ArrowUp, ArrowDown, Square, Bell } from 'lucide-react';
import { useShipSimulator } from '../../contexts/ShipSimulatorContext';
import { motion } from 'framer-motion';

interface TelegraphOrderProps {
  order: string;
  isActive: boolean;
  isResponse: boolean;
  onClick: () => void;
  color: string;
}

function TelegraphOrder({ order, isActive, isResponse, onClick, color }: TelegraphOrderProps) {
  const getIcon = () => {
    if (order.includes('ahead')) return ArrowUp;
    if (order.includes('astern')) return ArrowDown;
    return Square;
  };

  const Icon = getIcon();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative p-3 rounded-lg border-2 transition-all ${
        isActive
          ? `${color} border-current`
          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
      }`}
    >
      <div className="flex flex-col items-center space-y-1">
        <Icon className="h-6 w-6" />
        <span className="text-xs font-medium capitalize">
          {order.replace('_', ' ')}
        </span>
      </div>
      
      {isResponse && isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
        >
          <Bell className="h-2 w-2 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}

export function EngineRoomTelegraph() {
  const { state, sendTelegraphOrder, playSound } = useShipSimulator();
  const { telegraph } = state.bridge;
  const [lastOrderTime, setLastOrderTime] = useState<Date | null>(null);

  const telegraphOrders = [
    { 
      order: 'full_astern', 
      label: 'Full Astern', 
      color: 'bg-red-600 text-white border-red-500',
      speed: -100 
    },
    { 
      order: 'half_astern', 
      label: 'Half Astern', 
      color: 'bg-red-500 text-white border-red-400',
      speed: -50 
    },
    { 
      order: 'slow_astern', 
      label: 'Slow Astern', 
      color: 'bg-red-400 text-white border-red-300',
      speed: -25 
    },
    { 
      order: 'stop', 
      label: 'Stop', 
      color: 'bg-yellow-600 text-white border-yellow-500',
      speed: 0 
    },
    { 
      order: 'slow_ahead', 
      label: 'Slow Ahead', 
      color: 'bg-green-400 text-white border-green-300',
      speed: 25 
    },
    { 
      order: 'half_ahead', 
      label: 'Half Ahead', 
      color: 'bg-green-500 text-white border-green-400',
      speed: 50 
    },
    { 
      order: 'full_ahead', 
      label: 'Full Ahead', 
      color: 'bg-green-600 text-white border-green-500',
      speed: 100 
    },
  ];

  const handleTelegraphOrder = (order: string) => {
    sendTelegraphOrder(order);
    setLastOrderTime(new Date());
    playSound('telegraph-bell');
  };

  const isOrderActive = (order: string) => telegraph.bridgeOrder === order;
  const isResponseActive = (order: string) => telegraph.engineResponse === order;
  const isAnswered = telegraph.bridgeOrder === telegraph.engineResponse;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-600">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <div className="bg-orange-600 p-2 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span>Engine Telegraph</span>
        </h2>
        <p className="text-slate-300 text-sm mt-1">Bridge to Engine Room</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Telegraph Display */}
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <h3 className="text-slate-300 text-sm mb-2">Bridge Order</h3>
              <div className={`text-xl font-bold p-3 rounded-lg ${
                telegraphOrders.find(o => o.order === telegraph.bridgeOrder)?.color || 'bg-slate-600 text-white'
              }`}>
                {telegraph.bridgeOrder.replace('_', ' ').toUpperCase()}
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-slate-300 text-sm mb-2">Engine Response</h3>
              <div className={`text-xl font-bold p-3 rounded-lg relative ${
                telegraphOrders.find(o => o.order === telegraph.engineResponse)?.color || 'bg-slate-600 text-white'
              }`}>
                {telegraph.engineResponse.replace('_', ' ').toUpperCase()}
                {isAnswered && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Bell className="h-3 w-3 text-white" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="text-center">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isAnswered 
                ? 'bg-green-500/20 border border-green-500 text-green-400' 
                : 'bg-yellow-500/20 border border-yellow-500 text-yellow-400'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                isAnswered ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'
              }`} />
              <span className="text-sm font-medium">
                {isAnswered ? 'Order Acknowledged' : 'Awaiting Response'}
              </span>
            </div>
          </div>
        </div>

        {/* Telegraph Controls */}
        <div className="space-y-4">
          <h3 className="text-white font-medium text-sm">Telegraph Orders</h3>
          <div className="grid grid-cols-2 gap-3">
            {telegraphOrders.map((item) => (
              <TelegraphOrder
                key={item.order}
                order={item.order}
                isActive={isOrderActive(item.order)}
                isResponse={isResponseActive(item.order)}
                onClick={() => handleTelegraphOrder(item.order)}
                color={item.color}
              />
            ))}
          </div>
        </div>

        {/* Quick Commands */}
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">Quick Commands</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleTelegraphOrder('stop')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Square className="h-4 w-4" />
              <span>Emergency Stop</span>
            </button>
            
            <button
              onClick={() => handleTelegraphOrder('slow_ahead')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowUp className="h-4 w-4" />
              <span>Start Engines</span>
            </button>
          </div>
        </div>

        {/* Order Log */}
        <div className="bg-slate-700 p-3 rounded-lg">
          <h3 className="text-white font-medium text-sm mb-3">Recent Orders</h3>
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {lastOrderTime && (
              <div className="text-sm text-slate-300">
                <span className="font-mono">{lastOrderTime.toLocaleTimeString()}</span>
                {' - '}
                <span className="text-blue-400">
                  Bridge ordered: {telegraph.bridgeOrder.replace('_', ' ')}
                </span>
              </div>
            )}
            <div className="text-sm text-slate-300">
              <span className="font-mono">20:12:09</span>
              {' - '}
              <span className="text-green-400">Engine ready for maneuvering</span>
            </div>
            <div className="text-sm text-slate-300">
              <span className="font-mono">20:11:45</span>
              {' - '}
              <span className="text-yellow-400">Startup procedure completed</span>
            </div>
          </div>
        </div>

        {/* Engine Performance */}
        <div className="bg-slate-700 p-3 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-slate-300 text-sm">Engine RPM</div>
              <div className="text-white font-mono text-lg">
                {state.engineRoom.systems.mainEngine.rpm}
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-300 text-sm">Engine Load</div>
              <div className="text-white font-mono text-lg">
                {state.engineRoom.systems.auxiliaryEngine.load}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-300 text-sm">Response Time</div>
              <div className="text-green-400 font-mono text-lg">1.2s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
