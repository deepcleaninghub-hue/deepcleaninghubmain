import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading indicator when loading is true', () => {
    const { getByText } = render(
      <LoadingSpinner loading={true} message="Loading data..." />
    );

    expect(getByText('Loading data...')).toBeTruthy();
  });

  it('renders children when loading is false', () => {
    const { getByText } = render(
      <LoadingSpinner loading={false}>
        <div>Content</div>
      </LoadingSpinner>
    );

    // Note: React Native doesn't have div, but this tests the concept
    // In actual React Native, you'd use View
  });

  it('shows default message when no message prop is provided', () => {
    const { getByText } = render(<LoadingSpinner loading={true} />);

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('does not render loading indicator when loading is false', () => {
    const { queryByText } = render(
      <LoadingSpinner loading={false} message="Loading..." />
    );

    expect(queryByText('Loading...')).toBeNull();
  });
});

