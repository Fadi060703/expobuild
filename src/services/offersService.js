import axios from 'axios';

const API_BASE_URL = 'http://fadishouhfa.pythonanywhere.com/api';
export const fetchOffers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/offers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
};

export const fetchOfferDetails = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/offers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching offer details:', error);
    return null;
  }
};