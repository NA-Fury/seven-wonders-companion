// utils/errorHandling.ts - Comprehensive error handling utilities
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Error types for the app
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  STORAGE = 'STORAGE',
  CALCULATION = 'CALCULATION',
  USER_INPUT = 'USER_INPUT',
  SYSTEM = 'SYSTEM',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: number;
  context?: Record<string, any>;
  stack?: string;
}

// Error handling class
class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Log error internally
  private logError(error: AppError): void {
    this.errorLog.unshift(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Persist error log
    this.persistErrorLog();

    // Log to console in development
    if (__DEV__) {
      console.error('App Error:', error);
    }
  }

  // Handle different types of errors
  handleError(
    type: ErrorType,
    message: string,
    details?: string,
    context?: Record<string, any>,
    showAlert = true
  ): AppError {
    const error: AppError = {
      type,
      message,
      details,
      timestamp: Date.now(),
      context,
      stack: new Error().stack,
    };

    this.logError(error);

    if (showAlert) {
      this.showErrorAlert(error);
    }

    return error;
  }

  // Show user-friendly error alerts
  private showErrorAlert(error: AppError): void {
    const userMessage = this.getUserFriendlyMessage(error);
    
    Alert.alert(
      'Error',
      userMessage,
      [
        { text: 'OK', style: 'cancel' },
        {
          text: 'Report',
          onPress: () => this.reportError(error),
        },
      ]
    );
  }

  // Convert technical errors to user-friendly messages
  private getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return error.message; // Validation messages are already user-friendly
      case ErrorType.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      case ErrorType.STORAGE:
        return 'Unable to save or load data. Please ensure you have enough storage space.';
      case ErrorType.CALCULATION:
        return 'Error calculating scores. Please check your inputs and try again.';
      case ErrorType.USER_INPUT:
        return error.message || 'Invalid input. Please correct and try again.';
      case ErrorType.SYSTEM:
        return 'An unexpected error occurred. Please restart the app and try again.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  }

  // Report error (could integrate with crash reporting service)
  private reportError(error: AppError): void {
    // In a real app, you might send this to a service like Sentry, Bugsnag, etc.
    console.log('Reporting error:', error);
    
    // For now, just show a toast that it was reported
    Alert.alert(
      'Error Reported',
      'Thank you for reporting this issue. We will investigate and fix it soon.',
      [{ text: 'OK' }]
    );
  }

  // Persist error log to storage
  private async persistErrorLog(): Promise<void> {
    try {
      await AsyncStorage.setItem('errorLog', JSON.stringify(this.errorLog));
    } catch (e) {
      console.warn('Failed to persist error log:', e);
    }
  }

  // Load error log from storage
  async loadErrorLog(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('errorLog');
      if (stored) {
        this.errorLog = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load error log:', e);
    }
  }

  // Get recent errors for debugging
  getRecentErrors(count = 10): AppError[] {
    return this.errorLog.slice(0, count);
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
    AsyncStorage.removeItem('errorLog');
  }

  // Validate and handle async operations
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    errorType: ErrorType,
    errorMessage: string,
    context?: Record<string, any>
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(
        errorType,
        errorMessage,
        error instanceof Error ? error.message : String(error),
        context
      );
      return null;
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Validation utilities
export class ValidationUtils {
  // Player name validation
  static validatePlayerName(name: string): string | null {
    if (!name || typeof name !== 'string') {
      return 'Player name is required';
    }
    
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return 'Player name must be at least 2 characters long';
    }
    
    if (trimmed.length > 20) {
      return 'Player name must be less than 20 characters';
    }
    
    if (!/^[a-zA-Z0-9\s\-_'.]+$/.test(trimmed)) {
      return 'Player name contains invalid characters';
    }
    
    return null;
  }

  // Score validation
  static validateScore(score: number, min = -10, max = 200): string | null {
    if (typeof score !== 'number' || isNaN(score)) {
      return 'Score must be a valid number';
    }
    
    if (score < min) {
      return `Score cannot be less than ${min}`;
    }
    
    if (score > max) {
      return `Score cannot be greater than ${max}`;
    }
    
    if (!Number.isInteger(score)) {
      return 'Score must be a whole number';
    }
    
    return null;
  }

  // Game setup validation
  static validateGameSetup(players: any[], expansions: any): string[] {
    const errors: string[] = [];
    
    // Validate player count
    if (!players || players.length < 2) {
      errors.push('At least 2 players are required');
    }
    
    if (players && players.length > 7) {
      errors.push('Maximum 7 players allowed');
    }
    
    // Validate player names
    if (players) {
      const names = players.map(p => p.name?.toLowerCase?.().trim()).filter(Boolean);
      const uniqueNames = new Set(names);
      if (names.length !== uniqueNames.size) {
        errors.push('All player names must be unique');
      }
      
      players.forEach((player, index) => {
        const nameError = ValidationUtils.validatePlayerName(player.name);
        if (nameError) {
          errors.push(`Player ${index + 1}: ${nameError}`);
        }
      });
    }
    
    // Validate expansions
    if (expansions) {
      const expansionCount = Object.values(expansions).filter(Boolean).length;
      if (expansionCount > 4) {
        errors.push('Too many expansions selected');
      }
    }
    
    return errors;
  }

  // Science symbols validation
  static validateScienceSymbols(compass: number, tablet: number, gear: number): string | null {
    const symbols = [compass, tablet, gear];
    
    for (const symbol of symbols) {
      if (typeof symbol !== 'number' || isNaN(symbol)) {
        return 'Science symbols must be valid numbers';
      }
      
      if (symbol < 0) {
        return 'Science symbols cannot be negative';
      }
      
      if (symbol > 10) {
        return 'Science symbols cannot exceed 10';
      }
      
      if (!Number.isInteger(symbol)) {
        return 'Science symbols must be whole numbers';
      }
    }
    
    return null;
  }

  // Military conflicts validation
  static validateMilitaryConflicts(conflicts: any): string | null {
    if (!conflicts || typeof conflicts !== 'object') {
      return 'Military conflicts data is invalid';
    }
    
    const ages = ['age1', 'age2', 'age3'];
    const validOutcomes = ['win', 'lose', 'tie'];
    
    for (const age of ages) {
      if (!conflicts[age]) {
        return `Missing conflicts for ${age}`;
      }
      
      const { left, right } = conflicts[age];
      if (!validOutcomes.includes(left) || !validOutcomes.includes(right)) {
        return `Invalid conflict outcomes for ${age}`;
      }
    }
    
    return null;
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();
  
  static startMeasurement(key: string): void {
    this.measurements.set(key, Date.now());
  }
  
  static endMeasurement(key: string): number {
    const startTime = this.measurements.get(key);
    if (!startTime) {
      console.warn(`No measurement started for key: ${key}`);
      return 0;
    }
    
    const duration = Date.now() - startTime;
    this.measurements.delete(key);
    
    if (__DEV__) {
      console.log(`Performance: ${key} took ${duration}ms`);
    }
    
    // Log slow operations
    if (duration > 1000) {
      errorHandler.handleError(
        ErrorType.SYSTEM,
        `Slow operation detected: ${key}`,
        `Operation took ${duration}ms`,
        { operation: key, duration },
        false
      );
    }
    
    return duration;
  }
  
  static measureAsync<T>(key: string, operation: () => Promise<T>): Promise<T> {
    this.startMeasurement(key);
    return operation().finally(() => {
      this.endMeasurement(key);
    });
  }
}

// Data sanitization utilities
export class DataSanitizer {
  // Sanitize player data
  static sanitizePlayer(player: any): any {
    if (!player || typeof player !== 'object') {
      throw new Error('Invalid player data');
    }
    
    return {
      id: String(player.id || ''),
      name: String(player.name || '').trim(),
      avatar: player.avatar ? String(player.avatar) : undefined,
      stats: player.stats && typeof player.stats === 'object' ? {
        gamesPlayed: Math.max(0, parseInt(player.stats.gamesPlayed) || 0),
        wins: Math.max(0, parseInt(player.stats.wins) || 0),
        averageScore: Math.max(0, parseFloat(player.stats.averageScore) || 0),
        highestScore: Math.max(0, parseInt(player.stats.highestScore) || 0),
        favoriteStrategy: player.stats.favoriteStrategy ? String(player.stats.favoriteStrategy) : undefined,
      } : undefined,
    };
  }
  
  // Sanitize score data
  static sanitizeScore(score: any): number {
    const num = parseFloat(score);
    if (isNaN(num)) {
      throw new Error('Invalid score value');
    }
    
    return Math.round(Math.max(-10, Math.min(200, num)));
  }
  
  // Sanitize expansion settings
  static sanitizeExpansions(expansions: any): any {
    if (!expansions || typeof expansions !== 'object') {
      return {
        leaders: false,
        cities: false,
        armada: false,
        edifice: false,
      };
    }
    
    return {
      leaders: Boolean(expansions.leaders),
      cities: Boolean(expansions.cities),
      armada: Boolean(expansions.armada),
      edifice: Boolean(expansions.edifice),
    };
  }
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage = 'Operation failed'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    errorHandler.handleError(
      ErrorType.SYSTEM,
      errorMessage,
      error instanceof Error ? error.message : String(error),
      undefined,
      false
    );
    return fallback;
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: any;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memory usage monitor
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private intervals: Set<number> = new Set();
  
  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }
  
  startMonitoring(intervalMs = 30000): void {
    if (!__DEV__) return;
    
    const interval = setInterval(() => {
      if (global.gc && typeof global.gc === 'function') {
        // Force garbage collection if available (requires --expose-gc)
        global.gc();
      }
      
      // Log memory usage
      const memInfo = (performance as any).memory;
      if (memInfo) {
        console.log('Memory Usage:', {
          used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024) + 'MB',
        });
        
        // Warn if memory usage is high
        if (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit > 0.8) {
          errorHandler.handleError(
            ErrorType.SYSTEM,
            'High memory usage detected',
            `Using ${Math.round(memInfo.usedJSHeapSize / 1024 / 1024)}MB of ${Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024)}MB`,
            { memoryInfo: memInfo },
            false
          );
        }
      }
    }, intervalMs);
    
    this.intervals.add(interval);
  }
  
  stopMonitoring(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }
}

// Initialize error handler and memory monitor
export const initializeErrorHandling = async (): Promise<void> => {
  await errorHandler.loadErrorLog();
  
  if (__DEV__) {
    MemoryMonitor.getInstance().startMonitoring();
  }
  
  // Set up global error handlers
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);
    
    // Log console errors
    if (args.length > 0) {
      errorHandler.handleError(
        ErrorType.SYSTEM,
        'Console Error',
        args.join(' '),
        { args },
        false
      );
    }
  };
};

// Clean up resources
export const cleanupErrorHandling = (): void => {
  MemoryMonitor.getInstance().stopMonitoring();
};