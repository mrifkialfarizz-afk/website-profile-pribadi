const DEPLOYED_BACKEND_URL = 'https://website-profile-pribadi-production.up.railway.app';

const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const BASE_URL = isLocalhost ? 'http://localhost:5000' : DEPLOYED_BACKEND_URL;

