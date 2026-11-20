"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ambilEvent } from "@/data/ambil";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type HasilPesan = {
  berhasil: boolean;
  pesan: string;
  galat: { nama?: string; email?: string; jumlah?: string };
  isian: { nama: string; email: string };
};

export async function pesanTiket(
  _sebelum: HasilPesan,
  formData: FormData,
): Promise<HasilPesan> {
  const eventId = Number(formData.get("eventId"));
  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const jumlah = Number(formData.get("jumlah"));
  const isian = { nama, email };

  // jangan percaya browser: baca event dari database, bukan dari formulir
  const event = await ambilEvent(eventId);
  if (!event) {
    return {
      berhasil: false,
      pesan: "Event tidak ditemukan.",
      galat: {},
      isian,
    };
  }

  const galat: HasilPesan["galat"] = {};
  if (nama.length < 3) galat.nama = "Nama minimal 3 huruf.";
  else if (nama.length > 40) galat.nama = "Nama maksimal 40 huruf.";
  if (!email.includes("@")) galat.email = "Email harus memuat tanda @.";
  if (!Number.isInteger(jumlah) || jumlah < 1)
    galat.jumlah = "Jumlah tiket minimal 1.";
  else if (jumlah > 5) galat.jumlah = "Maksimal 5 tiket per pesanan.";
  else if (jumlah > event.kuota - event.terisi)
    galat.jumlah = `Sisa tiket hanya ${event.kuota - event.terisi}.`;

  if (Object.keys(galat).length > 0) {
    return {
      berhasil: false,
      pesan: "Periksa lagi isian yang merah.",
      galat,
      isian,
    };
  }

  const { data: baru, error } = await supabaseAdmin
    .from("pesanan")
    .insert({
      event_id: eventId,
      nama,
      email,
      jumlah,
      total: event.harga * jumlah,
    })
    .select("nomor")
    .single();
  if (error) {
    return {
      berhasil: false,
      pesan: "Pesanan gagal disimpan. Coba lagi.",
      galat: {},
      isian,
    };
  }

  const { data: kuotaBaru, error: galatKuota } = await supabaseAdmin
    .from("events")
    .update({ terisi: event.terisi + jumlah })
    .eq("id", eventId)
    .eq("terisi", event.terisi)
    .select("id")
    .maybeSingle();
  if (galatKuota) {
    return {
      berhasil: false,
      pesan:
        "Pesanan tersimpan, tetapi kuota gagal diperbarui. Hubungi panitia.",
      galat: {},
      isian,
    };
  }
  if (!kuotaBaru) {
    await supabaseAdmin.from("pesanan").delete().eq("nomor", baru.nomor);
    return {
      berhasil: false,
      pesan: "Tiket baru saja berubah, coba lagi.",
      galat: {},
      isian,
    };
  }

  const toples = await cookies();
  toples.set("nama", nama, { maxAge: 60 * 60 * 24 * 30 });

  revalidatePath("/event");
  revalidatePath(`/event/${eventId}`);
  revalidatePath("/pesanan");

  return {
    berhasil: true,
    pesan: `Pesanan #${baru.nomor} terkirim: ${jumlah} tiket untuk ${nama}.`,
    galat: {},
    isian: { nama, email: "" },
  };
}

export async function batalkanPesanan(formData: FormData) {
  const nomor = Number(formData.get("nomor"));
  const namaSaya = (await cookies()).get("nama")?.value;
  if (!Number.isInteger(nomor) || !namaSaya) return;

  // syarat kepemilikan ikut di dalam perintah hapus: pesanan orang lain tidak akan terhapus
  const { data: hapus } = await supabaseAdmin
    .from("pesanan")
    .delete()
    .eq("nomor", nomor)
    .eq("nama", namaSaya)
    .select()
    .maybeSingle();
  if (!hapus) return;

  const event = await ambilEvent(hapus.event_id);
  if (event) {
    await supabaseAdmin
      .from("events")
      .update({ terisi: Math.max(0, event.terisi - hapus.jumlah) })
      .eq("id", hapus.event_id);
  }

  revalidatePath("/event");
  revalidatePath(`/event/${hapus.event_id}`);
  revalidatePath("/pesanan");
}
