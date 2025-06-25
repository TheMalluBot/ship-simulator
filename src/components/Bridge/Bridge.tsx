import React from 'react';
import { NavigationPanel } from './NavigationPanel';
import { RadarDisplay } from './RadarDisplay';
import { HelmControls } from './HelmControls';
import { CommunicationPanel } from './CommunicationPanel';
import { EngineRoomTelegraph } from './EngineRoomTelegraph';
import { AlarmPanel } from './AlarmPanel';

export function Bridge() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Navigation Panel */}
      <div className="xl:col-span-2">
        <NavigationPanel />
      </div>

      {/* Radar Display */}
      <div>
        <RadarDisplay />
      </div>

      {/* Helm Controls */}
      <div>
        <HelmControls />
      </div>

      {/* Engine Room Telegraph */}
      <div>
        <EngineRoomTelegraph />
      </div>

      {/* Communication Panel */}
      <div>
        <CommunicationPanel />
      </div>

      {/* Alarm Panel */}
      <div className="lg:col-span-2 xl:col-span-3">
        <AlarmPanel />
      </div>
    </div>
  );
}
