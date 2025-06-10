import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

//get user data
export const get = query({
	args: {},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
      throw new Error("Unauthenticated call");
    }
    return await ctx.db.get(userId);
	}
});