import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button, Input, Text } from '../../core';
import { theme } from '../../core/theme';
import { useAuthStore } from '../authStore';

interface SignInScreenProps {
  onNavigateToSignUp: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onNavigateToSignUp,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInAsGuest, isLoading, error } = useAuthStore();

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
    } catch (err) {
    }
  };

  const handleGuestSignIn = async () => {
    try {
      await signInAsGuest();
    } catch (err) {
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="h1" align="center">
            ServiceHub
          </Text>
          <Text variant="body" color={theme.colors.textSecondary} align="center">
            Your all-in-one service booking platform
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          {error && (
            <Text variant="bodySmall" color={theme.colors.error}>
              {error}
            </Text>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={isLoading}
              fullWidth
            />
            <Button
              title="Continue as Guest"
              variant="outline"
              onPress={handleGuestSignIn}
              loading={isLoading}
              fullWidth
            />
          </View>

          <View style={styles.footer}>
            <Text variant="bodySmall" color={theme.colors.textSecondary}>
              Don't have an account?{' '}
            </Text>
            <Button
              title="Sign Up"
              variant="ghost"
              size="small"
              onPress={onNavigateToSignUp}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  form: {
    gap: theme.spacing.md,
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
});
