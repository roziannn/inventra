
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const coreUser = pgTable(
  "CORE_User",
  {
    Id: uuid("Id").defaultRandom().primaryKey(),

    Username: varchar("Username", { length: 50 }).notNull(),

    Email: varchar("Email", { length: 150 }).notNull(),

    PasswordHash: text("PasswordHash").notNull(),

    FullName: varchar("FullName", { length: 150 }).notNull(),

    IsActive: boolean("IsActive").notNull().default(true),

    LastLoginAt: timestamp("LastLoginAt", {
      withTimezone: true,
    }),

    CreatedAt: timestamp("CreatedAt", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    CreatedBy: uuid("CreatedBy"),

    UpdatedAt: timestamp("UpdatedAt", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    UpdatedBy: uuid("UpdatedBy"),
  },
  (table) => [
    uniqueIndex("UX_CORE_User_Username").on(table.Username),
    uniqueIndex("UX_CORE_User_Email").on(table.Email),
  ]
);

export type CoreUser = typeof coreUser.$inferSelect;
export type NewCoreUser = typeof coreUser.$inferInsert;
