export const MOCK_HOMES = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    status: Math.random() > 0.8 ? 'alert' : Math.random() > 0.3 ? 'active' : 'idle',
    load: (Math.random() * 5).toFixed(2),
}));

export const MOCK_ALERTS = [
    { id: 1, type: 'Security', message: 'Unauthorized access attempt detected at Substation A', timestamp: new Date().toISOString() },
    { id: 2, type: 'Frequency', message: 'Frequency deviation detected: 49.8Hz', timestamp: new Date().toISOString() },
];

export const MOCK_GRID_STATUS = {
    mode: 'Normal',
    load: '84%',
    capacity: '120MW',
    isIslandMode: false,
};
