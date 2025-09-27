import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Text, Divider } from 'react-native-paper';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface CustomDrawerContentProps {
  navigation: any;
  state: any;
  descriptors: any;
}

export function CustomDrawerContent({ navigation, state, descriptors }: CustomDrawerContentProps) {
  const { admin, signOut } = useAdminAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={64} 
          label={admin?.firstName?.[0] || 'A'} 
          style={styles.avatar}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {admin?.firstName} {admin?.lastName}
        </Text>
        <Text variant="bodyMedium" style={styles.role}>
          {admin?.role?.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      <Divider style={styles.divider} />

      <ScrollView style={styles.menu}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.drawerLabel || route.name;
          const icon = options.drawerIcon;

          return (
            <DrawerItem
              key={route.key}
              label={label}
              icon={icon}
              active={state.index === index}
              onPress={() => navigation.navigate(route.name)}
              style={styles.menuItem}
            />
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Divider style={styles.divider} />
        <DrawerItem
          label="Sign Out"
          icon={({ color, size }) => <Icon name="logout" size={size} color={color} />}
          onPress={handleSignOut}
          style={styles.signOutItem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  avatar: {
    backgroundColor: '#2196F3',
    marginBottom: 10,
  },
  name: {
    fontWeight: 'bold',
    color: '#212121',
  },
  role: {
    color: '#757575',
    marginTop: 4,
  },
  divider: {
    marginVertical: 10,
  },
  menu: {
    flex: 1,
  },
  menuItem: {
    marginHorizontal: 10,
  },
  footer: {
    paddingBottom: 20,
  },
  signOutItem: {
    marginHorizontal: 10,
  },
});

// Import Icon component
import { Icon } from './Icon';
