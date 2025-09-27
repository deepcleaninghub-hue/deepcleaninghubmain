import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Card, Button, Chip, useTheme, Divider, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface BookingDate {
  date: string;
  time: string;
  id: string;
}

interface MultiDateSelectorProps {
  selectedDates: BookingDate[];
  onDatesChange: (dates: BookingDate[]) => void;
  serviceTime: Date;
  onTimeChange: (time: Date) => void;
  maxDays?: number;
}

const MultiDateSelector: React.FC<MultiDateSelectorProps> = ({
  selectedDates,
  onDatesChange,
  serviceTime,
  onTimeChange,
  maxDays = 7,
}) => {
  const theme = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      onTimeChange(selectedTime);
    }
  };

  const handleAddDate = () => {
    if (selectedDates.length >= maxDays) {
      Alert.alert('Maximum Days Reached', `You can select up to ${maxDays} days for this service.`);
      return;
    }

    if (!tempDate || !serviceTime) return;

    const dateString = tempDate?.toISOString()?.split('T')[0];
    const timeString = serviceTime?.toTimeString()?.split(' ')[0]?.substring(0, 5);

    // Check if this date is already selected
    const isDuplicate = selectedDates.some(
      date => date.date === dateString
    );

    if (isDuplicate) {
      Alert.alert('Date Already Selected', 'This date has already been added to your booking.');
      return;
    }

    const newDate: BookingDate = {
      date: dateString || '',
      time: timeString || '',
      id: `${dateString || ''}_${timeString || ''}_${Date.now()}`,
    };

    onDatesChange([...selectedDates, newDate].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
  };

  const handleRemoveDate = (dateId: string) => {
    onDatesChange(selectedDates.filter(date => date.id !== dateId));
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
  };

  const handleTimeConfirm = () => {
    setShowTimePicker(false);
  };

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              Select Service Dates
            </Text>
            <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {selectedDates.length} of {maxDays} days selected
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Time Selection */}
          <View style={styles.timeSection}>
            <Text variant="bodyMedium" style={[styles.timeLabel, { color: theme.colors.onSurfaceVariant }]}>
              Service Time (same for all days)
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowTimePicker(true)}
              style={styles.timeButton}
              icon="clock-outline"
            >
              {formatTime(serviceTime)}
            </Button>
          </View>

          <Divider style={styles.divider} />

          {/* Date Selection */}
          <View style={styles.dateSection}>
            <Text variant="bodyMedium" style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>
              Add Service Date
            </Text>
            <View style={styles.dateInputRow}>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
                icon="calendar-outline"
              >
                {formatDate(tempDate)}
              </Button>
              <Button
                mode="contained"
                onPress={handleAddDate}
                style={styles.addButton}
                disabled={selectedDates.length >= maxDays}
                icon="plus"
              >
                Add
              </Button>
            </View>
          </View>

          {/* Selected Dates List */}
          {selectedDates.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.selectedDatesSection}>
                <Text variant="bodyMedium" style={[styles.selectedDatesLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Selected Dates
                </Text>
                <View style={styles.selectedDatesList}>
                  {selectedDates.map((date, index) => (
                    <Chip
                      key={date.id}
                      mode="outlined"
                      onClose={() => handleRemoveDate(date.id)}
                      style={[styles.dateChip, { borderColor: theme.colors.primary }]}
                      textStyle={{ color: theme.colors.primary }}
                      icon="calendar"
                    >
                      {formatDate(new Date(date.date))}
                    </Chip>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Instructions */}
          <View style={styles.instructionsSection}>
            <View style={styles.instructionRow}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
                Select multiple dates for recurring service appointments
              </Text>
            </View>
            <View style={styles.instructionRow}>
              <Ionicons name="time-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
                The same time will be used for all selected dates
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.pickerContainer}>
                <Text variant="titleMedium" style={[styles.pickerTitle, { color: theme.colors.onSurface }]}>
                  Select Date
                </Text>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
                {Platform.OS === 'ios' && (
                  <View style={styles.pickerButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => setShowDatePicker(false)}
                      style={styles.pickerButton}
                    >
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleDateConfirm}
                      style={styles.pickerButton}
                    >
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
              <View style={styles.pickerContainer}>
                <Text variant="titleMedium" style={[styles.pickerTitle, { color: theme.colors.onSurface }]}>
                  Select Time
                </Text>
                <DateTimePicker
                  value={serviceTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
                {Platform.OS === 'ios' && (
                  <View style={styles.pickerButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => setShowTimePicker(false)}
                      style={styles.pickerButton}
                    >
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleTimeConfirm}
                      style={styles.pickerButton}
                    >
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
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  timeSection: {
    marginBottom: 16,
  },
  timeLabel: {
    marginBottom: 8,
  },
  timeButton: {
    alignSelf: 'flex-start',
  },
  dateSection: {
    marginBottom: 16,
  },
  dateLabel: {
    marginBottom: 8,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButton: {
    flex: 1,
  },
  addButton: {
    borderRadius: 8,
  },
  selectedDatesSection: {
    marginBottom: 16,
  },
  selectedDatesLabel: {
    marginBottom: 8,
  },
  selectedDatesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    marginBottom: 4,
  },
  instructionsSection: {
    marginTop: 8,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  instructionText: {
    marginLeft: 8,
    flex: 1,
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  pickerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default MultiDateSelector;
