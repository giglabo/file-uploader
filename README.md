# GigLabo File Uploader

<p>
  <a href="https://www.npmjs.com/package/@giglabo/hash-worker">
    <img src="https://img.shields.io/npm/v/@giglabo/hash-worker?label=npm%20hash-worker&color=CB3837" alt="npm hash-worker version" />
  </a>
  <a href="https://www.npmjs.com/package/@giglabo/react-upload">
    <img src="https://img.shields.io/npm/v/@giglabo/react-upload?label=npm%20react-upload&color=61DAFB" alt="npm react-upload version" />
  </a>
  <a href="https://www.npmjs.com/package/@giglabo/s3-upload" >
    <img src="https://img.shields.io/npm/v/@giglabo/s3-upload?label=npm%20s3-upload&color=569A31" alt="npm s3-upload version" />
  </a>
  <a href="https://www.npmjs.com/package/@giglabo/upload-shared">
    <img src="https://img.shields.io/npm/v/@giglabo/upload-shared?label=npm%20upload-shared&color=007ACC" alt="npm upload-shared version" />
  </a>
</p>

<div>
  <h3>S3 Multipart Resumable Uploads of Large Files</h3>
  <p>Fast, open-source, secure and reliable file uploads for any size projects</p>

  <p>
    <a href="https://file-uploader.giglabo.com/nextjs">View Demo for Next.js</a>
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
- **Developer Experience** - Build by developers for developers: simple API, comprehensive documentation
- **Performance** - Optimized for both small files and large uploads
- **Customizable** - Extensive configuration options for your needs

## Documentation

Visit our [documentation](https://giglabo.com/el/products/file-uploader/file-uploader-docs-hmobhkpylx982fp9rem4ag90) for:

- Integration guides
- Examples and tutorials
- Troubleshooting

## License

GigLabo File Uploader is available under two licenses:

- **Open Source** - GPL-V3 license for personal and open-source projects ([GPL_LICENSE](https://www.gnu.org/licenses/gpl-3.0.txt))
- **Commercial** - One-time fee for business use ([COMMERCIAL_LICENSE](COMMERCIAL_LICENSE.txt)). You can buy it on [giglabo.com](https://giglabo.com/products/file-uploader-zgq9195flavybelvn9upuqk8)

The commercial license includes:
- Updates and priority support
- 30-day money-back guarantee

## Support

- 📚 [Documentation](https://giglabo.com/el/products/file-uploader/file-uploader-docs-hmobhkpylx982fp9rem4ag90)
- 🐛 [Issue Tracker](https://github.com/giglabo/file-uploader/issues)
- 📧 [Email Support](mailto:main@giglabo.dev)

---

<div>
  <p>Built with ❤️ by the GigLabo team</p>
  <p>© 2025 GigLabo. All rights reserved.</p>
</div>
