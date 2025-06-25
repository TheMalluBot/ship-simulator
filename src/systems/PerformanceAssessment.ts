// Performance Assessment System - Comprehensive Training Evaluation
export interface TrainingMistake {
  timestamp: number;
  action: string;
  expected: string;
  phase: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
}

export interface StepRecord {
  stepId: string;
  phase: string;
  duration: number;
  timestamp: number;
  efficiency: number;
}

export interface PerformanceMetrics {
  overall: number;
  breakdown: {
    efficiency: number;
    safety: number;
    time: number;
    procedure: number;
  };
  totalTime: number;
  mistakes: number;
  certification: {
    level: 'MASTER' | 'ADVANCED' | 'COMPETENT' | 'BASIC' | 'FAILED';
    badge: string;
    color: string;
    description: string;
  };
  improvements: string[];
  achievements: string[];
}

export class PerformanceAssessment {
  private startTime: number | null = null;
  private endTime: number | null = null;
  private mistakes: TrainingMistake[] = [];
  private steps: StepRecord[] = [];
  private targetTime: number = 600000; // 10 minutes default
  
  // Performance scores (0-100)
  private efficiencyScore: number = 100;
  private safetyScore: number = 100;
  private timeScore: number = 100;
  private proceduralScore: number = 100;

  constructor() {
    this.reset();
  }

  public startAssessment(): void {
    this.startTime = Date.now();
    this.mistakes = [];
    this.steps = [];
    this.efficiencyScore = 100;
    this.safetyScore = 100;
    this.timeScore = 100;
    this.proceduralScore = 100;
  }

  public endAssessment(): void {
    this.endTime = Date.now();
  }

  public reset(): void {
    this.startTime = null;
    this.endTime = null;
    this.mistakes = [];
    this.steps = [];
    this.efficiencyScore = 100;
    this.safetyScore = 100;
    this.timeScore = 100;
    this.proceduralScore = 100;
    this.targetTime = 600000; // 10 minutes
  }

  public setTargetTime(timeInSeconds: number): void {
    this.targetTime = timeInSeconds * 1000;
  }

  public recordMistake(action: string, expected: string, phase: string): void {
    const severity = this.determineMistakeSeverity(action, expected, phase);
    
    const mistake: TrainingMistake = {
      timestamp: Date.now(),
      action,
      expected,
      phase,
      severity,
      description: this.generateMistakeDescription(action, expected, phase, severity)
    };

    this.mistakes.push(mistake);
    this.updateScoresForMistake(mistake);
  }

  private determineMistakeSeverity(action: string, expected: string, phase: string): 'minor' | 'major' | 'critical' {
    // Critical mistakes - safety violations or major procedure violations
    const criticalKeywords = ['emergency', 'safety', 'main-engine', 'turning-gear', 'final-safety'];
    if (criticalKeywords.some(keyword => action.includes(keyword) || expected.includes(keyword))) {
      return 'critical';
    }

    // Major mistakes - important systems or significant procedure violations
    const majorKeywords = ['diesel-gen', 'steam-boiler', 'lubrication', 'cooling-system'];
    if (majorKeywords.some(keyword => action.includes(keyword) || expected.includes(keyword))) {
      return 'major';
    }

    // Everything else is minor
    return 'minor';
  }

  private generateMistakeDescription(action: string, expected: string, phase: string, severity: 'minor' | 'major' | 'critical'): string {
    const descriptions = {
      critical: [
        `Critical safety violation: Attempted ${action} without proper authorization`,
        `Major procedure violation: ${action} performed out of sequence`,
        `Safety interlock bypassed: ${action} attempted without prerequisites`
      ],
      major: [
        `Important system error: ${action} initiated incorrectly`,
        `Significant procedure deviation: Expected ${expected}, performed ${action}`,
        `System dependency violation: ${action} attempted without proper preparation`
      ],
      minor: [
        `Minor procedure error: ${action} not optimal for current phase`,
        `Timing issue: ${action} performed, but ${expected} was more appropriate`,
        `Sequence optimization: Consider ${expected} before ${action}`
      ]
    };

    const options = descriptions[severity];
    return options[Math.floor(Math.random() * options.length)];
  }

  private updateScoresForMistake(mistake: TrainingMistake): void {
    const penalties = {
      critical: { efficiency: 20, safety: 25, procedural: 30 },
      major: { efficiency: 15, safety: 15, procedural: 20 },
      minor: { efficiency: 5, safety: 5, procedural: 10 }
    };

    const penalty = penalties[mistake.severity];
    
    this.efficiencyScore = Math.max(0, this.efficiencyScore - penalty.efficiency);
    this.safetyScore = Math.max(0, this.safetyScore - penalty.safety);
    this.proceduralScore = Math.max(0, this.proceduralScore - penalty.procedural);
  }

  public recordStep(stepId: string, phase: string, duration: number): void {
    const step: StepRecord = {
      stepId,
      phase,
      duration,
      timestamp: Date.now(),
      efficiency: this.calculateStepEfficiency(stepId, duration)
    };

    this.steps.push(step);
  }

  private calculateStepEfficiency(stepId: string, duration: number): number {
    // Expected durations for different steps (in milliseconds)
    const expectedDurations: Record<string, number> = {
      'emergency-gen-start': 30000,
      'dg1-prep': 60000,
      'dg1-start': 30000,
      'dg2-start': 30000,
      'cooling-system-start': 45000,
      'steam-boiler-start': 45000,
      'air-system-start': 45000,
      'fuel-system-start': 45000,
      'lubrication-start': 60000,
      'turning-gear': 30000,
      'engine-cooling': 45000,
      'starting-air-prep': 45000,
      'final-safety-checks': 15000,
      'main-engine-first-fire': 20000,
      'engine-stabilization': 15000,
      'bridge-control-transfer': 10000
    };

    const expectedDuration = expectedDurations[stepId] || 30000;
    const efficiency = Math.max(0, Math.min(100, (expectedDuration / duration) * 100));
    
    return efficiency;
  }

  public updateTimeScore(elapsedTime: number): void {
    if (!this.targetTime) return;
    
    // Time score decreases if over target time, but doesn't penalize for being fast
    if (elapsedTime > this.targetTime) {
      const overTime = elapsedTime - this.targetTime;
      const timePenalty = Math.min(50, (overTime / this.targetTime) * 100);
      this.timeScore = Math.max(50, 100 - timePenalty);
    } else {
      // Bonus for completing under target time
      const timeBonus = Math.min(10, ((this.targetTime - elapsedTime) / this.targetTime) * 20);
      this.timeScore = Math.min(100, 100 + timeBonus);
    }
  }

  public getCurrentPerformance(): Partial<PerformanceMetrics> {
    const currentTime = Date.now();
    const elapsedTime = this.startTime ? currentTime - this.startTime : 0;
    
    const overall = (this.efficiencyScore + this.safetyScore + this.timeScore + this.proceduralScore) / 4;
    
    return {
      overall: Math.round(overall),
      breakdown: {
        efficiency: Math.round(this.efficiencyScore),
        safety: Math.round(this.safetyScore),
        time: Math.round(this.timeScore),
        procedure: Math.round(this.proceduralScore)
      },
      totalTime: elapsedTime,
      mistakes: this.mistakes.length
    };
  }

  public calculateFinalScore(): PerformanceMetrics {
    if (!this.startTime) {
      throw new Error('Assessment not started');
    }

    const endTime = this.endTime || Date.now();
    const totalTime = endTime - this.startTime;
    
    // Update final time score
    this.updateTimeScore(totalTime);
    
    // Calculate overall score
    const overall = (this.efficiencyScore + this.safetyScore + this.timeScore + this.proceduralScore) / 4;
    
    // Determine certification level
    const certification = this.determineCertificationLevel(overall);
    
    // Generate improvement suggestions
    const improvements = this.generateImprovementSuggestions();
    
    // Generate achievements
    const achievements = this.generateAchievements();

    return {
      overall: Math.round(overall),
      breakdown: {
        efficiency: Math.round(this.efficiencyScore),
        safety: Math.round(this.safetyScore),
        time: Math.round(this.timeScore),
        procedure: Math.round(this.proceduralScore)
      },
      totalTime,
      mistakes: this.mistakes.length,
      certification,
      improvements,
      achievements
    };
  }

  private determineCertificationLevel(score: number): PerformanceMetrics['certification'] {
    if (score >= 95) {
      return {
        level: 'MASTER',
        badge: '🏆',
        color: '#FFD700',
        description: 'Outstanding performance. Ready for command responsibility.'
      };
    } else if (score >= 85) {
      return {
        level: 'ADVANCED',
        badge: '🥇',
        color: '#C0C0C0',
        description: 'Excellent performance. Advanced maritime competency demonstrated.'
      };
    } else if (score >= 75) {
      return {
        level: 'COMPETENT',
        badge: '🥈',
        color: '#CD7F32',
        description: 'Good performance. Competent in basic maritime operations.'
      };
    } else if (score >= 65) {
      return {
        level: 'BASIC',
        badge: '🥉',
        color: '#B87333',
        description: 'Adequate performance. Basic understanding demonstrated.'
      };
    } else {
      return {
        level: 'FAILED',
        badge: '📚',
        color: '#808080',
        description: 'Additional training required. Review procedures and practice more.'
      };
    }
  }

  private generateImprovementSuggestions(): string[] {
    const suggestions: string[] = [];
    
    // Time-based suggestions
    if (this.timeScore < 70) {
      suggestions.push('Focus on improving procedure execution speed');
      suggestions.push('Review system startup sequences to reduce delays');
    }
    
    // Safety-based suggestions
    if (this.safetyScore < 80) {
      suggestions.push('Pay closer attention to safety prerequisites');
      suggestions.push('Always verify system interlocks before proceeding');
    }
    
    // Efficiency-based suggestions
    if (this.efficiencyScore < 75) {
      suggestions.push('Work on step sequencing optimization');
      suggestions.push('Practice system preparation procedures');
    }
    
    // Procedural suggestions
    if (this.proceduralScore < 80) {
      suggestions.push('Review maritime procedure standards');
      suggestions.push('Focus on proper step dependencies');
    }
    
    // Mistake-specific suggestions
    const criticalMistakes = this.mistakes.filter(m => m.severity === 'critical');
    if (criticalMistakes.length > 0) {
      suggestions.push('Critical safety violations require immediate attention');
      suggestions.push('Review emergency procedures and safety protocols');
    }
    
    const majorMistakes = this.mistakes.filter(m => m.severity === 'major');
    if (majorMistakes.length > 2) {
      suggestions.push('Focus on understanding system dependencies');
      suggestions.push('Practice procedure sequencing in training mode');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Excellent performance! Continue maintaining high standards');
      suggestions.push('Consider challenging yourself with higher difficulty modes');
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  private generateAchievements(): string[] {
    const achievements: string[] = [];
    
    // Perfect scores
    if (this.safetyScore === 100) {
      achievements.push('🛡️ Safety Champion - Zero safety violations');
    }
    
    if (this.efficiencyScore >= 95) {
      achievements.push('⚡ Speed Demon - Exceptional efficiency');
    }
    
    if (this.proceduralScore >= 95) {
      achievements.push('📋 Procedure Master - Flawless execution');
    }
    
    // Time achievements
    const totalTime = this.endTime ? this.endTime - (this.startTime || 0) : 0;
    if (totalTime < this.targetTime * 0.8) {
      achievements.push('🚀 Speed Runner - 20% under target time');
    }
    
    // Mistake achievements
    if (this.mistakes.length === 0) {
      achievements.push('🎯 Perfectionist - Zero mistakes');
    } else if (this.mistakes.length <= 1) {
      achievements.push('🎖️ Nearly Perfect - Minimal errors');
    }
    
    // Step achievements
    if (this.steps.length >= 15) {
      achievements.push('🔧 System Expert - All systems mastered');
    }
    
    // Difficulty achievements
    const stepEfficiencies = this.steps.map(s => s.efficiency);
    const avgEfficiency = stepEfficiencies.length > 0 
      ? stepEfficiencies.reduce((a, b) => a + b, 0) / stepEfficiencies.length 
      : 0;
      
    if (avgEfficiency >= 90) {
      achievements.push('⭐ Maritime Professional - Outstanding competency');
    }
    
    return achievements;
  }

  // Getters for current state
  public getStartTime(): number | null {
    return this.startTime;
  }

  public getElapsedTime(): number {
    if (!this.startTime) return 0;
    const endTime = this.endTime || Date.now();
    return endTime - this.startTime;
  }

  public getMistakes(): TrainingMistake[] {
    return [...this.mistakes];
  }

  public getSteps(): StepRecord[] {
    return [...this.steps];
  }

  public getMistakeCount(): number {
    return this.mistakes.length;
  }

  public getCriticalMistakeCount(): number {
    return this.mistakes.filter(m => m.severity === 'critical').length;
  }

  public getMajorMistakeCount(): number {
    return this.mistakes.filter(m => m.severity === 'major').length;
  }

  public getMinorMistakeCount(): number {
    return this.mistakes.filter(m => m.severity === 'minor').length;
  }

  // Export data for analysis
  public exportData(): any {
    return {
      assessment: {
        startTime: this.startTime,
        endTime: this.endTime,
        targetTime: this.targetTime,
        totalTime: this.getElapsedTime()
      },
      performance: this.getCurrentPerformance(),
      mistakes: this.mistakes,
      steps: this.steps,
      scores: {
        efficiency: this.efficiencyScore,
        safety: this.safetyScore,
        time: this.timeScore,
        procedural: this.proceduralScore
      }
    };
  }
}
