import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Event } from "./events";
import type { Pesanan } from "./pesanan";

export async function ambilEvents(
  limitCount?: number,
  orderBy: "tanggal" | "harga" = "tanggal",
  ascending = true,
  tanggalMulai?: string,
): Promise<Event[]> {
  let query = supabase.from("events").select("*");

  if (tanggalMulai) {
    query = query.gte("tanggal", tanggalMulai);
  }

  query = query.order(orderBy, { ascending });

  if (limitCount !== undefined) {
    query = query.limit(limitCount);
  }

  const { data, error } = await query;
  if (error) throw new Error("Gagal memuat event: " + error.message);
  return data as Event[];
}
export async function ambilEvent(id: number): Promise<Event | null> {
  if (!Number.isInteger(id)) return null;
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Gagal memuat event: " + error.message);
  return data as Event | null;
}

export async function ambilTerkait(event: Event): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("kategori", event.kategori)
    .neq("id", event.id)
    .order("tanggal");
  if (error) throw new Error("Gagal memuat event terkait: " + error.message);
  return data as Event[];
}

// Pesanan berisi nama dan email orang, jadi dibaca memakai kunci rahasia (hanya di server).
export async function ringkasanPesanan(eventId: number) {
  const { data, count, error } = await supabaseAdmin
    .from("pesanan")
    .select("jumlah", { count: "exact" })
    .eq("event_id", eventId);

  if (error) throw new Error("Gagal menghitung pesanan: " + error.message);

  const daftarPesanan = data ?? [];
  return {
    jumlahPesanan: count ?? daftarPesanan.length,
    jumlahTiket: daftarPesanan.reduce((total, item) => total + item.jumlah, 0),
  };
}

export async function ambilPesanan(): Promise<Pesanan[]> {
  const { data, error } = await supabaseAdmin
    .from("pesanan")
    .select("*, events(judul)")
    .order("nomor", { ascending: false });
  if (error) throw new Error("Gagal memuat pesanan: " + error.message);
  return data as Pesanan[];
}
