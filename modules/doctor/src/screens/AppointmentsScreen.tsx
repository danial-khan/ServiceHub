import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Button, Card, Text } from '@servicehub/core';
import { theme } from '@servicehub/core';
import { useDoctorStore } from '../store';
import { Appointment } from '../data';

interface AppointmentsScreenProps {
  onBack: () => void;
}

export const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({
  onBack,
}) => {
  const { appointments, loadAppointments, cancelAppointment } = useDoctorStore();

  useEffect(() => {
    loadAppointments();
  }, []);

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'upcoming'
  );

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <Card style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.avatar}>
          <Text variant="h4" color={theme.colors.white}>
            {item.doctorName.split(' ')[1][0]}
          </Text>
        </View>
        <View style={styles.appointmentInfo}>
          <Text variant="h4">{item.doctorName}</Text>
          <Text variant="bodySmall" color={theme.colors.textSecondary}>
            {item.specialty}
          </Text>
          <Text variant="caption">{item.hospitalName}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === 'upcoming' && styles.statusUpcoming,
            item.status === 'completed' && styles.statusCompleted,
            item.status === 'cancelled' && styles.statusCancelled,
          ]}
        >
          <Text variant="caption" color={theme.colors.white}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detail}>
          <Text variant="bodySmall" color={theme.colors.textSecondary}>
            Date
          </Text>
          <Text variant="body" weight="medium">
            {item.date}
          </Text>
        </View>
        <View style={styles.detail}>
          <Text variant="bodySmall" color={theme.colors.textSecondary}>
            Time
          </Text>
          <Text variant="body" weight="medium">
            {item.time}
          </Text>
        </View>
      </View>

      {item.status === 'upcoming' && (
        <Button
          title="Cancel Appointment"
          variant="outline"
          size="small"
          onPress={() => cancelAppointment(item.id)}
        />
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="← Back" variant="ghost" size="small" onPress={onBack} />
        <Text variant="h3">My Appointments</Text>
        <View style={{ width: 60 }} />
      </View>

      {upcomingAppointments.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="h4" align="center">
            No appointments yet
          </Text>
          <Text
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
          >
            Book your first appointment
          </Text>
          <Button title="Find a Doctor" onPress={onBack} />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderAppointment}
          contentContainerStyle={styles.listContent}
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
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  appointmentCard: {
    marginBottom: theme.spacing.md,
  },
  appointmentHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  statusBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    height: 24,
  },
  statusUpcoming: {
    backgroundColor: theme.colors.primary,
  },
  statusCompleted: {
    backgroundColor: theme.colors.success,
  },
  statusCancelled: {
    backgroundColor: theme.colors.textTertiary,
  },
  appointmentDetails: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  detail: {
    gap: theme.spacing.xs,
  },
});
