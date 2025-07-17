import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import cameraIcon from '../../assets/icons/camIcon.png';
import exploreIcon from '../../assets/icons/exploreIcon.png';
import mapIcon from '../../assets/icons/mapIcon.png';




const styles = StyleSheet.create({
 tabIcon: {
   alignSelf: 'center',
 },
 centerButton: {
   alignItems: 'center',
   justifyContent: 'center',
   width: 55,
   height: 55,
   backgroundColor: 'transparent',
   borderRadius: 28,
   marginBottom: 0,
 },
});


const colors = {
 cream: '#FFF5E0',
 darkGray: '#2D2B2B',
};


export default function TabsLayout() {
 return (
   <Tabs
     screenOptions={{
       headerShown: false,
       tabBarStyle: {
         position: 'absolute',
         bottom: 0,
         left: 0,
         right: 0,
         height: 90,
         backgroundColor: 'rgba(168, 147, 147, 0.9)',
         borderTopWidth: 0,
         elevation: 0,
         shadowColor: '#000',
         shadowOffset: { width: 0, height: -4 },
         shadowOpacity: 0,
         shadowRadius: 8,
         paddingBottom: 45,
         paddingTop: 5,
         flexDirection: 'row',
         justifyContent: 'space-evenly',
         alignItems: 'center',
       },
       tabBarShowLabel: false,
     }}
   >
     <Tabs.Screen
       name="explore"
       options={{
         title: 'Explore',
         tabBarIcon: ({ focused }) => (
           <Image
             source={exploreIcon}
             resizeMode="contain"
             style={{
               width: focused ? 44 : 40,
               height: focused ? 44 : 40,
               tintColor: focused ? colors.cream : colors.darkGray,
             }}
           />
         ),
       }}
     />


     <Tabs.Screen
       name="deals"
       options={{
         title: 'Deals',
         tabBarIcon: ({ focused }) => (
           <Ionicons
             name="pricetags-outline"
             size={focused ? 30 : 30}
             color={focused ? colors.cream : colors.darkGray}
             style={styles.tabIcon}
           />
         ),
       }}
     />


     <Tabs.Screen
       name="map"
       options={{
         title: 'Map',
         tabBarIcon: ({ focused }) => (
           <View style={styles.centerButton}>
             <Image
               source={mapIcon}
               resizeMode="contain"
               style={{
                 width: 70,
                 height: 70,
               }}
             />
           </View>
         ),
       }}
     />


     <Tabs.Screen
       name="photo"
       options={{
         title: 'Photo',
         tabBarStyle: { display: 'none' }, // 👈 Hides the tab bar
         tabBarIcon: ({ focused }) => (
         <Image
           source={cameraIcon}
           resizeMode="contain"
           style={[
           styles.tabIcon,
           {
             width: focused ? 58 : 58,
             height: focused ? 58 : 58,
           },
         ]}
       />
     ),
   }}
 />
    


     <Tabs.Screen
       name="profile"
       options={{
         title: 'Profile',
         tabBarIcon: ({ focused }) => (
           <Ionicons
             name="person-outline"
             size={focused ? 40 : 36}
             color={focused ? colors.cream : colors.darkGray}
             style={styles.tabIcon}
           />
         ),
       }}
     />
   </Tabs>
 );
}
