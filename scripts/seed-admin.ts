
import { config } from "dotenv";
import argon2 from "argon2";
import { eq, or } from "drizzle-orm";

config({ path: ".env.local" });

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const fullName = process.env.ADMIN_FULLNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !email || !fullName || !password) {
    throw new Error("ADMIN environment variables are incomplete.");
  }

  if (password.length <= 6) {
    throw new Error("Admin password must be at least 6 characters.");
  }

  const { db, pool } = await import("../lib/db");
  const { coreUser } = await import("../lib/db/schema/core-user");
  const { coreRole } = await import("../lib/db/schema/core-role");
  const { coreUserRole } = await import("../lib/db/schema/core-user-role");

  try {
    await db.transaction(async (tx) => {
      const [role] = await tx
        .select()
        .from(coreRole)
        .where(eq(coreRole.RoleCode, "SUPERADMIN"))
        .limit(1);

      if (!role) {
        throw new Error("SUPERADMIN role not found. Run role seed first.");
      }

      const existingUsers = await tx
        .select()
        .from(coreUser)
        .where(
          or(
            eq(coreUser.Username, username),
            eq(coreUser.Email, email)
          )
        );

      if (existingUsers.length > 1) {
        throw new Error(
          "Username and email belong to different existing users."
        );
      }

      let userId: string;

      if (existingUsers.length === 1) {
        const existing = existingUsers[0];

        if (
          existing.Username !== username ||
          existing.Email !== email
        ) {
          throw new Error(
            "Username or email already belongs to another account."
          );
        }

        userId = existing.Id;
        console.log("Existing admin account found. Password unchanged.");
      } else {
        const passwordHash = await argon2.hash(password, {
          type: argon2.argon2id,
        });

        const [newUser] = await tx
          .insert(coreUser)
          .values({
            Username: username,
            Email: email,
            FullName: fullName,
            PasswordHash: passwordHash,
            IsActive: true,
          })
          .returning({ Id: coreUser.Id });

        userId = newUser.Id;

        console.log("SUPERADMIN account created.");
      }

      await tx
        .insert(coreUserRole)
        .values({
          UserId: userId,
          RoleId: role.Id,
        })
        .onConflictDoNothing();

      console.log("SUPERADMIN role assigned.");
    });
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Admin seed failed:", error.message);
  process.exitCode = 1;
});