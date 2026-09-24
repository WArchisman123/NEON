import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { verifyInviteToken, acceptInviteAndJoinOrg } from "@/lib/energy/invite-service";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in first." }, { status: 401 });
    }

    const body = await req.json();
    const { orgId, role = "org:member", token } = body;

    if (!orgId || !token) {
      return NextResponse.json({ error: "Missing required invitation parameters." }, { status: 400 });
    }

    const isValid = verifyInviteToken(orgId, role, token);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or forged invitation token." },
        { status: 400 }
      );
    }

    const result = await acceptInviteAndJoinOrg(orgId, role, user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to join organization." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orgName: result.orgName,
      message: `Successfully joined ${result.orgName}`,
    });
  } catch (err: unknown) {
    console.error("[api/org/invite/accept POST] Error:", err);
    const msg = err instanceof Error ? err.message : "Failed to accept invite";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
