import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Button, Card, Text } from '@servicehub/core';
import { theme } from '@servicehub/core';
import { useModuleLoader } from '../moduleLoader';
import { ModuleMetadata, DownloadStatus } from '../types';

interface ModuleMarketplaceScreenProps {
  onBack: () => void;
}

export const ModuleMarketplaceScreen: React.FC<ModuleMarketplaceScreenProps> = ({
  onBack,
}) => {
  const {
    catalog,
    isLoadingCatalog,
    catalogError,
    fetchCatalog,
    downloadModule,
    removeModule,
    isModuleInstalled,
    downloadProgress,
  } = useModuleLoader();

  useEffect(() => {
    if (!catalog && !isLoadingCatalog) {
      fetchCatalog();
    }
  }, []);

  const handleDownload = async (moduleId: string) => {
    try {
      await downloadModule(moduleId);
      Alert.alert('Success', 'Module installed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to download module');
    }
  };

  const handleRemove = async (moduleId: string) => {
    Alert.alert(
      'Remove Module',
      'Are you sure you want to remove this module?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeModule(moduleId);
          },
        },
      ]
    );
  };

  const renderModule = ({ item }: { item: ModuleMetadata }) => {
    const installed = isModuleInstalled(item.id);
    const progress = downloadProgress.get(item.id);

    return (
      <Card style={styles.moduleCard}>
        <View style={styles.moduleHeader}>
          <View style={styles.iconPlaceholder}>
            <Text variant="h3" color={theme.colors.white}>
              {item.name[0]}
            </Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text variant="h4">{item.name}</Text>
            <Text variant="bodySmall" color={theme.colors.textSecondary}>
              {item.description}
            </Text>
            <View style={styles.metadata}>
              <Text variant="caption">v{item.version}</Text>
              <Text variant="caption">
                {(item.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
          </View>
        </View>

        {progress && progress.status !== DownloadStatus.COMPLETE ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress.progress * 100}%` },
                ]}
              />
            </View>
            <Text variant="caption">
              {progress.status === DownloadStatus.DOWNLOADING
                ? `Downloading ${Math.round(progress.progress * 100)}%`
                : progress.status === DownloadStatus.VERIFYING
                ? 'Verifying...'
                : progress.status === DownloadStatus.INSTALLING
                ? 'Installing...'
                : progress.error || 'Error'}
            </Text>
          </View>
        ) : (
          <View style={styles.actions}>
            {installed ? (
              <>
                <View style={styles.installedBadge}>
                  <Text variant="caption" color={theme.colors.success}>
                    ✓ Installed
                  </Text>
                </View>
                <Button
                  title="Remove"
                  variant="outline"
                  size="small"
                  onPress={() => handleRemove(item.id)}
                />
              </>
            ) : (
              <Button
                title="Download"
                size="small"
                onPress={() => handleDownload(item.id)}
                fullWidth
              />
            )}
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="h2">Module Marketplace</Text>
          <Text variant="bodySmall" color={theme.colors.textSecondary}>
            Download service modules on demand
          </Text>
        </View>
        <Button title="Back" variant="ghost" size="small" onPress={onBack} />
      </View>

      {isLoadingCatalog ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" style={styles.loadingText}>
            Loading modules...
          </Text>
        </View>
      ) : catalogError ? (
        <View style={styles.centered}>
          <Text variant="h4" color={theme.colors.error}>
            Failed to load catalog
          </Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            {catalogError}
          </Text>
          <Button title="Retry" onPress={fetchCatalog} />
        </View>
      ) : (
        <FlatList
          data={catalog?.modules || []}
          keyExtractor={(item) => item.id}
          renderItem={renderModule}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text variant="body" color={theme.colors.textSecondary}>
                No modules available
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  loadingText: {
    marginTop: theme.spacing.md,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  moduleCard: {
    marginBottom: theme.spacing.md,
  },
  moduleHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  metadata: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  installedBadge: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  progressContainer: {
    gap: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
});
