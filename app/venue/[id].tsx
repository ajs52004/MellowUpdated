import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const VenueDetail = () => {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Venue ID: {id}</Text>
      <Text style={styles.subtitle}>This is the detail page for venue {id}.</Text>
    </View>
  );
};

export default VenueDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
