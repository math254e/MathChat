import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
 
const schema = defineSchema({
  ...authTables,
  models: defineTable({
    name: v.string(),
    model_id: v.string(),
    description: v.string(),
    provider: v.string(),
  }).index("model_id", ["model_id"]),
  user_model: defineTable({
    model_id: v.string(),
    user: v.id("users"),
  }),
  threads: defineTable({
    user: v.id("users"),
    name: v.optional(v.string()),
    last_message_at: v.number(),
    split_from: v.optional(v.id("threads")),
    model_id: v.optional(v.string()),
  }),
  messages: defineTable({
    thread_id: v.id("threads"),
    role: v.string(),
    content: v.string(),
  }),
});

 
export default schema;