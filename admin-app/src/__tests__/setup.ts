// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-paper
jest.mock('react-native-paper', () => {
    const actual = jest.requireActual('react-native-paper');
    return {
        ...actual,
        useTheme: () => ({
            colors: {
                primary: '#2196F3',
                primaryContainer: '#E3F2FD',
                secondary: '#FF9800',
                secondaryContainer: '#FFF3E0',
                tertiary: '#4CAF50',
                tertiaryContainer: '#E8F5E8',
                surface: '#FFFFFF',
                surfaceVariant: '#F5F5F5',
                background: '#FAFAFA',
                error: '#F44336',
                errorContainer: '#FFEBEE',
                onPrimary: '#FFFFFF',
                onSecondary: '#FFFFFF',
                onTertiary: '#FFFFFF',
                onSurface: '#212121',
                onSurfaceVariant: '#757575',
                onBackground: '#212121',
                onError: '#FFFFFF',
                outline: '#E0E0E0',
                outlineVariant: '#F0F0F0',
            },
            roundness: 8,
        }),
    };
});

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');
    return {
        ...actual,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
            setOptions: jest.fn(),
        }),
        useRoute: () => ({
            params: {},
        }),
    };
});

// Mock expo modules
jest.mock('expo-status-bar', () => ({
    StatusBar: 'StatusBar',
}));

jest.mock('expo-constants', () => ({
    default: {
        expoConfig: {},
    },
}));

// Mock react-native-calendars
jest.mock('react-native-calendars', () => ({
    Calendar: 'Calendar',
    CalendarList: 'CalendarList',
    Agenda: 'Agenda',
}));

// Mock date-fns
jest.mock('date-fns', () => jest.requireActual('date-fns'));

// Mock axios
jest.mock('axios', () => {
    const actual = jest.requireActual('axios');
    return {
        ...actual,
        create: jest.fn(() => ({
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
            interceptors: {
                request: {
                    use: jest.fn(),
                },
                response: {
                    use: jest.fn(),
                },
            },
        })),
    };
});

// Suppress console errors in tests
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};

