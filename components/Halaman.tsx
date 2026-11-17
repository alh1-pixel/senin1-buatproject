import Link from "next/link";
import { alamatHalaman, type Saringan } from "@/data/saring";

type Props = {
  s: Saringan;
  hal: number;
  jumlah: number;
};

export default function Halaman({ s, hal, jumlah }: Props) {
  if (jumlah <= 1) return null;

  const nomorHalaman = Array.from({ length: jumlah }, (_, index) => index + 1);
  const gayaTautan =
    "rounded border px-3 py-2 text-sm hover:bg-slate-50";

  return (
    <nav
      aria-label="Navigasi halaman katalog"
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
    >
      {hal > 1 && (
        <Link href={alamatHalaman(s, hal - 1)} className={gayaTautan}>
          « Sebelumnya
        </Link>
      )}
      {nomorHalaman.map((nomor) =>
        nomor === hal ? (
          <span
            key={nomor}
            aria-current="page"
            className="rounded border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-bold text-white"
          >
            {nomor}
          </span>
        ) : (
          <Link
            key={nomor}
            href={alamatHalaman(s, nomor)}
            className={gayaTautan}
          >
            {nomor}
          </Link>
        ),
      )}
      {hal < jumlah && (
        <Link href={alamatHalaman(s, hal + 1)} className={gayaTautan}>
          Berikutnya »
        </Link>
      )}
    </nav>
  );
}
