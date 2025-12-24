import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguage, Language } from '../contexts/LanguageContext';

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSelectorScreen() {
  const router = useRouter();
  const { setLanguage, t } = useLanguage();
  const [selected, setSelected] = useState<Language | null>(null);

  const handleContinue = async () => {
    if (selected) {
      await setLanguage(selected);
      router.push('/quizzes');
    }
  };

  return (
    <LinearGradient colors={['#a855f7', '#8b5cf6', '#7c3aed']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('selectLanguage')}</Text>
        <Text style={styles.subtitle}>
          {selected
            ? `${LANGUAGES.find((l) => l.code === selected)?.name} ${t('continue')}`
            : t('selectLanguage')}
        </Text>

        <View style={styles.languagesList}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.languageCard, selected === lang.code && styles.languageCardSelected]}
              onPress={() => setSelected(lang.code)}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={styles.languageName}>{lang.name}</Text>
              {selected === lang.code && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
  },
  languagesList: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#fff',
  },
  flag: {
    fontSize: 32,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  checkmark: {
    color: '#22c55e',
    fontSize: 24,
    fontWeight: '700',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

