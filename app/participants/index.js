import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { fetchCategories } from '../../src/services/categoryService';
import { fetchParticipantDetails, fetchParticipants } from '../../src/services/participantsService';
import { fetchCompanyProducts, fetchProductDetail } from '../../src/services/productsService';

/* -----------------------------
   Scaling helpers (same as Home)
   ----------------------------- */
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
const scale = (size, width) => (width / guidelineBaseWidth) * size;
const verticalScale = (size, height) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, width, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

const API_BASE_URL = 'http://127.0.0.1:8000';

/* -----------------------------
   ParticipantsScreen
   ----------------------------- */
export default function ParticipantsScreen() {
  const { width, height } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState('alphabetical');
  const [activeType, setActiveType] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // 🔸 New product-related states
  const [companyProducts, setCompanyProducts] = useState([]);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productDetailLoading, setProductDetailLoading] = useState(false);

  /* -----------------------------
     Data fetching
     ----------------------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [participantsData, categoriesData] = await Promise.all([
          fetchParticipants(),
          fetchCategories(),
        ]);
        setParticipants(participantsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
const loadParticipantDetails = async (id) => {
  try {
    setDetailLoading(true);
    const details = await fetchParticipantDetails(id);

    // ensure the structure is consistent
    if (details && typeof details === 'object' && details.id) {
      setSelectedParticipant(details);
    } else {
      console.error('Invalid participant details:', details);
    }
  } catch (error) {
    console.error('Failed to load participant details:', error);
  } finally {
    setDetailLoading(false);
  }
};

  // 🔸 Fetch company products
  const loadCompanyProducts = async (companyId) => {
    try {
      setProductLoading(true);
      const data = await fetchCompanyProducts(companyId);
      setCompanyProducts(data);
      setShowProductsModal(true);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setProductLoading(false);
    }
  };

  // 🔸 Fetch product detail
  const loadProductDetail = async (productId) => {
    try {
      setProductDetailLoading(true);
      const detail = await fetchProductDetail(productId);
      setSelectedProduct(detail);
    } catch (error) {
      console.error('Failed to load product detail:', error);
    } finally {
      setProductDetailLoading(false);
    }
  };

  /* -----------------------------
     Derived data
     ----------------------------- */
  const filteredParticipants =
    activeType === 'all'
      ? participants
      : participants.filter((p) => p.category === parseInt(activeType));

  const sortedParticipants = [...filteredParticipants].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const currentTypeLabel =
    categories.find((c) => c.id === parseInt(activeType))?.name || 'All Types';

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || 'Unknown';

  /* -----------------------------
     Loading State
     ----------------------------- */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5c2c8c" />
      </View>
    );
  }

  /* -----------------------------
     Render
     ----------------------------- */
  return (
    <View style={styles.container}>
      {/* Top navigation bar */}
      <View
        style={[
          styles.navBar,
          {
            paddingTop: verticalScale(18, height),
            paddingBottom: verticalScale(10, height),
            borderBottomLeftRadius: moderateScale(22, width),
            borderBottomRightRadius: moderateScale(22, width),
          },
        ]}
      >
        {['alphabetical', 'type'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.navButton,
              activeTab === tab && styles.activeNavButton,
              {
                paddingVertical: verticalScale(8, height),
                paddingHorizontal: scale(20, width),
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.navButtonText,
                { fontSize: moderateScale(14, width) },
              ]}
            >
              {tab === 'alphabetical' ? 'A-Z' : 'By Type'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alphabetical List */}
      {activeTab === 'alphabetical' ? (
        <ScrollView style={{ flex: 1, padding: scale(16, width) }}>
          {sortedParticipants.map((p) => (
            <View
              key={p.id}
              style={[
                styles.listItem,
                {
                  padding: scale(14, width),
                  marginBottom: verticalScale(12, height),
                  borderRadius: moderateScale(14, width),
                },
              ]}
            >
              {/* 🔸 Products button on left */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#5c2c8c',
                  paddingVertical: verticalScale(6, height),
                  paddingHorizontal: scale(10, width),
                  borderRadius: moderateScale(8, width),
                  marginRight: scale(10, width),
                }}
                onPress={() => loadCompanyProducts(p.id)}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: moderateScale(12, width),
                    fontWeight: '600',
                  }}
                >
                  Products
                </Text>
              </TouchableOpacity>

              {/* Participant Info */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                onPress={() => loadParticipantDetails(p.id)}
              >
                {p.logo && (
                  <Image
                    source={{ uri: `${API_BASE_URL}${p.logo}` }}
                    style={{
                      width: scale(46, width),
                      height: scale(46, width),
                      borderRadius: scale(25, width),
                      marginRight: scale(12, width),
                    }}
                  />
                )}
                <View>
                  <Text
                    style={[
                      styles.participantName,
                      { fontSize: moderateScale(15, width) },
                    ]}
                  >
                    {p.name}
                  </Text>
                  <Text
                    style={[
                      styles.participantType,
                      {
                        fontSize: moderateScale(12, width),
                        paddingVertical: verticalScale(3, height),
                        paddingHorizontal: scale(8, width),
                        borderRadius: moderateScale(6, width),
                      },
                    ]}
                  >
                    {getCategoryName(p.category)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {/* Participant Details Modal */}
<Modal
  visible={!!selectedParticipant}
  transparent
  animationType="slide"
  onRequestClose={() => setSelectedParticipant(null)}
>
  <View style={styles.detailModalContainer}>
    <View
      style={[
        styles.detailModal,
        {
          width: width * 0.9,
          borderRadius: moderateScale(14, width),
          padding: scale(20, width),
        },
      ]}
    >
      {detailLoading ? (
        <ActivityIndicator size="large" color="#5c2c8c" />
      ) : (
        <>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedParticipant(null)}
          >
            <Text style={{ fontSize: moderateScale(26, width), color: '#5c2c8c' }}>
              ×
            </Text>
          </TouchableOpacity>

          {selectedParticipant?.logo && (
            <Image
              source={{ uri: `${API_BASE_URL}${selectedParticipant.logo}` }}
              style={{
                width: scale(90, width),
                height: scale(90, width),
                alignSelf: 'center',
                borderRadius: scale(45, width),
                marginBottom: verticalScale(12, height),
              }}
            />
          )}

          <Text
            style={{
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: moderateScale(20, width),
              color: '#333',
            }}
          >
            {selectedParticipant?.name}
          </Text>

          <Text
            style={{
              textAlign: 'center',
              color: '#666',
              marginVertical: verticalScale(10, height),
            }}
          >
            {selectedParticipant?.description || 'No description available.'}
          </Text>
        </>
      )}
    </View>
  </View>
</Modal>

      {/* 🔸 Products Modal */}
      <Modal
        visible={showProductsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductsModal(false)}
      >
        <View style={styles.detailModalContainer}>
          <View
            style={[
              styles.detailModal,
              {
                width: width * 0.9,
                borderRadius: moderateScale(14, width),
                padding: scale(20, width),
              },
            ]}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProductsModal(false)}
            >
              <Text style={{ fontSize: moderateScale(26, width), color: '#5c2c8c' }}>×</Text>
            </TouchableOpacity>

            <Text
              style={{
                fontWeight: 'bold',
                fontSize: moderateScale(18, width),
                textAlign: 'center',
                marginBottom: verticalScale(10, height),
              }}
            >
              Products
            </Text>

            {productLoading ? (
              <ActivityIndicator size="large" color="#5c2c8c" />
            ) : (
              <ScrollView>
                {companyProducts.map((prod) => (
                  <TouchableOpacity
                    key={prod.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#f9f9f9',
                      padding: scale(10, width),
                      marginBottom: verticalScale(8, height),
                      borderRadius: moderateScale(10, width),
                    }}
                    onPress={() => loadProductDetail(prod.id)}
                  >
                    {prod.image && (
                      <Image
                        source={{ uri: `${API_BASE_URL}${prod.image}` }}
                        style={{
                          width: scale(50, width),
                          height: scale(50, width),
                          borderRadius: moderateScale(8, width),
                          marginRight: scale(10, width),
                        }}
                      />
                    )}
                    <Text style={{ fontSize: moderateScale(15, width), color: '#333' }}>
                      {prod.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 🔸 Product Detail Modal (same card style) */}
      <Modal
        visible={!!selectedProduct}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.detailModalContainer}>
          <View
            style={[
              styles.detailModal,
              {
                width: width * 0.9,
                borderRadius: moderateScale(14, width),
                padding: scale(20, width),
              },
            ]}
          >
            {productDetailLoading ? (
              <ActivityIndicator size="large" color="#5c2c8c" />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedProduct(null)}
                >
                  <Text style={{ fontSize: moderateScale(26, width), color: '#5c2c8c' }}>×</Text>
                </TouchableOpacity>

                {selectedProduct?.image && (
                  <Image
                    source={{ uri: `${API_BASE_URL}${selectedProduct.image}` }}
                    style={{
                      width: scale(90, width),
                      height: scale(90, width),
                      alignSelf: 'center',
                      borderRadius: scale(45, width),
                      marginBottom: verticalScale(12, height),
                    }}
                  />
                )}
                <Text
                  style={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: moderateScale(20, width),
                    color: '#333',
                  }}
                >
                  {selectedProduct?.name}
                </Text>

                <Text
                  style={{
                    textAlign: 'center',
                    color: '#666',
                    marginVertical: verticalScale(10, height),
                  }}
                >
                  {selectedProduct?.description}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Existing participant details modal */}
      {/* keep your original modal here unchanged */}
    </View>
  );
}

/* -----------------------------
   Styles
   ----------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fbff' },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#5c2c8c',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
  },
  navButton: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  activeNavButton: { backgroundColor: 'rgba(255,255,255,0.35)' },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  listItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  participantName: { color: '#333', fontWeight: '600' },
  participantType: { color: '#555', backgroundColor: '#f0f0f0' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  detailModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  detailModal: { backgroundColor: 'white', maxHeight: '85%' },
  closeButton: { position: 'absolute', top: 10, right: 10 },
});
