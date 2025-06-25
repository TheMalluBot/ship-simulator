import React, { useState } from 'react';
import { Radio, Satellite, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { useShipSimulator } from '../../contexts/ShipSimulatorContext';
import { motion } from 'framer-motion';

interface VHFChannelProps {
  channel: number;
  name: string;
  isActive: boolean;
  onClick: () => void;
  priority?: 'emergency' | 'commercial' | 'port';
}

function VHFChannel({ channel, name, isActive, onClick, priority }: VHFChannelProps) {
  const getChannelColor = () => {
    if (priority === 'emergency') return 'text-red-400 bg-red-500/20 border-red-500';
    if (priority === 'port') return 'text-blue-400 bg-blue-500/20 border-blue-500';
    return 'text-slate-300 bg-slate-700 border-slate-600';
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-2 rounded border text-left transition-all ${
        isActive 
          ? 'bg-green-600 border-green-500 text-white' 
          : getChannelColor()
      } hover:opacity-80`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-sm">CH {channel.toString().padStart(2, '0')}</div>
          <div className="text-xs opacity-75">{name}</div>
        </div>
        {isActive && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
        )}
      </div>
    </motion.button>
  );
}

export function CommunicationPanel() {
  const { state, playSound } = useShipSimulator();
  const [activeVHFChannel, setActiveVHFChannel] = useState(16);
  const [squelchLevel, setSquelchLevel] = useState(3);
  const [volumeLevel, setVolumeLevel] = useState(7);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedAISTarget, setSelectedAISTarget] = useState<string | null>(null);

  const vhfChannels = [
    { channel: 16, name: 'Distress/Safety', priority: 'emergency' as const },
    { channel: 13, name: 'Bridge-to-Bridge', priority: 'commercial' as const },
    { channel: 12, name: 'Port Operations', priority: 'port' as const },
    { channel: 14, name: 'Port Operations', priority: 'port' as const },
    { channel: 6, name: 'Safety/SAR', priority: 'emergency' as const },
    { channel: 8, name: 'Commercial', priority: 'commercial' as const },
    { channel: 9, name: 'Commercial', priority: 'commercial' as const },
    { channel: 11, name: 'Commercial', priority: 'commercial' as const },
  ];

  const handleChannelChange = (channel: number) => {
    setActiveVHFChannel(channel);
    playSound('radio-static');
  };

  const nearbyVessels = [
    {
      mmsi: '987654321',
      name: 'MERCHANT VESSEL',
      callSign: 'ABCD1',
      distance: 2.5,
      bearing: 45,
      course: 180,
      speed: 12,
    },
    {
      mmsi: '123789456',
      name: 'FISHING VESSEL',
      callSign: 'FV123',
      distance: 5.8,
      bearing: 120,
      course: 90,
      speed: 8,
    },
    {
      mmsi: '555666777',
      name: 'CONTAINER SHIP',
      callSign: 'CS789',
      distance: 8.2,
      bearing: 280,
      course: 45,
      speed: 15,
    },
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-600">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <span>Communications</span>
        </h2>
        <p className="text-slate-300 text-sm mt-1">VHF Radio & AIS System</p>
      </div>

      <div className="p-4 space-y-6">
        {/* VHF Radio */}
        <div className="space-y-4">
          <h3 className="text-white font-medium text-sm flex items-center space-x-2">
            <Radio className="h-4 w-4 text-blue-400" />
            <span>VHF Radio</span>
          </h3>

          {/* Current Channel Display */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="text-center mb-4">
              <div className="text-3xl font-mono text-white mb-1">
                CH {activeVHFChannel.toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-slate-300">
                {vhfChannels.find(ch => ch.channel === activeVHFChannel)?.name}
              </div>
            </div>

            {/* Radio Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Volume</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 rounded ${isMuted ? 'bg-red-600' : 'bg-slate-600'}`}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 text-white" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-white" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={isMuted ? 0 : volumeLevel}
                    onChange={(e) => setVolumeLevel(Number(e.target.value))}
                    className="flex-1"
                    disabled={isMuted}
                  />
                  <span className="text-xs text-slate-400 w-6">
                    {isMuted ? '0' : volumeLevel}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-sm mb-2 block">Squelch</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={squelchLevel}
                    onChange={(e) => setSquelchLevel(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs text-slate-400 w-6">{squelchLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Selection */}
          <div className="grid grid-cols-2 gap-2">
            {vhfChannels.map((channel) => (
              <VHFChannel
                key={channel.channel}
                channel={channel.channel}
                name={channel.name}
                isActive={activeVHFChannel === channel.channel}
                onClick={() => handleChannelChange(channel.channel)}
                priority={channel.priority}
              />
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-700 p-3 rounded-lg">
            <h4 className="text-white font-medium text-sm mb-2">Recent Activity</h4>
            <div className="space-y-1 max-h-20 overflow-y-auto text-xs">
              <div className="text-slate-300">
                <span className="text-green-400 font-mono">20:15</span> CH16: Safety broadcast received
              </div>
              <div className="text-slate-300">
                <span className="text-blue-400 font-mono">20:12</span> CH13: MERCHANT VESSEL calling
              </div>
              <div className="text-slate-300">
                <span className="text-orange-400 font-mono">20:08</span> CH12: Port control update
              </div>
            </div>
          </div>
        </div>

        {/* AIS System */}
        <div className="space-y-4">
          <h3 className="text-white font-medium text-sm flex items-center space-x-2">
            <Satellite className="h-4 w-4 text-green-400" />
            <span>AIS (Automatic Identification System)</span>
          </h3>

          {/* Own Ship Information */}
          <div className="bg-slate-700 rounded-lg p-3">
            <h4 className="text-white font-medium text-sm mb-2">Own Ship Data</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-300">MMSI:</span>
                <span className="text-white ml-2 font-mono">123456789</span>
              </div>
              <div>
                <span className="text-slate-300">Call Sign:</span>
                <span className="text-white ml-2 font-mono">SHIP01</span>
              </div>
              <div>
                <span className="text-slate-300">Vessel Name:</span>
                <span className="text-white ml-2">TRAINING VESSEL</span>
              </div>
              <div>
                <span className="text-slate-300">Type:</span>
                <span className="text-white ml-2">Cargo</span>
              </div>
            </div>
          </div>

          {/* Nearby Vessels */}
          <div className="bg-slate-700 rounded-lg p-3">
            <h4 className="text-white font-medium text-sm mb-2">Nearby Vessels</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {nearbyVessels.map((vessel) => (
                <motion.div
                  key={vessel.mmsi}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedAISTarget(
                    selectedAISTarget === vessel.mmsi ? null : vessel.mmsi
                  )}
                  className={`p-2 rounded border cursor-pointer transition-all ${
                    selectedAISTarget === vessel.mmsi
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">{vessel.name}</div>
                      <div className="text-slate-300 text-xs">
                        {vessel.callSign} | {vessel.distance.toFixed(1)} nm
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-400 text-sm">{vessel.bearing}°</div>
                      <div className="text-slate-300 text-xs">{vessel.speed} kts</div>
                    </div>
                  </div>
                  
                  {selectedAISTarget === vessel.mmsi && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-2 pt-2 border-t border-slate-600"
                    >
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">MMSI:</span>
                          <span className="text-white ml-1 font-mono">{vessel.mmsi}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Course:</span>
                          <span className="text-white ml-1">{vessel.course}°</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Communications */}
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-red-400" />
            <span>Emergency</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              MAYDAY
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              PAN-PAN
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              SECURITÉ
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              DSC Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
