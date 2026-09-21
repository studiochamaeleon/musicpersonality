'use client';

import { MUSICPersonality } from '@/types';
import { readBrowserStorage, removeBrowserStorage, writeBrowserStorage } from '@/lib/browserStorage';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

export interface UserAnalytics {
  sessionId: string;
  completedSurveys: number;
  personalityHistory: Array<{
    scores: MUSICPersonality;
    timestamp: number;
    topGenre: string;
  }>;
  genreInteractions: Record<string, {
    views: number;
    lastViewed: number;
  }>;
  shareCount: number;
  installPromptShown: boolean;
  installPromptAccepted: boolean;
}

class AnalyticsService {
  private sessionId: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeUserAnalytics();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private initializeUserAnalytics(): void {
    if (typeof window === 'undefined') return;
    const initialAnalytics: UserAnalytics = {
        sessionId: this.sessionId,
        completedSurveys: 0,
        personalityHistory: [],
        genreInteractions: {},
        shareCount: 0,
        installPromptShown: false,
        installPromptAccepted: false
    };
    try {
      const stored = readBrowserStorage('local', 'musicPersonalityAnalytics');
      if (stored) {
        const parsed = JSON.parse(stored) as UserAnalytics;
        if (Array.isArray(parsed.personalityHistory) && parsed.genreInteractions && typeof parsed.genreInteractions === 'object') {
          parsed.personalityHistory = parsed.personalityHistory.slice(-3);
          writeBrowserStorage('local', 'musicPersonalityAnalytics', JSON.stringify(parsed));
          return;
        }
      }
      writeBrowserStorage('local', 'musicPersonalityAnalytics', JSON.stringify(initialAnalytics));
    } catch {
      writeBrowserStorage('local', 'musicPersonalityAnalytics', JSON.stringify(initialAnalytics));
    }
  }

  public track(event: string, properties?: Record<string, unknown>): void {
    if (!this.isEnabled || typeof window === 'undefined') return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    // Store in local storage for privacy-friendly analytics
    const events = this.getStoredEvents();
    events.push(analyticsEvent);
    
    // Keep only last 100 events to prevent storage bloat
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    writeBrowserStorage('local', 'analyticsEvents', JSON.stringify(events));

    // Update user analytics
    this.updateUserAnalytics(event, properties);

  }

  private getStoredEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = readBrowserStorage('local', 'analyticsEvents');
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.slice(-100) : [];
    } catch {
      return [];
    }
  }

  private updateUserAnalytics(event: string, properties?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    
    const stored = readBrowserStorage('local', 'musicPersonalityAnalytics');
    if (!stored) return;
    
    let analytics: UserAnalytics;
    try {
      analytics = JSON.parse(stored) as UserAnalytics;
      if (!Array.isArray(analytics.personalityHistory) || !analytics.genreInteractions || typeof analytics.genreInteractions !== 'object') return;
    } catch {
      return;
    }
    
    switch (event) {
      case 'survey_completed':
        analytics.completedSurveys++;
        if (properties?.personalityScores && properties?.topGenre) {
          analytics.personalityHistory.push({
            scores: properties.personalityScores as MUSICPersonality,
            timestamp: Date.now(),
            topGenre: properties.topGenre as string
          });
          analytics.personalityHistory = analytics.personalityHistory.slice(-3);
        }
        break;
        
      case 'genre_viewed':
        if (properties?.genreName) {
          const genreName = properties.genreName as string;
          if (!analytics.genreInteractions[genreName]) {
            analytics.genreInteractions[genreName] = { views: 0, lastViewed: 0 };
          }
          analytics.genreInteractions[genreName].views++;
          analytics.genreInteractions[genreName].lastViewed = Date.now();
        }
        break;
        
      case 'result_shared':
        analytics.shareCount++;
        break;
        
      case 'pwa_prompt_shown':
        analytics.installPromptShown = true;
        break;
        
      case 'pwa_installed':
        analytics.installPromptAccepted = true;
        break;
    }
    
    writeBrowserStorage('local', 'musicPersonalityAnalytics', JSON.stringify(analytics));
  }

  public getAnalytics(): UserAnalytics | null {
    if (typeof window === 'undefined') return null;
    const stored = readBrowserStorage('local', 'musicPersonalityAnalytics');
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as UserAnalytics;
      return Array.isArray(parsed.personalityHistory) && parsed.genreInteractions && typeof parsed.genreInteractions === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  public getPopularGenres(): Array<{ genre: string; views: number }> {
    const analytics = this.getAnalytics();
    if (!analytics) return [];
    
    return Object.entries(analytics.genreInteractions)
      .map(([genre, data]) => ({ genre, views: data.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  public getPersonalityTrends(): Array<{ trait: keyof MUSICPersonality; avgScore: number }> {
    const analytics = this.getAnalytics();
    if (!analytics || analytics.personalityHistory.length === 0) return [];
    
    const traits: (keyof MUSICPersonality)[] = ['mellow', 'unpretentious', 'sophisticated', 'intense', 'contemporary'];
    
    return traits.map(trait => {
      const avgScore = analytics.personalityHistory.reduce((sum, entry) => sum + entry.scores[trait], 0) / analytics.personalityHistory.length;
      return { trait, avgScore };
    }).sort((a, b) => b.avgScore - a.avgScore);
  }

  public exportData(): string {
    const analytics = this.getAnalytics();
    const events = this.getStoredEvents();
    
    return JSON.stringify({
      analytics,
      events,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  public clearData(): void {
    if (typeof window === 'undefined') return;
    removeBrowserStorage('local', 'musicPersonalityAnalytics');
    removeBrowserStorage('local', 'analyticsEvents');
    console.log('Analytics data cleared');
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      writeBrowserStorage('local', 'analyticsEnabled', enabled.toString());
    }
  }

  public isAnalyticsEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = readBrowserStorage('local', 'analyticsEnabled');
    return stored === null ? true : stored === 'true';
  }

  public debugAnalytics(): void {
    if (typeof window === 'undefined') return;
    
    const analytics = this.getAnalytics();
    const events = this.getStoredEvents();
    const popularGenres = this.getPopularGenres();
    const personalityTrends = this.getPersonalityTrends();
    
    console.group('📊 Music Personality Analytics Debug');
    console.log('User Analytics:', analytics);
    console.log('Recent Events:', events.slice(-10));
    console.log('Popular Genres:', popularGenres);
    console.log('Personality Trends:', personalityTrends);
    console.groupEnd();
  }
}

// Singleton instance
export const analytics = new AnalyticsService();
