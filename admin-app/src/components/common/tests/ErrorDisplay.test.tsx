import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorDisplay } from '../ErrorDisplay';

// Mock Icon component
jest.mock('../Icon', () => ({
  Icon: ({ name, size, color }: any) => null,
}));

describe('ErrorDisplay', () => {
  it('renders nothing when error is null', () => {
    const { queryByText } = render(<ErrorDisplay error={null} />);

    expect(queryByText('Something went wrong')).toBeNull();
  });

  it('displays error message when error is provided', () => {
    const { getByText } = render(
      <ErrorDisplay error="Network error occurred" />
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Network error occurred')).toBeTruthy();
  });

  it('shows retry button when onRetry is provided', () => {
    const mockRetry = jest.fn();
    const { getByText } = render(
      <ErrorDisplay error="Error message" onRetry={mockRetry} />
    );

    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();

    fireEvent.press(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when onRetry is not provided', () => {
    const { queryByText } = render(<ErrorDisplay error="Error message" />);

    expect(queryByText('Retry')).toBeNull();
  });

  it('uses custom retry text when provided', () => {
    const mockRetry = jest.fn();
    const { getByText } = render(
      <ErrorDisplay
        error="Error message"
        onRetry={mockRetry}
        retryText="Try Again"
      />
    );

    expect(getByText('Try Again')).toBeTruthy();
  });
});

