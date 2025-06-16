import { pgTable, serial, text, varchar, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm'; 

export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 256 }).notNull(),
  title: text('title').notNull(),
  modelId: text('model_id').default('google/gemini-1.5-flash-latest'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  sourceChatId: integer('source_chat_id').references(() => chats.id),
  branchedFromMessageId: integer('branched_from_message_id'),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  // The 'references' here is for the database foreign key constraint.
  chatId: serial('chat_id').references(() => chats.id, { onDelete: 'cascade' }),
  sender: text('sender', { enum: ['user', 'ai'] }).notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'), 
  usedWebSearch: boolean('used_web_search').default(false).notNull(),
  editCount: integer('edit_count').notNull().default(0),
  modelId: text('model_id'),
  searchResults: text('search_results'), // Store search results as JSON string
  createdAt: timestamp('created_at').notNull().defaultNow(),
});


export const chatsRelations = relations(chats, ({ many, one }) => ({
    // A chat can have many messages
    messages: many(messages),
    // A chat can have a source chat (for branching)
    sourceChat: one(chats, {
        fields: [chats.sourceChatId],
        references: [chats.id],
    }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    // A message belongs to one chat
    chat: one(chats, {
        fields: [messages.chatId],
        references: [chats.id],
    }),
}));