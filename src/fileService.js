export const createFileService = ({ cdnClient }) => {
  return {
    /**
     * Upload a file to the Chandrila CDN server.
     * @param {File|Blob} fileToUpload - The file to upload.
     * @param {string} [bucketName=null] - Optional specific bucket name.
     * @param {function} [onUploadProgress=null] - Axios upload progress callback.
     * @returns {Promise<any>}
     */
    saveFile: async (fileToUpload, bucketName = null, onUploadProgress = null) => {
      const formData = new FormData();
      formData.append('file_to_upload', fileToUpload);
      if (bucketName) {
        formData.append('bucket_name', bucketName);
      }
      
      const response = await cdnClient.post('/file/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });
      return response.data;
    },

    /**
     * Build the direct URL to GET an image or media file.
     * Returns a fully qualified URL for the <img src="..." /> or similar tags.
     * @param {string} key - Unique identifier of the file.
     * @param {object} [options={}] - Transformation options (h, w, f, q).
     * @returns {string} Fully constructed URL.
     */
    getFileUrl: (key, options = {}) => {
      const { h, w, f, q } = options;
      const params = new URLSearchParams();
      params.append('key', key);
      
      if (h) params.append('h', h);
      if (w) params.append('w', w);
      if (f) params.append('f', f);
      if (q) params.append('q', q);
      
      return `${cdnClient.defaults.baseURL}/file/get?${params.toString()}`;
    },

    /**
     * Build the direct URL for streaming a video.
     * @param {string} key - Unique identifier of the video file.
     * @returns {string} Fully constructed video stream URL.
     */
    getVideoStreamUrl: (key) => {
      return `${cdnClient.defaults.baseURL}/file/get_video?key=${encodeURIComponent(key)}`;
    },

    /**
     * Get a pre-signed URL for accessing a video file securely.
     * @param {string} key - Unique identifier of the video file.
     * @returns {Promise<object>} Returns dict with pre-signed URL and expiration time.
     */
    getVideoUrl: async (key) => {
      const response = await cdnClient.get('/file/get_video_url', {
        params: { key },
      });
      return response.data;
    }
  };
};
