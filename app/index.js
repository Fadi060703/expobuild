import { useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

/* -----------------------------
   Scaling helpers (responsive)
   ----------------------------- */
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
const scale = (size, width) => (width / guidelineBaseWidth) * size;
const verticalScale = (size, height) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, width, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

/* -----------------------------
   HomeScreen
   ----------------------------- */
export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();

  // Carousel config
  const carouselWidth = Math.round(width * 0.92); // container width for each slide
  const carouselHeight = Math.round(height * 0.25);
  const autoSlideIntervalMs = 3500; // auto-slide every 3.5s

  const [carouselImages] = useState([
    require('../assets/images/c1.jpg'),
    require('../assets/images/c1.jpg'),
    require('../assets/images/c1.jpg'),
  ]);

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Buttons data
  const buttonData = [
    { image: require('../assets/images/people.png'), text: 'Participants', screenName: 'participants/index' },
    { image: require('../assets/images/news.png'), text: 'News', screenName: 'news/index' },
    { image: require('../assets/images/sale.png'), text: 'Offers', screenName: 'offers/index' },
    { image: require('../assets/images/map.png'), text: 'Maps', screenName: 'maps/index' },
  ];

  // Auto-looping carousel logic
  useEffect(() => {
    const total = carouselImages.length;
    const interval = setInterval(() => {
      const next = (activeIndexRef.current + 1) % total;
      activeIndexRef.current = next;
      setActiveIndex(next);
      // animate scroll
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: next * carouselWidth, animated: true });
      }
    }, autoSlideIntervalMs);

    return () => clearInterval(interval);
  }, [carouselImages.length, carouselWidth]);

  // Update activeIndex when user scrolls manually
  useEffect(() => {
    const listenerId = scrollX.addListener(({ value }) => {
      const idx = Math.round(value / carouselWidth);
      if (idx !== activeIndexRef.current) {
        activeIndexRef.current = idx;
        setActiveIndex(idx);
      }
    });
    return () => scrollX.removeListener(listenerId);
  }, [carouselWidth, scrollX]);

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollRoot, { paddingBottom: verticalScale(40, height) }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Modern header: soft two-tone without external libs */}
      <View
        style={{
          width,
          height: height * 0.25,
          justifyContent: 'flex-end',
          alignItems: 'center',
          overflow: 'hidden',
          marginBottom: verticalScale(8, height),
        }}
      >
        {/* top decorative circle to emulate stylish header */}
        <View
          style={{
            position: 'absolute',
            top: -height * 0.08,
            left: -width * 0.25,
            width: width * 1.5,
            height: height * 0.45,
            borderRadius: (width * 1.5) / 2,
            backgroundColor: '#ffb87f44', // soft orange overlay
          }}
        />
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#5c2c8c', // base orange
            justifyContent: 'flex-end',
            alignItems: 'center',
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            paddingBottom: verticalScale(20, height),
          }}
        >
          <Text style={{
            color: '#fff',
            fontSize: moderateScale(26, width),
            fontWeight: '700',
          }}>
            EXPO Syria
          </Text>
          <Text style={{
            color: '#fff9',
            fontSize: moderateScale(13, width),
            marginTop: 6,
          }}>
          </Text>
        </View>
      </View>

      {/* Carousel container */}
      <View
        style={{
          width: carouselWidth,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: '#fff',
          alignSelf: 'center',
          shadowColor: '#5c2c8c',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {carouselImages.map((img, i) => (
            <Image
              key={i}
              source={img}
              style={{
                width: carouselWidth,
                height: carouselHeight,
                resizeMode: 'cover',
              }}
            />
          ))}
        </Animated.ScrollView>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {carouselImages.map((_, i) => {
            // dot animation based on scrollX (but fall back to activeIndex for deterministic width)
            const inputRange = [(i - 1) * carouselWidth, i * carouselWidth, (i + 1) * carouselWidth];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 14, 6],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Button grid */}
      <View
        style={[
          styles.gridContainer,
          {
            marginTop: verticalScale(30, height),
            paddingHorizontal: width * 0.06,
          },
        ]}
      >
        {buttonData.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.86}
            style={[
              styles.tile,
              {
                width: '47%',
                aspectRatio: 1,
                marginBottom: verticalScale(20, height),
                borderRadius: moderateScale(16, width),
              },
            ]}
            onPress={() => navigation.navigate(item.screenName)}
          >
            {/* subtle inner shadow / layered look */}
            <View style={styles.tileInner}>
              <Image
                source={item.image}
                style={{
                  width: width * 0.17,
                  height: width * 0.17,
                  marginBottom: verticalScale(8, height),
                  resizeMode: 'contain',
                }}
              />
              <Text style={[styles.tileText, { fontSize: moderateScale(15, width) }]}>{item.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

/* -----------------------------
   Styles
   ----------------------------- */
const styles = StyleSheet.create({
  scrollRoot: {
    flexGrow: 1,
    backgroundColor: '#ffffffff',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#5c2c8c',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffffff',
    marginHorizontal: 6,
  },
  gridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    backgroundColor: '#fff',
    borderWidth: 1.25,
    borderColor: '#5c2c8c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  tileText: {
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
