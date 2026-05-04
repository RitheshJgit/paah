import api from '../../services/api';

// CREATE TEAM
export const createTeam = async (data) => {
  const res = await api.post('/teams/create', data);
  return res.data;
};

// JOIN TEAM
export const joinTeam = async (data) => {
  const res = await api.post('/teams/join', data);
  return res.data;
};

// GET TEAMS
export const getTeams = async () => {
  const res = await api.get('/teams');
  return res.data;
};
// UPDATE TEAM NAME
export const updateTeamName = async (id, data) => {
  const res = await api.put(`/teams/${id}`, data);
  return res.data;
};

export const getMyTeam = async () => {
  const res = await api.get('/teams/my');
  return res.data;
};

export const changeLeader = async (teamId, data) => {
  const res = await api.put(`/teams/${teamId}/leader`, data);
  return res.data;
};

export const leaveTeam = async () => {
  const res = await api.post('/teams/leave');
  return res.data;
};