import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Button, Avatar, Divider, useTheme, TextInput, Modal, Portal, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { httpClient } from '@/services/httpClient';

export function ProfileScreen({ navigation }: any) {
  const theme = useTheme();
  const { admin, signOut, updateProfile, loading: authLoading } = useAdminAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  const newPasswordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);

  // Helper function to get admin initials
  const getAdminInitials = () => {
    if (!admin) return 'AD';
    if (admin.name) {
      const names = admin.name.split(' ');
      if (names.length >= 2 && names[0] && names[1]) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      if (names[0]) {
        return names[0].charAt(0).toUpperCase();
      }
    }
    if (admin.firstName && admin.lastName) {
      return `${admin.firstName.charAt(0)}${admin.lastName.charAt(0)}`.toUpperCase();
    }
    return admin.email?.charAt(0)?.toUpperCase() || 'AD';
  };

  // Helper function to get admin display name
  const getAdminDisplayName = () => {
    if (!admin) return 'Admin User';
    if (admin.name) return admin.name;
    if (admin.firstName && admin.lastName) {
      return `${admin.firstName} ${admin.lastName}`;
    }
    if (admin.firstName) return admin.firstName;
    if (admin.lastName) return admin.lastName;
    return admin.email || 'Admin User';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh admin data if needed
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    setChangePasswordModalVisible(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancelChangePassword = () => {
    setChangePasswordModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePasswordSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await httpClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Password changed successfully', [
          { text: 'OK', onPress: handleCancelChangePassword }
        ]);
      } else {
        Alert.alert('Error', response.data.error || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to change password';
      Alert.alert('Error', errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'staff':
        return 'Staff';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '#FF6B6B';
      case 'admin':
        return '#4ECDC4';
      case 'manager':
        return '#45B7D1';
      case 'staff':
        return '#96CEB4';
      default:
        return theme.colors.primary;
    }
  };

  if (authLoading || !admin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Profile
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Profile
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.profileContentRow}>
              <Avatar.Text 
                size={80} 
                label={getAdminInitials()}
                style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: theme.colors.onPrimary, fontSize: 28, fontWeight: 'bold' }}
              />
              <View style={styles.profileInfoCol}>
                <Text variant="titleLarge" style={[styles.profileName, { color: theme.colors.onSurface }]}>
                  {getAdminDisplayName()}
                </Text>
                <Text variant="bodyMedium" style={[styles.profileEmail, { color: theme.colors.onSurfaceVariant }]}>
                  {admin.email}
                </Text>
                {admin.phone && (
                  <View style={styles.phoneContainer}>
                    <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
                    <Text variant="bodySmall" style={[styles.phone, { color: theme.colors.onSurfaceVariant }]}>
                      {admin.phone}
                    </Text>
                  </View>
                )}
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(admin.role) + '20' }]}>
                  <Text variant="bodySmall" style={[styles.roleText, { color: getRoleColor(admin.role) }]}>
                    {getRoleDisplayName(admin.role)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.sectionContainer}>
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Quick Actions
              </Text>
              <View style={styles.grid}>
                <TouchableOpacity 
                  style={[styles.gridItem, { backgroundColor: theme.colors.primaryContainer }]} 
                  onPress={handleEditProfile}
                >
                  <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={[styles.gridLabel, { color: theme.colors.onPrimaryContainer }]}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.gridItem, { backgroundColor: theme.colors.secondaryContainer }]} 
                  onPress={handleChangePassword}
                >
                  <Ionicons name="lock-closed-outline" size={24} color={theme.colors.secondary} />
                  <Text variant="bodyMedium" style={[styles.gridLabel, { color: theme.colors.onSecondaryContainer }]}>
                    Change Password
                  </Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Account Information */}
        <View style={styles.sectionContainer}>
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Account Information
              </Text>
              <Divider style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                  User ID
                </Text>
                <Text variant="bodySmall" style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}>
                  {admin.id}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Role
                </Text>
                <Text variant="bodyMedium" style={[styles.infoValue, { color: getRoleColor(admin.role) }]}>
                  {getRoleDisplayName(admin.role)}
                </Text>
              </View>
              
              
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Member Since
                </Text>
                <Text variant="bodySmall" style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}>
                  {new Date(admin.createdAt).toLocaleDateString()}
        </Text>
      </View>
            </Card.Content>
          </Card>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <Card style={[styles.logoutCard, { backgroundColor: theme.colors.errorContainer }]}>
            <Card.Content style={styles.logoutContent}>
              <Button 
                mode="contained" 
                onPress={handleLogout}
                icon="logout"
                style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
                textColor={theme.colors.onError}
                contentStyle={styles.buttonContent}
              >
                Logout
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Portal>
        <Modal
          visible={changePasswordModalVisible}
          onDismiss={handleCancelChangePassword}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Change Password
            </Text>
            <IconButton
              icon="close"
              iconColor={theme.colors.onSurfaceVariant}
              onPress={handleCancelChangePassword}
            />
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => newPasswordRef.current?.focus()}
            />
            
            <TextInput
              ref={newPasswordRef}
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />
            
            <TextInput
              ref={confirmPasswordRef}
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={handleChangePasswordSubmit}
            />
            
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={handleCancelChangePassword}
                style={styles.modalButton}
                disabled={changingPassword}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleChangePasswordSubmit}
                style={styles.modalButton}
                loading={changingPassword}
                disabled={changingPassword}
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  profileSection: {
    marginBottom: 16,
  },
  profileCard: {
    borderRadius: 16,
    elevation: 2,
  },
  profileContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfoCol: {
    flex: 1,
  },
  profileName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phone: {
    marginLeft: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  roleText: {
    fontWeight: '600',
    fontSize: 12,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionCard: {
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 100,
  },
  gridLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingVertical: 4,
  },
  infoLabel: {
    flex: 1,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontWeight: '400',
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  logoutSection: {
    marginBottom: 32,
  },
  logoutCard: {
    borderRadius: 12,
    elevation: 2,
  },
  logoutContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  logoutButton: {
    borderRadius: 8,
    minWidth: 200,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    minWidth: 100,
  },
});
