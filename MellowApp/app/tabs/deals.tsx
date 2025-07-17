import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type DealsScreenProps = {
  locationRegion: {
    latitude: number;
    longitude: number;
  };
};

type Venue = {
  id: string;
  name: string;
  deal: string;
  image: string;
  rating: number;
  distance: string;
  type: 'bar' | 'restaurant' | 'club';
};

const DealsScreen = ({ locationRegion }: DealsScreenProps) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'bar' | 'restaurant' | 'club'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deals, setDeals] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await axios.get('http://10.74.136.193:3001/api/deals');
        const mapped: Venue[] = res.data.map((item: any, index: number) => ({
          id: item.id || index.toString(),
          name: item.name,
          deal: item.deal || 'Happy Hour specials!',
          image: item.image_url || 'https://via.placeholder.com/150',
          rating: item.rating || 4.0,
          distance: item.distance ? `${(item.distance / 1609).toFixed(1)} mi` : '0.5 mi',
          type: item.categories?.[0]?.alias || 'bar',
        }));
        setDeals(mapped);
      } catch (err: any) {
        console.error('Failed to fetch deals:', err.message);
        setError('Failed to load deals');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchSearch = deal.name.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || deal.type === filterType;
      return matchSearch && matchType;
    });
  }, [search, filterType, deals]);

  const renderCard = ({ item }: { item: Venue }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <LinearGradient
        colors={['rgba(255,255,255,0.3)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardContent}
      >
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDeal}>{item.deal}</Text>
        <Text style={styles.cardMetaText}>
          {item.distance} • ⭐ {item.rating}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FBBC05" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}></Text>
      </View>

      <View style={styles.searchBarRow}>
        <TextInput
          placeholder="Search bars..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        style={styles.scrollArea}
        data={filteredDeals}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.floatingContainer}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.floatingButton}
        >
          <Ionicons name="options-outline" size={22} color="#2D2B2B" />
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.dropdown}>
            {['all', 'bar', 'restaurant', 'club'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setFilterType(type as typeof filterType);
                  setShowFilters(false);
                }}
                style={[
                  styles.filterOption,
                  filterType === type && styles.filterOptionActive,
                ]}
              >
                <Text
                  style={
                    filterType === type
                      ? styles.filterTextActive
                      : styles.filterText
                  }
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#A89393',
  },
  pageHeader: {
    paddingTop: 0,
    paddingBottom: -10,
    alignItems: 'center',
    backgroundColor: '#A89393',
  },
  pageTitle: {
    fontSize: 32,
    fontFamily: 'Pacifico',
    color: '#2D2B2B',
    marginTop: 40,
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  searchBarRow: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 45,
    fontSize: 14,
    color: '#2D2B2B',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  floatingContainer: {
    position: 'absolute',
    right: 16,
    top: 110,
    zIndex: 10,
    alignItems: 'flex-end',
  },
  floatingButton: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 20,
    elevation: 4,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 8,
    width: 130,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filterOptionActive: {
    backgroundColor: '#FBBC05',
  },
  filterText: {
    fontSize: 14,
    color: '#2D2B2B',
  },
  filterTextActive: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D2B2B',
  },

  card: {
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2B2B',
  },
  cardDeal: {
    fontSize: 14,
    color: '#FBBC05',
    marginTop: 4,
    fontWeight: '500',
  },
  cardMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMetaText: {
    fontSize: 13,
    color: '#777',
  },
  tag: {
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 12,
    color: '#2D2B2B',
    fontWeight: '500',
  },
});


export default DealsScreen;
