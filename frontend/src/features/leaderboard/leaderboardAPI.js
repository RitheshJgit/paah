import api from '../../services/api';

export const getIndividualLeaderboard = async () => {
  const res = await api.get('/leaderboard/individual');
  return res.data;
};

export const getTeamLeaderboard = async () => {
  const res = await api.get('/leaderboard/teams');
  return res.data;
};

export const getMonthlyLeaderboard = async () => {
  const res = await api.get('/leaderboard/monthly');
  return res.data;
};

export const getSmartUsers = async () => {
  const res = await api.get('/leaderboard/smart-users');
  return res.data;
};

export const getSmartTeams = async () => {
  const res = await api.get('/leaderboard/smart-teams');
  return res.data;
};

export const getPlatformStats = async () => {
  const res = await api.get('/leaderboard/stats');
  return res.data;
};