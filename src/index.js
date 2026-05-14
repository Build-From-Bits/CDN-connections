import { buildCdnConfig } from './env.js';
import { createCdnClient } from './cdnClient.js';
import { createFileService } from './fileService.js';

/**
 * Initializes and creates the CDN System wrapper.
 * @param {object} options
 * @returns {object} The initialized CDN system containing config, client, and fileService.
 */
export const createCdnSystem = ({
  baseUrl = '',
  env = {},
  configOverrides = {},
  axiosOptions = {},
} = {}) => {
  const config = buildCdnConfig({
    baseUrl,
    env,
    overrides: configOverrides,
  });

  const cdnClient = createCdnClient({ config, axiosOptions });
  const fileService = createFileService({ cdnClient });

  return {
    config,
    cdnClient,
    fileService,
  };
};

export { buildCdnConfig } from './env.js';
