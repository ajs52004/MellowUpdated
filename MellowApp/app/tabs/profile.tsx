import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    } else {
      setName(user.name || '');
      setImage(user.profileImage || null);
    }
  }, [user]);

  if (!user) return null;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
    }
  };

  const handleBackToMap = () => {
    try {
      router.push('/tabs/map');
    } catch (error) {
      console.error('Navigation to map failed:', error);
      Alert.alert('Error', 'Could not navigate to map');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Buttons */}
      <TouchableOpacity onPress={handleBackToMap} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setSettingsVisible(true)}
      >
        <MaterialIcons name="settings" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Pick Image</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.userName}>{name || 'Your Profile'}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Saved Venues</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Check-ins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2 yrs</Text>
          <Text style={styles.statLabel}>on Mellow</Text>
        </View>
      </View>

      {/* Second Row */}
      <View style={styles.blockRow}>
        <TouchableOpacity style={styles.blockCard}>
          <Ionicons name="images-outline" size={32} color="#FBBC05" style={{ marginBottom: 10 }} />
          <Text style={styles.blockTitle}>My Photos</Text>
          <Text style={styles.blockText}>View your gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.blockCard}>
          <Ionicons name="star-outline" size={32} color="#FBBC05" style={{ marginBottom: 10 }} />
          <Text style={styles.blockTitle}>My Reviews</Text>
          <Text style={styles.blockText}>Coming soon</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Settings</Text>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>

            <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Coming Soon')}>
              <Ionicons name="person-outline" size={20} color="#fff" style={styles.settingIcon} />
              <Text style={styles.settingText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Coming Soon')}>
              <Ionicons name="eye-outline" size={20} color="#fff" style={styles.settingIcon} />
              <Text style={styles.settingText}>Preferences</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Coming Soon')}>
              <Ionicons name="notifications-outline" size={20} color="#fff" style={styles.settingIcon} />
              <Text style={styles.settingText}>Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Coming Soon')}>
              <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.settingIcon} />
              <Text style={styles.settingText}>Privacy Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSettingsVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
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
    backgroundColor: '#A89393',
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    backgroundColor: '#ccc',
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#615C5C',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    width: '28%',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2B2B',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  blockRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 30,
    alignSelf: 'center',
  },
  blockCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2B2B',
    marginBottom: 4,
    textAlign: 'center',
  },
  blockText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2D2B2B',
    width: '90%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  modalHeader: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingIcon: {
    width: 26,
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 20,
  },
  closeText: {
    color: '#FBBC05',
    fontWeight: '600',
    fontSize: 16,
  },
});
