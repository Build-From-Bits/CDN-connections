import axios from 'axios';

export const createCdnClient = ({ config, axiosOptions = {} }) => {
  const baseURL = `${config.baseUrl}${config.apiPrefix}`;
  
  const instance = axios.create({
    baseURL,
    ...axiosOptions,
  });

  return instance;
};
