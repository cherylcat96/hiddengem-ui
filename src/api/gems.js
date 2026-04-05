import client from './client';

export const getGems = (params) => client.get('/gems', { params });
export const getGem  = (id)     => client.get(`/gems/${id}`);
export const createGem = (data) => client.post('/gems', data);