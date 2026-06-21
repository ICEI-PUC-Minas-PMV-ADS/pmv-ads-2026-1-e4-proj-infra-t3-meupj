import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export { ActionMenuModal } from './ActionMenuModal';
export { ConfirmationModal } from './ConfirmationModal';

export const Input = ({ label, icon: Icon, error, ...props }) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.wrapper}>
      {Icon && <Icon size={18} color="#9CA3AF" style={styles.icon} />}
      <TextInput style={styles.input} placeholderTextColor="#9CA3AF" {...props} />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

export const Button = ({ title, onPress, variant = 'primary', loading, style, ...props }) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === 'primary' ? styles.buttonPrimary : styles.buttonOutline,
      style,
    ]}
    onPress={onPress}
    disabled={loading}
    {...props}
  >
    <Text
      style={[
        styles.buttonText,
        variant === 'primary' ? styles.buttonTextPrimary : styles.buttonTextOutline,
      ]}
    >
      {loading ? 'Carregando...' : title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#F9FAFB',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
  },
  button: {
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextOutline: {
    color: '#374151',
  },
});
