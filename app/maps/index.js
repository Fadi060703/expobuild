import { useEffect, useState } from 'react';
import { ActivityIndicator, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { WebView } from 'react-native-webview';

export default function MapScreen() {
  const [currentLocation, setCurrentLocation] = useState({ lat: 33.5138, lng: 36.2765 }); // Default to Damascus
  const [destination, setDestination] = useState({ lat: 33.5100, lng: 36.2800 });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionGranted(true);
          return true;
        }
      } catch (err) {
        console.warn(err);
      }
      return false;
    }
    // iOS always returns true for this check
    setPermissionGranted(true);
    return true;
  };

  // Get current location
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.log('Location error:', error);
        // Keep default location if GPS fails
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000,
        forceRequestLocation: true
      }
    );
  };

  // Set destination coordinates
  const setNewDestination = (lat, lng) => {
    setDestination({ lat, lng });
  };

  // Initialize location
  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        getCurrentLocation();
      }
    };
    init();
  }, []);

  // Generate the HTML for the WebView
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body, html, #map {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
      <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
      
      <script>
        // Wait for everything to load
        document.addEventListener('DOMContentLoaded', function() {
          // Initialize map
          var map = L.map('map', {
            zoomControl: true,
            dragging: true,
            tap: false
          }).setView([${currentLocation.lat}, ${currentLocation.lng}], 13);
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            noWrap: true
          }).addTo(map);
          
          // Add current location marker
          L.marker([${currentLocation.lat}, ${currentLocation.lng}], {
            icon: L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          }).addTo(map).bindPopup("Your Location");

          // Add destination marker
          L.marker([${destination.lat}, ${destination.lng}], {
            icon: L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          }).addTo(map).bindPopup("Destination");

          // Add routing
          var control = L.Routing.control({
            waypoints: [
              L.latLng(${currentLocation.lat}, ${currentLocation.lng}),
              L.latLng(${destination.lat}, ${destination.lng})
            ],
            routeWhileDragging: true,
            show: true,
            collapsible: true,
            lineOptions: {
              styles: [{color: '#007AFF', weight: 5}]
            },
            addWaypoints: false
          }).addTo(map);

          // Fix for WebView rendering issues
          setTimeout(function() {
            map.invalidateSize();
            control.hide();
            control.show();
          }, 500);
          
          // Notify React Native that map is loaded
          window.ReactNativeWebView.postMessage('mapLoaded');
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* Header with location info */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {permissionGranted 
            ? `Your Location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
            : 'Waiting for location permission...'}
        </Text>
      </View>

      {/* Map */}
      <WebView
        source={{ html: mapHtml }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
        onMessage={(event) => {
          if (event.nativeEvent.data === 'mapLoaded') {
            setMapLoaded(true);
          }
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('HTTP error:', nativeEvent);
        }}
      />

      {/* Destination selector */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setNewDestination(33.5100, 36.2800)}>
          <Text style={styles.buttonText}>Destination 1</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setNewDestination(33.5200, 36.2900)}>
          <Text style={styles.buttonText}>Destination 2</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  headerText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500'
  },
  webview: {
    flex: 1
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }]
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    minWidth: 120,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: '500'
  }
});