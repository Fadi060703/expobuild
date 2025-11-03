import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { fetchOfferDetails, fetchOffers } from '../../src/services/offersService';
import { fetchParticipantDetails } from '../../src/services/participantsService';

// 🔹 Scaling helpers
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size, width) => (width / guidelineBaseWidth) * size;
const verticalScale = (size, height) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, width, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

export default function OffersScreen() {
  const { width, height } = useWindowDimensions();

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#068d8c" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fbff' }}>
      <Text
        style={{
          fontSize: moderateScale(22, width),
          fontWeight: 'bold',
          color: '#FBBC05',
          textAlign: 'center',
          marginTop: verticalScale(50, height),
          marginBottom: verticalScale(20, height),
        }}
      >
        Expo Offers
      </Text>

      <ScrollView style={{ paddingHorizontal: scale(15, width) }}>
        {offers.map((offer) => (
          <TouchableOpacity
            key={offer.id}
            style={{
              backgroundColor: 'white',
              padding: scale(15, width),
              borderRadius: moderateScale(10, width),
              marginBottom: verticalScale(12, height),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => loadOfferDetails(offer.id)}
          >
            <Text
              style={{
                fontSize: moderateScale(16, width),
                fontWeight: 'bold',
                color: '#333',
                marginBottom: verticalScale(4, height),
              }}
            >
              {offer.name}
            </Text>
            <Text style={{ fontSize: moderateScale(14, width), color: '#666' }}>
              {offer.companyName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Offer Details Modal */}
      <Modal
        visible={!!selectedOffer}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOffer(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              width: width * 0.9,
              backgroundColor: 'white',
              borderRadius: moderateScale(10, width),
              padding: scale(20, width),
              maxHeight: '80%',
            }}
          >
            {detailLoading ? (
              <ActivityIndicator size="large" color="#068d8c" />
            ) : (
              <>
                {/* Close Button */}
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: verticalScale(10, height),
                    right: scale(10, width),
                    zIndex: 1,
                    padding: scale(10, width),
                  }}
                  onPress={() => setSelectedOffer(null)}
                >
                  <Text style={{ fontSize: moderateScale(24, width), color: '#068d8c' }}>×</Text>
                </TouchableOpacity>

                {/* Company Logo */}
                {companyDetails?.logo && (
                  <Image
                    source={{ uri: `http://fadishouhfa.pythonanywhere.com${companyDetails.logo}` }}
                    style={{
                      width: scale(80, width),
                      height: scale(80, width),
                      alignSelf: 'center',
                      borderRadius: scale(40, width),
                      marginBottom: verticalScale(15, height),
                    }}
                  />
                )}

                <Text
                  style={{
                    fontSize: moderateScale(20, width),
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: verticalScale(5, height),
                    color: '#333',
                  }}
                >
                  {selectedOffer?.name}
                </Text>

                {companyDetails && (
                  <Text
                    style={{
                      fontSize: moderateScale(15, width),
                      textAlign: 'center',
                      color: '#068d8c',
                      marginBottom: verticalScale(20, height),
                    }}
                  >
                    By: {companyDetails.name}
                  </Text>
                )}

                <ScrollView showsVerticalScrollIndicator={true}>
                  <View style={{ marginBottom: verticalScale(15, height) }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: '#068d8c',
                        marginBottom: verticalScale(5, height),
                        fontSize: moderateScale(15, width),
                      }}
                    >
                      Offer Details:
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(14, width),
                        color: '#555',
                        lineHeight: verticalScale(22, height),
                      }}
                    >
                      {selectedOffer?.description}
                    </Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
