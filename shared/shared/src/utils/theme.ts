/**
 * Theme Configuration
 * 
 * Centralized theme management for the DeepClean Mobile Hub app.
 * Provides consistent design tokens and theming capabilities.
 */

import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { AppTheme } from '../types';

// Font configuration
const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
};

// Design tokens
export const designTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
  },
  elevation: {
    level0: 0,
    level1: 1,
    level2: 3,
    level3: 6,
    level4: 8,
    level5: 12,
  },
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
  },
};

// Color palette - Enhanced with comprehensive 4-color scheme
const colors = {
  primary: '#3F72AF',           // Medium blue for primary actions
  primaryContainer: '#DBE2EF',  // Soft blue-gray for primary containers
  secondary: '#112D4E',         // Dark navy for secondary elements
  secondaryContainer: '#F9F7F7', // Light cream for secondary containers
  tertiary: '#059669',          // Keep green for success states
  tertiaryContainer: '#d1fae5',
  surface: '#F9F7F7',           // Light cream for main surfaces
  surfaceVariant: '#DBE2EF',    // Soft blue-gray for variant surfaces
  background: '#F9F7F7',        // Light cream background
  error: '#dc2626',             // Keep red for errors
  errorContainer: '#fef2f2',
  onPrimary: '#ffffff',         // White text on primary
  onSecondary: '#ffffff',       // White text on secondary
  onTertiary: '#ffffff',
  onSurface: '#112D4E',         // Dark navy text on light surfaces
  onSurfaceVariant: '#3F72AF',  // Medium blue text on variant surfaces
  onBackground: '#112D4E',      // Dark navy text on background
  onError: '#ffffff',
  outline: '#DBE2EF',           // Soft blue-gray for outlines
  outlineVariant: '#F9F7F7',    // Light cream for variant outlines
  shadow: '#112D4E',            // Dark navy for shadows
  scrim: '#112D4E',             // Dark navy for scrims
  inverseSurface: '#112D4E',    // Dark navy for inverse surfaces
  inverseOnSurface: '#F9F7F7',  // Light cream text on inverse surfaces
  inversePrimary: '#DBE2EF',    // Soft blue-gray for inverse primary
};

// Main theme
export const theme: AppTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surfaceVariant,
      level3: '#f1f5f9',
      level4: colors.outlineVariant,
      level5: colors.outline,
    },
  },
  roundness: designTokens.borderRadius.md,
};

// Dark theme (for future implementation)
export const darkTheme: AppTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    primary: '#3b82f6',
    primaryContainer: '#1e40af',
    secondary: '#8b5cf6',
    secondaryContainer: '#5b21b6',
    tertiary: '#10b981',
    tertiaryContainer: '#047857',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    background: '#0f172a',
    onSurface: '#f8fafc',
    onSurfaceVariant: '#cbd5e1',
    onBackground: '#f8fafc',
    outline: '#475569',
    outlineVariant: '#334155',
    inverseSurface: '#f8fafc',
    inverseOnSurface: '#1e293b',
    inversePrimary: '#1e40af',
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: '#334155',
      level3: '#475569',
      level4: '#64748b',
      level5: '#94a3b8',
    },
  },
};

// Utility functions
export const getSpacing = (size: keyof typeof designTokens.spacing): number => {
  return designTokens.spacing[size];
};

export const getBorderRadius = (size: keyof typeof designTokens.borderRadius): number => {
  return designTokens.borderRadius[size];
};

export const getElevation = (level: keyof typeof designTokens.elevation): number => {
  return designTokens.elevation[level];
};

// Responsive utilities
export const isTablet = (width: number): boolean => {
  return width >= designTokens.breakpoints.tablet;
};

export const isDesktop = (width: number): boolean => {
  return width >= designTokens.breakpoints.desktop;
};

// Color utilities
export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - in production, use a proper color contrast library
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

export const getAlphaColor = (color: string, alpha: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Animation durations
export const animationDurations = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Z-index scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};
