import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

export default function PhotoScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [latestPhoto, setLatestPhoto] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  
  
  const [fontsLoaded] = useFonts({
    Caveat: require('../../assets/fonts/Caveat-VariableFont_wght.ttf')
  });

  // Load saved photos on mount
  useEffect(() => {
    loadPhotos();
  }, []);

  // Hide tab bar when camera is open
  useEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });

    return () => {
      parent?.setOptions({ tabBarStyle: { display: 'flex' } });
    };
  }, []);

    const handleSwipe = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, velocityX } = event.nativeEvent;

    if (translationX > 50 && velocityX > 500) {
      router.push('/tabs/map'); // or 'map' if that's the map tab name
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: 'none' } });

      return () => {
        parent?.setOptions({ tabBarStyle: { display: 'flex' } });
      };
    }, [navigation])
  );



  const loadPhotos = async () => {
    try {
      const stored = await AsyncStorage.getItem('savedPhotos');
      if (stored) {
        const photos = JSON.parse(stored);
        setGalleryPhotos(photos);
        if (photos.length > 0) {
          setLatestPhoto(photos[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  };

  const savePhotoUri = async (uri: string) => {
    try {
      setIsSaving(true);
      const updatedPhotos = [uri, ...galleryPhotos];
      await AsyncStorage.setItem('savedPhotos', JSON.stringify(updatedPhotos));
      setGalleryPhotos(updatedPhotos);
      setLatestPhoto(uri);
    } catch (error) {
      console.error('Failed to save photo:', error);
      Alert.alert('Error', 'Failed to save photo');
    } finally {
      setIsSaving(false);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      setPreviewVisible(true);
      await savePhotoUri(photo.uri);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const deletePhoto = async (uri: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPhotos = galleryPhotos.filter(photo => photo !== uri);
              await AsyncStorage.setItem('savedPhotos', JSON.stringify(updatedPhotos));
              setGalleryPhotos(updatedPhotos);
              setLatestPhoto(updatedPhotos[0] || null);
              if (photoUri === uri) {
                setPreviewVisible(false);
                setPhotoUri(null);
              }
            } catch (error) {
              console.error('Failed to delete photo:', error);
            }
          },
        },
      ]
    );
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to use the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={handleSwipe}>
    <View style={styles.container}>
      {!previewVisible && !galleryVisible ? (
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
        >
          <SafeAreaView style={styles.topControls}>
            <TouchableOpacity onPress={() => setGalleryVisible(true)} style={styles.galleryButton}>
              {latestPhoto && (
                <Image source={{ uri: latestPhoto }} style={styles.thumbnail} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
              <Ionicons name="camera-reverse" size={32} color="white" />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.bottomControls}>
            <TouchableOpacity 
              onPress={takePhoto} 
              style={styles.shutterButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.innerShutter} />
              )}
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : previewVisible && photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <View style={styles.previewControls}>
            <TouchableOpacity 
              onPress={() => setPreviewVisible(false)} 
              style={styles.previewButton}
            >
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deletePhoto(photoUri)} 
              style={styles.previewButton}
            >
              <Ionicons name="trash" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.galleryContainer}>
          <SafeAreaView style={styles.galleryHeader}>
            <TouchableOpacity 
              onPress={() => setGalleryVisible(false)} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={[styles.galleryTitle, fontsLoaded && { fontFamily: 'Caveat' }]}>
              Your Photos
            </Text>
          </SafeAreaView>

          <ScrollView contentContainerStyle={styles.galleryGrid}>
            {galleryPhotos.map((uri, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => {
                  setPhotoUri(uri);
                  setPreviewVisible(true);
                  setGalleryVisible(false);
                }}
              >
                <Image source={{ uri }} style={styles.galleryImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
      </PanGestureHandler>

  );
}

const { width } = Dimensions.get('window');
const imageSize = width / 3 - 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  flipButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerShutter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'white',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewControls: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewButton: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  galleryTitle: {
    color: 'white',
    fontSize: 24,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  galleryImage: {
    width: imageSize,
    height: imageSize,
    margin: 1,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});