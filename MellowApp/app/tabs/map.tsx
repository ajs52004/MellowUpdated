import axios from 'axios';
import * as Location from 'expo-location';
import { debounce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Modal from 'react-native-modal';
import { GOOGLE_API_KEY } from '../../apiKey';

interface Suggestion {
  description: string;
}

interface Place {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name?: string;
  place_id?: string;
}

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [region, setRegion] = useState<Region>({
    latitude: 40.743991,
    longitude: -74.032363,
    latitudeDelta: 0.08,
    longitudeDelta: 0.05,
  });
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [placeDetails, setPlaceDetails] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'specials'>('info');

  const debouncedFetch = useRef(
    debounce((newRegion: Region) => {
      fetchPlaces(newRegion);
    }, 800)
  ).current;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const userRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setRegion(userRegion);
      mapRef.current?.animateToRegion(userRegion, 1000);
      fetchPlaces(userRegion);
    })();
  }, []);

  const fetchPlaces = async (locationRegion: Region) => {
    try {
      const { latitude, longitude } = locationRegion;
      const res = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${latitude},${longitude}`,
            radius: 10000,
            keyword: 'bar|pub|tavern|club|cocktail|beer|restaurant|byob',
            key: GOOGLE_API_KEY,
          },
        }
      );
      setPlaces(res.data.results || []);
    } catch (err) {
      console.error('Places fetch error:', err);
    }
  };

  const fetchPlaceDetails = async (placeId: string) => {
    try {
      const res = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            fields: 'name,formatted_address,formatted_phone_number,opening_hours,website',
            key: GOOGLE_API_KEY,
          },
        }
      );
      setPlaceDetails(res.data.result || null);
    } catch (err) {
      console.error('Place details fetch error:', err);
    }
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    debouncedFetch(newRegion);
  };

  const handleLocationSelect = async (text: string) => {
    setSuggestions([]);
    try {
      const geocode = await Location.geocodeAsync(text);
      if (geocode.length > 0) {
        const { latitude, longitude } = geocode[0];
        const newRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
        fetchPlaces(newRegion);
        setSearch('');
      }
    } catch (err) {
      console.error('Geocode error:', err);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.length < 1) return setSuggestions([]);

      try {
        const res = await axios.get(
          'https://maps.googleapis.com/maps/api/place/autocomplete/json',
          {
            params: {
              input: search,
              key: GOOGLE_API_KEY,
              types: '(regions)',
              components: 'country:us',
            },
          }
        );
        const results = res.data.predictions || [];
        if (results.length === 0) {
          setSuggestions([{ description: 'No location found' }]);
        } else {
          const formatted = results.map((r: any) => ({ description: r.description }));
          setSuggestions(formatted);
        }
      } catch (err) {
        console.error('Autocomplete error:', err);
        setSuggestions([{ description: 'No location found' }]);
      }
    };

    fetchSuggestions();
  }, [search]);

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {places.map((place, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              }}
              onPress={() => {
                setSelectedPlace(place);
                setModalVisible(true);
                setActiveTab('info');
                if (place.place_id) fetchPlaceDetails(place.place_id);
              }}
            />
          ))}
        </MapView>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => handleLocationSelect(search)}
            placeholder="Search cities, zip codes..."
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
        </View>
        {suggestions.length > 0 && (
          <ScrollView style={styles.suggestionsContainer}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  if (item.description === 'No location found') return;
                  handleLocationSelect(item.description);
                }}
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => {
          setModalVisible(false);
          setPlaceDetails(null);
        }}
      >
        <View style={styles.modal}>
          <View style={styles.tabHeader}>
            <TouchableOpacity onPress={() => setActiveTab('info')} style={[styles.tabButton, activeTab === 'info' && styles.tabActive]}>
              <Text style={{ fontWeight: activeTab === 'info' ? 'bold' : 'normal' }}>Info</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('specials')} style={[styles.tabButton, activeTab === 'specials' && styles.tabActive]}>
              <Text style={{ fontWeight: activeTab === 'specials' ? 'bold' : 'normal' }}>Specials</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'info' && placeDetails ? (
            <View>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{placeDetails.name}</Text>
              <Text>{placeDetails.formatted_address}</Text>
              {placeDetails.opening_hours?.weekday_text?.map((line: string, i: number) => (
                <Text key={i}>{line}</Text>
              ))}
              {placeDetails.formatted_phone_number && <Text>📞 {placeDetails.formatted_phone_number}</Text>}
              {placeDetails.website && <Text numberOfLines={1}>🔗 {placeDetails.website}</Text>}
            </View>
          ) : activeTab === 'info' ? (
            <Text>Loading details...</Text>
          ) : (
            <Text>Specials feature temporarily disabled</Text>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  map: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  searchBar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    padding: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
  },
  searchInput: {
    fontSize: 16,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    maxHeight: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopWidth: 0,
    borderRadius: 4,
    marginTop: -15,
    zIndex: 999,
    elevation: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  tabHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
});