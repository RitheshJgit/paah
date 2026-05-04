import api from '../../services/api';

// REGISTER
export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

// LOGIN
export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

// GET CURRENT USER
export const getCurrentUser = async () => {
  const res = await api.get('/users/me');
  return res.data;
};