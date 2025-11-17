import React from 'react';
import { render } from '@testing-library/react-native';
import { Icon } from '../Icon';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: ({ name, size, color, style }: any) => null,
}));

describe('Icon', () => {
  it('renders with default props', () => {
    const { UNSAFE_root } = render(<Icon name="home" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { UNSAFE_root } = render(<Icon name="home" size={32} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with custom color', () => {
    const { UNSAFE_root } = render(<Icon name="home" color="#FF0000" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with custom style', () => {
    const customStyle = { marginTop: 10 };
    const { UNSAFE_root } = render(
      <Icon name="home" style={customStyle} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });
});

