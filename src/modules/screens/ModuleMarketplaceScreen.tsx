import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Button, Card, Text } from '@servicehub/core';
import { theme } from '@servicehub/core';
import { useModuleStore } from '../store';
import { ModuleMetadata } from '../moduleLoader';

interface ModuleMarketplaceScreenProps {
  onBack: () => void;
}

export const ModuleMarketplaceScreen: React.FC<ModuleMarketplaceScreenProps> = ({
  onBack,
}) => {
  const availableModules = useModuleStore((state) => state.availableModules);

  const renderModule = ({ item }: { item: ModuleMetadata }) => (
    <Card style={styles.moduleCard}>
      <Text variant="h3">{item.name}</Text>
      {item.description && (
        <Text variant="body" style={styles.description}>
          {item.description}
        </Text>
      )}
      <Text variant="caption" style={styles.info}>
        Size: {(item.size / 1024).toFixed(0)} KB • Version {item.version}
      </Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={availableModules}
        renderItem={renderModule}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <Button title="Back" onPress={onBack} variant="outline" style={styles.backButton} />
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
  description: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  info: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  backButton: {
    margin: theme.spacing.md,
  },
});
