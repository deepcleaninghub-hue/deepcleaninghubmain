/**
 * LoadingSpinner Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { LoadingSpinner } from '../LoadingSpinner';
import { theme } from '../../../utils/theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <PaperProvider theme={theme}>
      {component}
    </PaperProvider>
  );
};

describe('LoadingSpinner', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = renderWithTheme(<LoadingSpinner />);
    
    expect(getByTestId('loading-spinner')).toBeTruthy();
    expect(getByTestId('loading-spinner-indicator')).toBeTruthy();
  });

  it('renders with custom message', () => {
    const message = 'Loading services...';
    const { getByTestId, getByText } = renderWithTheme(
      <LoadingSpinner message={message} />
    );
    
    expect(getByTestId('loading-spinner')).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
  });

  it('renders with custom testID', () => {
    const testID = 'custom-loading-spinner';
    const { getByTestId } = renderWithTheme(
      <LoadingSpinner testID={testID} />
    );
    
    expect(getByTestId(testID)).toBeTruthy();
    expect(getByTestId(`${testID}-indicator`)).toBeTruthy();
  });

  it('renders with small size', () => {
    const { getByTestId } = renderWithTheme(
      <LoadingSpinner size="small" />
    );
    
    expect(getByTestId('loading-spinner-indicator')).toBeTruthy();
  });

  it('renders with large size', () => {
    const { getByTestId } = renderWithTheme(
      <LoadingSpinner size="large" />
    );
    
    expect(getByTestId('loading-spinner-indicator')).toBeTruthy();
  });

  it('renders with custom color', () => {
    const color = '#FF0000';
    const { getByTestId } = renderWithTheme(
      <LoadingSpinner color={color} />
    );
    
    expect(getByTestId('loading-spinner-indicator')).toBeTruthy();
  });

  it('has proper accessibility props', () => {
    const { getByTestId } = renderWithTheme(
      <LoadingSpinner 
        accessibilityLabel="Custom loading"
        accessibilityRole="progressbar"
      />
    );
    
    const spinner = getByTestId('loading-spinner');
    expect(spinner).toBeTruthy();
  });
});
