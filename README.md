<div align=center>

<img width="1640" height="350" src="https://github.com/user-attachments/assets/3d9e8d91-cc80-4600-8c6d-89718bb333c4" />

# fsh
### A file upload and storage service built with [Bun](https://bun.sh/) and [Elysia](https://elysiajs.com/).

</div>

## Features

- **File Upload**: Upload files with optional custom names
- **File Download**: Retrieve files by filename
- **File Deletion**: One-time delete URLs for managing uploaded files
- **Time-Limited Files**: Set expiration times for automatic file deletion
- **Docker Support**: Ready-to-deploy Docker and Docker Compose configurations
- **Multiple Format Support**: Supports images (JPEG, PNG, GIF, WebP), videos (MP4, MOV, WebM, MKV, AVI), JSON, and binary files

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0 or later)
- Docker & Docker Compose (optional)

### Local Development

1. Install dependencies:
   ```bash
   bun install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

The server will start on the port specified in your environment variables (default: 65535).

### Docker Deployment

Build and run using Docker:
```bash
docker build -t file-storage .
docker run -p 65535:65535 file-storage
```

Or use Docker Compose:
```bash
docker-compose up -d
```

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | Yes | Port number for the server to listen on | - |
| `FILESYSTEM_UPLOAD_PATH` | Yes | Directory path for storing uploaded files | `uploads` |

### Example `.env.local`

```env
PORT=65535
FILESYSTEM_UPLOAD_PATH=uploads
```

## API Reference

### Base Endpoint

`GET /`

Returns service status and information.

**Response:**
```json
{
  "message": ">-<> swimming",
  "uptime": 123.45,
  "files": 5
}
```

---

### Upload File

`POST /u`

Upload a new file to the storage service.

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | The file to upload |
| `name` | String | No | Custom filename for the uploaded file |
| `expires` | String | No | Seconds until file expires and auto-deletes |

**Example (cURL):**
```bash
curl -X POST http://localhost:65535/u \
  -F "file=@/path/to/image.jpg" \
  -F "name=my-image" \
  -F "expires=3600"
```

**Response:**
```json
{
  "message": "File uploaded successfully at my-image.jpg",
  "expiresIn": 3600,
  "delete_url": "/d/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

### Download File

`GET /f/:filename`

Download a file by its filename.

**Parameters:**
- `filename` (path): The name of the file to retrieve

**Example (cURL):**
```bash
curl -O http://localhost:65535/f/my-image.jpg
```

**Response:** The file content with appropriate Content-Type header.

**Status Codes:**
- `200`: File retrieved successfully
- `400`: Invalid filename
- `404`: File not found
- `500`: Server configuration error

---

### Delete File

`GET /d/:token`

Delete a file using its one-time delete token.

**Parameters:**
- `token` (path): The delete token received during upload

**Example (cURL):**
```bash
curl http://localhost:65535/d/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Response:**
```json
{
  "message": "File deleted successfully."
}
```

**Status Codes:**
- `200`: File deleted successfully
- `404`: Token not found or already used
- `500`: Server error or file deletion failed

## Project Structure

```
fsh/
├── index.ts              # Application entry point
├── routes/
│   ├── base.ts           # Base route (health check)
│   ├── upload.ts         # File upload endpoint
│   ├── file.ts           # File download endpoint
│   └── delete.ts         # File deletion endpoint
├── uploads/              # Default upload directory
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker Compose configuration
├── nginx.conf            # Nginx reverse proxy config
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── publish.sh            # Deployment script
```

## Supported File Types

### Images
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

### Videos
- MP4 (`.mp4`)
- QuickTime (`.mov`)
- WebM (`.webm`)
- Matroska (`.mkv`)
- AVI (`.avi`)

### Other
- JSON (`.json`)
- Binary (`.bin` - for unknown file types)

## Security Considerations

1. **Filename Validation**: Prevents directory traversal attacks by rejecting filenames containing `..` or starting with `/`
2. **Delete Tokens**: Each file gets a unique, cryptographically secure delete token
3. **Content-Type Headers**: Properly sets Content-Type for downloads or forces attachment for unknown types
4. **File Existence Checks**: Validates file existence before download/delete operations

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
