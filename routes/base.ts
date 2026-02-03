import { Elysia } from "elysia";

export const baseRoute = new Elysia().get("/", () => {
    const fs = require("fs");
    const path = require("path");
    const uploadDir = path.resolve(process.cwd(), process.env.FILESYSTEM_UPLOAD_PATH);
    let fileAmount = 0;
    try {
        fileAmount = fs.readdirSync(uploadDir).length;
    } catch {
        fileAmount = 0;
    }

	return {
		message: ">-<> swimming",
		uptime: process.uptime(),
        files: fileAmount
	};
});
