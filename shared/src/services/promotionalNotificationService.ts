/**
 * Promotional Notification Service
 * 
 * Automatically schedules local notifications for weekend and holiday discounts
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Public holidays in Germany (2025-2027)
const PUBLIC_HOLIDAYS = [
    // 2025
    '2025-01-01', '2025-04-18', '2025-04-21', '2025-05-01', '2025-05-29',
    '2025-06-09', '2025-06-19', '2025-10-03', '2025-10-31', '2025-12-25', '2025-12-26',

    // 2026
    '2026-01-01', '2026-03-08', '2026-04-03', '2026-04-06', '2026-05-01',
    '2026-05-14', '2026-05-25', '2026-06-04', '2026-10-03', '2026-10-31',
    '2026-12-25', '2026-12-26',

    // 2027
    '2027-01-01', '2027-03-26', '2027-03-28', '2027-03-29', '2027-05-01',
    '2027-05-06', '2027-05-17', '2027-05-27', '2027-10-03', '2027-10-31',
    '2027-12-25', '2027-12-26',
];

interface PromotionalNotification {
    id: string;
    date: string;
    type: 'weekend' | 'holiday';
}

class PromotionalNotificationService {
    private storageKey = 'scheduled_promotional_notifications';
    private lastScheduledKey = 'last_promo_schedule_date';

    /**
     * Initialize promotional notifications
     * Schedules all weekend and holiday notifications
     */
    async initialize(): Promise<void> {
        try {
            console.log('🎁 Initializing promotional notifications...');

            // Check if we need to reschedule
            const shouldReschedule = await this.shouldReschedule();
            if (!shouldReschedule) {
                console.log('✅ Promotional notifications already scheduled for today');
                return;
            }

            // Cancel all existing promotional notifications
            await this.cancelAllPromotionalNotifications();

            // Schedule new notifications
            await this.scheduleAllPromotions();

            // Update last scheduled date
            await AsyncStorage.setItem(this.lastScheduledKey, new Date().toISOString());

            console.log('✅ Promotional notifications scheduled successfully');
        } catch (error) {
            console.error('❌ Error initializing promotional notifications:', error);
        }
    }

    /**
     * Check if we should reschedule notifications
     * Returns true if it's been more than 24 hours since last schedule
     */
    private async shouldReschedule(): Promise<boolean> {
        try {
            const lastScheduled = await AsyncStorage.getItem(this.lastScheduledKey);
            if (!lastScheduled) {
                return true;
            }

            const lastDate = new Date(lastScheduled);
            const now = new Date();
            const hoursSinceLastSchedule = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

            // Reschedule if it's been more than 24 hours
            return hoursSinceLastSchedule > 24;
        } catch (error) {
            console.error('Error checking reschedule status:', error);
            return true;
        }
    }

    /**
     * Schedule all promotional notifications (weekends + holidays)
     */
    private async scheduleAllPromotions(): Promise<void> {
        const now = new Date();
        const scheduledNotifications: PromotionalNotification[] = [];

        // Schedule for next 90 days (Expo has a limit on scheduled notifications)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 90);

        // Schedule weekend promotions
        const weekendNotifications = await this.scheduleWeekendPromotions(now, endDate);
        scheduledNotifications.push(...weekendNotifications);

        // Schedule holiday promotions
        const holidayNotifications = await this.scheduleHolidayPromotions(now, endDate);
        scheduledNotifications.push(...holidayNotifications);

        // Store scheduled notifications
        await AsyncStorage.setItem(
            this.storageKey,
            JSON.stringify(scheduledNotifications)
        );

        console.log(`📅 Scheduled ${scheduledNotifications.length} promotional notifications`);
    }

    /**
     * Schedule weekend promotional notifications (20% OFF)
     */
    private async scheduleWeekendPromotions(
        startDate: Date,
        endDate: Date
    ): Promise<PromotionalNotification[]> {
        const notifications: PromotionalNotification[] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();

            // Saturday (6) or Sunday (0)
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                const dateStr = this.formatDate(currentDate);

                // Skip if it's a public holiday (holiday notifications take precedence)
                if (!PUBLIC_HOLIDAYS.includes(dateStr)) {
                    // Schedule notification for 10 AM
                    const notificationDate = new Date(currentDate);
                    notificationDate.setHours(10, 0, 0, 0);

                    // Only schedule if it's in the future
                    if (notificationDate > new Date()) {
                        try {
                            const notificationId = await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: '✨ Keep Your Home Spotless!',
                                    body: 'Get 20% OFF Deep Cleaning this weekend! Book your professional cleaning today and enjoy a sparkling home at the best price. Quality you can trust 🏆',
                                    data: {
                                        type: 'weekend_promotion',
                                        discount: '20',
                                        date: dateStr,
                                    },
                                    sound: 'default',
                                },
                                trigger: notificationDate as any,
                            });

                            notifications.push({
                                id: notificationId,
                                date: dateStr,
                                type: 'weekend',
                            });
                        } catch (error) {
                            console.error(`Failed to schedule weekend notification for ${dateStr}:`, error);
                        }
                    }
                }
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(`📅 Scheduled ${notifications.length} weekend promotions`);
        return notifications;
    }

    /**
     * Schedule holiday promotional notifications (25% OFF)
     */
    private async scheduleHolidayPromotions(
        startDate: Date,
        endDate: Date
    ): Promise<PromotionalNotification[]> {
        const notifications: PromotionalNotification[] = [];

        for (const holiday of PUBLIC_HOLIDAYS) {
            const holidayDate = new Date(holiday);

            // Only schedule if within our date range and in the future
            if (holidayDate >= startDate && holidayDate <= endDate && holidayDate > new Date()) {
                // Schedule notification for 9 AM on the holiday
                const notificationDate = new Date(holidayDate);
                notificationDate.setHours(9, 0, 0, 0);

                try {
                    const notificationId = await Notifications.scheduleNotificationAsync({
                        content: {
                            title: '🎉 Festival Cleaning Offer 🎉',
                            body: 'Save 25% OFF – Limited Time! Whether it\'s Christmas 🎄 or a special celebration 🎊 — make your home shine. Book today & relax tomorrow.',
                            data: {
                                type: 'holiday_promotion',
                                discount: '25',
                                date: holiday,
                            },
                            sound: 'default',
                        },
                        trigger: notificationDate as any,
                    });

                    notifications.push({
                        id: notificationId,
                        date: holiday,
                        type: 'holiday',
                    });
                } catch (error) {
                    console.error(`Failed to schedule holiday notification for ${holiday}:`, error);
                }
            }
        }

        console.log(`📅 Scheduled ${notifications.length} holiday promotions`);
        return notifications;
    }

    /**
     * Cancel all promotional notifications
     */
    async cancelAllPromotionalNotifications(): Promise<void> {
        try {
            // Get stored notification IDs
            const storedData = await AsyncStorage.getItem(this.storageKey);
            if (storedData) {
                const notifications: PromotionalNotification[] = JSON.parse(storedData);

                // Cancel each notification
                for (const notification of notifications) {
                    try {
                        await Notifications.cancelScheduledNotificationAsync(notification.id);
                    } catch (error) {
                        // Notification might already be delivered or not exist
                    }
                }
            }

            // Clear storage
            await AsyncStorage.removeItem(this.storageKey);
            console.log('🗑️ Cancelled all promotional notifications');
        } catch (error) {
            console.error('Error cancelling promotional notifications:', error);
        }
    }

    /**
     * Get all scheduled promotional notifications
     */
    async getScheduledPromotions(): Promise<PromotionalNotification[]> {
        try {
            const storedData = await AsyncStorage.getItem(this.storageKey);
            if (storedData) {
                return JSON.parse(storedData);
            }
            return [];
        } catch (error) {
            console.error('Error getting scheduled promotions:', error);
            return [];
        }
    }

    /**
     * Manually trigger a test promotional notification
     */
    async sendTestPromotion(type: 'weekend' | 'holiday', delaySeconds: number = 2): Promise<string | null> {
        try {
            const isWeekend = type === 'weekend';

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: isWeekend ? '✨ Keep Your Home Spotless!' : '🎉 Festival Cleaning Offer 🎉',
                    body: isWeekend
                        ? 'Get 20% OFF Deep Cleaning this weekend! Book your professional cleaning today and enjoy a sparkling home at the best price. Quality you can trust 🏆'
                        : 'Save 25% OFF – Limited Time! Whether it\'s Christmas 🎄 or a special celebration 🎊 — make your home shine. Book today & relax tomorrow.',
                    data: {
                        type: `${type}_promotion`,
                        discount: isWeekend ? '20' : '25',
                        test: true,
                    },
                    sound: 'default',
                },
                trigger: { seconds: delaySeconds } as any,
            });

            console.log(`🧪 Test ${type} promotion scheduled for ${delaySeconds} seconds`);
            return notificationId;
        } catch (error) {
            console.error('Error sending test promotion:', error);
            return null;
        }
    }

    /**
     * Schedule a test notification for a specific time (for real-time testing)
     */
    async scheduleTestAtTime(type: 'weekend' | 'holiday', minutesFromNow: number): Promise<string | null> {
        try {
            const isWeekend = type === 'weekend';
            const scheduledTime = new Date();
            scheduledTime.setMinutes(scheduledTime.getMinutes() + minutesFromNow);

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: isWeekend ? '✨ Keep Your Home Spotless!' : '🎉 Festival Cleaning Offer 🎉',
                    body: isWeekend
                        ? 'Get 20% OFF Deep Cleaning this weekend! Book your professional cleaning today and enjoy a sparkling home at the best price. Quality you can trust 🏆'
                        : 'Save 25% OFF – Limited Time! Whether it\'s Christmas 🎄 or a special celebration 🎊 — make your home shine. Book today & relax tomorrow.',
                    data: {
                        type: `${type}_promotion`,
                        discount: isWeekend ? '20' : '25',
                        test: true,
                        scheduledFor: scheduledTime.toISOString(),
                    },
                    sound: 'default',
                },
                trigger: scheduledTime as any,
            });

            console.log(`🧪 Test ${type} promotion scheduled for ${scheduledTime.toLocaleTimeString()}`);
            return notificationId;
        } catch (error) {
            console.error('Error scheduling test at specific time:', error);
            return null;
        }
    }

    /**
     * Format date as YYYY-MM-DD
     */
    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

export const promotionalNotificationService = new PromotionalNotificationService();
export default promotionalNotificationService;

