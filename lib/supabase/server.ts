import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diset di .env.local"
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dipanggil dari Server Component, aman diabaikan
        }
      },
    },
  });
}

const PAGE_SIZE = 1000;

// ponytail: batas 1000 baris per permintaan dari PostgREST,
// di-loop dengan range sampai semua baris terbaca.
export async function fetchAllTransactions(
  businessId: string,
  columns: string
): Promise<Record<string, unknown>[]> {
  const supabase = await createClient();
  const all: Record<string, unknown>[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("transactions")
      .select(columns)
      .eq("business_id", businessId)
      .order("date", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      throw new Error(error.message);
    }
    all.push(...((data ?? []) as unknown as Record<string, unknown>[]));
    if (!data || data.length < PAGE_SIZE) break;
  }

  return all;
}
