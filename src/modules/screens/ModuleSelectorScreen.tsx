import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Button, Card, Text } from '@servicehub/core';
import { theme } from '@servicehub/core';
import { useModuleLoader } from '../moduleLoader';
import { useAuthStore } from '../../auth';

interface ModuleSelectorScreenProps {
  onModuleSelect: (moduleId: string) => void;
  onNavigateToMarketplace: () => void;
}

export const ModuleSelectorScreen: React.FC<ModuleSelectorScreenProps> = ({
  onModuleSelect,
  onNavigateToMarketplace,
}) => {
  const { user, signOut } = useAuthStore();
  const { getInstalledModules, loadModule } = useModuleLoader();
  const installedModules = getInstalledModules();

  const handleModulePress = async (moduleId: string) => {
    try {
      await loadModule(moduleId);
      onModuleSelect(moduleId);
    } catch (error) {
      console.error('Failed to load module:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="h2">ServiceHub</Text>
          <Text variant="bodySmall" color={theme.colors.textSecondary}>
            Welcome, {user?.name || 'Guest'}
          </Text>
        </View>
        <Button
          title="Sign Out"
          variant="outline"
          size="small"
          onPress={signOut}
        />
      </View>

      {installedModules.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="h3" align="center">
            No Modules Installed
          </Text>
          <Text
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
            style={styles.emptyText}
          >
            Browse the marketplace to download service modules
          </Text>
          <Button
            title="Browse Modules"
            onPress={onNavigateToMarketplace}
            fullWidth
          />
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text variant="h3">Your Services</Text>
            <Text variant="bodySmall" color={theme.colors.textSecondary}>
              Select a service to continue
            </Text>
          </View>

          <FlatList
            data={installedModules}
            keyExtractor={(item) => item.metadata.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleModulePress(item.metadata.id)}
              >
                <Card style={styles.moduleCard}>
                  <View style={styles.moduleHeader}>
                    <View style={styles.iconPlaceholder}>
                      <Text variant="h3">{item.metadata.name[0]}</Text>
                    </View>
                    <View style={styles.moduleInfo}>
                      <Text variant="h4">{item.metadata.name}</Text>
                      <Text variant="bodySmall" color={theme.colors.textSecondary}>
                        {item.metadata.description}
                      </Text>
                      <Text variant="caption">v{item.metadata.version}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <Button
                title="+ Browse More Modules"
                variant="outline"
                onPress={onNavigateToMarketplace}
                fullWidth
              />
            }
          />
        </>
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
  section: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  emptyText: {
    marginBottom: theme.spacing.md,
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  moduleCard: {
    marginBottom: theme.spacing.md,
  },
  moduleHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
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
});
