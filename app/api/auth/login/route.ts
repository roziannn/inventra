
import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { coreUser } from "@/lib/db/schema/core-user";
import { coreUserRole } from "@/lib/db/schema/core-user-role";
import { coreRole } from "@/lib/db/schema/core-role";

import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login input",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { identifier, password } = validation.data;

    const [user] = await db
      .select()
      .from(coreUser)
      .where(
        or(
          eq(coreUser.Username, identifier),
          eq(coreUser.Email, identifier.toLowerCase())
        )
      )
      .limit(1);

    if (!user || !user.IsActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(
      password,
      user.PasswordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const roles = await db
  .select({
    RoleCode: coreRole.RoleCode,
    RoleName: coreRole.RoleName,
    IsActive: coreRole.IsActive,
  })
  .from(coreUserRole)
  .innerJoin(
    coreRole,
    eq(coreUserRole.RoleId, coreRole.Id)
  )
  .where(eq(coreUserRole.UserId, user.Id));

    const activeRoles = roles
    .filter((role) => role.IsActive)
    .map(({ RoleCode, RoleName }) => ({
        RoleCode,
        RoleName,
    }));

    await createSession(user.Id);

    await db
      .update(coreUser)
      .set({
        LastLoginAt: new Date(),
      })
      .where(eq(coreUser.Id, user.Id));

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: {
            Id: user.Id,
            Username: user.Username,
            Email: user.Email,
            FullName: user.FullName,
          },
          roles: activeRoles,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
