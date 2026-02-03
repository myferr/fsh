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

export const deleteRoute = new Elysia().get(
	"/d/:token",
	async ({ params, set }) => {
		const { token } = params;

		if (!process.env.FILESYSTEM_UPLOAD_PATH) {
			set.status = 500;
			return { error: "FILESYSTEM_UPLOAD_PATH is not set." };
		}

		const metadata = await getMetadata();
		const fileName = metadata[token];

		if (!fileName) {
			set.status = 404;
			return { error: "Delete token not found or already used." };
		}

		const filePath = path.resolve(
			process.cwd(),
			process.env.FILESYSTEM_UPLOAD_PATH,
			fileName,
		);

		try {
			if (existsSync(filePath)) {
				await unlink(filePath);
			}
		} catch (_e) {
			set.status = 500;
			return { error: "Failed to delete file." };
		}

		delete metadata[token];
		await saveMetadata(metadata);

		return { message: "File deleted successfully." };
	},
	{
		params: t.Object({
			token: t.String(),
		}),
	},
);
