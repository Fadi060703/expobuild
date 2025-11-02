import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { fetchOfferDetails, fetchOffers } from '../../src/services/offersService';
import { fetchParticipantDetails } from '../../src/services/participantsService';

const { width, height } = Dimensions.get('window');

// 🔹 Helper function to scale sizes proportionally
const scale = size => (width / 375) * size;
const fontScale = size => PixelRatio.roundToNearestPixel((width / 375) * size);

export default function OffersScreen() {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        setLoading(true);
        const offersData = await fetchOffers();

        const offersWithCompanies = await Promise.all(
          offersData.map(async (offer) => {
            if (offer.company) {
              try {
                const company = await fetchParticipantDetails(offer.company);
                return { ...offer, companyName: company.name };
              } catch {
                return { ...offer, companyName: 'Unknown Company' };
              }
            }
            return { ...offer, companyName: 'No company' };
          })
        );

        setOffers(offersWithCompanies);
      } catch (error) {
        console.error('Failed to load offers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  const loadOfferDetails = async (id) => {
    try {
      setDetailLoading(true);
      const offer = await fetchOfferDetails(id);
      setSelectedOffer(offer);
      
      if (offer?.company) {
        const company = await fetchParticipantDetails(offer.company);
        setCompanyDetails(company);
      }
    } catch (error) {
      console.error('Failed to load offer details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#068d8c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expo Offers</Text>
      
      <ScrollView style={styles.listContainer}>
        {offers.map((offer) => (
          <TouchableOpacity
            key={offer.id}
            style={styles.listItem}
            onPress={() => loadOfferDetails(offer.id)}
          >
            <Text style={styles.offerName}>{offer.name}</Text>
            <Text style={styles.companyName}>{offer.companyName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={!!selectedOffer}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedOffer(null)}
      >
        <View style={styles.detailModalContainer}>
          <View style={styles.detailModal}>
            {detailLoading ? (
              <ActivityIndicator size="large" color="#068d8c" />
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedOffer(null)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
                
                {companyDetails?.logo && (
                  <Image 
                    source={{ uri: `http://127.0.0.1:8000${companyDetails.logo}` }}
                    style={styles.detailLogo}
                  />
                )}
                
                <Text style={styles.detailName}>{selectedOffer?.name}</Text>
                {companyDetails && (
                  <Text style={styles.detailCompany}>
                    By: {companyDetails.name}
                  </Text>
                )}
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Offer Details:</Text>
                  <Text style={styles.detailText}>{selectedOffer?.description}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fbff',
  },
  header: {
    fontSize: fontScale(22),
    fontWeight: 'bold',
    color: '#FBBC05',
    textAlign: 'center',
    marginTop: scale(50),
    marginBottom: scale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: scale(15),
  },
  listItem: {
    backgroundColor: 'white',
    padding: scale(15),
    borderRadius: scale(10),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  offerName: {
    fontSize: fontScale(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scale(4),
  },
  companyName: {
    fontSize: fontScale(14),
    color: '#666',
  },
  detailModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  detailModal: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: scale(10),
    padding: scale(20),
    maxHeight: '80%',
  },
  detailLogo: {
    width: scale(80),
    height: scale(80),
    alignSelf: 'center',
    borderRadius: scale(40),
    marginBottom: scale(15),
  },
  detailName: {
    fontSize: fontScale(20),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: scale(5),
    color: '#333',
  },
  detailCompany: {
    fontSize: fontScale(15),
    textAlign: 'center',
    color: '#068d8c',
    marginBottom: scale(20),
  },
  detailSection: {
    marginBottom: scale(15),
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#068d8c',
    marginBottom: scale(5),
    fontSize: fontScale(15),
  },
  detailText: {
    fontSize: fontScale(14),
    color: '#555',
    lineHeight: fontScale(22),
  },
  closeButton: {
    position: 'absolute',
    top: scale(10),
    right: scale(10),
    padding: scale(10),
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: fontScale(24),
    color: '#068d8c',
  },
});
