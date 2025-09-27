import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function Icon({ name, size = 24, color = '#000', style }: IconProps) {
  return (
    <MaterialIcons 
      name={name as any} 
      size={size} 
      color={color} 
      style={style} 
    />
  );
}
