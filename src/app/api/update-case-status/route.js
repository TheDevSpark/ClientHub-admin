import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
  try {
    const body = await req.json();
    const caseId = body?.caseId;
    const statusToSet = body?.newStatus ?? body?.status;

    if (!caseId || !statusToSet) {
      return NextResponse.json({ error: "Missing caseId or status" }, { status: 400 });
    }

    if (!serviceRoleKey) {
      return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try case_id first
    const { data: d1, error: e1 } = await supabaseAdmin
      .from("cases")
      .update({ status: statusToSet })
      .eq("case_id", caseId)
      .select("case_id");

    if (e1) {
      return NextResponse.json({ error: e1.message }, { status: 400 });
    }

    if (Array.isArray(d1) && d1.length > 0) {
      return NextResponse.json({ success: true });
    }

    // Fallback: try id
    const { data: d2, error: e2 } = await supabaseAdmin
      .from("cases")
      .update({ status: statusToSet })
      .eq("id", caseId)
      .select("id");

    if (e2) {
      return NextResponse.json({ error: e2.message }, { status: 400 });
    }

    if (Array.isArray(d2) && d2.length > 0) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "No matching case found" }, { status: 404 });
  } catch (err) {
    console.error("update-case-status error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
