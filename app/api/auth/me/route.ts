import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { coreUserRole } from "@/lib/db/schema/core-user-role";
import { coreRole } from "@/lib/db/schema/core-role";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthenticated",
        },
        { status: 401 }
      );
    }

    const roles = await db
      .select({
        RoleCode: coreRole.RoleCode,
        RoleName: coreRole.RoleName,
      })
      .from(coreUserRole)
      .innerJoin(
        coreRole,
        eq(coreUserRole.RoleId, coreRole.Id)
      )
      .where(eq(coreUserRole.UserId, session.UserId));

    return NextResponse.json({
      success: true,
      data: {
        user: {
          Id: session.UserId,
          Username: session.Username,
          Email: session.Email,
          FullName: session.FullName,
        },
        roles,
      },
    });
  } catch (error) {
    console.error("Session validation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to validate session",
      },
      { status: 500 }
    );
  }
}