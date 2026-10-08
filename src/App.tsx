import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore, initializeAuth, SignInScreen, SignUpScreen } from './auth';
import { useModuleLoader, initializeModuleLoader, ModuleSelectorScreen, ModuleMarketplaceScreen } from './modules';
import { theme } from './core/theme';

const Stack = createNativeStackNavigator();

type AppScreen = 'SignIn' | 'SignUp' | 'ModuleSelector' | 'Marketplace' | 'Module';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('SignIn');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { loadedModules } = useModuleLoader();

  useEffect(() => {
    const initialize = async () => {
      await initializeAuth();
      await initializeModuleLoader();
      setIsInitializing(false);
    };
    initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentScreen('ModuleSelector');
    } else {
      setCurrentScreen('SignIn');
      setSelectedModuleId(null);
    }
  }, [isAuthenticated]);

  if (isInitializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SignIn':
        return (
          <SignInScreen
            onNavigateToSignUp={() => setCurrentScreen('SignUp')}
          />
        );
      case 'SignUp':
        return (
          <SignUpScreen
            onNavigateToSignIn={() => setCurrentScreen('SignIn')}
          />
        );
      case 'ModuleSelector':
        return (
          <ModuleSelectorScreen
            onModuleSelect={(moduleId) => {
              setSelectedModuleId(moduleId);
              setCurrentScreen('Module');
            }}
            onNavigateToMarketplace={() => setCurrentScreen('Marketplace')}
          />
        );
      case 'Marketplace':
        return (
          <ModuleMarketplaceScreen
            onBack={() => setCurrentScreen('ModuleSelector')}
          />
        );
      case 'Module':
        if (selectedModuleId) {
          const module = loadedModules.get(selectedModuleId);
          if (module?.getNavigator) {
            const ModuleNavigator = module.getNavigator();
            return (
              <ModuleNavigator
                onBack={() => setCurrentScreen('ModuleSelector')}
              />
            );
          }
        }
        setCurrentScreen('ModuleSelector');
        return null;
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {renderScreen()}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
