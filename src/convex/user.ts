import { query } from "./_generated/server";
import { v } from "convex/values";

//get user name
export const get = query({
	args: {},
	handler: async (ctx, args) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) {
			return null;
		}
		return user.name;
	}
});