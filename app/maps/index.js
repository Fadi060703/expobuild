import { Image, StyleSheet, Text, View } from 'react-native';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/854/854878.png' }}
        style={styles.icon}
      />
      <Text style={styles.title}>الخريطة</Text>
      <Text style={styles.subtitle}>قريباً...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EA4335', // red, matches your map tab color
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#777',
  },
});
