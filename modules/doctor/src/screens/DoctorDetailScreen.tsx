import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button, Card, Text } from '@servicehub/core';
import { theme } from '@servicehub/core';
import { Doctor, generateTimeSlots, TimeSlot } from '../data';
import { useDoctorStore } from '../store';

interface DoctorDetailScreenProps {
  doctor: Doctor;
  onBack: () => void;
  onBookingComplete: () => void;
}

export const DoctorDetailScreen: React.FC<DoctorDetailScreenProps> = ({
  doctor,
  onBack,
  onBookingComplete,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-15');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const { bookAppointment } = useDoctorStore();
  const [isBooking, setIsBooking] = useState(false);

  const timeSlots = generateTimeSlots(selectedDate);

  const handleBooking = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      await bookAppointment({
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        date: selectedDate,
        time: selectedSlot.time,
        hospitalName: doctor.hospitalName,
      });
      onBookingComplete();
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="← Back" variant="ghost" size="small" onPress={onBack} />
        <Text variant="h3">Book Appointment</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.doctorHeader}>
            <View style={styles.avatar}>
              <Text variant="h2" color={theme.colors.white}>
                {doctor.name.split(' ')[1][0]}
              </Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text variant="h3">{doctor.name}</Text>
              <Text variant="body" color={theme.colors.textSecondary}>
                {doctor.specialty}
              </Text>
              <Text variant="bodySmall" color={theme.colors.textSecondary}>
                {doctor.hospitalName}
              </Text>
              <Text variant="body" weight="semibold" style={styles.fee}>
                Consultation: ${doctor.consultationFee}
              </Text>
            </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text variant="h4">{doctor.rating}</Text>
              <Text variant="caption" color={theme.colors.textSecondary}>
                Rating
              </Text>
            </View>
            <View style={styles.stat}>
              <Text variant="h4">{doctor.yearsOfExperience}</Text>
              <Text variant="caption" color={theme.colors.textSecondary}>
                Years Exp
              </Text>
            </View>
            <View style={styles.stat}>
              <Text variant="h4">{doctor.reviewCount}</Text>
              <Text variant="caption" color={theme.colors.textSecondary}>
                Reviews
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text variant="h4">Select Date</Text>
          <Text variant="bodySmall" color={theme.colors.textSecondary}>
            Available: {doctor.availableDays.join(', ')}
          </Text>
          <View style={styles.dateSelector}>
            <Text variant="body">{selectedDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h4">Select Time Slot</Text>
          <View style={styles.slotsGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                disabled={!slot.available}
                onPress={() => setSelectedSlot(slot)}
                style={[
                  styles.slot,
                  !slot.available && styles.slotDisabled,
                  selectedSlot?.id === slot.id && styles.slotSelected,
                ]}
              >
                <Text
                  variant="bodySmall"
                  color={
                    !slot.available
                      ? theme.colors.textTertiary
                      : selectedSlot?.id === slot.id
                      ? theme.colors.white
                      : theme.colors.text
                  }
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title={`Confirm Booking - $${doctor.consultationFee}`}
          onPress={handleBooking}
          disabled={!selectedSlot}
          loading={isBooking}
          fullWidth
        />
      </ScrollView>
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
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  doctorHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  fee: {
    marginTop: theme.spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  stat: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.sm,
  },
  dateSelector: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  slot: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 90,
    alignItems: 'center',
  },
  slotDisabled: {
    opacity: 0.4,
  },
  slotSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
});
