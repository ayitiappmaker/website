import { supabase } from "@/libs/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const { error, data } = await supabase.auth.signUp({
      email: `godsgiftuko+${Math.random()}@gmail.com`,
      password: "12345678",
      options: {
        data: {
          first_name: "God'sgift",
          last_name: "Uko",
          name: "God'sgift Uko"
        },
      },
    });

    console.log({ error, data });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { user_id } = await request.json(); // Receive user ID from the request body

  if (!user_id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const { error } = await createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    ).auth.admin.deleteUser(user_id);

    if (error) {
      return NextResponse.json(
        { error: "Error deleting user account" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const user_id = url.searchParams.get("id");
  const phone = url.searchParams.get("phone");
  const email = url.searchParams.get("email");

  const query = {
    col: '',
    val: '',
  }

  if (user_id) {
    query.col = 'id';
    query.val = user_id;
  }

  if (phone) {
    query.col = 'phone';
    query.val = phone;
  }

  if (email) {
    query.col = 'email';
    query.val = email;
  }

  if (!user_id && !phone && !email) {
    return NextResponse.json({ error: "User ID OR Email OR Phone is required" }, { status: 400 });
  }

  try {
    const { error, data } = await supabase
      .from("profiles")
      .select("*")
      .eq(query.col, query.val)
      .single();

    if (!data) {
      return NextResponse.json({ error: "Invalid Account" }, { status: 400 });
    }

    if (error) {
      return NextResponse.json(
        { error: "Something went wrong. Try again" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User retrieved", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { first_name, last_name, email, reason } = await request.json();

  if (!first_name || !last_name || !email) {
    return NextResponse.json(
      { error: "first_name, last_name, email & reason(optional) are required" },
      { status: 500 }
    );
  }

  try {
    const { error } = await supabase.from("delete_account_requests").insert([
      {
        first_name,
        last_name,
        email,
        reason,
      },
    ]);

    if (error) {
      return NextResponse.json(
        { error: "Error recording deleted account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Recorded!" }, { status: 200 });
  } catch (error) {
    console.error("Error recording deleted account:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  // if (!user_id) {
  //   return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  // }

  try {
    const query = {
      col: body?.email ? 'email' : 'phone',
      val: body?.email || body?.phone,
    }
    // const { error, data } = await createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    // ).auth.admin.getUserById(user_id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq(query.col, query.val)
      .single();

    if (!profile) {
          return NextResponse.json(
        { error: "Invalid Account" },
        { status: 400 }
      );
    }

    
    const { error } = await supabase.from("delete_account_requests").insert([
      {
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        email: profile?.email,
        reason: profile?.reason,
      },
    ]);


    if (error) {
      return NextResponse.json(
        { error: "Error requesting account deletion" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Request submitted!" }, { status: 200 });
  } catch (error) {
    console.error("Error requesting account deletion:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
