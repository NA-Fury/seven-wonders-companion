import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from '../../ui';

export const NumericInput = ({ 
  label, 
  value, 
  onChangeValue, 
  min = 0, 
  max = 100, 
  step = 1, 
  suffix, 
  helperText 
}: {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  helperText?: string;
}) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 6 }}>{label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable 
        onPress={() => onChangeValue(Math.max(min, value - step))} 
        style={{ 
          width: 36, 
          height: 36, 
          borderRadius: 18, 
          backgroundColor: value <= min ? 'rgba(107,114,128,0.3)' : '#C4A24C', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Text style={{ color: value <= min ? '#6B7280' : '#1C1A1A', fontSize: 18 }}>-</Text>
      </Pressable>
      <Text style={{ color: '#F3E7D3', fontSize: 18, minWidth: 56, textAlign: 'center' }}>
        {value} {suffix}
      </Text>
      <Pressable 
        onPress={() => onChangeValue(Math.min(max, value + step))} 
        style={{ 
          width: 36, 
          height: 36, 
          borderRadius: 18, 
          backgroundColor: value >= max ? 'rgba(107,114,128,0.3)' : '#C4A24C', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Text style={{ color: value >= max ? '#6B7280' : '#1C1A1A', fontSize: 18 }}>+</Text>
      </Pressable>
    </View>
    {helperText ? (
      <Text style={{ color: 'rgba(243,231,211,0.6)', fontSize: 11, marginTop: 6 }}>
        {helperText}
      </Text>
    ) : null}
  </View>
);

export const ToggleRow = ({ 
  label, 
  value, 
  onToggle 
}: {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}) => (
  <Pressable 
    onPress={() => onToggle(!value)} 
    style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      padding: 10, 
      backgroundColor: 'rgba(243,231,211,0.03)', 
      borderRadius: 8, 
      marginBottom: 8 
    }}
  >
    <View 
      style={{ 
        width: 18, 
        height: 18, 
        borderRadius: 9, 
        borderWidth: 2, 
        borderColor: '#C4A24C', 
        marginRight: 10, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: value ? '#C4A24C' : 'transparent' 
      }}
    >
      {value ? <Text style={{ fontSize: 12, color: '#1C1A1A' }}>✓</Text> : null}
    </View>
    <Text style={{ color: '#F3E7D3', fontSize: 14 }}>{label}</Text>
  </Pressable>
);

export const ScoreCategory = ({ 
  title, 
  description, 
  icon, 
  children 
}: {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <Card style={{ marginBottom: 14 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <Text style={{ fontSize: 18, marginRight: 8 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#C4A24C', fontSize: 15, fontWeight: '600' }}>{title}</Text>
        <Text style={{ color: 'rgba(243,231,211,0.7)', fontSize: 12 }}>{description}</Text>
      </View>
    </View>
    {children}
  </Card>
);
