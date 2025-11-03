// Categories API

import axios from 'axios';

const API_BASE_URL = 'http://fadishouhfa.pythonanywhere.com/api';


export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/category`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchCategoryDetails = async (categoryId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category details:', error);
    return null;
  }
};