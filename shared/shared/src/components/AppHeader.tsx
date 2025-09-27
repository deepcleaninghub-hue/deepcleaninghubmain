import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Props { title?: string; showBack?: boolean; onBackPress?: () => void }

const AppHeader: React.FC<Props> = ({ title, showBack, onBackPress }) => {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.customHeader, { backgroundColor: theme.colors.surface }]}>
      {showBack ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBackPress || (() => navigation.goBack())}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      ) : null}
      {title ? (
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
          {title}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  customHeader: {
    height: 56,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    marginRight: 8,
    paddingVertical: 4,
    paddingRight: 8,
    paddingLeft: 0,
  },
});

export default AppHeader;
