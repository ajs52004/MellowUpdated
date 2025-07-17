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

      {/* Sign Out Option */}
      <TouchableOpacity style={[styles.settingRow, styles.signOutRow]} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#FBBC05" style={styles.settingIcon} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setSettingsVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


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

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{name || 'Your Profile'}</Text>

        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Pick a Profile Picture</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer: Sign Out Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={logout}>
          <Text style={styles.saveButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A89393',
    padding: 20,
    paddingTop: 60,
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
signOutRow: {
  marginTop: 20,
  borderTopWidth: 1,
  borderTopColor: '#444',
  paddingTop: 15,
},
signOutText: {
  color: '#FBBC05',
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 20,
    color: '#fff',
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 15,
  },
  placeholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  placeholderText: {
    color: '#615C5C',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#FBBC05',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalItem: {
    fontSize: 16,
    paddingVertical: 10,
    color: '#333',
  },
  modalClose: {
    marginTop: 20,
    fontSize: 16,
    color: '#FBBC05',
    fontWeight: '600',
  },
});
