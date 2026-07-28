import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import AgriBackground from '../../components/AgriBackground';
import GlassCard from '../../components/GlassCard';
import { API_BASE_URL, authFetch, fetchWithTimeout } from '../_api/config';
import { useAuth } from '../_context/AuthContext';

type Rental = {
  id: string;
  machineTitle: string;
  description: string;
  location: string;
  owner_id?: string;
  phone: string;
  image_url?: string;
  createdAt: string;
};

// ── Machine Card ──────────────────────────────────────────────────────
function MachineCard({ item, isOwner, onContact, onDelete }: {
  item: Rental;
  isOwner: boolean;
  onContact: () => void;
  onDelete: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <GlassCard style={styles.card}>
        <View style={styles.cardAccent} />

        <View style={styles.cardBody}>
          <View style={styles.cardInfo}>
            <View style={styles.machineIconRow}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.machineImage} />
              ) : (
                <View style={styles.machineIcon}>
                  <Text style={{ fontSize: 20 }}>🚜</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.machineName}>{item.machineTitle}</Text>
                <Text style={styles.machineDate}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
              {isOwner && (
                <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
                  <MaterialIcons name="delete-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="place" size={14} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="description" size={14} color={COLORS.textMuted} />
              <Text style={styles.detailText} numberOfLines={2}>{item.description}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={14} color={COLORS.gold} />
              <Text style={styles.phoneText}>{item.phone}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onContact} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={0.85}>
            <LinearGradient
              colors={GRADIENTS.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.contactBtn}
            >
              <MaterialIcons name="phone" size={16} color={COLORS.textDark} />
              <Text style={styles.contactBtnText}>Call Owner</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function MachineryScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'rent'>('search');
  const [machines, setMachines] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [rentForm, setRentForm] = useState({ title: '', description: '', location: '', phone: '' });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabIndicator = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    fetchRentals();
  }, []);

  const switchTab = (tab: 'search' | 'rent') => {
    setActiveTab(tab);
    Animated.spring(tabIndicator, {
      toValue: tab === 'search' ? 0 : 1,
      tension: 70,
      friction: 12,
      useNativeDriver: false,
    }).start();
    if (tab === 'rent') {
      Animated.spring(formSlide, { toValue: 0, useNativeDriver: true }).start();
    } else {
      formSlide.setValue(20);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/machinery`);
      const data = await response.json();
      if (response.ok) setMachines(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to fetch rentals.');
    } finally {
      setLoading(false);
    }
  };

  const handleRentOut = async () => {
    if (!rentForm.title || !rentForm.description || !rentForm.location || !rentForm.phone) {
      Alert.alert('Missing Fields', 'Please fill in all fields before listing.');
      return;
    }
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to list a machine.');
      return;
    }
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (imageUri) {
        const formData = new FormData();
        
        if (Platform.OS === 'web') {
          // On web, we must convert the image URI to a Blob before appending to FormData
          const r = await fetch(imageUri);
          const blob = await r.blob();
          formData.append('file', blob, 'machine.jpg');
        } else {
          formData.append('file', {
            uri: imageUri,
            name: 'machine.jpg',
            type: 'image/jpeg',
          } as any);
        }
        
        formData.append('upload_preset', 'ervizhi_machines');

        const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dbsup2lgv/image/upload', {
          method: 'POST',
          body: formData,
        });
        const cloudData = await cloudRes.json();
        if (cloudData.secure_url) {
          imageUrl = cloudData.secure_url;
        } else {
          Alert.alert("Upload Error", cloudData.error?.message || "Failed to upload image.");
          setIsSubmitting(false);
          return;
        }
      }

      const response = await authFetch(`${API_BASE_URL}/machinery`, {
        method: 'POST',
        body: JSON.stringify({
          machineTitle: rentForm.title,
          description: rentForm.description,
          location: rentForm.location,
          phone: rentForm.phone,
          image_url: imageUrl,
        }),
      });
      if (response.ok) {
        Alert.alert('✅ Success', 'Machine listed successfully!');
        setRentForm({ title: '', description: '', location: '', phone: '' });
        setImageUri(null);
        switchTab('search');
        fetchRentals();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.detail || 'Failed to list machine.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rentalId: string) => {
    const executeDelete = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/machinery/${rentalId}`, { method: 'DELETE' });
        if (response.ok) { 
          if (Platform.OS === 'web') { window.alert('Listing removed.'); } else { Alert.alert('Deleted', 'Listing removed.'); }
          fetchRentals(); 
        } else {
          const data = await response.json();
          const err = data.detail || 'Failed to delete listing.';
          if (Platform.OS === 'web') { window.alert('Error: ' + err); } else { Alert.alert('Error', err); }
        }
      } catch (e: any) {
        const err = e.message || 'Network error while deleting.';
        if (Platform.OS === 'web') { window.alert('Error: ' + err); } else { Alert.alert('Error', err); }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this listing?')) {
        executeDelete();
      }
    } else {
      Alert.alert('Remove Listing', 'Are you sure you want to delete this listing?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: executeDelete },
      ]);
    }
  };

  const filteredMachines = machines.filter(m =>
    m.machineTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputStyle = (field: string) => [styles.formInput, focusedField === field && styles.formInputFocused];

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 8 : 40 }]}>
      <AgriBackground />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <View style={{ height: SPACING.md }} />

          <View style={styles.tabWrapper}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => switchTab('search')}
                activeOpacity={0.8}
              >
                {activeTab === 'search' ? (
                  <LinearGradient
                    colors={GRADIENTS.gold}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activeTab}
                  >
                    <Text style={[styles.tabTextActive, { color: COLORS.textDark }]}>Search Machines</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabText}>Search Machines</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => switchTab('rent')}
                activeOpacity={0.8}
              >
                {activeTab === 'rent' ? (
                  <LinearGradient
                    colors={GRADIENTS.gold}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activeTab}
                  >
                    <Text style={[styles.tabTextActive, { color: COLORS.textDark }]}>Rent Out Machine</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabText}>Rent Out Machine</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {activeTab === 'search' ? (
            <View style={styles.tabContent}>
              <View style={[styles.searchRow, searchFocused && styles.searchRowFocused]}>
                <MaterialIcons name="search" size={20} color={searchFocused ? COLORS.gold : COLORS.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search machine, location, type..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholderTextColor={COLORS.textMuted}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <MaterialIcons name="close" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {loading ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="large" color={COLORS.gold} />
                  <Text style={styles.loadingText}>Loading listings...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredMachines}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={{ paddingBottom: 80, gap: SPACING.sm }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <MachineCard
                      item={item}
                      isOwner={isAuthenticated && !!profile && item.owner_id === profile.uid}
                      onContact={() => Linking.openURL(`tel:${item.phone}`)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Text style={{ fontSize: 48 }}>🔍</Text>
                      <Text style={styles.emptyTitle}>No machines found</Text>
                      <Text style={styles.emptyText}>
                        {searchQuery ? 'Try a different search term' : 'Be the first to list a machine!'}
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          ) : (
            <View style={styles.tabContent}>
              <FlatList
                data={[{ key: 'form' }]}
                keyExtractor={i => i.key}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
                renderItem={() => (
                  <View style={styles.formWrapper}>
                    <Animated.View style={{ transform: [{ translateY: formSlide }] }}>
                      <GlassCard style={styles.formCard}>
                        <Text style={{ display: 'none' }}>List Your Machine</Text>

                        {[
                          { field: 'title', placeholder: 'Machine Title (e.g. Tractor 50HP)', icon: 'agriculture' as const },
                          { field: 'description', placeholder: 'Description (e.g. Hourly rate)', icon: 'description' as const },
                          { field: 'location', placeholder: 'Location (e.g. City, Village)', icon: 'place' as const },
                          { field: 'phone', placeholder: 'Mobile Number', icon: 'phone' as const },
                        ].map(({ field, placeholder, icon }) => (
                          <View key={field} style={styles.fieldWrap}>
                            <View style={inputStyle(field)}>
                              <MaterialIcons name={icon} size={18} color={focusedField === field ? COLORS.gold : COLORS.textMuted} />
                              <TextInput
                                style={styles.fieldInput}
                                placeholder={placeholder}
                                placeholderTextColor={COLORS.textMuted}
                                value={(rentForm as any)[field]}
                                onChangeText={(text) => setRentForm({ ...rentForm, [field]: text })}
                                keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
                                multiline={field === 'description'}
                                onFocus={() => setFocusedField(field)}
                                onBlur={() => setFocusedField(null)}
                              />
                            </View>
                          </View>
                        ))}

                        <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage} activeOpacity={0.8}>
                          <MaterialIcons name="add-a-photo" size={20} color={COLORS.gold} />
                          <Text style={styles.imagePickerText}>{imageUri ? 'Change Photo' : 'Add Machine Photo'}</Text>
                        </TouchableOpacity>
                        {imageUri && (
                          <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        )}

                        <TouchableOpacity
                          style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                          onPress={handleRentOut}
                          disabled={isSubmitting}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons name="cloud-upload" size={20} color={COLORS.darkBg} />
                          <Text style={styles.submitText}>
                            {isSubmitting ? 'Posting...' : 'List Machine'}
                          </Text>
                        </TouchableOpacity>
                      </GlassCard>
                    </Animated.View>
                  </View>
                )}
              />
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.md },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pageTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  pageSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabWrapper: {
    paddingBottom: SPACING.md,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.pill,
    padding: 4,
    height: 48,
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  activeTab: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.cardBg2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { fontSize: 14, fontWeight: '700', color: COLORS.gold },

  tabContent: { flex: 1 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    marginBottom: SPACING.md,
  },
  searchRowFocused: { borderColor: COLORS.gold },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },

  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm, paddingTop: 60 },
  loadingText: { color: COLORS.textMuted, fontSize: 14 },

  card: {
    borderRadius: RADIUS.xl,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    ...SHADOWS.card,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardAccent: { width: 3, backgroundColor: COLORS.gold, opacity: 0.7, borderRadius: 2 },
  cardBody: { flex: 1, padding: SPACING.md, flexDirection: 'row', alignItems: 'flex-end' },
  cardInfo: { flex: 1 },
  machineIconRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  machineIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  machineName: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  machineDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  deleteBtn: { padding: 6 },
  machineImage: { width: 40, height: 40, borderRadius: RADIUS.md },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 4 },
  detailText: { fontSize: 12, color: COLORS.textSecondary, flex: 1, lineHeight: 18 },
  phoneText: { fontSize: 13, color: COLORS.textGold, fontWeight: '700' },
  contactBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginLeft: SPACING.sm,
    ...SHADOWS.button,
  },
  contactBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.darkBg },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  emptyTitle: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '700' },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },

  formWrapper: { flex: 1, paddingBottom: SPACING.lg },
  formCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    ...SHADOWS.card,
    overflow: 'hidden',
  },
  formHeader: { height: 2, backgroundColor: COLORS.gold, opacity: 0.5, marginHorizontal: -SPACING.md, marginTop: -SPACING.md, marginBottom: SPACING.md },
  goldTopBorder: { height: 2, backgroundColor: COLORS.gold, opacity: 0.5, marginBottom: SPACING.md, marginHorizontal: -SPACING.md, marginTop: -SPACING.md },
  formTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  formSubtitle: { fontSize: 12, color: COLORS.textMuted, marginBottom: SPACING.md },

  fieldWrap: { marginBottom: SPACING.sm },
  fieldLabel: { display: 'none' },
  formInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    minHeight: 52,
  },
  formInputFocused: { borderColor: COLORS.gold },
  fieldInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary, paddingVertical: 10 },

  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  imagePickerText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  previewImage: { width: '100%', height: 160, borderRadius: RADIUS.lg, marginBottom: SPACING.sm },

  submitBtn: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
    ...SHADOWS.button,
  },
  submitText: { fontSize: 16, fontWeight: '900', color: COLORS.darkBg },
});
