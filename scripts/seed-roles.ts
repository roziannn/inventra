
import { config } from "dotenv";
import { sql } from "drizzle-orm/sql/sql";

config({ path: ".env.local" });

async function main() {
  const { db, pool } = await import("../lib/db");
  const { coreRole } = await import("../lib/db/schema/core-role");

  const roles = [
    {
      RoleCode: "SUPERADMIN",
      RoleName: "Super Administrator",
      Description: "Full access to all system features and configurations.",
    },
    {
      RoleCode: "ADMIN",
      RoleName: "System Administrator",
      Description: "Manages system settings, users, and access permissions.",
    },
    {
      RoleCode: "WAREHOUSE_MANAGER",
      RoleName: "Warehouse Manager",
      Description: "Manages warehouse operations and inventory activities.",
    },
    {
      RoleCode: "WAREHOUSE_SUPERVISOR",
      RoleName: "Warehouse Supervisor",
      Description: "Oversees warehouse operations and ensures smooth inventory management.",
    },
    {
      RoleCode: "WAREHOUSE_STAFF",
      RoleName: "Warehouse Staff",
      Description: "Handles daily warehouse operational activities.",
    },
    {
      RoleCode: "GUEST_USER",
      RoleName: "Read Only User",
      Description: "Can view authorized inventory information without modifying it.",
    },
  ];

  try {
    await db
      .insert(coreRole)
      .values(
        roles.map((role) => ({
          ...role,
          IsSystem: true,
          IsActive: true,
        }))
      )
     .onConflictDoUpdate({
        target: coreRole.RoleCode,
        set: {
        RoleName: sql`excluded."RoleName"`,
        Description: sql`excluded."Description"`,
        IsSystem: true,
        UpdatedAt: new Date(),
    },
  });
    console.log("Role seeding completed.");
    console.log(`Total roles processed: ${roles.length}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Role seeding failed:", error);
  process.exitCode = 1;
});
