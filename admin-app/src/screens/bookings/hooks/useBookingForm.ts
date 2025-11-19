/**
 * Hook for managing booking form state
 */

import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { AdminService } from '@/types';
import { ServiceVariant } from '../components/ServiceVariantSelector';
import { BookingDate } from '../utils/bookingDataBuilder';
import { adminDataService } from '@/services/adminDataService';
import { validateDate, validateTime } from '../utils/validations';

const getInitialDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
};

const getInitialTime = () => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
    return futureTime;
};

export function useBookingForm() {
    // Customer
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    // Service selection
    const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('');
    const [selectedServiceType, setSelectedServiceType] = useState<AdminService | null>(null);
    const [selectedServiceVariant, setSelectedServiceVariant] = useState<ServiceVariant | null>(null);

    // Variant configuration
    const [variantQuantity, setVariantQuantity] = useState('1');
    const [variantMeasurement, setVariantMeasurement] = useState('');
    const [distance, setDistance] = useState('');
    const [numberOfBoxes, setNumberOfBoxes] = useState('');

    // Date and time
    const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
    const [selectedTime, setSelectedTime] = useState<Date>(getInitialTime());
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [selectedDates, setSelectedDates] = useState<BookingDate[]>([]);
    const [serviceTime, setServiceTime] = useState(new Date());

    // Form fields
    const [serviceAddress, setServiceAddress] = useState('');
    const [notes, setNotes] = useState('');

    // Computed values
    const isHouseMovingService =
        selectedServiceType?.title?.toLowerCase().includes('moving') ||
        selectedServiceType?.title?.toLowerCase().includes('house') ||
        selectedServiceCategory === 'moving';

    const isWeeklyCleaningService =
        selectedServiceType?.id === 'weekly-cleaning' ||
        selectedServiceType?.title?.toLowerCase().includes('weekly cleaning') ||
        selectedServiceVariant?.title?.toLowerCase().includes('weekly cleaning') ||
        selectedServiceVariant?.id === 'weekly-cleaning';

    // Initialize date and time strings on mount
    useEffect(() => {
        const initialDate = getInitialDate();
        const initialTime = getInitialTime();
        setDate(initialDate.toISOString().split('T')[0] || '');
        setTime(initialTime.toTimeString().split(' ')[0]?.substring(0, 5) || '09:00');
    }, []);

    // Reset variant configuration when variant changes
    useEffect(() => {
        if (selectedServiceVariant) {
            setVariantQuantity('1');
            setVariantMeasurement('');
            setDistance('');
            setNumberOfBoxes('');
        }
    }, [selectedServiceVariant]);

    // Note: Services and variants are now loaded by the selector components themselves using cache
    // This hook no longer needs to fetch them

    const handleDateChange = (pickedDate: Date) => {
        const dateResult = validateDate(pickedDate);
        if (!dateResult.isValid) {
            Alert.alert('Invalid Date', dateResult.error || 'Please select a valid date');
            return;
        }

        setSelectedDate(pickedDate);
        const formattedDate = pickedDate.toISOString().split('T')[0] || '';
        setDate(formattedDate);

        // If the selected date is today, reset time to current time + 1 hour
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pickedDateOnly = new Date(pickedDate);
        pickedDateOnly.setHours(0, 0, 0, 0);

        if (pickedDateOnly.getTime() === today.getTime()) {
            const now = new Date();
            const futureTime = new Date(now.getTime() + 60 * 60 * 1000);
            setSelectedTime(futureTime);
            const formattedTime = futureTime.toTimeString().split(' ')[0]?.substring(0, 5) || '09:00';
            setTime(formattedTime);
        }
    };

    const handleTimeChange = (pickedTime: Date) => {
        const timeResult = validateTime(pickedTime, selectedDate);
        if (!timeResult.isValid) {
            Alert.alert('Invalid Time', timeResult.error || 'Please select a valid time');
            return;
        }

        setSelectedTime(pickedTime);
        const formattedTime = pickedTime.toTimeString().split(' ')[0]?.substring(0, 5) || '09:00';
        setTime(formattedTime);
    };

    return {
        // Customer
        selectedCustomer,
        setSelectedCustomer,

        // Service selection
        selectedServiceCategory,
        setSelectedServiceCategory,
        selectedServiceType,
        setSelectedServiceType,
        selectedServiceVariant,
        setSelectedServiceVariant,

        // Variant configuration
        variantQuantity,
        setVariantQuantity,
        variantMeasurement,
        setVariantMeasurement,
        distance,
        setDistance,
        numberOfBoxes,
        setNumberOfBoxes,

        // Date and time
        selectedDate,
        selectedTime,
        date,
        time,
        selectedDates,
        setSelectedDates,
        serviceTime,
        setServiceTime,
        handleDateChange,
        handleTimeChange,

        // Form fields
        serviceAddress,
        setServiceAddress,
        notes,
        setNotes,

        // Computed
        isHouseMovingService,
        isWeeklyCleaningService,
    };
}

