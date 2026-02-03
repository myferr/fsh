import { Elysia } from "elysia";

if (!process.env.PORT) {
  throw new Error("PORT is not set. Please set the PORT environment variable.");
}

const app = new Elysia().get("/", () => ">-<> swimming").listen(parseInt(process.env.PORT, 10));

const hostname = app.server?.hostname ?? "localhost";
const port = process.env.PORT;

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
const info = `swimming @ \x1b[32m${hostname}:${port}\x1b[0m`;

let i = 0;
setInterval(() => {
  const clear = `\r${" ".repeat(swimLength + info.length)}\r`;
  process.stdout.write(clear);
  const frame = `\x1b[92m${frames[i % frames.length]}\x1b[0m ${info}`;
  process.stdout.write(frame);
  i++;
}, 300);

