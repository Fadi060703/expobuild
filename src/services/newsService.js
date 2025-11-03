import axios from 'axios';

const API_BASE_URL = 'https://fadishouhfa.pythonanywhere.com/api';

export const fetchNewsArticles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/articles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return [];
  }
};

export const fetchArticleDetails = async (articleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/articles/${articleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching article details:', error);
    return null;
  }
};