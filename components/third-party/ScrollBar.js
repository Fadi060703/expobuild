import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';


const ScrollBar = ({ text , cat , onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={imageSource} style={styles.image} />
      <Text style={styles.text}>{text}</Text>
      <Text style = { styles.text }> { cat } </Text>
    </TouchableOpacity>
  );
}; 

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
    textAlign: 'center',
    fontFamily: 'Alata-Regular', // Using Alata font here
  },
});

export default ScrollBar ;