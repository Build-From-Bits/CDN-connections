import axios from 'axios';

export const createCdnClient = ({ config, axiosOptions = {}, headerHook = null }) => {
  const baseURL = `${config.baseUrl}${config.apiPrefix}`;

  const instance = axios.create({
    baseURL,
    ...axiosOptions,
  });

  if (typeof headerHook === 'function') {
    instance.interceptors.request.use(async (request) => {
      const headers = await headerHook(request);
      return { ...request, headers: { ...(request.headers || {}), ...headers } };
    });
  }

  return instance;
};
