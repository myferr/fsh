import { Elysia } from "elysia";

export const baseRoute = new Elysia().get("/", () => {
	return {
		message: ">-<> swimming",
		uptime: process.uptime(),
	};
});
