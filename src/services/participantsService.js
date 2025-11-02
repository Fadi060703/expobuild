import axios from 'axios';

const API_BASE_URL = 'http://fadishouhfa.pythonanywhere.com/api';
// Participants API
export const fetchParticipants = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/participants`);
    return response.data;
  } catch (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
};

export const fetchParticipantDetails = async (participantId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/participants/${participantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching participant details:', error);
    return null;
  }
};




