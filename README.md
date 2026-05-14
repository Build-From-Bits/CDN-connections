# @truflect/cdn-connections

Client library for interacting with the Chandrila CDN Server.

## Installation

```bash
npm install @truflect/cdn-connections
```

## Usage

```javascript
import { createCdnSystem } from '@truflect/cdn-connections';

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
// Result: http://localhost:8000/api/file/get?key=my-image-key&w=800&q=80&f=webp

// 3. Get a streaming video URL
const videoUrl = fileService.getVideoStreamUrl('my-video-key');

// 4. Get a presigned URL for a video
const presigned = await fileService.getVideoUrl('my-video-key');
```