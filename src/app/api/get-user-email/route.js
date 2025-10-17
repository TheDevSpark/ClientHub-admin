import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
  try {
    const { userId } = await req.json();
    console.log("API: Received userId:", userId);
    console.log("API: Service role key present:", !!serviceRoleKey);

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!serviceRoleKey) {
      console.log("API: No service role key available");
      return NextResponse.json({ 
        error: "Service role key not configured" 
      }, { status: 500 });
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log("API: Attempting to get user by ID:", userId);
    
    // Fetch user from auth.users table
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    console.log("API: Auth response:", { 
      hasData: !!data, 
      hasUser: !!data?.user,
      hasEmail: !!data?.user?.email,
      error: error?.message 
    });

    if (error) {
      console.error("API: Auth error:", error);
      return NextResponse.json({ 
        error: error.message || "Failed to fetch user" 
      }, { status: 400 });
    }

    if (data?.user?.email) {
      return NextResponse.json({ email: data.user.email });
    }

    return NextResponse.json({ 
      error: "User email not found" 
    }, { status: 404 });

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}