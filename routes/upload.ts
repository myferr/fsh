import { unlink, writeFile as write } from "node:fs/promises";
import path from "node:path";

import { Elysia, t } from "elysia";

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

		let _deleteTimeout: ReturnType<typeof setTimeout> | undefined;
		let expiresInSeconds: number | undefined ;

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
