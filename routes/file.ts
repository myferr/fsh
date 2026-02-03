import { createReadStream, existsSync } from "node:fs";
import path from "node:path";

import { Elysia } from "elysia";

export const fileRoute = new Elysia().get(
	"/f/:filename",
	async ({ params, set }) => {
		if (!process.env.FILESYSTEM_UPLOAD_PATH) {
			set.status = 500;
			return "Upload directory is not set.";
		}

		const filename = params.filename;

		if (
			typeof filename !== "string" ||
			filename.includes("..") ||
			filename.startsWith("/")
		) {
			set.status = 400;
			return "Invalid filename.";
		}

		const filePath = path.resolve(
			process.cwd(),
			process.env.FILESYSTEM_UPLOAD_PATH,
			filename
		);

		if (!existsSync(filePath)) {
			set.status = 404;
			return "File not found.";
		}

		const ext = path.extname(filename).toLowerCase();
		let contentType: string | undefined = undefined;

		switch (ext) {
			case ".jpg":
			case ".jpeg":
				contentType = "image/jpeg";
				break;
			case ".png":
				contentType = "image/png";
				break;
			case ".gif":
				contentType = "image/gif";
				break;
			case ".webp":
				contentType = "image/webp";
				break;
			case ".mp4":
				contentType = "video/mp4";
				break;
			case ".mov":
				contentType = "video/quicktime";
				break;
			case ".webm":
				contentType = "video/webm";
				break;
			case ".mkv":
				contentType = "video/x-matroska";
				break;
			case ".avi":
				contentType = "video/x-msvideo";
				break;
			case ".json":
				contentType = "application/json";
				break;
			case ".bin":
				contentType = "application/octet-stream";
				break;
			default:
				contentType = undefined;
		}

		if (contentType) {
			set.headers = {
				"Content-Type": contentType,
			};
		} else {
			set.headers = {
				"Content-Disposition": `attachment; filename="${filename}"`
			};
		}

		return createReadStream(filePath);
	},
);