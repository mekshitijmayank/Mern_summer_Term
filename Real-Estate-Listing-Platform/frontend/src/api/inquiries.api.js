import api from './axios';

export const submitInquiry = async (inquiryData) => {
  const response = await api.post('/api/inquiries', inquiryData);
  return response.data;
};

export const getInquiries = async () => {
  const response = await api.get('/api/inquiries');
  return response.data;
};

export const updateInquiryStatus = async (inquiryId, status) => {
  const response = await api.patch(`/api/inquiries/${inquiryId}/status`, { status });
  return response.data;
};
