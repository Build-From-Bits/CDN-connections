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
  headerHook = null,
} = {}) => {
  const config = buildCdnConfig({
    baseUrl,
    env,
    overrides: configOverrides,
  });

  const cdnClient = createCdnClient({ config, axiosOptions, headerHook });
  const fileService = createFileService({ cdnClient, uploadFieldName: config.uploadFieldName });

  return {
    config,
    cdnClient,
    fileService,
  };
};

export { buildCdnConfig } from './env.js';
