import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Divider, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiDateSelector from '../../../../shared/src/components/MultiDateSelector';
import { BookingDate } from '../../../../shared/src/types';

export function BookingCreateScreen({ navigation }: any) {
  const theme = useTheme();
  const [customerId, setCustomerId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  
  // Multi-day booking state
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDates, setSelectedDates] = useState<BookingDate[]>([]);
  const [serviceTime, setServiceTime] = useState(new Date());

  const handleCreateBooking = async () => {
    if (!customerId || !serviceId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (isMultiDay && selectedDates.length === 0) {
      Alert.alert('Error', 'Please select at least one service date');
      return;
    }
    
    if (!isMultiDay && (!date || !time)) {
      Alert.alert('Error', 'Please select service date and time');
      return;
    }

    try {
      // In a real app, you would call the API here
      Alert.alert('Success', 'Booking created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking');
    }
  };

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
        <Text variant="headlineSmall" style={styles.headerTitle}>Create Booking</Text>
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
            
            {/* Multi-day booking toggle */}
            <View style={styles.multiDayToggle}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Multiple Days
              </Text>
              <Switch
                value={isMultiDay}
                onValueChange={setIsMultiDay}
                color={theme.colors.primary}
              />
            </View>
            
            {isMultiDay ? (
              <MultiDateSelector
                selectedDates={selectedDates}
                onDatesChange={setSelectedDates}
                serviceTime={serviceTime}
                onTimeChange={setServiceTime}
                maxDays={7}
              />
            ) : (
              <>
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
              </>
            )}
            
            <TextInput
              label="Priority"
              value={priority}
              onChangeText={setPriority}
              style={styles.input}
              mode="outlined"
              placeholder="low, medium, high, urgent"
            />
            
            <TextInput
              label="Notes"
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
            onPress={handleCreateBooking}
            style={styles.actionButton}
          >
            Create Booking
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
  multiDayToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
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