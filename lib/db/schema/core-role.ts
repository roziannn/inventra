
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const coreRole = pgTable(
  "CORE_Role",
  {
    Id: uuid("Id").defaultRandom().primaryKey(),

    RoleCode: varchar("RoleCode", { length: 50 }).notNull(),

    RoleName: varchar("RoleName", { length: 100 }).notNull(),

    Description: text("Description"),

    IsSystem: boolean("IsSystem").notNull().default(false),

    IsActive: boolean("IsActive").notNull().default(true),

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
    uniqueIndex("UX_CORE_Role_RoleCode").on(table.RoleCode),
    uniqueIndex("UX_CORE_Role_RoleName").on(table.RoleName),
  ]
);

export type CoreRole = typeof coreRole.$inferSelect;
export type NewCoreRole = typeof coreRole.$inferInsert;
