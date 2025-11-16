import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { Text, Card, Chip, Button, useTheme, Divider } from 'react-native-paper';
import { format, isSameDay, parseISO, startOfWeek, addDays, subDays, addMonths, subMonths } from 'date-fns';
import { AdminBooking } from '@/types';

export type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarViewProps {
  bookings: AdminBooking[];
  onBookingPress: (booking: AdminBooking) => void;
  onMarkComplete?: (bookingId: string) => void;
  viewMode?: CalendarViewMode;
  onViewModeChange?: (mode: CalendarViewMode) => void;
}

interface MarkedDate {
  marked?: boolean;
  dotColor?: string;
  dots?: Array<{ color: string }>;
  selected?: boolean;
  selectedColor?: string;
  customStyles?: {
    container?: any;
    text?: any;
  };
}

export function CalendarView({ 
  bookings, 
  onBookingPress,
  onMarkComplete,
  viewMode: initialViewMode = 'month',
  onViewModeChange 
}: CalendarViewProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initialViewMode);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const handleViewModeChange = (mode: CalendarViewMode) => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  // Get bookings for a specific date
  const getBookingsForDate = (dateString: string): AdminBooking[] => {
    const date = parseISO(dateString);
    return bookings.filter(booking => {
      const bookingDate = booking.booking_date 
        ? parseISO(booking.booking_date)
        : booking.date 
        ? parseISO(booking.date)
        : null;
      
      if (!bookingDate) return false;

      // Check if booking is on this date
      if (isSameDay(bookingDate, date)) {
        return true;
      }

      // Check multi-day bookings
      if (booking.is_multi_day && booking.allBookingDates) {
        return booking.allBookingDates.some((bd: any) => {
          const bdDate = bd.date ? parseISO(bd.date) : null;
          return bdDate && isSameDay(bdDate, date);
        });
      }

      return false;
    });
  };

  // Create marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: Record<string, MarkedDate> = {};
    
    bookings.forEach(booking => {
      const bookingDate = booking.booking_date 
        ? parseISO(booking.booking_date)
        : booking.date 
        ? parseISO(booking.date)
        : null;
      
      if (!bookingDate) return;

      const dateKey = format(bookingDate, 'yyyy-MM-dd');
      
      // Determine color based on status
      let dotColor = theme.colors.primary;
      if (booking.status === 'completed') {
        dotColor = '#4CAF50';
      } else if (booking.status === 'cancelled') {
        dotColor = theme.colors.error;
      } else if (booking.status === 'confirmed') {
        dotColor = '#2196F3';
      }

      if (marked[dateKey]) {
        // Multiple bookings on same date - use different styling
        marked[dateKey].marked = true;
        if (!marked[dateKey].dots) {
          marked[dateKey].dots = [];
        }
        marked[dateKey].dots!.push({ color: dotColor });
      } else {
        marked[dateKey] = {
          marked: true,
          dotColor,
          customStyles: {
            container: {
              backgroundColor: dotColor + '20',
              borderRadius: 4,
            },
            text: {
              color: theme.colors.onSurface,
              fontWeight: '600',
            },
          },
        };
      }

      // Mark multi-day bookings
      if (booking.is_multi_day && booking.allBookingDates) {
        booking.allBookingDates.forEach((bd: any) => {
          const bdDate = bd.date ? parseISO(bd.date) : null;
          if (bdDate) {
            const bdKey = format(bdDate, 'yyyy-MM-dd');
            if (!marked[bdKey]) {
              marked[bdKey] = {
                marked: true,
                dotColor,
                customStyles: {
                  container: {
                    backgroundColor: dotColor + '20',
                    borderRadius: 4,
                  },
                  text: {
                    color: theme.colors.onSurface,
                    fontWeight: '600',
                  },
                },
              };
            }
          }
        });
      }
    });

    // Mark selected date
    if (selectedDate && marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = theme.colors.primary;
    } else if (selectedDate) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: theme.colors.primary,
      };
    }

    return marked;
  }, [bookings, selectedDate, theme]);

  // Get bookings for selected date
  const selectedDateBookings = useMemo(() => {
    return getBookingsForDate(selectedDate);
  }, [selectedDate, bookings]);

  // Get week dates
  const weekDates = useMemo(() => {
    if (viewMode !== 'week') return [];
    const start = startOfWeek(currentMonth, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [viewMode, currentMonth]);

  // Get day bookings for week view
  const getWeekBookings = () => {
    return weekDates.map(date => ({
      date,
      dateString: format(date, 'yyyy-MM-dd'),
      bookings: getBookingsForDate(format(date, 'yyyy-MM-dd')),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return theme.colors.primary;
      case 'confirmed': return '#4CAF50';
      case 'completed': return '#4CAF50';
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleMonthChange = (month: any) => {
    setCurrentMonth(new Date(month.year, month.month - 1, 1));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7)
    );
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1)
    );
    setSelectedDate(format(
      direction === 'prev' ? subDays(currentMonth, 1) : addDays(currentMonth, 1),
      'yyyy-MM-dd'
    ));
  };

  // Render month view
  const renderMonthView = () => (
    <View style={styles.monthViewContainer}>
      <Calendar
        current={format(currentMonth, 'yyyy-MM-dd')}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        onDayPress={handleDateSelect}
        style={styles.calendar}
        theme={{
          backgroundColor: theme.colors.surface,
          calendarBackground: theme.colors.surface,
          textSectionTitleColor: theme.colors.onSurfaceVariant,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.onSurface,
          textDisabledColor: theme.colors.onSurfaceVariant + '80',
          dotColor: theme.colors.primary,
          selectedDotColor: '#ffffff',
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.onSurface,
          textDayFontWeight: '400',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
        }}
        enableSwipeMonths
      />
    </View>
  );

  // Render week view
  const renderWeekView = () => {
    const weekBookings = getWeekBookings();
    
    return (
      <View style={styles.weekViewContainer}>
        <View style={styles.weekHeader}>
          <Button
            icon="chevron-left"
            onPress={() => navigateWeek('prev')}
            mode="outlined"
            compact
          >
            Prev
          </Button>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {weekDates[0] && weekDates[6] 
              ? `${format(weekDates[0], 'MMM d')} - ${format(weekDates[6], 'MMM d, yyyy')}`
              : 'Week View'
            }
          </Text>
          <Button
            icon="chevron-right"
            onPress={() => navigateWeek('next')}
            mode="outlined"
            compact
          >
            Next
          </Button>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.weekScrollView}
          contentContainerStyle={styles.weekScrollContent}
        >
          <View style={styles.weekContainer}>
            {weekBookings.map(({ date, dateString, bookings: dayBookings }) => (
              <View 
                key={dateString} 
                style={[
                  styles.weekDayColumn,
                  selectedDate === dateString && { backgroundColor: theme.colors.primaryContainer }
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleDateSelect({ dateString })}
                  style={styles.weekDayHeader}
                >
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {format(date, 'EEE')}
                  </Text>
                  <Text 
                    variant="titleMedium" 
                    style={{ 
                      color: isSameDay(date, new Date()) 
                        ? theme.colors.primary 
                        : theme.colors.onSurface,
                      fontWeight: isSameDay(date, new Date()) ? 'bold' : 'normal'
                    }}
                  >
                    {format(date, 'd')}
                  </Text>
                  {dayBookings.length > 0 && (
                    <Chip 
                      style={{ height: 20, marginTop: 4 }}
                      textStyle={{ fontSize: 10 }}
                    >
                      {dayBookings.length}
                    </Chip>
                  )}
                </TouchableOpacity>
                <ScrollView 
                  style={styles.weekDayBookings}
                  nestedScrollEnabled
                >
                  {dayBookings.map(booking => (
                    <TouchableOpacity
                      key={booking.id}
                      onPress={() => onBookingPress(booking)}
                      style={[
                        styles.weekBookingItem,
                        { borderLeftColor: getStatusColor(booking.status) }
                      ]}
                    >
                      <Text variant="bodySmall" style={{ fontWeight: '600' }}>
                        {formatTime(booking.booking_time || booking.time)}
                      </Text>
                      <Text variant="bodySmall" numberOfLines={1}>
                        {booking.services?.title || 'Service'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayBookings = getBookingsForDate(selectedDate);
    
    return (
      <View style={styles.dayViewContainer}>
        <View style={styles.dayHeader}>
          <Button
            icon="chevron-left"
            onPress={() => navigateDay('prev')}
            mode="outlined"
            compact
          >
            Prev
          </Button>
          <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
            {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
          </Text>
          <Button
            icon="chevron-right"
            onPress={() => navigateDay('next')}
            mode="outlined"
            compact
          >
            Next
          </Button>
        </View>
        
        <ScrollView 
          style={styles.dayScrollView}
          nestedScrollEnabled
        >
          {dayBookings.length === 0 ? (
            <Card style={{ margin: 16, padding: 24, alignItems: 'center' }}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No bookings for this day
              </Text>
            </Card>
          ) : (
            dayBookings.map(booking => (
              <Card
                key={booking.id}
                style={[styles.bookingCard, { backgroundColor: theme.colors.surface }]}
              >
                <Card.Content>
                  <TouchableOpacity onPress={() => onBookingPress(booking)}>
                    <View style={styles.bookingCardHeader}>
                      <Text variant="titleMedium">
                        {formatTime(booking.booking_time || booking.time)}
                      </Text>
                      <Chip
                        mode="outlined"
                        textStyle={{ color: getStatusColor(booking.status) }}
                        style={{ borderColor: getStatusColor(booking.status) }}
                      >
                        {booking.status}
                      </Chip>
                    </View>
                    <Divider style={{ marginVertical: 8 }} />
                    <Text variant="bodyLarge" style={{ marginBottom: 4 }}>
                      {booking.services?.title || 'Service'}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      €{(booking.total_amount || 0).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                  {booking.status !== 'completed' && booking.status !== 'cancelled' && onMarkComplete && (
                    <View style={styles.dayViewActions}>
                      <Button
                        mode="contained"
                        onPress={() => onMarkComplete(booking.id)}
                        style={styles.completeButton}
                        icon="check-circle"
                        compact
                      >
                        Complete
                      </Button>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* View Mode Selector */}
      <View style={styles.viewModeSelector}>
        <Button
          mode={viewMode === 'month' ? 'contained' : 'outlined'}
          onPress={() => handleViewModeChange('month')}
          compact
          style={styles.viewModeButton}
        >
          Month
        </Button>
        <Button
          mode={viewMode === 'week' ? 'contained' : 'outlined'}
          onPress={() => handleViewModeChange('week')}
          compact
          style={styles.viewModeButton}
        >
          Week
        </Button>
        <Button
          mode={viewMode === 'day' ? 'contained' : 'outlined'}
          onPress={() => handleViewModeChange('day')}
          compact
          style={styles.viewModeButton}
        >
          Day
        </Button>
      </View>

      {/* Calendar Content */}
      <View style={styles.calendarContent}>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </View>

      {/* Selected Date Bookings (for month view) */}
      {viewMode === 'month' && selectedDateBookings.length > 0 && (
        <Card style={[styles.selectedDateCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {format(parseISO(selectedDate), 'EEEE, MMMM d')}
            </Text>
            <Divider style={{ marginBottom: 8 }} />
            <ScrollView nestedScrollEnabled>
              {selectedDateBookings.map(booking => (
                <TouchableOpacity
                  key={booking.id}
                  onPress={() => onBookingPress(booking)}
                  style={styles.selectedDateBooking}
                >
                  <View style={styles.selectedDateBookingInfo}>
                    <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                      {formatTime(booking.booking_time || booking.time)}
                    </Text>
                    <Text variant="bodySmall" numberOfLines={1}>
                      {booking.services?.title || 'Service'}
                    </Text>
                  </View>
                  <Chip
                    mode="outlined"
                    textStyle={{ fontSize: 10, color: getStatusColor(booking.status) }}
                    style={{ borderColor: getStatusColor(booking.status), height: 24 }}
                  >
                    {booking.status}
                  </Chip>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  viewModeSelector: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    backgroundColor: 'transparent',
  },
  viewModeButton: {
    flex: 1,
  },
  calendarContent: {
    flex: 1,
    width: '100%',
  },
  monthViewContainer: {
    width: '100%',
    paddingHorizontal: 4,
  },
  calendar: {
    width: '100%',
  },
  weekViewContainer: {
    flex: 1,
    width: '100%',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 8,
  },
  weekScrollView: {
    flex: 1,
  },
  weekScrollContent: {
    paddingHorizontal: 8,
  },
  weekContainer: {
    flexDirection: 'row',
    minHeight: 400,
  },
  weekDayColumn: {
    width: 120,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    backgroundColor: 'transparent',
  },
  weekDayHeader: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 80,
  },
  weekDayBookings: {
    flex: 1,
    padding: 4,
  },
  weekBookingItem: {
    padding: 8,
    borderLeftWidth: 3,
    marginBottom: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  dayViewContainer: {
    flex: 1,
    width: '100%',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 8,
  },
  dayScrollView: {
    flex: 1,
    width: '100%',
  },
  bookingCard: {
    margin: 16,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDateCard: {
    margin: 16,
    marginTop: 8,
    marginHorizontal: 8,
    maxHeight: 300,
  },
  selectedDateBooking: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedDateBookingInfo: {
    flex: 1,
    marginRight: 8,
  },
  dayViewActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
});

