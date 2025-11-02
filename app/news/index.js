import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { fetchArticleDetails, fetchNewsArticles } from '../../src/services/newsService';

const { width, height } = Dimensions.get('window');
const scale = size => (width / 375) * size;
const fontScale = size => PixelRatio.roundToNearestPixel((width / 375) * size);

export default function NewsScreen() {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50076" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expo News</Text>
      
      <ScrollView style={styles.articlesContainer}>
        {newsArticles.map(article => (
          <TouchableOpacity 
            key={article.id} 
            style={styles.articleCard}
            onPress={() => handleArticlePress(article)}
          >
            <View style={styles.articleTextContainer}>
              <Text style={styles.articleTitle}>{article.headline}</Text>
              <Text style={styles.articleDate}>{article.created_at}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <View style={styles.detailModal}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedArticle(null)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          {detailLoading ? (
            <ActivityIndicator size="large" color="#e50076" />
          ) : (
            <>
              <Text style={styles.detailTitle}>{selectedArticle.headline}</Text>
              <Text style={styles.detailDate}>{selectedArticle.created_at}</Text>
              
              {articleDetails?.image && (
                <Image 
                  source={{ uri: `fadishouhfa.pythonanywhere.com${articleDetails.image}` }}
                  style={styles.articleImage}
                  resizeMode="contain"
                />
              )}
              
              <Text style={styles.detailContent}>
                {articleDetails?.articleText || 'Loading content...'}
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: scale(30),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: fontScale(24),
    fontWeight: 'bold',
    color: '#ff914d',
    textAlign: 'center',
    marginBottom: scale(20),
  },
  articlesContainer: {
    paddingHorizontal: scale(15),
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: scale(10),
    marginBottom: scale(15),
    padding: scale(15),
    shadowColor: '#ff914d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ffe6f2',
  },
  articleTitle: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scale(5),
  },
  articleDate: {
    fontSize: fontScale(12),
    color: '#888',
  },
  detailModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: scale(20),
    zIndex: 100,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: scale(10),
  },
  closeButtonText: {
    fontSize: fontScale(28),
    color: '#e50076',
  },
  detailTitle: {
    fontSize: fontScale(22),
    fontWeight: 'bold',
    marginBottom: scale(8),
    color: '#333',
  },
  detailDate: {
    fontSize: fontScale(13),
    color: '#888',
    marginBottom: scale(15),
  },
  detailContent: {
    fontSize: fontScale(16),
    lineHeight: fontScale(24),
    color: '#444',
  },
  articleImage: {
    width: '100%',
    height: scale(200),
    marginBottom: scale(20),
    borderRadius: scale(8),
  },
});
