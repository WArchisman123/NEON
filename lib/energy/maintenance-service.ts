import { query } from "@/lib/supabase/db";
import {
  MaintenanceServiceRecord,
  MaintenanceTicketRecord,
  MaintenanceAssetType,
  TicketStatus,
  CreateTicketParams,
} from "./types";

/**
 * Retrieves all active maintenance service packages from Supabase PostgreSQL.
 * Strictly filters by Solar PV or BESS if assetType is specified.
 */
export async function getMaintenanceServices(
  assetType?: MaintenanceAssetType
): Promise<MaintenanceServiceRecord[]> {
  try {
    let sql = `
      SELECT 
        id,
        asset_type,
        title,
        slug,
        description,
        base_price,
        estimated_duration_hours,
        deliverables,
        is_active
      FROM public.maintenance_services
      WHERE is_active = true
    `;
    const params: unknown[] = [];

    if (assetType) {
      sql += " AND asset_type = $1";
      params.push(assetType);
    }

    sql += " ORDER BY base_price ASC";

    const res = await query<MaintenanceServiceRecord>(sql, params);
    return res.rows;
  } catch (error) {
    console.error("[maintenance-service:getMaintenanceServices] Error:", error);
    return [];
  }
}

/**
 * Retrieves all maintenance tickets for a given organization,
 * joined with site name and service package details.
 */
export async function getMaintenanceTickets(
  orgId: string
): Promise<MaintenanceTicketRecord[]> {
  try {
    const sql = `
      SELECT 
        t.id,
        t.ticket_number,
        t.org_id,
        t.site_id,
        t.asset_type,
        t.service_id,
        t.custom_notes,
        t.status,
        to_char(t.scheduled_date, 'YYYY-MM-DD') as scheduled_date,
        t.time_window,
        t.assigned_crew_name,
        t.total_price,
        t.payment_status,
        t.service_report_url,
        t.created_at,
        t.updated_at,
        s.name as site_name,
        s.location_city as site_city,
        m.title as service_title,
        m.slug as service_slug,
        m.deliverables as deliverables
      FROM public.maintenance_tickets t
      LEFT JOIN public.sites s ON s.id = t.site_id
      LEFT JOIN public.maintenance_services m ON m.id = t.service_id
      WHERE t.org_id = $1
      ORDER BY t.created_at DESC
    `;

    const res = await query<MaintenanceTicketRecord>(sql, [orgId]);
    return res.rows;
  } catch (error) {
    console.error("[maintenance-service:getMaintenanceTickets] Error:", error);
    return [];
  }
}

/**
 * Creates a new maintenance booking ticket.
 */
export async function createMaintenanceTicket(
  params: CreateTicketParams
): Promise<MaintenanceTicketRecord | null> {
  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `NEON-MNT-${randomSuffix}`;
    const status: TicketStatus = "requested";
    const paymentStatus = params.paymentStatus || "paid";

    const assignedCrew =
      params.assignedCrewName ||
      (params.assetType === "bess"
        ? "Alpha BESS Diagnostic Crew (Lead: Marcus Vance)"
        : "SkyInspect Aerial Solutions");

    const sql = `
      INSERT INTO public.maintenance_tickets (
        ticket_number,
        org_id,
        site_id,
        asset_type,
        service_id,
        custom_notes,
        status,
        scheduled_date,
        time_window,
        assigned_crew_name,
        total_price,
        payment_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING 
        id,
        ticket_number,
        org_id,
        site_id,
        asset_type,
        service_id,
        custom_notes,
        status,
        to_char(scheduled_date, 'YYYY-MM-DD') as scheduled_date,
        time_window,
        assigned_crew_name,
        total_price,
        payment_status,
        service_report_url,
        created_at,
        updated_at
    `;

    const res = await query<MaintenanceTicketRecord>(sql, [
      ticketNumber,
      params.orgId,
      params.siteId,
      params.assetType,
      params.serviceId || null,
      params.customNotes || null,
      status,
      params.scheduledDate,
      params.timeWindow,
      assignedCrew,
      params.totalPrice,
      paymentStatus,
    ]);

    if (res.rows.length === 0) return null;

    // Fetch with joins for immediate UI presentation
    const created = res.rows[0];
    const joined = await query<MaintenanceTicketRecord>(
      `
      SELECT 
        t.id,
        t.ticket_number,
        t.org_id,
        t.site_id,
        t.asset_type,
        t.service_id,
        t.custom_notes,
        t.status,
        to_char(t.scheduled_date, 'YYYY-MM-DD') as scheduled_date,
        t.time_window,
        t.assigned_crew_name,
        t.total_price,
        t.payment_status,
        t.service_report_url,
        t.created_at,
        t.updated_at,
        s.name as site_name,
        s.location_city as site_city,
        m.title as service_title,
        m.slug as service_slug,
        m.deliverables as deliverables
      FROM public.maintenance_tickets t
      LEFT JOIN public.sites s ON s.id = t.site_id
      LEFT JOIN public.maintenance_services m ON m.id = t.service_id
      WHERE t.id = $1
      `,
      [created.id]
    );

    return joined.rows[0] || created;
  } catch (error) {
    console.error("[maintenance-service:createMaintenanceTicket] Error:", error);
    return null;
  }
}

/**
 * Updates the lifecycle state of a maintenance ticket.
 */
export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus
): Promise<MaintenanceTicketRecord | null> {
  try {
    const sql = `
      UPDATE public.maintenance_tickets
      SET 
        status = $1,
        updated_at = now()
      WHERE id = $2
      RETURNING 
        id,
        ticket_number,
        org_id,
        site_id,
        asset_type,
        service_id,
        custom_notes,
        status,
        to_char(scheduled_date, 'YYYY-MM-DD') as scheduled_date,
        time_window,
        assigned_crew_name,
        total_price,
        payment_status,
        service_report_url,
        created_at,
        updated_at
    `;

    const res = await query<MaintenanceTicketRecord>(sql, [newStatus, ticketId]);
    if (res.rows.length === 0) return null;

    // Fetch joined
    const joined = await query<MaintenanceTicketRecord>(
      `
      SELECT 
        t.id,
        t.ticket_number,
        t.org_id,
        t.site_id,
        t.asset_type,
        t.service_id,
        t.custom_notes,
        t.status,
        to_char(t.scheduled_date, 'YYYY-MM-DD') as scheduled_date,
        t.time_window,
        t.assigned_crew_name,
        t.total_price,
        t.payment_status,
        t.service_report_url,
        t.created_at,
        t.updated_at,
        s.name as site_name,
        s.location_city as site_city,
        m.title as service_title,
        m.slug as service_slug,
        m.deliverables as deliverables
      FROM public.maintenance_tickets t
      LEFT JOIN public.sites s ON s.id = t.site_id
      LEFT JOIN public.maintenance_services m ON m.id = t.service_id
      WHERE t.id = $1
      `,
      [ticketId]
    );

    return joined.rows[0] || res.rows[0];
  } catch (error) {
    console.error("[maintenance-service:updateTicketStatus] Error:", error);
    return null;
  }
}

/**
 * Seeds initial demo tickets for an organization if none exist.
 */
export async function seedDemoTicketsIfEmpty(
  orgId: string,
  siteId: string
): Promise<void> {
  try {
    const countRes = await query<{ count: string }>(
      "SELECT count(*) FROM public.maintenance_tickets WHERE org_id = $1",
      [orgId]
    );

    if (parseInt(countRes.rows[0].count, 10) > 0) {
      return;
    }

    // Get available services
    const services = await getMaintenanceServices();
    const bessService = services.find((s) => s.asset_type === "bess") || services[0];
    const solarService = services.find((s) => s.asset_type === "solar_pv") || services[1];

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 4);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    // 1. Dispatched BESS Ticket
    if (bessService) {
      await query(
        `INSERT INTO public.maintenance_tickets (
          ticket_number, org_id, site_id, asset_type, service_id, custom_notes, status,
          scheduled_date, time_window, assigned_crew_name, total_price, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          "NEON-MNT-8812",
          orgId,
          siteId,
          "bess",
          bessService.id,
          "Annual preventative maintenance: Flush dielectric loop and verify NFPA 855 contactor response times.",
          "en_route",
          formatDate(tomorrow),
          "08:00 AM - 12:00 PM PST",
          "Alpha BESS Diagnostic Crew (Lead: Marcus Vance)",
          bessService.base_price,
          "paid",
        ]
      );
    }

    // 2. Requested Solar Drone Ticket
    if (solarService) {
      await query(
        `INSERT INTO public.maintenance_tickets (
          ticket_number, org_id, site_id, asset_type, service_id, custom_notes, status,
          scheduled_date, time_window, assigned_crew_name, total_price, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          "NEON-MNT-7430",
          orgId,
          siteId,
          "solar_pv",
          solarService.id,
          "Follow-up inspection on MPPT 04 string mismatch to classify diode faults via radiometric orthomosaic.",
          "quote_accepted",
          formatDate(nextWeek),
          "01:00 PM - 05:00 PM PST",
          "SkyInspect Aerial Solutions",
          solarService.base_price,
          "pending",
        ]
      );
    }
  } catch (error) {
    console.error("[maintenance-service:seedDemoTicketsIfEmpty] Error:", error);
  }
}
