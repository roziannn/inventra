import { NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  try {
    await revokeCurrentSession();

    return NextResponse.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}