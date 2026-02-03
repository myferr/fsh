import { baseRoute } from "./routes/base";
import { fileRoute } from "./routes/file";
import { uploadRoute } from "./routes/upload";
import { deleteRoute } from "./routes/delete";

import { Elysia } from "elysia";

console.clear();

if (!process.env.PORT) {
	throw new Error("PORT is not set. Please set the PORT environment variable.");
}

const app = new Elysia()
	.use(baseRoute)
	.use(uploadRoute)
	.use(fileRoute)
	.use(deleteRoute);
app.listen(parseInt(process.env.PORT, 10));

const frames = [
	" >-<>        ",
	"   >-<>      ",
	"     >-<>    ",
	"       >-<>  ",
	"         >-<>",
	"       <>-<  ",
	"     <>-<    ",
	"   <>-<      ",
	" <>-<        ",
	"<>-<         ",
	"             ",
];

const swimLength = 24;
const info = `swimming @ \x1b[32m${app.server?.hostname}:${app.server?.port}\x1b[0m && uploading to \x1b[32m${process.env.FILESYSTEM_UPLOAD_PATH}\x1b[0m`;

let i = 0;
setInterval(() => {
	const clear = `\r${" ".repeat(swimLength + info.length)}\r`;
	process.stdout.write(clear);
	const frame = `\x1b[92m${frames[i % frames.length]}\x1b[0m ${info}`;
	process.stdout.write(frame);
	i++;
}, 300);
