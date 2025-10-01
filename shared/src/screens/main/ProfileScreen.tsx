// Enhanced with new color palette: #F9F7F7, #DBE2EF, #3F72AF, #112D4E
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Platform, Linking, Dimensions, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Button, Avatar, Divider, useTheme, IconButton, Badge, ActivityIndicator, TextInput, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { EnhancedLanguageSelector } from '../../components/EnhancedLanguageSelector';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProfileStackScreenProps } from '../../navigation/types';
import { profileAPI, ChangePasswordData } from '../../services/profileAPI';
import AppModal from '../../components/common/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Props = ProfileStackScreenProps<'ProfileMain'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { height: screenHeight } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const { user, signOut, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const { modalConfig, visible, hideModal, showError, showSuccess, showConfirm } = useAppModal();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteAccountStep, setDeleteAccountStep] = useState(0); // 0: not started, 1: first confirmation, 2: second confirmation
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Helper function to get user initials safely
  const getUserInitials = () => {
    if (!user) return 'GU';
    if (!user.firstName || !user.lastName) return user.email?.charAt(0)?.toUpperCase() || 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  // Helper function to get user display name safely (handles camelCase and snake_case)
  const getUserDisplayName = () => {
    if (!user) return t('profile.guestUser');
    const first = (user as any).firstName || (user as any).first_name || '';
    const last = (user as any).lastName || (user as any).last_name || '';
    const full = `${first} ${last}`.trim();
    if (full.length > 0) return full;
    if (first) return first;
    if (last) return last;
    return user.email || t('profile.guestUser');
  };

  const handleEditProfile = () => {
    if (navigation) {
      navigation.navigate('EditProfile');
    }
  };

  const handleSettings = () => {
    showError(t('profile.settings'), t('profile.settingsComingSoon'));
  };

  const handleLogout = () => {
    showConfirm(
      t('common.logout'),
      t('profile.logoutConfirm'),
      () => signOut(),
      undefined,
      t('common.logout'),
      t('common.cancel')
    );
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleChangePassword = () => {
    setChangePasswordModalVisible(true);
  };

  const handleChangeLanguage = () => {
    setLanguageSelectorVisible(true);
  };

  const handleChangePasswordSubmit = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showError(t('common.error'), t('profile.fillAllFields'));
      return;
    }

    if (newPassword.length < 6) {
      showError(t('common.error'), t('profile.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      showError(t('common.error'), t('profile.passwordsDoNotMatch'));
      return;
    }

    setChangingPassword(true);

    try {
      const passwordData = {
        currentPassword: currentPassword,
        newPassword: newPassword
      };

      const result = await profileAPI.changePassword(passwordData);

      if (result.success) {
        showSuccess(t('common.success'), t('profile.passwordChangeSuccess'), () => {
          setChangePasswordModalVisible(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        });
      } else {
        showError(t('common.error'), result.error || t('profile.passwordChangeError'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError(t('common.error'), t('profile.unexpectedError'));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelChangePassword = () => {
    setChangePasswordModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    if (deleteAccountStep === 0) {
      // First step: Initial warning
      showConfirm(
        t('profile.deleteAccountStep1Title'),
        t('profile.deleteAccountStep1Message'),
        () => {
          setDeleteAccountStep(1);
          // Show second confirmation after a brief delay
          setTimeout(() => {
            handleSecondDeleteConfirmation();
          }, 500);
        },
        undefined,
        t('profile.iUnderstandContinue'),
        t('common.cancel')
      );
    }
  };

  const handleSecondDeleteConfirmation = () => {
    showConfirm(
      t('profile.deleteAccountStep2'),
      t('profile.deleteAccountFinal'),
      () => {
        setDeleteAccountStep(2);
        // Show input dialog
        setTimeout(() => {
          handleDeleteConfirmationInput();
        }, 300);
      },
      () => setDeleteAccountStep(0),
      t('profile.typeDeleteToConfirmButton'),
      t('common.cancel')
    );
  };

  const handleDeleteConfirmationInput = () => {
    // TODO: Implement proper text input modal for delete confirmation
    // For now, show a simple confirmation
    showConfirm(
      t('profile.deleteAccountStep2'),
      t('profile.typeDeleteToConfirm'),
      () => {
        // Proceed with actual deletion
        handleActualDeleteAccount();
      },
      () => setDeleteAccountStep(0),
      t('profile.deleteForever'),
      t('common.cancel')
    );
  };

  const handleActualDeleteAccount = () => {
    showSuccess(
      t('profile.accountDeletedTitle'),
      t('profile.accountDeletedMessage'),
      () => {
        setDeleteAccountStep(0);
        // Here you would call the actual delete API
        // For now, just show the coming soon message
      }
    );
  };

  const handleRateApp = async () => {
    // try {
    //   const iosUrl = 'itms-apps://itunes.apple.com/app/id000000000?action=write-review';
    //   const androidUrl = 'market://details?id=com.deepcleanhub.app';
    //   const url = Platform.OS === 'ios' ? iosUrl : androidUrl;
    //   const fallback = Platform.OS === 'ios'
    //     ? 'https://apps.apple.com/app/id000000000'
    //     : 'https://play.google.com/store/apps/details?id=com.deepcleanhub.app';
    //   const can = await Linking.canOpenURL(url);
    //   await Linking.openURL(can ? url : fallback);
    // } catch {}
  };

  const getAppVersion = () => {
    try {
      const Constants = require('expo-constants').default;
      return Constants?.manifest2?.extra?.expoClient?.version || Constants?.manifest?.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  };

  // Show loading state if auth is still loading
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>{t('profile.loadingProfile')}</Text>
      </View>
    );
  }

  const handleMenuPress = (menuItem: string) => {
    if (menuItem === t('profile.myOrders')) {
      // Navigate to Orders tab - this will be handled by the main tab navigator
      showError(t('profile.orders'), t('profile.navigateToOrders'));
    } else {
      showError(menuItem, `${menuItem} ${t('profile.functionalityComingSoon')}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('profile.title')}/>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={[styles.scrollContent, { minHeight: screenHeight }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
        {/* Enhanced Profile Section */}
        <View style={styles.profileSection}>
          <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.profileContentRow}>
              <Avatar.Text 
                size={72} 
                label={getUserInitials()}
                style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: theme.colors.onPrimary, fontSize: 26, fontWeight: 'bold' }}
              />
              <View style={styles.profileInfoCol}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                  {getUserDisplayName()}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {user?.email || t('profile.noEmail')}
                </Text>
                {user?.phone && (
                  <View style={styles.phoneContainer}>
                    <Ionicons name="call" size={16} color={theme.colors.primary} />
                    <Text variant="bodySmall" style={[styles.phone, { color: theme.colors.onSurfaceVariant }]}>
                      {user.phone}
                    </Text>
                  </View>
                )}
                {/* Edit profile button removed */}
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Stats section removed */}

        {/* Menu section removed */}

        {/* Quick Actions Grid */}
        <View style={styles.sectionContainer}>
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700', marginBottom: 8 }}>{t('profile.quickActions')}</Text>
              <View style={styles.grid}>
                <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.colors.primaryContainer }]} onPress={handleEditProfile}>
                  <Ionicons name="person" size={20} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={[styles.gridLabel, { color: theme.colors.onPrimaryContainer }]}>{t('profile.editProfile')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.colors.secondaryContainer }]} onPress={() => navigation.navigate('Orders' as any)}>
                  <Ionicons name="receipt" size={20} color={theme.colors.secondary} />
                  <Text variant="bodyMedium" style={[styles.gridLabel, { color: theme.colors.onSecondaryContainer }]}>{t('profile.myOrders')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.colors.tertiaryContainer }]} onPress={handleChangePassword}>
                  <Ionicons name="lock-closed" size={20} color={theme.colors.tertiary} />
                  <Text variant="bodyMedium" style={[styles.gridLabel, { color: theme.colors.onTertiaryContainer }]}>{t('profile.changePassword')}</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.colors.primaryContainer }]} onPress={handleChangeLanguage}>
                   <Ionicons name="language" size={20} color={theme.colors.primary} />
                   <Text variant="bodyMedium" style={[styles.gridLabel, { color: theme.colors.onPrimaryContainer }]}>{t('profile.changeLanguage')}</Text>
                 </TouchableOpacity>
                <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.colors.secondaryContainer }]} onPress={() => navigation.navigate('Services' as any)}>
                  <Ionicons name="briefcase" size={20} color={theme.colors.secondary} />
                  <Text variant="bodyMedium" style={[styles.gridLabel, { color: theme.colors.onSecondaryContainer }]}>{t('profile.browseServices')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.colors.errorContainer }]} onPress={handleDeleteAccount}>
                  <Ionicons name="trash" size={20} color={theme.colors.error} />
                  <Text variant="bodyMedium" style={[styles.gridLabel, { color: theme.colors.onErrorContainer }]}>{t('profile.deleteAccount')}</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Account Actions removed */}

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
                {t('common.logout')}
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <AppModal
        visible={changePasswordModalVisible}
        onDismiss={handleCancelChangePassword}
        title={t('profile.changePassword')}
        message=""
        showCloseButton={true}
        maxHeight={500}
        children={
          <View style={styles.modalContent}>
            <TextInput
              label={t('profile.currentPassword')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            
            <TextInput
              label={t('profile.newPassword')}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            
            <TextInput
              label={t('profile.confirmNewPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
              returnKeyType="done"
              blurOnSubmit={true}
            />
            
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={handleCancelChangePassword}
                style={styles.modalButton}
                disabled={changingPassword}
              >
                {t('common.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleChangePasswordSubmit}
                style={styles.modalButton}
                loading={changingPassword}
                disabled={changingPassword}
              >
                {changingPassword ? t('profile.changingPassword') : t('profile.changePassword')}
              </Button>
            </View>
          </View>
        }
      />

       {/* Language Selector Modal */}
          <EnhancedLanguageSelector
            visible={languageSelectorVisible}
            onDismiss={() => setLanguageSelectorVisible(false)}
          />

       {/* App Modal */}
       <AppModal
         visible={visible}
         onDismiss={hideModal}
         title={modalConfig?.title || ''}
         message={modalConfig?.message || ''}
         type={modalConfig?.type}
         showCancel={modalConfig?.showCancel}
         confirmText={modalConfig?.confirmText}
         cancelText={modalConfig?.cancelText}
         onConfirm={modalConfig?.onConfirm}
         onCancel={modalConfig?.onCancel}
         icon={modalConfig?.icon}
       />
     </SafeAreaView>
   );
 };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBE2EF', // Soft blue-gray for profile section
  },
  scrollContainer: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 24,
  },
  profileSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  profileCard: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#112D4E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  profileContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    elevation: 2,
    shadowColor: '#112D4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3F72AF', // Medium blue for edit button
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#112D4E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileInfoCol: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    marginBottom: 8,
    textAlign: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phone: {
    marginLeft: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verificationText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
    gap: 12,
  },
  editButton: {
    borderRadius: 12,
  },
  shareButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#112D4E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statsContent: {
    padding: 24,
  },
  statsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statsTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  statsSubtitle: {
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 12,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  menuCard: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#112D4E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuContent: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtext: {
    opacity: 0.7,
    fontSize: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FF3B30',
  },
  menuDivider: {
    marginHorizontal: 20,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 32,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionCard: {
    borderRadius: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
  },
  gridLabel: {
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
  },
  deleteBtn: {
    borderRadius: 10,
    marginBottom: 8,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 4,
  },
  logoutCard: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#112D4E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  logoutText: {
    fontWeight: '500',
  },
  logoutActions: {
    justifyContent: 'center',
    paddingBottom: 20,
  },
  logoutButton: {
    borderRadius: 12,
  },
  modalContent: {
    padding: 0,
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
});

export { ProfileScreen };
export default ProfileScreen;


