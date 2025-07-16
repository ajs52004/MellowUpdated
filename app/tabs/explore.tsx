import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Venue {
  id: string;
  name: string;
  image_url: string;
  location: string;
  price: string;
  rating: number;
  category: string;
}

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/deals');
        setVenues(res.data || []);
      } catch (err) {
        console.error('Error fetching venues:', err);
      }
    };

    fetchVenues();
  }, []);

  const renderVenueCard = ({ item }: { item: Venue }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.cardMeta}>{item.location} • {item.price}</Text>
      <Text style={styles.cardRating}>⭐ {item.rating.toFixed(1)}</Text>
    </TouchableOpacity>
  );

  const Section = ({ title, filter }: { title: string; filter: (v: Venue) => boolean }) => {
    const filtered = venues.filter(filter);
    if (filtered.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.arrow}>›</Text>
        </View>
        <FlatList
          horizontal
          data={filtered}
          renderItem={renderVenueCard}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search for venues"
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Section title="Recently Viewed" filter={(v) => v.category === 'recent'} />
        <Section title="Trending Locally" filter={(v) => v.category === 'trending'} />
        <Section title="Bang for Buck" filter={(v) => v.category === 'value'} />
        <Section title="Most Popular This Month" filter={(v) => v.category === 'top'} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },

  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 30,
    padding: 10,
    paddingHorizontal: 20,
    elevation: 3,
    alignItems: 'center',
  },
  searchInput: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },

  scrollContainer: {
    paddingBottom: 100,
  },

  section: {
    marginTop: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  arrow: {
    fontSize: 24,
    color: '#888',
    marginTop: -2,
  },

  card: {
    width: 160,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 100,
  },
  cardName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
    marginHorizontal: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
    marginTop: 2,
  },
  cardRating: {
    fontSize: 12,
    color: '#444',
    marginHorizontal: 8,
    marginBottom: 8,
    marginTop: 2,
  },
});
