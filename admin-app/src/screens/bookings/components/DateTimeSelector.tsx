/**
 * Date and Time Selector Component
 * Handles single date/time selection or multi-date selection for weekly cleaning
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Button, useTheme } from 'react-native-paper';
import MultiDateSelector from '../../../../../shared/src/components/MultiDateSelector';
import { BookingDate } from '../../../../../shared/src/types';

interface DateTimeSelectorProps {
  date: string;
  time: string;
  selectedDate: Date;
  selectedTime: Date;
  selectedDates: BookingDate[];
  serviceTime: Date;
  isWeeklyCleaning: boolean;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
  onDatesChange: (dates: BookingDate[]) => void;
  onServiceTimeChange: (time: Date) => void;
}

export function DateTimeSelector({
  date,
  time,
  selectedDate,
  selectedTime,
  selectedDates,
  serviceTime,
  isWeeklyCleaning,
  onDateChange,
  onTimeChange,
  onDatesChange,
  onServiceTimeChange,
}: DateTimeSelectorProps) {
  const theme = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDisplayTime = (time: Date): string => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleDateChange = (event: any, pickedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (pickedDate) {
      onDateChange(pickedDate);
    }
  };

  const handleTimeChange = (event: any, pickedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (pickedTime) {
      onTimeChange(pickedTime);
    }
  };

  if (isWeeklyCleaning) {
    return (
      <View>
        <View style={styles.multiDayInfoContainer}>
          <Text variant="bodyMedium" style={[styles.multiDayInfoText, { color: theme.colors.primary }]}>
            Weekly Cleaning Service - Multiple Days Required
          </Text>
        </View>
        <MultiDateSelector
          selectedDates={selectedDates}
          onDatesChange={onDatesChange}
          serviceTime={serviceTime}
          onTimeChange={onServiceTimeChange}
          maxDays={7}
          t={(key: string) => key}
        />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Service Date *
        </Text>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.button}
          contentStyle={styles.buttonContent}
          icon="calendar"
        >
          {date ? formatDisplayDate(selectedDate) : 'Select Date'}
        </Button>
      </View>

      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Service Time *
        </Text>
        <Button
          mode="outlined"
          onPress={() => setShowTimePicker(true)}
          style={styles.button}
          contentStyle={styles.buttonContent}
          icon="clock-outline"
        >
          {time ? formatDisplayTime(selectedTime) : 'Select Time'}
        </Button>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.pickerContainer, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleMedium" style={[styles.pickerTitle, { color: theme.colors.onSurface }]}>
                  Select Date
                </Text>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
                {Platform.OS === 'ios' && (
                  <View style={styles.pickerButtons}>
                    <Button mode="outlined" onPress={() => setShowDatePicker(false)} style={styles.pickerButton}>
                      Cancel
                    </Button>
                    <Button mode="contained" onPress={() => setShowDatePicker(false)} style={styles.pickerButton}>
                      OK
                    </Button>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.pickerContainer, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleMedium" style={[styles.pickerTitle, { color: theme.colors.onSurface }]}>
                  Select Time
                </Text>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
                {Platform.OS === 'ios' && (
                  <View style={styles.pickerButtons}>
                    <Button mode="outlined" onPress={() => setShowTimePicker(false)} style={styles.pickerButton}>
                      Cancel
                    </Button>
                    <Button mode="contained" onPress={() => setShowTimePicker(false)} style={styles.pickerButton}>
                      OK
                    </Button>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  multiDayInfoContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  multiDayInfoText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerContainer: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  pickerButton: {
    minWidth: 80,
  },
});

