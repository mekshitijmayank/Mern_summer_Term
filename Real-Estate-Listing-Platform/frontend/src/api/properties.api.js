import api from './axios';

export const getProperties = async (params = {}) => {
  const response = await api.get('/api/properties', { params });
  return response.data;
};

export const getProperty = async (id) => {
  const response = await api.get(`/api/properties/${id}`);
  return response.data;
};

export const createProperty = async (propertyData) => {
  const response = await api.post('/api/properties', propertyData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateProperty = async (id, propertyData) => {
  const response = await api.put(`/api/properties/${id}`, propertyData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteProperty = async (id) => {
  const response = await api.delete(`/api/properties/${id}`);
  return response.data;
};
