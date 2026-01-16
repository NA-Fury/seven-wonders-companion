import React from 'react';
import { Text, TextInput, type TextInputProps, View, type ViewProps } from 'react-native';
import { theme } from '@/constants/theme';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  helperText?: string;
  errorText?: string;
  inputProps?: TextInputProps;
} & ViewProps;

export function Field({
  label,
  value,
  onChangeText,
  helperText,
  errorText,
  inputProps,
  style,
  ...rest
}: FieldProps) {
  return (
    <View
      {...rest}
      style={[
        { marginBottom: theme.spacing.sm },
        style,
      ]}
    >
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: theme.spacing.xs }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="rgba(243, 231, 211, 0.45)"
        style={[
          {
            backgroundColor: 'rgba(28, 26, 26, 0.6)',
            color: theme.colors.textPrimary,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderWidth: 1,
            borderColor: theme.colors.border,
            minHeight: 44,
          },
          inputProps?.multiline ? { minHeight: 120, textAlignVertical: 'top' } : null,
        ]}
        {...inputProps}
      />
      {helperText ? (
        <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: theme.spacing.xs }}>{helperText}</Text>
      ) : null}
      {errorText ? (
        <Text style={{ color: theme.colors.danger, fontSize: 11, marginTop: theme.spacing.xs }}>{errorText}</Text>
      ) : null}
    </View>
  );
}
