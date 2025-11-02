// Products API

import axios from 'axios';

const API_BASE_URL = 'http://fadishouhfa.pythonanywhere.com/api';

export const fetchCompanyProducts = async (companyId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/company-products/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching company products:', error);
    return [];
  }
};

export const fetchProductDetail = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
};
