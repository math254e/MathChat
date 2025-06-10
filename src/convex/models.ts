import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const get = query({
  handler: async (ctx) => {
    const models = await ctx.db.query("models").collect();
		return models;
	},
});

export const get_user_model = query({
  handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Unauthenticated");

		const models = await ctx.db.query("models").collect();
    const user_model = await ctx.db.query("user_model").filter((q) => q.eq(q.field("user"), userId)).first();

    //if no user model, return the first model
    if (!user_model) {
      return models[0];
    } else if (!models.find(m => m.model_id === user_model.model_id)) {
      return models[0];
    }

    return user_model;
  },
});

export const set_user_model = mutation({
  args: {
    model_id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Unauthenticated");
		
    // Check if user already has a selected model
    const existing = await ctx.db.query("user_model")
      .filter((q) => q.eq(q.field("user"), userId))
      .first();

    if (existing) {
      // Update existing selection
      await ctx.db.patch(existing._id, { model_id: args.model_id });
    } else {
      // Create new selection
      await ctx.db.insert("user_model", { model_id: args.model_id, user: userId });
    }
  },
});

//get thread model
export const get_thread_model = query({
  args: {
    thread_id: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Unauthenticated");

    const thread = await ctx.db.get(args.thread_id);
		const models = await ctx.db.query("models").collect();

		//check if thread exists and is owned by the user
    if (thread === null) throw new Error("Thread not found");
    if (thread.user !== userId) throw new Error("Unauthorized");

		//if no model_id, return the first model
		if (!thread.model_id) {
			return models[0].model_id;

		//if the model_id is not in the models collection, return the first model
		} else if (!models.find(m => m.model_id === thread.model_id)) {
			return models[0].model_id;
		}

    return thread.model_id;
  },
});
