import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const [showDay, setShowDay] = useState(false);
  const logoAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    PatrickHand: require('../../../assets/fonts/PatrickHand-Regular.ttf'),
  });

  const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

  useEffect(() => {
    if (!fontsLoaded) return;

    // Animate logo scale + fade in
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        setShowDay(true);
        setTimeout(() => {
          router.replace('/tabs/map');
        }, 1500);
      }, 1000);
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {!showDay ? (
        <Animated.Image
          source={require('../../../assets/images/splash-logo.png')}
          style={[
            styles.logo,
            {
              opacity: logoAnim,
              transform: [
                {
                  scale: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ],
            },
          ]}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.dayText}>{today}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A89393',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220, // increased size
    height: 220,
  },
  dayText: {
    fontSize: 40,
    fontFamily: 'PatrickHand',
    color: '#F7F2E8',
    textAlign: 'center',
  },
});
