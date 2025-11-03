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
import { fetchArticleDetails, fetchNewsArticles } from '../../src/services/newsService';

// 🔹 Scaling helpers
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size, width) => (width / guidelineBaseWidth) * size;
const verticalScale = (size, height) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, width, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

export default function NewsScreen() {
  const { width, height } = useWindowDimensions();

  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleDetails, setArticleDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const articles = await fetchNewsArticles();
        setNewsArticles(articles);
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  const handleArticlePress = async (article) => {
    setDetailLoading(true);
    setSelectedArticle(article);
    try {
      const details = await fetchArticleDetails(article.id);
      setArticleDetails(details);
    } catch (err) {
      console.error('Failed to fetch article details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#e50076" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: verticalScale(30, height) }}>
      <Text
        style={{
          fontSize: moderateScale(24, width),
          fontWeight: 'bold',
          color: '#ff914d',
          textAlign: 'center',
          marginBottom: verticalScale(20, height),
        }}
      >
        Expo News
      </Text>

      <ScrollView style={{ paddingHorizontal: scale(15, width) }}>
        {newsArticles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: moderateScale(10, width),
              marginBottom: verticalScale(15, height),
              padding: scale(15, width),
              shadowColor: '#ff914d',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 5,
              borderWidth: 1,
              borderColor: '#ffe6f2',
            }}
            onPress={() => handleArticlePress(article)}
          >
            <View>
              <Text
                style={{
                  fontSize: moderateScale(18, width),
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: verticalScale(5, height),
                }}
              >
                {article.headline}
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(12, width),
                  color: '#888',
                }}
              >
                {article.created_at}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Article Detail Modal */}
      <Modal
        visible={!!selectedArticle}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedArticle(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: width * 0.9,
              maxHeight: '80%',
              backgroundColor: 'white',
              borderRadius: moderateScale(10, width),
              padding: scale(20, width),
            }}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: verticalScale(10, height),
                right: scale(10, width),
                zIndex: 1,
                padding: scale(10, width),
              }}
              onPress={() => setSelectedArticle(null)}
            >
              <Text style={{ fontSize: moderateScale(28, width), color: '#e50076' }}>×</Text>
            </TouchableOpacity>

            {detailLoading ? (
              <ActivityIndicator size="large" color="#e50076" />
            ) : (
              <ScrollView showsVerticalScrollIndicator={true}>
                <Text
                  style={{
                    fontSize: moderateScale(22, width),
                    fontWeight: 'bold',
                    marginBottom: verticalScale(8, height),
                    color: '#333',
                  }}
                >
                  {selectedArticle?.headline}
                </Text>

                <Text
                  style={{
                    fontSize: moderateScale(13, width),
                    color: '#888',
                    marginBottom: verticalScale(15, height),
                  }}
                >
                  {selectedArticle?.created_at}
                </Text>

                {articleDetails?.image && (
                  <Image
                    source={{ uri: `https://fadishouhfa.pythonanywhere.com${articleDetails.image}` }}
                    style={{
                      width: '100%',
                      height: verticalScale(200, height),
                      marginBottom: verticalScale(20, height),
                      borderRadius: moderateScale(8, width),
                    }}
                    resizeMode="contain"
                  />
                )}

                <Text
                  style={{
                    fontSize: moderateScale(16, width),
                    lineHeight: verticalScale(24, height),
                    color: '#444',
                  }}
                >
                  {articleDetails?.articleText || 'Loading content...'}
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
