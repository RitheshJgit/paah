import api from '../../services/api';

export const getProfile = async () => {
  const res = await api.get('/users/profile');
  return res.data;
};