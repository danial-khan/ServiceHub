import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Button, Card, Text } from '../../../src/core';
import { theme } from '../../../src/core/theme';
import { DOCTORS, SPECIALTIES, Doctor } from '../data';

interface DoctorListScreenProps {
  onDoctorSelect: (doctor: Doctor) => void;
  onNavigateToAppointments: () => void;
}

export const DoctorListScreen: React.FC<DoctorListScreenProps> = ({
  onDoctorSelect,
  onNavigateToAppointments,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const filteredDoctors =
    selectedSpecialty === 'All'
      ? DOCTORS
      : DOCTORS.filter((d) => d.specialty === selectedSpecialty);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2">Find a Doctor</Text>
        <Button
          title="My Appointments"
          variant="outline"
          size="small"
          onPress={onNavigateToAppointments}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.specialtyScroll}
        contentContainerStyle={styles.specialtyContent}
      >
        {SPECIALTIES.map((specialty) => (
          <TouchableOpacity
            key={specialty}
            onPress={() => setSelectedSpecialty(specialty)}
            style={[
              styles.specialtyChip,
              selectedSpecialty === specialty && styles.specialtyChipActive,
            ]}
          >
            <Text
              variant="bodySmall"
              weight="medium"
              color={
                selectedSpecialty === specialty
                  ? theme.colors.white
                  : theme.colors.text
              }
            >
              {specialty}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onDoctorSelect(item)}>
            <Card style={styles.doctorCard}>
              <View style={styles.doctorHeader}>
                <View style={styles.avatar}>
                  <Text variant="h3" color={theme.colors.white}>
                    {item.name.split(' ')[1][0]}
                  </Text>
                </View>
                <View style={styles.doctorInfo}>
                  <Text variant="h4">{item.name}</Text>
                  <Text variant="bodySmall" color={theme.colors.textSecondary}>
                    {item.specialty}
                  </Text>
                  <Text variant="caption">{item.hospitalName}</Text>
                </View>
              </View>
              <View style={styles.doctorMeta}>
                <View style={styles.metaItem}>
                  <Text variant="bodySmall">★ {item.rating}</Text>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    ({item.reviewCount} reviews)
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text variant="bodySmall">
                    {item.yearsOfExperience} years exp.
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text variant="bodySmall" weight="semibold">
                    ${item.consultationFee}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
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
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  specialtyScroll: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
  },
  specialtyContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  specialtyChip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundSecondary,
    marginRight: theme.spacing.sm,
  },
  specialtyChipActive: {
    backgroundColor: theme.colors.primary,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  doctorCard: {
    marginBottom: theme.spacing.md,
  },
  doctorHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  doctorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  metaItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
});
