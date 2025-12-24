import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';

const CATEGORIES = [
  { id: '1', name: 'Football', icon: '⚽' },
  { id: '2', name: 'Science', icon: '🔬' },
  { id: '3', name: 'History', icon: '📜' },
  { id: '4', name: 'Movie', icon: '🎬' },
  { id: '5', name: 'Music', icon: '🎵' },
];

const QUIZZES = [
  {
    id: '1',
    title: 'Python Quiz',
    questions: 12,
    participants: '2.5K',
    icon: '⚔️',
  },
  {
    id: '2',
    title: 'Informatics Quiz',
    questions: 8,
    participants: '6.3K',
    icon: '🧠',
  },
  {
    id: '3',
    title: 'C++ Quiz',
    questions: 8,
    participants: '4.1K',
    icon: '📚',
  },
];

export default function QuizzesScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [profileName, setProfileName] = useState<string>('Roxanne');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const CURRENT_USER_KEY = 'current_user_email';
  const getUserDataKey = (email: string) => `user_data_${email}`;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get current user email
        const currentEmail = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (!currentEmail) {
          router.push('/');
          return;
        }

        // Load user data from "database" using email
        const userDataKey = getUserDataKey(currentEmail);
        const stored = await AsyncStorage.getItem(userDataKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name) setProfileName(parsed.name);
          if (parsed.avatarUri) setAvatarUri(parsed.avatarUri);
        } else {
          // Fallback: use email as name
          setProfileName(currentEmail.split('@')[0]);
        }

        // Also check for updates from settings (backwards compatibility)
        const profileStored = await AsyncStorage.getItem('user_profile');
        if (profileStored) {
          const profileParsed = JSON.parse(profileStored);
          if (profileParsed.name) setProfileName(profileParsed.name);
          if (profileParsed.avatarUri) setAvatarUri(profileParsed.avatarUri);
        }
      } catch (e) {
        // ignore
      }
    };

    loadProfile();

    // Listen for profile updates (when returning from settings)
    const interval = setInterval(loadProfile, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const initial = profileName?.[0]?.toUpperCase() ?? 'U';

  return (
    <LinearGradient colors={['#a855f7', '#8b5cf6', '#7c3aed']} style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.profileSection}>
          <View style={styles.profileCircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.profileImage} />
            ) : (
              <Text style={styles.profileInitial}>{initial}</Text>
            )}
          </View>
          <View>
            <Text style={styles.levelText}>{t('level')}</Text>
            <Text style={styles.levelValue}>1</Text>
          </View>
        </View>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreIcon}>⚡</Text>
          <Text style={styles.scoreValue}>0</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Task Card */}
        <BlurView intensity={80} tint="light" style={styles.dailyTaskCard}>
          <View style={styles.dailyTaskContent}>
            <Text style={styles.dailyTaskIcon}>⚓</Text>
            <View style={styles.dailyTaskInfo}>
              <Text style={styles.dailyTaskTitle}>{t('dailyTask')}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '16%' }]} />
              </View>
              <Text style={styles.progressText}>16 / 100</Text>
            </View>
          </View>
        </BlurView>

        {/* Quiz Categories */}
        <Text style={styles.sectionTitle}>{t('quiz')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryCircle}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* More Games Section */}
        <Text style={styles.sectionTitle}>{t('moreGames')}</Text>
        {QUIZZES.map((quiz) => (
          <TouchableOpacity
            key={quiz.id}
            activeOpacity={0.9}
            onPress={() => {
              if (quiz.id === '1') {
                router.push('/python-quiz');
              } else if (quiz.id === '2') {
                router.push('/informatics-quiz');
              } else if (quiz.id === '3') {
                router.push('/cpp-quiz');
              }
            }}
          >
            <BlurView intensity={80} tint="light" style={styles.quizCard}>
              <View style={styles.quizContent}>
                <View style={styles.quizIconContainer}>
                  <Text style={styles.quizIcon}>{quiz.icon}</Text>
                </View>
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <Text style={styles.quizMeta}>
                    {quiz.questions} {t('questions')} · {quiz.participants} {t('plays')}
                  </Text>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/quizzes')}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>{t('home')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏆</Text>
          <Text style={styles.navLabel}>{t('leaderboard')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🔖</Text>
          <Text style={styles.navLabel}>{t('bookmarks')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings' as any)}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navLabel}>{t('settings')}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  profileInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  levelText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  levelValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  scoreIcon: {
    fontSize: 20,
    marginBottom: -4,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  dailyTaskCard: {
    borderRadius: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  dailyTaskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  dailyTaskIcon: {
    fontSize: 32,
  },
  dailyTaskInfo: {
    flex: 1,
  },
  dailyTaskTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoriesContainer: {
    paddingRight: 20,
    gap: 12,
  },
  categoryCircle: {
    width: 80,
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    fontSize: 32,
    textAlign: 'center',
    lineHeight: 70,
  },
  categoryName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  quizCard: {
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  quizContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  quizIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizIcon: {
    fontSize: 24,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  quizMeta: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 0,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navIcon: {
    fontSize: 24,
    opacity: 0.6,
    color: '#4b5563',
  },
  navIconActive: {
    opacity: 1,
    color: '#7c3aed',
  },
  navLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#7c3aed',
    fontWeight: '700',
  },
});


