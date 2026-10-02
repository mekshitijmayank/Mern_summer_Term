import api from './axios';

export const getAdminUsers = async () => {
  const response = await api.get('/api/admin/users');
  return response.data;
};

export const setAccountRole = async (userId, role) => {
  const response = await api.patch(`/api/admin/users/${userId}/role`, { role });
  return response.data;
};