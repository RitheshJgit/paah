import api from '../../services/api';

// CREATE
export const createDonation = async (formData) => {
  const res = await api.post('/donations', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return res.data;
};

// GET MY DONATIONS
export const getMyDonations = async () => {
  const res = await api.get('/donations/my');
  return res.data;
};

export const getPendingDonations = async () => {
  const res = await api.get('/donations/pending');
  return res.data;
};

export const verifyDonation = async (data) => {
  const res = await api.post('/donations/verify', data);
  return res.data;
};

export const getAllDonations = async () => {
  const res = await api.get('/donations/all');
  return res.data;
};

export const getAdminStats = async () => {
  const res = await api.get('/donations/admin-stats');
  return res.data;
};