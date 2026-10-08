import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './auth';
import { SignInScreen } from './auth/screens/SignInScreen';
import { useModuleStore } from './modules/store';
import { ModuleSelectorScreen } from './modules/screens/ModuleSelectorScreen';
import { ModuleMarketplaceScreen } from './modules/screens/ModuleMarketplaceScreen';

type Screen = 'SignIn' | 'ModuleSelector' | 'Marketplace' | 'Module';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('SignIn');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchCatalog = useModuleStore((state) => state.fetchCatalog);
  const getModuleComponent = useModuleStore((state) => state.getModuleComponent);

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchCatalog();
      } catch (error) {
        console.error('Failed to fetch catalog:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, [fetchCatalog]);

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
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setCurrentScreen('Module');
  };

  const handleBackToSelector = () => {
    setCurrentScreen('ModuleSelector');
    setSelectedModuleId(null);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SignIn':
        return <SignInScreen onNavigateToSignUp={() => {}} />;
      case 'ModuleSelector':
        return (
          <ModuleSelectorScreen
            onModuleSelect={handleModuleSelect}
            onNavigateToMarketplace={() => setCurrentScreen('Marketplace')}
          />
        );
      case 'Marketplace':
        return <ModuleMarketplaceScreen onBack={() => setCurrentScreen('ModuleSelector')} />;
      case 'Module':
        if (selectedModuleId) {
          const ModuleComponent = getModuleComponent(selectedModuleId);
          if (ModuleComponent) {
            return <ModuleComponent onBack={handleBackToSelector} />;
          }
        }
        return (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        );
      default:
        return <SignInScreen onNavigateToSignUp={() => {}} />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>{renderScreen()}</View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
