import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../_layout';
import { useAuth } from '../_context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, authFetch } from '../_api/config';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING } from '../../constants/theme';
import AgriBackground from '../../components/AgriBackground';

export default function SettingsScreen() {
  const { isTamil, toggleLanguage } = useApp();
  const { user, profile, logout, refreshProfile } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Input focus states for styling
  const [activeInput, setActiveInput] = useState<string | null>(null);

  // Edit state
  const [editForm, setEditForm] = useState({
    username: profile?.username || '',
    phone: profile?.phone || '',
    village: profile?.village || '',
    imageBase64: '',
    localImageUri: profile?.profile_image_url || ''
  });

  const handleLogout = async () => {
    try {
      await logout();
      setTimeout(() => {
        router.replace('/');
      }, 50);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const openEditModal = () => {
    setEditForm({
      username: profile?.username || '',
      phone: profile?.phone || '',
      village: profile?.village || '',
      imageBase64: '',
      localImageUri: profile?.profile_image_url || ''
    });
    setEditModalVisible(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        isTamil ? 'அனுமதி தேவை' : 'Permission Required', 
        isTamil ? 'புகைப்படங்களை அணுக அனுமதி தேவை.' : 'Permission to access gallery is required.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setEditForm(prev => ({
        ...prev,
        imageBase64: result.assets[0].base64!,
        localImageUri: result.assets[0].uri
      }));
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      // Update basic fields
      const profileRes = await authFetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          username: editForm.username,
          phone: editForm.phone,
          village: editForm.village
        })
      });
      
      if (!profileRes.ok) {
        throw new Error('Failed to update profile info');
      }

      // Update image if picked
      if (editForm.imageBase64) {
        const imgRes = await authFetch(`${API_BASE_URL}/auth/profile-image`, {
          method: 'POST',
          body: JSON.stringify({
            image_base64: editForm.imageBase64
          })
        });
        if (!imgRes.ok) {
          throw new Error('Failed to upload image');
        }
      }

      await refreshProfile();
      setEditModalVisible(false);
      Alert.alert(
        isTamil ? 'வெற்றி' : 'Success', 
        isTamil ? 'சுயவிவரம் புதுப்பிக்கப்பட்டது!' : 'Profile updated successfully!'
      );
    } catch (error: any) {
      Alert.alert(isTamil ? 'பிழை' : 'Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AgriBackground />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{isTamil ? 'அமைப்புகள்' : 'Settings'}</Text>
          <View style={styles.headerUnderline} />
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardHeader}>
            <View style={styles.avatarContainer}>
              {profile?.profile_image_url || editForm.localImageUri ? (
                <Image 
                  source={{ uri: editForm.localImageUri || profile?.profile_image_url }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons name="person" size={36} color={COLORS.gold} />
                </View>
              )}
              <View style={styles.avatarGlow} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.username || user?.displayName || (isTamil ? 'விவசாயி' : 'Farmer')}
              </Text>
              <Text style={styles.profileEmail}>{user?.email || profile?.email || ''}</Text>
              
              {!!profile?.phone && (
                <Text style={styles.profileDetail}>
                  <MaterialIcons name="phone" size={12} color={COLORS.gold} /> {profile.phone}
                </Text>
              )}
              {!!profile?.village && (
                <Text style={styles.profileDetail}>
                  <MaterialIcons name="location-on" size={12} color={COLORS.gold} /> {profile.village}
                </Text>
              )}
              
              {user?.providerData?.[0]?.providerId === 'google.com' && (
                <View style={styles.providerBadge}>
                  <MaterialIcons name="account-circle" size={12} color={COLORS.gold} />
                  <Text style={styles.providerText}>Google Connected</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={{ position: 'absolute', top: SPACING.md, right: SPACING.md }}>
            <TouchableOpacity onPress={openEditModal} activeOpacity={0.85}>
              <MaterialIcons name="edit" size={20} color={COLORS.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Preferences */}
        <Text style={styles.sectionTitle}>
          {isTamil ? 'விருப்பங்கள்' : 'PREFERENCES'}
        </Text>
        
        <View style={styles.card}>
          {/* Language Toggle Row */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="language" size={20} color={COLORS.gold} />
              </View>
              <Text style={styles.settingText}>
                {isTamil ? 'மொழி (Language)' : 'Language'}
              </Text>
            </View>
          </View>

          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[
                styles.langOption,
                !isTamil && styles.activeLangOption
              ]}
              onPress={() => isTamil ? toggleLanguage() : null}
              activeOpacity={0.8}
            >
              {!isTamil ? (
                <View style={styles.activeLangGradient}>
                  <Text style={styles.activeLangText}>English</Text>
                </View>
              ) : (
                <Text style={styles.langText}>English</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langOption,
                isTamil && styles.activeLangOption
              ]}
              onPress={() => !isTamil ? toggleLanguage() : null}
              activeOpacity={0.8}
            >
              {isTamil ? (
                <View style={styles.activeLangGradient}>
                  <Text style={styles.activeLangText}>தமிழ்</Text>
                </View>
              ) : (
                <Text style={styles.langText}>தமிழ்</Text>
              )}
            </TouchableOpacity>
          </View>


        </View>

        {/* Log Out Section */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <MaterialIcons name="exit-to-app" size={20} color={COLORS.danger} />
            <Text style={styles.logoutText}>
              {isTamil ? 'வெளியேறு' : 'Log Out'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Top Indicator */}
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isTamil ? 'சுயவிவரத்தை திருத்து' : 'Edit Profile'}
              </Text>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)} 
                disabled={isSaving}
                style={styles.closeBtn}
              >
                <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              contentContainerStyle={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Avatar Picker */}
              <View style={styles.imagePickerContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.imagePickerBtn} activeOpacity={0.9}>
                  {editForm.localImageUri ? (
                    <Image source={{ uri: editForm.localImageUri }} style={styles.editAvatar} />
                  ) : (
                    <View style={styles.editAvatarPlaceholder}>
                      <MaterialIcons name="camera-alt" size={32} color={COLORS.gold} />
                      <Text style={styles.uploadText}>
                        {isTamil ? 'படம் மாற்று' : 'Upload Photo'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.editBadge}>
                    <MaterialIcons name="edit" size={12} color={COLORS.textDark} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Username Input */}
              <Text style={styles.inputLabel}>
                {isTamil ? 'பயனர்பெயர்' : 'Username'}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  activeInput === 'username' && styles.inputFocused
                ]}
                value={editForm.username}
                onChangeText={(t) => setEditForm({...editForm, username: t})}
                placeholder={isTamil ? 'பயனர்பெயர் எழுதவும்' : 'Enter username'}
                placeholderTextColor="rgba(236,253,245,0.4)"
                onFocus={() => setActiveInput('username')}
                onBlur={() => setActiveInput(null)}
              />

              {/* Phone Input */}
              <Text style={styles.inputLabel}>
                {isTamil ? 'தொலைபேசி எண்' : 'Phone Number'}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  activeInput === 'phone' && styles.inputFocused
                ]}
                value={editForm.phone}
                onChangeText={(t) => setEditForm({...editForm, phone: t})}
                placeholder={isTamil ? 'தொலைபேசி எண் எழுதவும்' : 'Enter phone number'}
                placeholderTextColor="rgba(236,253,245,0.4)"
                keyboardType="phone-pad"
                onFocus={() => setActiveInput('phone')}
                onBlur={() => setActiveInput(null)}
              />

              {/* Village Input */}
              <Text style={styles.inputLabel}>
                {isTamil ? 'கிராமம் / இடம்' : 'Village / Location'}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  activeInput === 'village' && styles.inputFocused
                ]}
                value={editForm.village}
                onChangeText={(t) => setEditForm({...editForm, village: t})}
                placeholder={isTamil ? 'கிராமத்தின் பெயரை எழுதவும்' : 'Enter village / location'}
                placeholderTextColor="rgba(236,253,245,0.4)"
                onFocus={() => setActiveInput('village')}
                onBlur={() => setActiveInput(null)}
              />
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity 
              onPress={saveProfile} 
              disabled={isSaving}
              activeOpacity={0.85}
              style={styles.saveBtnWrapper}
            >
              <LinearGradient
                colors={GRADIENTS.gold}
                style={styles.saveBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isSaving ? (
                  <ActivityIndicator color={COLORS.textDark} />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {isTamil ? 'சேமி' : 'Save Changes'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  headerContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  headerUnderline: {
    height: 3,
    width: 60,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
  },
  
  // Profile Card
  profileCard: {
    backgroundColor: COLORS.glassCard,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  profileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
    width: 76,
    height: 76,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: COLORS.gold,
    zIndex: 2,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.cardBg2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
    zIndex: 2,
  },
  avatarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 38,
    backgroundColor: COLORS.gold,
    opacity: 0.15,
    transform: [{ scale: 1.08 }],
    zIndex: 1,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  profileDetail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 0.5,
    borderColor: COLORS.goldBorderSoft,
  },
  providerText: {
    fontSize: 11,
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.button,
  },
  editProfileBtnText: {
    color: COLORS.textDark,
    fontWeight: '700',
    fontSize: 15,
  },

  // Section styling
  sectionTitle: {
    fontSize: 13,
    color: COLORS.textGold,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: 'rgba(6,95,70,0.5)',
    borderColor: COLORS.goldBorderSoft,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.card,
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconContainer: {
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderColor: COLORS.goldBorderSoft,
    borderWidth: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  
  // Language selector
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  langOption: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    backgroundColor: 'rgba(3,53,33,0.4)',
    overflow: 'hidden',
  },
  activeLangOption: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(13,59,46,0.8)',
  },
  activeLangGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 44,
  },
  activeLangText: {
    color: COLORS.gold,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  
  divider: {
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.1)',
    marginVertical: SPACING.md,
  },

  // Logout section
  logoutContainer: {
    marginTop: SPACING.sm,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,95,70,0.5)',
    borderColor: COLORS.goldBorderSoft,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    gap: SPACING.sm,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2,26,14,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.goldBorderSoft,
    borderWidth: 1,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 48,
    height: 5,
    backgroundColor: 'rgba(212,175,55,0.3)',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    backgroundColor: COLORS.cardBg2,
    padding: 6,
    borderRadius: RADIUS.pill,
  },
  modalScroll: {
    paddingBottom: SPACING.xl,
  },
  
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  imagePickerBtn: {
    position: 'relative',
  },
  editAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  editAvatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.cardBg2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 11,
    color: COLORS.textGold,
    marginTop: SPACING.xs,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.gold,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBg,
  },
  
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  inputFocused: {
    borderColor: COLORS.inputFocusBorder,
  },
  
  saveBtnWrapper: {
    marginTop: SPACING.sm,
  },
  saveBtn: {
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
