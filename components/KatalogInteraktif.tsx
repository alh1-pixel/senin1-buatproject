"use client";
import { useEffect, useState } from "react";
import { rupiah, type Event } from "@/data/events";
import KartuEvent from "./KartuEvent";
import KontrolKatalog from "./KontrolKatalog";

const JUMLAH_AWAL = 4;

export default function KatalogInteraktif({ events }: { events: Event[] }) {
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [urut, setUrut] = useState("tanggal");
  const [tampil, setTampil] = useState(JUMLAH_AWAL);
  const [hanyaTersedia, setHanyaTersedia] = useState(false);
  const [batasHarga, setBatasHarga] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrut(localStorage.getItem("urut") ?? "tanggal");
  }, []);

  function ubahUrut(nilai: string) {
    setUrut(nilai);
    localStorage.setItem("urut", nilai);
    setTampil(JUMLAH_AWAL);
  }

  const daftarKategori = ["Semua", ...new Set(events.map((e) => e.kategori))];
  const hasil = events.filter(
    (e) =>
      e.judul.toLowerCase().includes(cari.toLowerCase()) &&
      (kategori === "Semua" || e.kategori === kategori) &&
      (!hanyaTersedia || e.terisi < e.kuota) &&
      (batasHarga === "" || e.harga <= Number(batasHarga)),
  );

  const tersusun = [...hasil].sort((a, b) => {
    if (urut === "murah") return a.harga - b.harga;
    if (urut === "mahal") return b.harga - a.harga;
    if (urut === "nama") return a.judul.localeCompare(b.judul);
    return a.tanggal.localeCompare(b.tanggal);
  });

  const totalHarga = tersusun.reduce((jumlah, e) => jumlah + e.harga, 0);
  const rataHarga =
    tersusun.length > 0 ? Math.round(totalHarga / tersusun.length) : 0;
  const totalSisa = tersusun.reduce(
    (jumlah, e) => jumlah + (e.kuota - e.terisi),
    0,
  );

  const terlihat = tersusun.slice(0, tampil);
  const sisaKartu = tersusun.length - terlihat.length;

  return (
    <div>
      <KontrolKatalog
        cari={cari}
        onCari={(nilai) => {
          setCari(nilai);
          setTampil(JUMLAH_AWAL);
        }}
        kategori={kategori}
        onKategori={(nilai) => {
          setKategori(nilai);
          setTampil(JUMLAH_AWAL);
        }}
        daftarKategori={daftarKategori}
        urut={urut}
        onUrut={ubahUrut}
        hanyaTersedia={hanyaTersedia}
        onHanyaTersedia={(nilai) => {
          setHanyaTersedia(nilai);
          setTampil(JUMLAH_AWAL);
        }}
        batasHarga={batasHarga}
        onBatasHarga={(nilai) => {
          setBatasHarga(nilai);
          setTampil(JUMLAH_AWAL);
        }}
      />
      <p className="mb-1 text-sm text-slate-500">
        {tersusun.length} event ditemukan
      </p>
      {tersusun.length > 0 && (
        <p className="mb-3 text-sm text-slate-500">
          Rata-rata harga {rupiah(rataHarga)} · Total sisa tiket {totalSisa}
        </p>
      )}
      {tersusun.length === 0 ? (
        <p className="text-slate-500">Tidak ada event yang cocok</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {terlihat.map((e) => (
            <KartuEvent key={e.id} event={e} />
          ))}
        </div>
      )}
      {sisaKartu > 0 && (
        <button
          onClick={() => setTampil(tampil + JUMLAH_AWAL)}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Tampilkan lagi ({sisaKartu} lagi)
        </button>
      )}
    </div>
  );
}
