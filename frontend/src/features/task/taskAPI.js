import api from '../../services/api';

export const createTask = async (data) => {
  const res = await api.post('/tasks/create', data);
  return res.data;
};

export const joinTask = async (data) => {
  const res = await api.post('/tasks/join', data);
  return res.data;
};

export const acceptTask = async (data) => {
  const res = await api.post('/tasks/accept', data);
  return res.data;
};

export const getMyTasks = async () => {
  const res = await api.get('/tasks/my');
  return res.data;
};

export const submitTaskProof = async (data) => {
  const res = await api.post('/tasks/submit-proof', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};



export const getMyPendingCount = async () => {
  const res = await api.get('/tasks/my/pending-count');
  return res.data;
};

export const verifyTask = async (data) => {
  const res = await api.post('/tasks/verify', data);
  return res.data;
};

export const getPendingTasks = async () => {
  const res = await api.get('/tasks/pending');
  return res.data;
};

export const getAllTaskSubmissions = async () => {
  const res = await api.get('/tasks/all'); // 🔥 endpoint
  return res.data;
};

export const getTasks = async () => {
  const res = await api.get('/tasks'); // 🔥 matches backend route
  return res.data;
};

export const completeTask = async (data) => {
  const res = await api.post('/tasks/complete', data);
  return res.data;
};