import axios from 'axios';


const api = axios.create({
  baseURL: `http://${window.location.hostname}:3001/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
