
import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

import { coreUser } from "./core-user";

export const coreSession = pgTable(
  "CORE_Session",
  {
    Id: uuid("Id").defaultRandom().primaryKey(),

    UserId: uuid("UserId")
      .notNull()
      .references(() => coreUser.Id, {
        onDelete: "cascade",
      }),

    TokenHash: text("TokenHash").notNull(),

    ExpiresAt: timestamp("ExpiresAt", {
      withTimezone: true,
    }).notNull(),

    CreatedAt: timestamp("CreatedAt", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    RevokedAt: timestamp("RevokedAt", {
      withTimezone: true,
    }),
  },
  (table) => [
    uniqueIndex("UX_CORE_Session_TokenHash").on(
      table.TokenHash
    ),
    index("IX_CORE_Session_UserId").on(table.UserId),
    index("IX_CORE_Session_ExpiresAt").on(table.ExpiresAt),
  ]
);

export type CoreSession = typeof coreSession.$inferSelect;
export type NewCoreSession = typeof coreSession.$inferInsert;
