import { NextRequest, NextResponse } from "next/server";
import { updateTicketStatus } from "@/lib/energy/maintenance-service";
import { TicketStatus } from "@/lib/energy/types";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: TicketStatus[] = [
  "requested",
  "quote_accepted",
  "technician_assigned",
  "en_route",
  "on_site",
  "testing_and_verification",
  "completed",
  "cancelled",
];

/**
 * PATCH /api/v1/maintenance/tickets/:id/status
 * Updates the lifecycle state of a service ticket (e.g. en_route -> on_site -> completed).
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status as TicketStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updated = await updateTicketStatus(id, status as TicketStatus);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Ticket not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[api:maintenance/tickets/:id/status:PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error updating ticket status" },
      { status: 500 }
    );
  }
}
