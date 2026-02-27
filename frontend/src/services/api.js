import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
});

export const getGridStatus = async () => {
    try {
        const response = await api.get('/grid_status');
        return response.data;
    } catch (error) {
        console.error('Error fetching grid status:', error);
        // Return mock data if API fails for demo purposes
        return {
            mode: 'Normal',
            load: '84%',
            capacity: '120MW',
            isIslandMode: false,
        };
    }
};

export default api;
