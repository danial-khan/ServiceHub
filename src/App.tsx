import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from './auth/AuthContext';
import { LoginScreen } from './auth/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { useModuleStore } from './modules';

const Stack = createNativeStackNavigator();

export default function App() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const fetchCatalog = useModuleStore((state) => state.fetchCatalog);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    // Initialize module loader by fetching catalog
    fetchCatalog()
      .catch((error) => {
        console.error('Failed to fetch module catalog:', error);
      })
      .finally(() => {
        setCatalogLoading(false);
      });
  }, [fetchCatalog]);

  if (authLoading || catalogLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {!isAuthenticated ? (
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ServiceHub' }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
