import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

type LoginCredentials = {
  emailOrPhone: string;
  password: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [form, setForm] = useState<LoginCredentials>({
    emailOrPhone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/tabs/profile'); // ✅ goes straight to profile if already logged in
    }
  }, [user]);

  const isPhone = (input: string) => /^\d{10}$/.test(input);
  const isEmail = (input: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input);
  const isUsername = (input: string) =>
    /^[a-zA-Z0-9._-]{3,20}$/.test(input);
  const validateInput = (input: string) =>
    isPhone(input) || isEmail(input) || isUsername(input);

  // no structural changes needed, just logging added

// Inside handleLogin:
const handleLogin = async () => {
  console.log('🔐 Login button pressed with form:', form);
  if (!validateInput(form.emailOrPhone)) {
    setError('Please enter a valid phone number, email, or username.');
    return;
  }

  try {
    await login(form);
    console.log('✅ Login success');
    router.replace('/tabs/profile');
  } catch (err: any) {
    console.error('❌ Login failed:', err.message);
    setError(err.message || 'Login failed. Please check your credentials.');
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Back Arrow */}
        <TouchableOpacity
          onPress={() => router.replace('/tabs/map')}
          style={styles.backArrow}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/images/splash-logo.png')}
            style={styles.logo}
          />
          <Text style={styles.loginTitle}>Log In</Text>
        </View>

        <View style={styles.card}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <TextInput
            style={styles.input}
            value={form.emailOrPhone}
            onChangeText={(text) => setForm({ ...form, emailOrPhone: text })}
            placeholder="Phone, Email, or Username"
            placeholderTextColor="#615C5C"
            keyboardType="default"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            placeholder="Password"
            placeholderTextColor="#615C5C"
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <Text style={styles.switchText}>
            Don’t have an account?{' '}
            <Text
              style={styles.linkText}
              onPress={() => router.push('/auth/signup')}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A89393',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  backArrow: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  input: {
    width: '100%',
    marginBottom: 14,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#FBBC05',
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#333',
  },
  button: {
    backgroundColor: '#FBBC05',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  switchText: {
    marginTop: 16,
    fontSize: 14,
    color: '#333',
  },
  linkText: {
    color: '#FBBC05',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
