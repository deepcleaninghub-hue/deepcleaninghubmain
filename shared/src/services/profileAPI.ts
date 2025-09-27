import { httpClient } from './httpClient';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profile_image?: string;
  profile_completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Profile API
export const profileAPI = {
  // Get user profile
  async getProfile(): Promise<UserProfile | null> {
    try {
      const response = await httpClient.get<{success: boolean, data: UserProfile}>('/profile');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(profileData: UpdateProfileData): Promise<{success: boolean, data?: UserProfile, message?: string, error?: string}> {
    try {
      const response = await httpClient.put<{success: boolean, data: UserProfile, message: string}>('/profile', profileData);
      
      return response;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile'
      };
    }
  },

  // Change password
  async changePassword(passwordData: ChangePasswordData): Promise<{success: boolean, message?: string, error?: string}> {
    try {
      const response = await httpClient.put<{success: boolean, message: string}>('/mobile-auth/change-password', passwordData);
      
      return response;
    } catch (error: any) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error.message || 'Failed to change password'
      };
    }
  },

  // Upload profile image
  async uploadProfileImage(imageUrl: string): Promise<{success: boolean, data?: {profile_image: string}, message?: string, error?: string}> {
    try {
      const response = await httpClient.post<{success: boolean, data: {profile_image: string}, message: string}>('/profile/upload-image', {
        image_url: imageUrl
      });
      
      return response;
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload profile image'
      };
    }
  }
};
