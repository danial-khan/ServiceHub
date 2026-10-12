import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Button, Card, Text } from '@servicehub/core';
import { theme } from '@servicehub/core';
import { useModuleStore } from '../store';
import { ModuleMetadata } from '../moduleLoader';

interface ModuleSelectorScreenProps {
  onModuleSelect: (moduleId: string) => void;
  onNavigateToMarketplace: () => void;
}

export const ModuleSelectorScreen: React.FC<ModuleSelectorScreenProps> = ({
  onModuleSelect,
  onNavigateToMarketplace,
}) => {
  const availableModules = useModuleStore((state) => state.availableModules);
  const installedModules = useModuleStore((state) => state.installedModules);
  const downloadingModules = useModuleStore((state) => state.downloadingModules);
  const error = useModuleStore((state) => state.error);
  const installModule = useModuleStore((state) => state.installModule);
  const uninstallModule = useModuleStore((state) => state.uninstallModule);

  const handleInstall = async (moduleId: string) => {
    try {
      await installModule(moduleId);
      Alert.alert('Success', `${moduleId} module installed successfully`);
    } catch (err) {
      Alert.alert('Error', `Failed to install module: ${err}`);
    }
  };

  const handleUninstall = async (moduleId: string) => {
    try {
      await uninstallModule(moduleId);
      Alert.alert('Success', `${moduleId} module removed`);
    } catch (err) {
      Alert.alert('Error', `Failed to remove module: ${err}`);
    }
  };

  const renderModule = ({ item }: { item: ModuleMetadata }) => {
    const isInstalled = !!installedModules[item.id];
    const isDownloading = downloadingModules[item.id];

    return (
      <Card style={styles.moduleCard}>
        <View style={styles.moduleHeader}>
          <View style={styles.moduleInfo}>
            <Text variant="h3">{item.name}</Text>
            {item.description && (
              <Text variant="body" style={styles.description}>
                {item.description}
              </Text>
            )}
            <Text variant="caption" style={styles.version}>
              Version {item.version}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {isDownloading ? (
            <ActivityIndicator size="small" />
          ) : isInstalled ? (
            <>
              <Button
                title="Open"
                onPress={() => onModuleSelect(item.id)}
                variant="primary"
                style={styles.button}
              />
              <Button
                title="Remove"
                onPress={() => handleUninstall(item.id)}
                variant="outline"
                style={styles.button}
              />
            </>
          ) : (
            <Button
              title="Install"
              onPress={() => handleInstall(item.id)}
              variant="primary"
              style={styles.button}
            />
          )}
        </View>
      </Card>
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="body" style={styles.errorText}>
          {error}
        </Text>
        <Button title="Go to Marketplace" onPress={onNavigateToMarketplace} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={availableModules}
        renderItem={renderModule}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <Button
        title="Browse Marketplace"
        onPress={onNavigateToMarketplace}
        variant="outline"
        style={styles.marketplaceButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.md,
  },
  moduleCard: {
    marginBottom: theme.spacing.md,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  moduleInfo: {
    flex: 1,
  },
  description: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  version: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  button: {
    minWidth: 100,
  },
  marketplaceButton: {
    margin: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    margin: theme.spacing.md,
  },
});
