
import {
  pgTable,
  uuid,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

import { coreUser } from "./core-user";
import { coreRole } from "./core-role";

export const coreUserRole = pgTable(
  "CORE_UserRole",
  {
    UserId: uuid("UserId")
      .notNull()
      .references(() => coreUser.Id, { onDelete: "cascade" }),

    RoleId: uuid("RoleId")
      .notNull()
      .references(() => coreRole.Id, { onDelete: "restrict" }),

    AssignedAt: timestamp("AssignedAt", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    AssignedBy: uuid("AssignedBy"),
  },
  (table) => [
    primaryKey({
      name: "PK_CORE_UserRole",
      columns: [table.UserId, table.RoleId],
    }),
    index("IX_CORE_UserRole_RoleId").on(table.RoleId),
  ]
);

export type CoreUserRole = typeof coreUserRole.$inferSelect;
export type NewCoreUserRole = typeof coreUserRole.$inferInsert;
