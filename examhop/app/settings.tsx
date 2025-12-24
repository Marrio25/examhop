import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface UserProfile {
  name: string;
  avatarUri: string | null;
  email: string;
}

const CURRENT_USER_KEY = 'current_user_email';

const getUserDataKey = (email: string) => `user_data_${email}`;

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [name, setName] = useState<string>('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingName, setPendingName] = useState<string>('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentEmail = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (!currentEmail) {
          router.push('/');
          return;
        }
        setEmail(currentEmail);

        const userDataKey = getUserDataKey(currentEmail);
        const stored = await AsyncStorage.getItem(userDataKey);
        if (stored) {
          const parsed: UserProfile = JSON.parse(stored);
          if (parsed.name) setName(parsed.name);
          if (parsed.avatarUri) setAvatarUri(parsed.avatarUri);
        } else {
          // Fallback: use email as default name
          setName(currentEmail.split('@')[0]);
        }
      } catch {
        // ignore
      }
    };

    loadProfile();
  }, [router]);

  const saveProfileToDB = async (updates: Partial<UserProfile>) => {
    if (!email) return;

    try {
      const userDataKey = getUserDataKey(email);
      const existing = await AsyncStorage.getItem(userDataKey);
      const current: UserProfile = existing
        ? JSON.parse(existing)
        : { name: email.split('@')[0], avatarUri: null, email };

      const updated: UserProfile = { ...current, ...updates };
      await AsyncStorage.setItem(userDataKey, JSON.stringify(updated));

      // Also update the general profile key for backwards compatibility
      await AsyncStorage.setItem('user_profile', JSON.stringify({
        name: updated.name,
        avatarUri: updated.avatarUri,
      }));

      return updated;
    } catch {
      return null;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      const updated = await saveProfileToDB({ avatarUri: result.assets[0].uri });
      if (updated) {
        setAvatarUri(updated.avatarUri);
      }
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
  };

  const handleNameBlur = () => {
    if (name.trim() && name !== pendingName) {
      setPendingName(name);
      setShowConfirmModal(true);
    }
  };

  const confirmNameChange = async () => {
    setShowConfirmModal(false);
    const updated = await saveProfileToDB({ name: pendingName });
    if (updated) {
      setName(updated.name);
    }
  };

  const cancelNameChange = () => {
    setShowConfirmModal(false);
    setName(pendingName);
  };

  const initial = name?.[0]?.toUpperCase() ?? 'U';

  return (
    <LinearGradient colors={['#a855f7', '#8b5cf6', '#7c3aed']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>{t('account')}</Text>

        <View style={styles.profileRow}>
          <View style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
              <Text style={styles.changePhotoText}>{t('changePhoto')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileFields}>
            <Text style={styles.label}>{t('displayName')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={handleNameChange}
              onBlur={handleNameBlur}
              placeholder="Your name"
              placeholderTextColor="rgba(15, 23, 42, 0.4)"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('preferences')}</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('soundEffects')}</Text>
            <Text style={styles.settingValue}>{t('on')}</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('notifications')}</Text>
            <Text style={styles.settingValue}>{t('on')}</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('language')}</Text>
            <View style={styles.languageSelector}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    language === lang.code && styles.languageOptionActive,
                  ]}
                  onPress={() => setLanguage(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={styles.languageName}>{lang.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about')}</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('email')}</Text>
            <Text style={styles.settingValue}>{email || 'Not set'}</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('memberSince')}</Text>
            <Text style={styles.settingValue}>2025</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={async () => {
          await AsyncStorage.removeItem(CURRENT_USER_KEY);
          router.push('/');
        }}>
          <Text style={styles.logoutText}>{t('logOut')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={cancelNameChange}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('confirmNameChange')}</Text>
            <Text style={styles.modalMessage}>
              {t('sureChangeName')} "{pendingName}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={cancelNameChange}>
                <Text style={styles.modalButtonTextCancel}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={confirmNameChange}>
                <Text style={styles.modalButtonTextConfirm}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 20,
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  changePhotoButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  profileFields: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  settingValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 8,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.9)',
  },
  logoutText: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalButtonConfirm: {
    backgroundColor: '#7c3aed',
  },
  modalButtonTextCancel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  languageSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#fff',
  },
  languageFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  languageName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});


