import { createCdnSystem } from '../src/index.js';
import fs from 'fs';
import path from 'path';

// Initialize the CDN system
const cdnSystem = createCdnSystem({
  baseUrl: 'http://localhost:8000', // Assuming Chandrila runs on port 8000 locally
});

const { fileService } = cdnSystem;

async function runTests() {
  console.log('--- Testing CDN Connections ---\n');

  // 1. Test building URLs (synchronous)
  const dummyKey = 'test-file-key-123';
  
  const imageUrl = fileService.getFileUrl(dummyKey, { w: 500, q: 90, f: 'webp' });
  console.log('Image URL:\n', imageUrl, '\n');

  const videoStreamUrl = fileService.getVideoStreamUrl(dummyKey);
  console.log('Video Stream URL:\n', videoStreamUrl, '\n');

  // 2. Test File Upload (requires backend)
  try {
    console.log('Testing File Upload to CDN...');
    
    // Create a dummy file to upload
    const dummyFilePath = path.join(process.cwd(), 'dummy.txt');
    fs.writeFileSync(dummyFilePath, 'Hello Chandrila CDN!');
    
    // We need to pass a File/Blob like object. In Node.js, we can use a Blob or File object.
    // However, Axios FormData in Node.js works with ReadStreams or Buffers.
    const fileStream = fs.createReadStream(dummyFilePath);
    
    const uploadResult = await fileService.saveFile(fileStream);
    console.log('Upload Result:', uploadResult);

    // Clean up
    fs.unlinkSync(dummyFilePath);

    if (uploadResult && uploadResult.key) {
        console.log('\nTesting Video Presigned URL with uploaded key...');
        try {
            const presigned = await fileService.getVideoUrl(uploadResult.key);
            console.log('Presigned URL Result:', presigned);
        } catch (e) {
            console.log('Video URL test failed (file might not be a video):', e.response?.data || e.message);
        }
    }

  } catch (error) {
    console.error('File Upload/API Test Failed!');
    console.error('Error:', error.response?.data || error.message);
    console.log('\nNote: Make sure the Chandrila CDN server is running on http://localhost:8000');
  }
}

runTests();
