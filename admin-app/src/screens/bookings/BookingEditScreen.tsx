import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminData } from '@/contexts/AdminDataContext';
import { AdminBooking } from '@/types';
import { adminDataService } from '@/services/adminDataService';

export function BookingEditScreen({ navigation, route }: any) {
  const theme = useTheme();
  const { refreshBookings } = useAdminData();
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const result = await adminDataService.getBooking(bookingId);
      if (result.success && result.data) {
        const bookingData = result.data;
        setBooking(bookingData);
        setCustomerId(bookingData.customerId);
        setServiceId(bookingData.serviceId);
        setDate(bookingData.date);
        setTime(bookingData.time);
        setPriority(bookingData.priority);
        setNotes(bookingData.adminNotes || '');
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async () => {
    if (!booking || !customerId || !serviceId || !date || !time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await adminDataService.updateBooking(bookingId, {
        customerId,
        serviceId,
        date,
        time,
        priority: priority as any,
        adminNotes: notes,
      });
      await refreshBookings();
      Alert.alert('Success', 'Booking updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking');
    }
  };

  if (loading || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            icon="arrow-left"
          >
            Back
          </Button>
          <Text variant="headlineSmall" style={styles.headerTitle}>Edit Booking</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          icon="arrow-left"
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={styles.headerTitle}>Edit Booking</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Booking Information
            </Text>
            <Divider style={styles.divider} />
            
            <TextInput
              label="Customer ID *"
              value={customerId}
              onChangeText={setCustomerId}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Service ID *"
              value={serviceId}
              onChangeText={setServiceId}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Date (YYYY-MM-DD) *"
              value={date}
              onChangeText={setDate}
              style={styles.input}
              mode="outlined"
              placeholder="2024-01-15"
            />
            
            <TextInput
              label="Time (HH:MM) *"
              value={time}
              onChangeText={setTime}
              style={styles.input}
              mode="outlined"
              placeholder="14:30"
            />
            
            <TextInput
              label="Priority"
              value={priority}
              onChangeText={setPriority}
              style={styles.input}
              mode="outlined"
              placeholder="low, medium, high, urgent"
            />
            
            <TextInput
              label="Admin Notes"
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
          </Card.Content>
        </Card>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleUpdateBooking}
            style={styles.actionButton}
          >
            Update Booking
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    marginLeft: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  input: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
});