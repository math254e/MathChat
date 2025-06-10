import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    model_id: v.string(),
    splitFrom: v.optional(v.id("threads")),
  },
  handler: async (ctx, args) => {
		console.log("Creating thread");
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Unauthenticated");
    
    const threadId = await ctx.db.insert("threads", {
      user: userId,
      name: undefined,
      last_message_at: Date.now(),
      split_from: args.splitFrom ?? undefined,
      model_id: args.model_id
    });
    return threadId;
  },
});

//get all threads
export const get_all = query({
  handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Unauthenticated");

    //get only threads that belong to the user
		const threads = await ctx.db.query("threads").filter(q => q.eq(q.field("user"), userId)).collect();

    return threads.map(thread => ({
      id: thread._id,
      name: thread.name,
      created_at: thread._creationTime,
      last_message_at: thread.last_message_at,
      split_from: thread.split_from,
      model_id: thread.model_id
    }));
  },
});

//get thread messages
export const get = query({
  args: {
    thread_id: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Unauthenticated");

    //check if the thread belongs to the user
    const thread_data = await ctx.db.get(args.thread_id);
    if (!thread_data) throw new Error("Thread not found");
    if (thread_data.user !== userId) throw new Error("Unauthorized");
    

    const messages = await ctx.db.query("messages").filter((q) => q.eq(q.field("thread_id"), args.thread_id)).collect();
    const return_item ={
      data: {
        id: thread_data._id,
        name: thread_data.name,
        created_at: thread_data._creationTime,
        last_message_at: thread_data.last_message_at,
        split_from: thread_data.split_from,
        model_id: thread_data.model_id
      },
      messages: messages.map(msg => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        timestamp: msg._creationTime
      }))
    };
    return return_item;
  },
});

//delete thread
export const delete_thread = mutation({
  args: {
    thread_id: v.id("threads"),
  },
  handler: async (ctx, args) => {
    //auth
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Unauthenticated");

    //check if the thread belongs to the user
    const thread = await ctx.db.get(args.thread_id);
    if (thread === null) throw new Error("Thread not found");
    if (thread.user !== userId) throw new Error("Unauthorized");

    //delete all messages in the thread
    const messages = await ctx.db.query("messages").filter((q) => q.eq(q.field("thread_id"), args.thread_id)).collect();

    //delete each message
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    //delete the thread
    await ctx.db.delete(args.thread_id);
  },
});

//update thread model
export const update_model = mutation({
  args: {
    thread_id: v.id("threads"),
    model_id: v.id("models"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Unauthenticated");

    //check if the thread belongs to the user
    const thread = await ctx.db.get(args.thread_id);
    if (thread === null) throw new Error("Thread not found");
    if (thread.user !== userId) throw new Error("Unauthorized");

    //update the model
    await ctx.db.patch(args.thread_id, {
      model_id: args.model_id
    });
  },
});

