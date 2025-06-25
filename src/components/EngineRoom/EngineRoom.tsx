import React from 'react';
import { AcceleratedTrainingInterface } from './AcceleratedTrainingInterface';
import { useAcceleratedTraining } from '../../contexts/AcceleratedTrainingContext';

export function EngineRoom() {
  const { state } = useAcceleratedTraining();

  return (
    <div className="space-y-6 engine-room-bg min-h-screen p-4">
      {/* Main Accelerated Training Interface */}
      <AcceleratedTrainingInterface />
    </div>
  );
}
