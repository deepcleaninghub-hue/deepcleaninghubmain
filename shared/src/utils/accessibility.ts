/**
 * Accessibility Utilities
 * 
 * Comprehensive accessibility support following WCAG 2.1 AA standards
 * and React Native accessibility best practices.
 */

import { AccessibilityInfo, Platform } from 'react-native';

export interface AccessibilityConfig {
  screenReaderEnabled: boolean;
  reduceMotionEnabled: boolean;
  highContrastEnabled: boolean;
  fontSizeScale: number;
  isAccessibilityServiceEnabled: boolean;
}

export interface AccessibilityProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityActions?: Array<{
    name: string;
    label?: string;
  }>;
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
}

class AccessibilityManager {
  private config: AccessibilityConfig = {
    screenReaderEnabled: false,
    reduceMotionEnabled: false,
    highContrastEnabled: false,
    fontSizeScale: 1.0,
    isAccessibilityServiceEnabled: false,
  };

  private listeners: Array<() => void> = [];

  async initialize() {
    try {
      // Check if screen reader is enabled
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.config.screenReaderEnabled = screenReaderEnabled;

      // Check if reduce motion is enabled
      const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      this.config.reduceMotionEnabled = reduceMotionEnabled;

      // Check if high contrast is enabled (Android only)
      if (Platform.OS === 'android') {
        try {
          const highContrastEnabled = await AccessibilityInfo.isHighTextContrastEnabled();
          this.config.highContrastEnabled = highContrastEnabled;
        } catch (error) {
          // High contrast not available on this platform
          this.config.highContrastEnabled = false;
        }
      }

      // Check if accessibility service is enabled (with error handling)
      try {
        const isAccessibilityServiceEnabled = await AccessibilityInfo.isAccessibilityServiceEnabled();
        this.config.isAccessibilityServiceEnabled = isAccessibilityServiceEnabled;
      } catch (error) {
        // Accessibility service check not available on this platform
        this.config.isAccessibilityServiceEnabled = false;
      }

      // Set up listeners for accessibility changes
      this.setupListeners();

      console.log('Accessibility manager initialized:', this.config);
    } catch (error) {
      console.error('Failed to initialize accessibility manager:', error);
      // Set default values if initialization fails
      this.config = {
        screenReaderEnabled: false,
        reduceMotionEnabled: false,
        highContrastEnabled: false,
        fontSizeScale: 1.0,
        isAccessibilityServiceEnabled: false,
      };
    }
  }

  private setupListeners() {
    // Screen reader listener
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled) => {
        this.config.screenReaderEnabled = isEnabled;
        this.notifyListeners();
      }
    );

    // Reduce motion listener
    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled) => {
        this.config.reduceMotionEnabled = isEnabled;
        this.notifyListeners();
      }
    );

    // High contrast listener (Android only)
    if (Platform.OS === 'android') {
      const highContrastListener = AccessibilityInfo.addEventListener(
        'highTextContrastChanged',
        (isEnabled) => {
          this.config.highContrastEnabled = isEnabled;
          this.notifyListeners();
        }
      );
    }

    // Store listeners for cleanup
    this.listeners.push(screenReaderListener?.remove);
    this.listeners.push(reduceMotionListener?.remove);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener?.());
  }

  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  isScreenReaderEnabled(): boolean {
    return this.config.screenReaderEnabled;
  }

  isReduceMotionEnabled(): boolean {
    return this.config.reduceMotionEnabled;
  }

  isHighContrastEnabled(): boolean {
    return this.config.highContrastEnabled;
  }

  isAccessibilityServiceEnabled(): boolean {
    return this.config.isAccessibilityServiceEnabled;
  }

  // Generate accessibility props for common components
  generateButtonProps(
    label: string,
    hint?: string,
    disabled: boolean = false,
    selected: boolean = false
  ): AccessibilityProps {
    return {
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: 'button',
      accessibilityState: {
        disabled,
        selected,
      },
    };
  }

  generateLinkProps(
    label: string,
    hint?: string,
    disabled: boolean = false
  ): AccessibilityProps {
    return {
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: 'link',
      accessibilityState: {
        disabled,
      },
    };
  }

  generateImageProps(
    label: string,
    hint?: string,
    decorative: boolean = false
  ): AccessibilityProps {
    return {
      accessibilityLabel: decorative ? undefined : label,
      accessibilityHint: hint,
      accessibilityRole: decorative ? 'none' : 'image',
      accessibilityState: decorative ? {} : undefined,
    };
  }

  generateTextProps(
    label: string,
    hint?: string,
    isHeading: boolean = false
  ): AccessibilityProps {
    return {
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: isHeading ? 'header' : 'text',
    };
  }

  generateInputProps(
    label: string,
    hint?: string,
    value?: string,
    placeholder?: string,
    required: boolean = false,
    error?: string
  ): AccessibilityProps {
    return {
      accessibilityLabel: label,
      accessibilityHint: hint || (error ? `Error: ${error}` : undefined),
      accessibilityRole: 'text',
      accessibilityState: {
        disabled: false,
      },
      accessibilityValue: {
        text: value || placeholder || '',
      },
    };
  }

  generateSwitchProps(
    label: string,
    hint?: string,
    checked: boolean = false,
    disabled: boolean = false
  ): AccessibilityProps {
    return {
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: 'switch',
      accessibilityState: {
        disabled,
        checked,
      },
    };
  }

  generateSliderProps(
    label: string,
    hint?: string,
    min: number = 0,
    max: number = 100,
    value: number = 0,
    disabled: boolean = false
  ): AccessibilityProps {
    return {
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: 'adjustable',
      accessibilityState: {
        disabled,
      },
      accessibilityValue: {
        min,
        max,
        now: value,
      },
    };
  }

  generateListProps(
    label: string,
    hint?: string,
    itemCount: number = 0
  ): AccessibilityProps {
    return {
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: 'list',
      accessibilityState: {
        disabled: false,
      },
      accessibilityValue: {
        text: `${itemCount} items`,
      },
    };
  }

  generateListItemProps(
    label: string,
    hint?: string,
    selected: boolean = false,
    disabled: boolean = false
  ): AccessibilityProps {
    return {
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: 'button',
      accessibilityState: {
        disabled,
        selected,
      },
    };
  }

  // Announce messages to screen readers
  announceForAccessibility(message: string) {
    if (this.config.screenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }

  // Set accessibility focus
  setAccessibilityFocus(reactTag: number) {
    if (this.config.screenReaderEnabled) {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  }

  // Cleanup
  destroy() {
    this.listeners.forEach(listener => listener?.());
    this.listeners = [];
  }
}

// Export singleton instance
export const accessibilityManager = new AccessibilityManager();

// Export convenience functions
export const getAccessibilityConfig = () => accessibilityManager.getConfig();
export const isScreenReaderEnabled = () => accessibilityManager.isScreenReaderEnabled();
export const isReduceMotionEnabled = () => accessibilityManager.isReduceMotionEnabled();
export const isHighContrastEnabled = () => accessibilityManager.isHighContrastEnabled();
export const announceForAccessibility = (message: string) => 
  accessibilityManager.announceForAccessibility(message);
export const setAccessibilityFocus = (reactTag: number) => 
  accessibilityManager.setAccessibilityFocus(reactTag);

// Export component prop generators
export const generateButtonProps = (
  label: string,
  hint?: string,
  disabled?: boolean,
  selected?: boolean
) => accessibilityManager.generateButtonProps(label, hint, disabled, selected);

export const generateLinkProps = (
  label: string,
  hint?: string,
  disabled?: boolean
) => accessibilityManager.generateLinkProps(label, hint, disabled);

export const generateImageProps = (
  label: string,
  hint?: string,
  decorative?: boolean
) => accessibilityManager.generateImageProps(label, hint, decorative);

export const generateTextProps = (
  label: string,
  hint?: string,
  isHeading?: boolean
) => accessibilityManager.generateTextProps(label, hint, isHeading);

export const generateInputProps = (
  label: string,
  hint?: string,
  value?: string,
  placeholder?: string,
  required?: boolean,
  error?: string
) => accessibilityManager.generateInputProps(label, hint, value, placeholder, required, error);

export const generateSwitchProps = (
  label: string,
  hint?: string,
  checked?: boolean,
  disabled?: boolean
) => accessibilityManager.generateSwitchProps(label, hint, checked, disabled);

export const generateSliderProps = (
  label: string,
  hint?: string,
  min?: number,
  max?: number,
  value?: number,
  disabled?: boolean
) => accessibilityManager.generateSliderProps(label, hint, min, max, value, disabled);

export const generateListProps = (
  label: string,
  hint?: string,
  itemCount?: number
) => accessibilityManager.generateListProps(label, hint, itemCount);

export const generateListItemProps = (
  label: string,
  hint?: string,
  selected?: boolean,
  disabled?: boolean
) => accessibilityManager.generateListItemProps(label, hint, selected, disabled);

// Accessibility constants
export const AccessibilityRoles = {
  BUTTON: 'button',
  LINK: 'link',
  IMAGE: 'image',
  TEXT: 'text',
  HEADER: 'header',
  SWITCH: 'switch',
  ADJUSTABLE: 'adjustable',
  LIST: 'list',
  LISTITEM: 'listitem',
  NONE: 'none',
} as const;

export const AccessibilityStates = {
  DISABLED: 'disabled',
  SELECTED: 'selected',
  CHECKED: 'checked',
  BUSY: 'busy',
  EXPANDED: 'expanded',
} as const;

// Initialize accessibility manager
accessibilityManager.initialize();
