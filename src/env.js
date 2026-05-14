export const buildCdnConfig = ({
  baseUrl = '',
  env = {},
  overrides = {},
} = {}) => {
  // Support Vite or Create React App environment variables, or standard ones
  const defaultBaseUrl = env.VITE_CDN_BASE_URL || env.REACT_APP_CDN_BASE_URL || env.CDN_BASE_URL || baseUrl || '';
  
  return {
    baseUrl: defaultBaseUrl,
    apiPrefix: '/api',
    ...overrides,
  };
};
