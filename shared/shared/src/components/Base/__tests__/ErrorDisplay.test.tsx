/**
 * ErrorDisplay Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { ErrorDisplay } from '../ErrorDisplay';
import { theme } from '../../../utils/theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <PaperProvider theme={theme}>
      {component}
    </PaperProvider>
  );
};

describe('ErrorDisplay', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  it('renders correctly with error message', () => {
    const errorMessage = 'Something went wrong';
    const { getByText, getByTestId } = renderWithTheme(
      <ErrorDisplay error={errorMessage} />
    );
    
    expect(getByText(errorMessage)).toBeTruthy();
    expect(getByTestId('error-display')).toBeTruthy();
  });

  it('renders with retry button when onRetry is provided', () => {
    const errorMessage = 'Network error';
    const { getByText, getByTestId } = renderWithTheme(
      <ErrorDisplay 
        error={errorMessage} 
        onRetry={mockOnRetry}
      />
    );
    
    expect(getByText(errorMessage)).toBeTruthy();
    expect(getByTestId('error-display-retry-button')).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const errorMessage = 'Network error';
    const { getByTestId } = renderWithTheme(
      <ErrorDisplay 
        error={errorMessage} 
        onRetry={mockOnRetry}
      />
    );
    
    const retryButton = getByTestId('error-display-retry-button');
    fireEvent.press(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('renders with custom retry text', () => {
    const errorMessage = 'Network error';
    const retryText = 'Try Again';
    const { getByText } = renderWithTheme(
      <ErrorDisplay 
        error={errorMessage} 
        onRetry={mockOnRetry}
        retryText={retryText}
      />
    );
    
    expect(getByText(retryText)).toBeTruthy();
  });

  it('renders in inline variant', () => {
    const errorMessage = 'Validation error';
    const { getByTestId } = renderWithTheme(
      <ErrorDisplay 
        error={errorMessage} 
        variant="inline"
      />
    );
    
    expect(getByTestId('error-display')).toBeTruthy();
  });

  it('renders in card variant by default', () => {
    const errorMessage = 'Server error';
    const { getByTestId } = renderWithTheme(
      <ErrorDisplay error={errorMessage} />
    );
    
    expect(getByTestId('error-display')).toBeTruthy();
  });

  it('shows icon by default', () => {
    const errorMessage = 'Error message';
    const { getByTestId } = renderWithTheme(
      <ErrorDisplay error={errorMessage} />
    );
    
    expect(getByTestId('error-display')).toBeTruthy();
  });

  it('hides icon when showIcon is false', () => {
    const errorMessage = 'Error message';
    const { getByTestId } = renderWithTheme(
      <ErrorDisplay 
        error={errorMessage} 
        showIcon={false}
      />
    );
    
    expect(getByTestId('error-display')).toBeTruthy();
  });

  it('has proper accessibility props', () => {
    const errorMessage = 'Error message';
    const { getByTestId } = renderWithTheme(
      <ErrorDisplay 
        error={errorMessage}
        accessibilityLabel="Custom error"
        accessibilityRole="alert"
      />
    );
    
    const errorDisplay = getByTestId('error-display');
    expect(errorDisplay).toBeTruthy();
  });
});
