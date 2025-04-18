export const basicCode = `import { FileUploader } from 'upload-crafters';

// Initialize the uploader
const uploader = new FileUploader({
  endpoint: 'https://api.example.com/upload',
  chunkSize: 1024 * 1024, // 1MB chunks
  maxFileSize: 1024 * 1024 * 1024, // 1GB
  allowedFileTypes: ['image/*', 'application/pdf']
});

// Handle file selection
document.getElementById('file-input').addEventListener('change', (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    uploader.addFiles(files);
  }
});

// Start upload
document.getElementById('upload-button').addEventListener('click', () => {
  uploader.startUpload();
});`;

// Advanced implementation code example
export const advancedCode = `import { FileUploader, UploadEvents } from 'upload-crafters';

// Advanced configuration
const uploader = new FileUploader({
  endpoint: 'https://api.example.com/upload',
  chunkSize: 2 * 1024 * 1024, // 2MB chunks
  maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
  allowedFileTypes: ['*'],
  simultaneousUploads: 3,
  retryAttempts: 5,
  retryDelay: 2000,
  verifyIntegrity: true,
  hashAlgorithm: 'sha256'
});

// Event listeners
uploader.on(UploadEvents.FILE_ADDED, (file) => {
  console.log(\`File added: \${file.name}\`);
});

uploader.on(UploadEvents.VERIFICATION_PROGRESS, (file, progress) => {
  updateVerificationUI(file.id, progress);
});

uploader.on(UploadEvents.UPLOAD_PROGRESS, (file, progress) => {
  updateProgressUI(file.id, progress);
});

uploader.on(UploadEvents.UPLOAD_COMPLETE, (file, response) => {
  showSuccessMessage(file.name);
});

uploader.on(UploadEvents.ERROR, (file, error) => {
  showErrorMessage(file.name, error.message);
});

// Handle network changes
window.addEventListener('online', () => {
  uploader.resumeUploads();
});

window.addEventListener('offline', () => {
  uploader.pauseUploads();
});`;
