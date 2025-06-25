// Maritime Audio System - Authentic Ship Sounds and Feedback
export class MaritimeAudioSystem {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = true;
  private sounds: Map<string, AudioBuffer> = new Map();
  private activeSounds: Map<string, AudioBufferSourceNode> = new Map();

  constructor() {
    this.initializeAudioContext();
    this.generateMaritimeSounds();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.isEnabled = false;
    }
  }

  private generateMaritimeSounds() {
    if (!this.audioContext) return;

    // Generate various maritime sounds using Web Audio API
    this.sounds.set('generator-start', this.generateGeneratorStart());
    this.sounds.set('diesel-engine-start', this.generateDieselEngineStart());
    this.sounds.set('pump-start', this.generatePumpStart());
    this.sounds.set('boiler-ignition', this.generateBoilerIgnition());
    this.sounds.set('compressor-start', this.generateCompressorStart());
    this.sounds.set('turning-gear', this.generateTurningGear());
    this.sounds.set('main-engine-start', this.generateMainEngineStart());
    this.sounds.set('synchronization', this.generateSynchronization());
    this.sounds.set('fuel-heating', this.generateFuelHeating());
    this.sounds.set('oil-heating', this.generateOilHeating());
    this.sounds.set('lube-pump', this.generateLubePump());
    this.sounds.set('cooling-circulation', this.generateCoolingCirculation());
    this.sounds.set('air-test', this.generateAirTest());
    this.sounds.set('safety-check', this.generateSafetyCheck());
    this.sounds.set('engine-stable', this.generateEngineStable());
    this.sounds.set('control-transfer', this.generateControlTransfer());
    this.sounds.set('systems-check', this.generateSystemsCheck());
    this.sounds.set('success', this.generateSuccessChime());
    this.sounds.set('error', this.generateErrorBeep());
    this.sounds.set('button-click', this.generateButtonClick());
    this.sounds.set('alarm', this.generateAlarmTone());
  }

  private generateGeneratorStart(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 3;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Simulate emergency generator starting sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const rampUp = Math.min(1, t / 2);
      const engineFreq = 20 + rampUp * 40;
      
      // Engine rumble with random variations
      let sample = Math.sin(2 * Math.PI * engineFreq * t) * 0.6;
      sample += Math.sin(2 * Math.PI * engineFreq * 2 * t) * 0.3;
      sample += (Math.random() - 0.5) * 0.2 * rampUp;
      
      data[i] = sample * rampUp * 0.5;
    }

    return buffer;
  }

  private generateDieselEngineStart(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 4;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Simulate large diesel engine starting
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const rampUp = Math.min(1, t / 3);
      
      // Deep diesel rumble
      const baseFreq = 15 + rampUp * 25;
      let sample = Math.sin(2 * Math.PI * baseFreq * t) * 0.7;
      sample += Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.4;
      sample += Math.sin(2 * Math.PI * baseFreq * 0.5 * t) * 0.3;
      
      // Add compression cycles
      const compressionRate = 30 * rampUp;
      sample += Math.sin(2 * Math.PI * compressionRate * t) * 0.2;
      
      // Random combustion pops
      if (Math.random() < 0.02 * rampUp) {
        sample += (Math.random() - 0.5) * 0.8;
      }
      
      data[i] = sample * rampUp * 0.4;
    }

    return buffer;
  }

  private generatePumpStart(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 2;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Simulate pump motor starting
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const rampUp = Math.min(1, t / 1.5);
      
      // Motor whine
      const motorFreq = 200 + rampUp * 300;
      let sample = Math.sin(2 * Math.PI * motorFreq * t) * 0.4;
      
      // Pump cycling
      const pumpRate = 8 * rampUp;
      sample += Math.sin(2 * Math.PI * pumpRate * t) * 0.3;
      
      // Water flow sound
      sample += (Math.random() - 0.5) * 0.1 * rampUp;
      
      data[i] = sample * rampUp * 0.5;
    }

    return buffer;
  }

  private generateBoilerIgnition(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 3;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Simulate boiler ignition and flame
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Initial ignition spark (first 0.5 seconds)
      let sample = 0;
      if (t < 0.5) {
        sample = (Math.random() - 0.5) * 0.8 * (0.5 - t) * 2;
      }
      
      // Flame roar (after 0.5 seconds)
      if (t > 0.5) {
        const flameIntensity = Math.min(1, (t - 0.5) / 1);
        sample = (Math.random() - 0.5) * 0.6 * flameIntensity;
        
        // Add low frequency rumble
        sample += Math.sin(2 * Math.PI * 30 * t) * 0.3 * flameIntensity;
        sample += Math.sin(2 * Math.PI * 60 * t) * 0.2 * flameIntensity;
      }
      
      data[i] = sample * 0.6;
    }

    return buffer;
  }

  private generateCompressorStart(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 3;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Simulate air compressor starting
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const rampUp = Math.min(1, t / 2);
      
      // Compressor motor
      const motorFreq = 100 + rampUp * 200;
      let sample = Math.sin(2 * Math.PI * motorFreq * t) * 0.5;
      
      // Air compression cycles
      const compressionRate = 4 + rampUp * 6;
      sample += Math.sin(2 * Math.PI * compressionRate * t) * 0.4;
      
      // High-frequency air sound
      sample += Math.sin(2 * Math.PI * 1000 * t) * 0.1 * rampUp;
      
      data[i] = sample * rampUp * 0.4;
    }

    return buffer;
  }

  private generateTurningGear(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 5;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Simulate turning gear operation
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Slow mechanical turning
      const turnRate = 0.5; // Very slow turn
      let sample = Math.sin(2 * Math.PI * turnRate * t) * 0.3;
      
      // Gear meshing sounds
      const gearFreq = 50;
      sample += Math.sin(2 * Math.PI * gearFreq * t) * 0.2;
      
      // Metal-on-metal sounds
      if (Math.sin(2 * Math.PI * turnRate * t) > 0.8) {
        sample += (Math.random() - 0.5) * 0.1;
      }
      
      data[i] = sample * 0.3;
    }

    return buffer;
  }

  private generateMainEngineStart(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 6;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Simulate main engine startup sequence
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      let sample = 0;
      
      // Air starting phase (0-2 seconds)
      if (t < 2) {
        sample = (Math.random() - 0.5) * 0.6 * (2 - t) / 2;
        sample += Math.sin(2 * Math.PI * 20 * t) * 0.3;
      }
      
      // First combustion (2-4 seconds)
      if (t >= 2 && t < 4) {
        const intensity = (t - 2) / 2;
        const engineFreq = 10 + intensity * 15;
        sample = Math.sin(2 * Math.PI * engineFreq * t) * 0.7 * intensity;
        
        // Combustion pops
        if (Math.random() < 0.05) {
          sample += (Math.random() - 0.5) * 0.5;
        }
      }
      
      // Stable running (4-6 seconds)
      if (t >= 4) {
        const engineFreq = 25; // 25 Hz = about 1500 RPM for 6-cylinder
        sample = Math.sin(2 * Math.PI * engineFreq * t) * 0.6;
        sample += Math.sin(2 * Math.PI * engineFreq * 2 * t) * 0.3;
        sample += Math.sin(2 * Math.PI * engineFreq * 0.5 * t) * 0.2;
        
        // Add some randomness for realism
        sample += (Math.random() - 0.5) * 0.1;
      }
      
      data[i] = sample * 0.5;
    }

    return buffer;
  }

  private generateSynchronization(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 2;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Simulate generator synchronization sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Electrical synchronization tone
      let sample = Math.sin(2 * Math.PI * 400 * t) * 0.3;
      
      // Beat frequency effect during sync
      const beatFreq = 2 - t; // Beat frequency decreases as sync improves
      sample *= (1 + 0.5 * Math.sin(2 * Math.PI * beatFreq * t));
      
      // Click when synchronized (at the end)
      if (t > 1.8) {
        sample += (Math.random() - 0.5) * 0.2;
      }
      
      data[i] = sample * 0.4;
    }

    return buffer;
  }

  private generateFuelHeating(): AudioBuffer {
    return this.generateSteadyHum(200, 3, 0.3);
  }

  private generateOilHeating(): AudioBuffer {
    return this.generateSteadyHum(150, 2, 0.3);
  }

  private generateLubePump(): AudioBuffer {
    return this.generatePumpStart();
  }

  private generateCoolingCirculation(): AudioBuffer {
    return this.generateSteadyHum(180, 2, 0.4);
  }

  private generateAirTest(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 1;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Quick air release sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-t * 3);
      
      let sample = (Math.random() - 0.5) * 0.8 * decay;
      sample += Math.sin(2 * Math.PI * 2000 * t) * 0.3 * decay;
      
      data[i] = sample;
    }

    return buffer;
  }

  private generateSafetyCheck(): AudioBuffer {
    return this.generateSuccessChime();
  }

  private generateEngineStable(): AudioBuffer {
    return this.generateSteadyHum(25, 2, 0.4);
  }

  private generateControlTransfer(): AudioBuffer {
    return this.generateSuccessChime();
  }

  private generateSystemsCheck(): AudioBuffer {
    return this.generateButtonClick();
  }

  private generateSteadyHum(frequency: number, duration: number, amplitude: number): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const rampUp = Math.min(1, t / 0.5);
      const rampDown = Math.min(1, (duration - t) / 0.5);
      const envelope = rampUp * rampDown;
      
      let sample = Math.sin(2 * Math.PI * frequency * t) * amplitude;
      sample += Math.sin(2 * Math.PI * frequency * 2 * t) * amplitude * 0.3;
      sample += (Math.random() - 0.5) * 0.1 * amplitude;
      
      data[i] = sample * envelope;
    }

    return buffer;
  }

  private generateSuccessChime(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 0.8;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Pleasant success chime
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-t * 2);
      
      let sample = Math.sin(2 * Math.PI * 880 * t) * 0.5 * decay; // A5
      sample += Math.sin(2 * Math.PI * 1100 * t) * 0.3 * decay; // C#6
      sample += Math.sin(2 * Math.PI * 1320 * t) * 0.2 * decay; // E6
      
      data[i] = sample;
    }

    return buffer;
  }

  private generateErrorBeep(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 0.5;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Harsh error beep
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-t * 4);
      
      let sample = Math.sin(2 * Math.PI * 440 * t) * 0.6 * decay; // A4
      sample += Math.sin(2 * Math.PI * 220 * t) * 0.4 * decay; // A3
      
      // Add some harshness
      sample = Math.sign(sample) * Math.pow(Math.abs(sample), 0.7);
      
      data[i] = sample;
    }

    return buffer;
  }

  private generateButtonClick(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 0.1;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Sharp click sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-t * 50);
      
      let sample = (Math.random() - 0.5) * 0.5 * decay;
      sample += Math.sin(2 * Math.PI * 2000 * t) * 0.3 * decay;
      
      data[i] = sample;
    }

    return buffer;
  }

  private generateAlarmTone(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const duration = 2;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Maritime alarm pattern
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Alternating frequency pattern
      const pattern = Math.floor(t * 4) % 2;
      const freq = pattern === 0 ? 800 : 1000;
      
      let sample = Math.sin(2 * Math.PI * freq * t) * 0.6;
      
      // Add urgency with square wave distortion
      sample = Math.sign(sample) * Math.pow(Math.abs(sample), 0.5);
      
      data[i] = sample;
    }

    return buffer;
  }

  // Public methods
  public playSound(soundName: string, volume: number = 1): void {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const soundBuffer = this.sounds.get(soundName);
    if (!soundBuffer) {
      console.warn(`Sound '${soundName}' not found`);
      return;
    }

    // Stop any previous instance of this sound
    const previousSound = this.activeSounds.get(soundName);
    if (previousSound) {
      try {
        previousSound.stop();
      } catch (e) {
        // Sound might already be stopped
      }
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = soundBuffer;
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    source.start();
    this.activeSounds.set(soundName, source);
    
    source.onended = () => {
      this.activeSounds.delete(soundName);
    };

    console.log(`Playing sound: ${soundName}`);
  }

  public playSuccess(): void {
    this.playSound('success', 0.7);
  }

  public playError(): void {
    this.playSound('error', 0.8);
  }

  public playButtonClick(): void {
    this.playSound('button-click', 0.5);
  }

  public playAlarm(): void {
    this.playSound('alarm', 0.9);
  }

  public stopSound(soundName: string): void {
    const sound = this.activeSounds.get(soundName);
    if (sound) {
      try {
        sound.stop();
      } catch (e) {
        // Sound might already be stopped
      }
      this.activeSounds.delete(soundName);
    }
  }

  public stopAll(): void {
    this.activeSounds.forEach((sound, name) => {
      try {
        sound.stop();
      } catch (e) {
        // Sound might already be stopped
      }
    });
    this.activeSounds.clear();
  }

  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioContext?.currentTime || 0);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  public isAudioEnabled(): boolean {
    return this.isEnabled && this.audioContext !== null;
  }
}
