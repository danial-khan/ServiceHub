import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Button, Card, Text } from '@servicehub/core';
import { theme } from '@servicehub/core';
import { BARBERSHOPS, SERVICES, BARBERS, TIME_SLOTS, Barbershop, BarberService, Barber } from './data';
import { useBarberStore } from './store';

type Screen = 'shops' | 'services' | 'barbers' | 'time' | 'bookings';

interface BarberModuleProps {
  onBack: () => void;
}

export const BarberModule: React.FC<BarberModuleProps> = ({ onBack }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('shops');
  const [selectedShop, setSelectedShop] = useState<Barbershop | null>(null);
  const [selectedService, setSelectedService] = useState<BarberService | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate] = useState('2026-10-15');
  const [isBooking, setIsBooking] = useState(false);

  const { bookings, loadBookings, createBooking, cancelBooking } = useBarberStore();

  React.useEffect(() => {
    loadBookings();
  }, []);

  const handleConfirmBooking = async () => {
    if (!selectedShop || !selectedService || !selectedBarber || !selectedTime) return;

    setIsBooking(true);
    try {
      await createBooking({
        shopName: selectedShop.name,
        barberName: selectedBarber.name,
        service: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        price: selectedService.price,
      });
      setCurrentScreen('bookings');
    } finally {
      setIsBooking(false);
    }
  };

  if (currentScreen === 'shops') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button title="← Back" variant="ghost" size="small" onPress={onBack} />
          <Text variant="h3">Barbershops</Text>
          <Button
            title="Bookings"
            variant="ghost"
            size="small"
            onPress={() => setCurrentScreen('bookings')}
          />
        </View>
        <FlatList
          data={BARBERSHOPS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedShop(item);
                setCurrentScreen('services');
              }}
            >
              <Card style={styles.card}>
                <Text variant="h4">{item.name}</Text>
                <Text variant="bodySmall" color={theme.colors.textSecondary}>
                  {item.address}
                </Text>
                <View style={styles.meta}>
                  <Text variant="bodySmall">★ {item.rating} ({item.reviewCount})</Text>
                  <Text variant="bodySmall">{item.distance}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  if (currentScreen === 'services') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="← Back"
            variant="ghost"
            size="small"
            onPress={() => setCurrentScreen('shops')}
          />
          <Text variant="h3">Select Service</Text>
          <View style={{ width: 60 }} />
        </View>
        <FlatList
          data={SERVICES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedService(item);
                setCurrentScreen('barbers');
              }}
            >
              <Card style={styles.card}>
                <View style={styles.serviceRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="h4">{item.name}</Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>
                      {item.duration}
                    </Text>
                  </View>
                  <Text variant="h4" weight="semibold">
                    ${item.price}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  if (currentScreen === 'barbers') {
    const shopBarbers = BARBERS.filter((b) => b.shopId === selectedShop?.id);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="← Back"
            variant="ghost"
            size="small"
            onPress={() => setCurrentScreen('services')}
          />
          <Text variant="h3">Choose Barber</Text>
          <View style={{ width: 60 }} />
        </View>
        <FlatList
          data={shopBarbers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedBarber(item);
                setCurrentScreen('time');
              }}
            >
              <Card style={styles.card}>
                <View style={styles.barberRow}>
                  <View style={styles.avatar}>
                    <Text variant="h4" color={theme.colors.white}>
                      {item.name[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="h4">{item.name}</Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>
                      {item.experience} experience
                    </Text>
                    <Text variant="bodySmall">★ {item.rating}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  if (currentScreen === 'time') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="← Back"
            variant="ghost"
            size="small"
            onPress={() => setCurrentScreen('barbers')}
          />
          <Text variant="h3">Select Time</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.content}>
          <Card>
            <Text variant="h4">Booking Summary</Text>
            <View style={styles.summary}>
              <Text variant="bodySmall" color={theme.colors.textSecondary}>
                Shop: {selectedShop?.name}
              </Text>
              <Text variant="bodySmall" color={theme.colors.textSecondary}>
                Service: {selectedService?.name}
              </Text>
              <Text variant="bodySmall" color={theme.colors.textSecondary}>
                Barber: {selectedBarber?.name}
              </Text>
              <Text variant="bodySmall" color={theme.colors.textSecondary}>
                Date: {selectedDate}
              </Text>
              <Text variant="body" weight="semibold">
                Price: ${selectedService?.price}
              </Text>
            </View>
          </Card>

          <Text variant="h4">Available Times</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotSelected,
                ]}
              >
                <Text
                  variant="body"
                  color={selectedTime === time ? theme.colors.white : theme.colors.text}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Confirm Booking"
            onPress={handleConfirmBooking}
            disabled={!selectedTime}
            loading={isBooking}
            fullWidth
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="← Back"
          variant="ghost"
          size="small"
          onPress={() => setCurrentScreen('shops')}
        />
        <Text variant="h3">My Bookings</Text>
        <View style={{ width: 60 }} />
      </View>
      {bookings.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="h4">No bookings yet</Text>
          <Button
            title="Find a Barbershop"
            onPress={() => setCurrentScreen('shops')}
          />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Text variant="h4">{item.shopName}</Text>
              <Text variant="bodySmall" color={theme.colors.textSecondary}>
                {item.service} with {item.barberName}
              </Text>
              <View style={styles.bookingDetails}>
                <Text variant="body">
                  {item.date} at {item.time}
                </Text>
                <Text variant="body" weight="semibold">
                  ${item.price}
                </Text>
              </View>
              {item.status === 'upcoming' && (
                <Button
                  title="Cancel"
                  variant="outline"
                  size="small"
                  onPress={() => cancelBooking(item.id)}
                />
              )}
            </Card>
          )}
        />
      )}
    </View>
  );
};

export const getNavigator = () => BarberModule;
export default BarberModule;

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
  listContent: {
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  barberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summary: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  timeSlot: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 100,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
});
