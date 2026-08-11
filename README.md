# @build-from-bits/cdn-connections

Client library for interacting with the Chandrila CDN Server.

Features:
- `saveFile` with a **parameterized upload field name** (default `file_to_upload`)
- `getFileUrl` / `getVideoStreamUrl` with **URL-encoded keys**
- `getVideoUrl` for pre-signed video URLs
- optional **auth/API-key header hook** for upload/read requests

## Installation

```bash
npm install @build-from-bits/cdn-connections
```

## Usage

```javascript
import { createCdnSystem } from '@build-from-bits/cdn-connections';

// Initialize the CDN system
const cdnSystem = createCdnSystem({
  baseUrl: 'http://localhost:8000', // URL of your Chandrila CDN server
});

// Access the file service
const { fileService } = cdnSystem;

// 1. Upload a file
const uploadResponse = await fileService.saveFile(myFileObject);
console.log('Uploaded File Key:', uploadResponse.file_id); // Returns the file ID/Key

// 2. Get an image URL (with optional resizing/quality/format)
const imageUrl = fileService.getFileUrl('my-image-key', { w: 800, q: 80, f: 'webp' });
// Result: http://localhost:8000/api/file/get?key=my-image-key&w=800&f=webp&q=80

// 3. Get a streaming video URL
const videoUrl = fileService.getVideoStreamUrl('my-video-key');

// 4. Get a presigned URL for a video
const presigned = await fileService.getVideoUrl('my-video-key');
```

## Custom Upload Field Name

Apps that send a different form field can override it via `configOverrides`:

```javascript
const cdnSystem = createCdnSystem({
  baseUrl: 'http://localhost:8000',
  configOverrides: {
    uploadFieldName: 'media_file',
  },
});
```

## Auth / API-key Headers

Pass a `headerHook` to inject `api-key`/`api-secret` (or any headers) on every CDN request. It may be async and receives the axios request config:

```javascript
const cdnSystem = createCdnSystem({
  baseUrl: 'http://localhost:8000',
  headerHook: async (request) => ({
    'api-key': import.meta.env.VITE_API_KEY,
    'api-secret': import.meta.env.VITE_API_SECRET_KEY,
  }),
});
```

## Environment Variables

`baseUrl` is resolved (in priority order) from `VITE_CDN_BASE_URL`, `REACT_APP_CDN_BASE_URL`, `CDN_BASE_URL`, or the `baseUrl` argument.

## Publish

```bash
npm run pack:check
npm run publish:npm
npm run publish:github
```

## License

Licensed under the Apache License 2.0.

Copyright 2026 Build From Bits Pvt Ltd.
