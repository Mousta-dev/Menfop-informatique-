import axios from 'axios';


const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const missionsApi = {
  getMissions: () => api.get('/missions'),
  getMission: (id) => api.get(`/missions/${id}`),
  createMission: (missionData) => api.post('/missions', missionData),
  getMissionsSummary: () => api.get('/missions/summary'),
};

export { missionsApi };
export default api;
