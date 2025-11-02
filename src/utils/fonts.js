import * as Font from 'expo-font';

export const loadFonts = async () => {
  await Font.loadAsync({
    'Alata-Regular': require('../assets/fonts/Alata-Regular.ttf'),
  });
};