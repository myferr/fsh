import { unlink, writeFile as write, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { Elysia, t } from "elysia";

interface Metadata {
	[token: string]: string;
}

async function getMetadata(): Promise<Metadata> {
	if (!process.env.FILESYSTEM_UPLOAD_PATH) {
		throw new Error("FILESYSTEM_UPLOAD_PATH is not set.");
	}
	const metadataPath = path.resolve(
		process.cwd(),
		process.env.FILESYSTEM_UPLOAD_PATH,
		"metadata.json",
	);
	if (existsSync(metadataPath)) {
		const content = await readFile(metadataPath, "utf-8");
		return JSON.parse(content);
	}
	return {};
}

async function saveMetadata(metadata: Metadata): Promise<void> {
	if (!process.env.FILESYSTEM_UPLOAD_PATH) {
		throw new Error("FILESYSTEM_UPLOAD_PATH is not set.");
	}
	const metadataPath = path.resolve(
		process.cwd(),
		process.env.FILESYSTEM_UPLOAD_PATH,
		"metadata.json",
	);
	await write(metadataPath, JSON.stringify(metadata, null, 2));
}

export const uploadRoute = new Elysia().post(
	"/u",
	async ({ body, set }) => {
		const fileObj = body?.file;
		const customName = body?.name;
		const expires = body?.expires;

		if (!fileObj || !(fileObj instanceof File)) {
			set.status = 400;
			return { error: "A valid file must be provided in the body." };
		}

		const fileBuffer = Buffer.from(await fileObj.arrayBuffer());

		if (!process.env.FILESYSTEM_UPLOAD_PATH) {
			throw new Error("FILESYSTEM_UPLOAD_PATH is not set.");
		}

		let uploadFileName: string;
		let ext: string;

		if (typeof customName === "string" && customName.length > 0) {
			ext = path.extname(customName);
			const baseName = ext ? customName.slice(0, -ext.length) : customName;
			uploadFileName = `${baseName}${ext || path.extname(fileObj.name) || ".bin"}`;
		} else {
			const fileID = crypto.randomUUID();
			ext = path.extname(fileObj.name);
			if (!ext) ext = ".bin";
			uploadFileName = `${fileID}${ext}`;
		}

		const uploadPath = path.resolve(
			process.cwd(),
			process.env.FILESYSTEM_UPLOAD_PATH,
			uploadFileName,
		);

		await write(uploadPath, fileBuffer);

		const deleteToken = crypto.randomUUID();
		const metadata = await getMetadata();
		metadata[deleteToken] = uploadFileName;
		await saveMetadata(metadata);

		const deleteUrl = `/d/${deleteToken}`;

		let _deleteTimeout: ReturnType<typeof setTimeout> | undefined;
		let expiresInSeconds: number | undefined;

		if (typeof expires !== "undefined") {
			expiresInSeconds = parseInt(String(expires), 10);
			if (!Number.isNaN(expiresInSeconds) && expiresInSeconds > 0) {
				_deleteTimeout = setTimeout(async () => {
					try {
						await unlink(uploadPath);
					} catch (_e) {
						return {
							error: _e,
						};
					}
				}, expiresInSeconds * 1000);
			} else {
				expiresInSeconds = undefined;
			}
		}

		return {
			message: `File uploaded successfully at ${uploadFileName}`,
			expiresIn: expiresInSeconds,
			delete_url: deleteUrl,
		};
	},
	{
		body: t.Object({
			file: t.File(),
			name: t.Optional(t.String()),
			expires: t.Optional(
				t.String({
					description:
						"Seconds (as string) until the file expires and is deleted",
				}),
			),
		}),
	},
);
