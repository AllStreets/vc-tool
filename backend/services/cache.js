import NodeCache from 'node-cache';

const CACHE_TTL_HOURS = parseInt(process.env.CACHE_TTL_HOURS || '4', 10);
const cache = new NodeCache({ stdTTL: CACHE_TTL_HOURS * 3600, checkperiod: 600 });

export const getCached = (key) => cache.get(key);
export const setCached = (key, value) => cache.set(key, value);
export const deleteCached = (key) => cache.del(key);
export const flushCache = () => cache.flushAll();

export default cache;
