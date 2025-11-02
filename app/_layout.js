import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#e50076', // Default active color
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tabs.Screen 
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          tabBarActiveTintColor: '#5c2c8c', // Pink
        }}
      />
      <Tabs.Screen 
        name="participants/index"
        options={{
          title: 'Participants',
          tabBarIcon: ({ color }) => <MaterialIcons name="people" size={24} color={color} />,
          tabBarActiveTintColor: '#068d8c', // Blue
        }}
      />
      <Tabs.Screen 
        name="news/index"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <MaterialIcons name="newspaper" size={24} color={color} />,
          tabBarActiveTintColor: '#e40574', // Green
        }}
      />
      <Tabs.Screen 
        name="offers/index"
        options={{
          title: 'Offers',
          tabBarIcon: ({ color }) => <MaterialIcons name="local-offer" size={24} color={color} />,
          tabBarActiveTintColor: '#FBBC05', // Yellow
        }}
      />
{/*       <Tabs.Screen 
        name="maps/index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <MaterialIcons name="map" size={24} color={color} />,
          tabBarActiveTintColor: '#EA4335', // Red
        }}
      /> */}
    </Tabs>
  );
}