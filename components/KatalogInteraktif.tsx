"use client";
import { useState } from "react";
import type { Event } from "@/data/events";
import KartuEvent from "./KartuEvent";
export default function KatalogInteraktif({ events }: { events: Event[] }) {
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [hanyaTersedia, setHanyaTersedia] = useState(false);

  const daftarKategori = ["Semua", ...new Set(events.map((e) => e.kategori))];
  const hasil = events.filter(
    (e) =>
      e.judul.toLowerCase().includes(cari.toLowerCase()) &&
      (kategori === "Semua" || e.kategori === kategori) &&
      (!hanyaTersedia || e.terisi < e.kuota),
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari event..."
          className="rounded border bg-black px-3 py-2"
        />
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="rounded border bg-black px-3 py-2"
        >
          {daftarKategori.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hanyaTersedia}
            onChange={(e) => setHanyaTersedia(e.target.checked)}
            className="rounded border bg-black"
          />
          Hanya yang masih ada tiket
        </label>
      </div>
      {hasil.length === 0 ? (
        <p className="text-slate-500">Tidak ada event yang ditemukan.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hasil.map((e) => (
            <KartuEvent key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
