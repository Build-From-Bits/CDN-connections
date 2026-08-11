import { describe, it, expect, vi } from 'vitest';
import { buildCdnConfig } from '../src/env.js';
import { createCdnClient } from '../src/cdnClient.js';
import { createFileService } from '../src/fileService.js';
import { createCdnSystem } from '../src/index.js';

describe('buildCdnConfig', () => {
  it('resolves base URL from VITE_CDN_BASE_URL', () => {
    const config = buildCdnConfig({ env: { VITE_CDN_BASE_URL: 'https://cdn.example.com' } });
    expect(config.baseUrl).toBe('https://cdn.example.com');
  });

  it('resolves base URL from REACT_APP_CDN_BASE_URL', () => {
    const config = buildCdnConfig({ env: { REACT_APP_CDN_BASE_URL: 'https://cdn-cra.example.com' } });
    expect(config.baseUrl).toBe('https://cdn-cra.example.com');
  });

  it('defaults uploadFieldName to file_to_upload and honors overrides', () => {
    const defaultConfig = buildCdnConfig({});
    expect(defaultConfig.uploadFieldName).toBe('file_to_upload');

    const overridden = buildCdnConfig({ overrides: { uploadFieldName: 'media_file' } });
    expect(overridden.uploadFieldName).toBe('media_file');
  });

  it('defaults apiPrefix to /api', () => {
    const config = buildCdnConfig({ baseUrl: 'https://cdn.example.com' });
    expect(config.apiPrefix).toBe('/api');
  });
});

describe('createCdnClient', () => {
  it('builds baseURL from baseUrl + apiPrefix', () => {
    const config = buildCdnConfig({ baseUrl: 'https://cdn.example.com' });
    const client = createCdnClient({ config });
    expect(client.defaults.baseURL).toBe('https://cdn.example.com/api');
  });

  it('injects headers from a headerHook', async () => {
    const config = buildCdnConfig({ baseUrl: 'https://cdn.example.com' });
    const headerHook = vi.fn(async (request) => {
      expect(request).toBeDefined();
      return { 'api-key': 'my-key', 'api-secret': 'my-secret' };
    });
    const client = createCdnClient({ config, headerHook });

    const adapter = vi.fn().mockResolvedValue({ data: 'ok' });
    client.defaults.adapter = adapter;

    await client.get('/file/get?key=x');
    const usedConfig = adapter.mock.calls[0][0];
    expect(usedConfig.headers['api-key']).toBe('my-key');
    expect(usedConfig.headers['api-secret']).toBe('my-secret');
    expect(headerHook).toHaveBeenCalledTimes(1);
  });
});

describe('createFileService', () => {
  const config = buildCdnConfig({ baseUrl: 'https://cdn.example.com' });

  const makeService = (clientOptions = {}) => {
    const client = createCdnClient({ config, ...clientOptions });
    return createFileService({ cdnClient: client });
  };

  it('getFileUrl builds a key URL with transformations', () => {
    const service = makeService();
    const url = service.getFileUrl('my-key', { w: 800, q: 80, f: 'webp' });
    expect(url).toBe('https://cdn.example.com/api/file/get?key=my-key&w=800&f=webp&q=80');
  });

  it('getFileUrl encodes the key', () => {
    const service = makeService();
    const url = service.getFileUrl('my folder/file with spaces&symbols');
    expect(url).toContain('key=my%20folder%2Ffile%20with%20spaces%26symbols');
  });

  it('getFileUrl omits empty options', () => {
    const service = makeService();
    const url = service.getFileUrl('key-only');
    expect(url).toBe('https://cdn.example.com/api/file/get?key=key-only');
  });

  it('getVideoStreamUrl matches getFileUrl encoding', () => {
    const service = makeService();
    const url = service.getVideoStreamUrl('my video.mp4');
    expect(url).toBe('https://cdn.example.com/api/file/get_video?key=my%20video.mp4');
  });

  it('getVideoUrl requests a pre-signed URL via cdnClient', async () => {
    const client = createCdnClient({ config });
    const getSpy = vi.spyOn(client, 'get').mockResolvedValue({
      data: { url: 'https://signed.example.com/video', expires: 3600 },
    });
    const service = createFileService({ cdnClient: client });
    const result = await service.getVideoUrl('video-key');
    expect(result).toEqual({ url: 'https://signed.example.com/video', expires: 3600 });
    expect(getSpy).toHaveBeenCalledWith('/file/get_video_url', { params: { key: 'video-key' } });
  });

  it('saveFile posts multipart data with default field name', async () => {
    const client = createCdnClient({ config });
    const postSpy = vi.spyOn(client, 'post').mockResolvedValue({ data: { file_id: 'abc' } });
    const service = createFileService({ cdnClient: client });

    const file = new File(['data'], 'photo.jpg');
    const result = await service.saveFile(file, 'bucket-a');

    expect(result).toEqual({ file_id: 'abc' });
    const [url, formData, options] = postSpy.mock.calls[0];
    expect(url).toBe('/file/save');
    expect(formData.get('file_to_upload')).toBe(file);
    expect(formData.get('bucket_name')).toBe('bucket-a');
    expect(options.headers['Content-Type']).toBe('multipart/form-data');
  });

  it('saveFile uses a custom upload field name', async () => {
    const client = createCdnClient({ config });
    const postSpy = vi.spyOn(client, 'post').mockResolvedValue({ data: {} });
    const service = createFileService({ cdnClient: client, uploadFieldName: 'media_file' });

    const file = new File(['data'], 'photo.jpg');
    await service.saveFile(file);
    const formData = postSpy.mock.calls[0][1];
    expect(formData.get('media_file')).toBe(file);
    expect(formData.get('file_to_upload')).toBeNull();
  });
});

describe('createCdnSystem', () => {
  it('wires config, client, and fileService together', () => {
    const system = createCdnSystem({ baseUrl: 'https://cdn.example.com' });
    expect(system.config).toBeDefined();
    expect(system.cdnClient).toBeDefined();
    expect(system.fileService).toBeDefined();
    expect(system.cdnClient.defaults.baseURL).toBe('https://cdn.example.com/api');
  });
});
