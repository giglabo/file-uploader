# GigLabo File Uploader

<div align="center">
  <h3>S3 Multipart Resumable Uploads of Large Files</h3>
  <p>Fast, open-source, secure and reliable file uploads for any size projects on Next.js</p>

  <p>
    <a href="https://file-uploader.giglabo.com/nextjs">View Demo</a>
    ·
    <a href="https://giglabo.com/el/products/file-uploader/file-uploader-docs-hmobhkpylx982fp9rem4ag90" target="_blank">Documentation</a>
    ·
    <a href="https://github.com/giglabo/file-uploader/issues">Report Bug</a>
  </p>
</div>

## Features

- 🚀 **Resumable Uploads** - Never lose progress on large file uploads
- 🛡️ **Integrity Verification** - MD5, SHA1, SHA256, CRC32, CRC32C support
- 📦 **S3 Compatible** - Works with any S3-compatible storage
- 🔒 **Secure by Default** - Built with security best practices
- 📹 **Big Files Upload** - Handle gigabyte files with ease 

## Quick Start

```bash
# Install via npm
npm install @giglabo/file-uploader

# Or using yarn
yarn add @giglabo/file-uploader
```

### Basic Usage

```typescript
import { FileUploader } from '@giglabo/file-uploader';

const uploader = new FileUploader({
  endpoint: 'https://your-api.com/upload',
  chunkSize: 5 * 1024 * 1024, // 5MB chunks
  verifyIntegrity: true
});

uploader.on('progress', (progress) => {
  console.log(`Upload progress: ${progress}%`);
});

uploader.upload(files);
```

## Why GigLabo File Uploader?

- **Reliability First** - Built for production use with enterprise-grade reliability
- **Developer Experience** - Build by developers for developers: Simple API, comprehensive documentation
- **Performance** - Optimized for both small files and large uploads
- **Customizable** - Extensive configuration options for your needs

## Documentation

Visit our [documentation](https://giglabo.com/el/products/file-uploader/file-uploader-docs-hmobhkpylx982fp9rem4ag90) for:

- Complete API reference
- Integration guides
- Best practices
- Examples and tutorials
- Troubleshooting

## Commercial License

GigLabo File Uploader is available under two licenses:

- **Open Source** - GPL-V3 for personal and open-source projects
- **Commercial** - One-time fee of €500 for business use

The commercial license includes:
- First year of updates and priority support
- 30-day money-back guarantee
- Optional annual renewal at €250

## Support

- 📚 [Documentation]([https://giglabo.dev/documentation](https://giglabo.com/el/products/file-uploader/file-uploader-docs-hmobhkpylx982fp9rem4ag90)
- 🐛 [Issue Tracker](https://github.com/giglabo/file-uploader/issues)
- 📧 [Email Support](mailto:main@giglabo.dev)

## License

- Open Source: LICENSE-GPL.txt
- Commercial: LICENSE-COMMERCIAL.txt

---

<div align="center">
  <p>Built with ❤️ by the GigLabo team</p>
  <p>© 2025 GigLabo. All rights reserved.</p>
</div>
