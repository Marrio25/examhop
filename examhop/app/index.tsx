import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isSignup, setIsSignup] = useState(false);

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // fake hash (frontend simulation)
  const hashPassword = (value: string): string => `hashed_${value}`;

  interface DateChangeEvent {
    type: string;
    nativeEvent: {
      timestamp: number;
    };
  }

  const onChangeDate = (event: DateChangeEvent, selectedDate?: Date): void => {
    setShowPicker(false);
    if (selectedDate) setBirthday(selectedDate);
  };

  const getUserDataKey = (email: string) => `user_data_${email}`;
  const CURRENT_USER_KEY = 'current_user_email';

  const handleSignup = async () => {
    if (
      !username ||
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !birthday
    ) {
      Alert.alert('Error', t('fillAllFields'));
      return;
    }

    const signupPayload = {
      username,
      first_name: firstName,
      last_name: lastName,
      email,
      birthday: birthday.toISOString().split('T')[0],
      password_hash: hashPassword(password),
    };

    // SERVER-FRIENDLY OUTPUT
    console.log('SIGNUP_REQUEST', signupPayload);

    // Save user data to "database" (AsyncStorage)
    try {
      const userDataKey = getUserDataKey(email);
      await AsyncStorage.setItem(userDataKey, JSON.stringify({
        email,
        name: firstName,
        avatarUri: null,
        username,
        firstName,
        lastName,
        birthday: birthday.toISOString().split('T')[0],
      }));
    } catch (e) {
      console.error('Failed to save user data:', e);
    }

    // Redirect to language selector after signup
    router.push('/language-selector');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', t('fillEmailPassword'));
      return;
    }

    const loginPayload = {
      email,
      password_hash: hashPassword(password),
    };

    console.log('LOGIN_REQUEST', loginPayload);

    // Save current user email for session management
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, email);
    } catch (e) {
      console.error('Failed to save current user:', e);
    }

    router.push('/quizzes');
  };

  return (
    <LinearGradient colors={['#8fecf8ff', '#0b707eff']} style={styles.container}>
      <BlurView intensity={90} tint="light" style={styles.card}>
        <Text style={styles.title}>
          {isSignup ? t('createAccount') : t('login')}
        </Text>

        {isSignup && (
          <>
            <TextInput
              style={styles.input}
              placeholder={t('username')}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder={t('firstName')}
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              style={styles.input}
              placeholder={t('lastName')}
              value={lastName}
              onChangeText={setLastName}
            />

            {/* Birthday Picker */}
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={{ color: birthday ? '#000' : '#94a3b8' }}>
                {birthday
                  ? birthday.toISOString().split('T')[0]
                  : t('birthday')}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={birthday || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                maximumDate={new Date()}
                onChange={onChangeDate}
              />
            )}
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder={t('email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder={t('password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={isSignup ? handleSignup : handleLogin}
        >
          <Svg height="50" width="100%" style={styles.buttonSvg}>
            <Defs>
              <SvgRadialGradient id="grad" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#2563eb" />
                <Stop offset="100%" stopColor="#254ed3ff" />
              </SvgRadialGradient>
            </Defs>
            <Rect width="100%" height="100%" rx="16" fill="url(#grad)" />
          </Svg>

          <Text style={styles.buttonText}>
            {isSignup ? t('signUp') : t('login')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
          <Text style={styles.switchText}>
            {isSignup
              ? t('alreadyHaveAccount')
              : t('noAccount')}
          </Text>
        </TouchableOpacity>
      </BlurView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // a bit more visible, still glassy
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 100,
  },
  title: {
  fontSize: 28,
  fontWeight: 'bold',
  textAlign: 'center',        // centru pe orizontală
  alignSelf: 'center',        // centru real în container
  width: '100%',              // ocupă toată lățimea
  marginBottom: 20,
},

  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSvg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    zIndex: 1,
    fontSize: 16,
  },
    switchText: {
      color: '#2563eb',
      textAlign: 'center',
      marginTop: 8,
    },
  });
