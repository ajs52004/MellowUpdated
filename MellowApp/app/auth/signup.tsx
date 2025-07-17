import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, updateUser } = useAuth(); // Make sure updateUser is available in your AuthContext
  const [form, setForm] = useState({
    username: '',
    name: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed mediaTypes
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      const newImageUri = result.assets[0].uri;
      try {
        if (updateUser) {
          await updateUser({ ...form, profileImage: newImageUri });
        }
        setProfileImage(newImageUri);
      } catch (err: any) {
        setError(err.message || 'Failed to update profile image');
      }
    }
  };

  // Inside handleSignup:
const handleSignup = async () => {
  console.log('📝 Signup button pressed with form:', form);
  if (form.password !== form.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  try {
    await signup({ ...form, profileImage: profileImage || null });
    console.log('✅ Signup success');
    router.replace('/tabs/profile');
  } catch (err: any) {
    console.error('❌ Signup failed:', err.message);
    setError(err.message || 'Signup failed. Please try again.');
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={() => router.push('/auth/login')}
        style={{ position: 'absolute', top: 40, left: 20, zIndex: 1 }}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.avatarContainer} onPress={updateProfileImage}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require('../../assets/icons/martini-placeholder.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.uploadText}>Tap to change profile photo</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
        placeholder="Name"
        placeholderTextColor="#615C5C"
      />
      <TextInput
        style={styles.input}
        value={form.username}
        onChangeText={(text) => setForm({ ...form, username: text })}
        placeholder="Username"
        placeholderTextColor="#615C5C"
      />
      <TextInput
        style={styles.input}
        value={form.emailOrPhone}
        onChangeText={(text) => setForm({ ...form, emailOrPhone: text })}
        placeholder="Email or Phone"
        placeholderTextColor="#615C5C"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
        placeholder="Password"
        placeholderTextColor="#615C5C"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={form.confirmPassword}
        onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
        placeholder="Confirm Password"
        placeholderTextColor="#615C5C"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.switchText}>
        Already have an account?{' '}
        <Text style={styles.linkText} onPress={() => router.push('/auth/login')}>
          Log In
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#A89393',
    flexGrow: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: '#ccc',
  },
  uploadText: {
    color: '#FBBC05',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    marginBottom: 12,
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
    textAlign: 'center',
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  switchText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 14,
  },
  linkText: {
    color: '#FBBC05',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});