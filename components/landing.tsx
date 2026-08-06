import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  Calculator,
  Database,
  FlaskConical,
  History,
  LineChart,
  type LucideIcon,
} from "lucide-react";

function CrossDot({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 text-neutral-400 ${className}`}
    >
      <svg width="9" height="9" viewBox="0 0 9 9" className="block">
        <path d="M4.5 0v9M0 4.5h9" stroke="currentColor" strokeWidth="1" />
      </svg>
    </span>
  );
}

function Wireframe({ variant }: { variant: "bars" | "line" | "histogram" | "rows" }) {
  if (variant === "bars") {
    return (
      <svg viewBox="0 0 96 48" className="h-12 w-full" aria-hidden>
        <rect x="12" y="12" width="20" height="28" rx="3" fill="#d4d4d4" />
        <rect x="40" y="6" width="20" height="34" rx="3" fill="#171717" />
        <line x1="8" y1="44" x2="88" y2="44" stroke="#d4d4d4" />
      </svg>
    );
  }
  if (variant === "line") {
    return (
      <svg viewBox="0 0 96 48" className="h-12 w-full" aria-hidden>
        <polyline
          points="8,34 30,28 52,18 74,24 88,10"
          fill="none"
          stroke="#171717"
          strokeWidth="1.5"
        />
        <line x1="8" y1="44" x2="88" y2="44" stroke="#d4d4d4" />
        <circle cx="30" cy="28" r="2" fill="#171717" />
        <circle cx="52" cy="18" r="2" fill="#171717" />
        <circle cx="88" cy="10" r="2" fill="#171717" />
      </svg>
    );
  }
  if (variant === "histogram") {
    return (
      <svg viewBox="0 0 96 48" className="h-12 w-full" aria-hidden>
        {[8, 14, 10, 26, 18, 32].map((height, index) => (
          <rect
            key={index}
            x={8 + index * 14}
            y={40 - height}
            width="9"
            height={height}
            rx="2"
            fill={index === 5 ? "#171717" : "#d4d4d4"}
          />
        ))}
        <line x1="4" y1="42" x2="92" y2="42" stroke="#d4d4d4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 96 48" className="h-12 w-full" aria-hidden>
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          <circle cx="10" cy={10 + row * 10} r="2" fill="#a3a3a3" />
          <rect x="18" y={7 + row * 10} width="48" height="6" rx="3" fill="#e5e5e5" />
          <rect x="72" y={7 + row * 10} width="16" height="6" rx="3" fill="#171717" />
        </g>
      ))}
    </svg>
  );
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  wireframe: "bars" | "line" | "histogram" | "rows";
}

const FEATURES: Feature[] = [
  {
    icon: Calculator,
    title: "What-If Calculator",
    description:
      "Simulasikan kenaikan harga, diskon, tambah pegawai, dan perubahan stok dengan kalkulasi yang transparan dan bisa diaudit.",
    wireframe: "bars",
  },
  {
    icon: LineChart,
    title: "Estimasi Elastisitas",
    description:
      "Estimasi elastisitas harga dari data transaksi Anda, dengan indikator kepercayaan R² yang ditampilkan jujur.",
    wireframe: "line",
  },
  {
    icon: FlaskConical,
    title: "Simulasi Monte Carlo",
    description:
      "Rentang kemungkinan profit dari ribuan iterasi sampel pola historis, bukan angka tunggal yang menyesatkan.",
    wireframe: "histogram",
  },
  {
    icon: Database,
    title: "Data Transaksi CSV",
    description:
      "Unggah transaksi bulanan dan lihat ringkasan omzet, pertumbuhan, dan item terlaris tanpa perlu alat lain.",
    wireframe: "rows",
  },
  {
    icon: BarChart3,
    title: "Benchmark Industri",
    description:
      "Pembanding margin dan pola harga umum per industri sebagai referensi saat mengisi asumsi.",
    wireframe: "bars",
  },
  {
    icon: History,
    title: "Riwayat Keputusan",
    description:
      "Setiap simulasi tersimpan otomatis sebagai log keputusan, siap dibandingkan kembali kapan saja.",
    wireframe: "rows",
  },
];

function HeroChart() {
  return (
    <svg viewBox="0 0 480 320" className="w-full" fill="none" aria-hidden>
      {[0, 1, 2, 3, 4].map((row) => (
        <line
          key={`h${row}`}
          x1="56"
          y1={40 + row * 56}
          x2="440"
          y2={40 + row * 56}
          stroke="#e5e5e5"
          strokeDasharray="4 4"
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((col) => (
        <line
          key={`v${col}`}
          x1={64 + col * 62}
          y1="40"
          x2={64 + col * 62}
          y2="264"
          stroke="#e5e5e5"
          strokeDasharray="4 4"
        />
      ))}
      <line x1="56" y1="264" x2="440" y2="264" stroke="#171717" strokeWidth="1.5" />
      <line x1="56" y1="40" x2="56" y2="264" stroke="#171717" strokeWidth="1.5" />
      <polyline
        points="56,232 124,204 192,216 260,160 328,168 396,104 440,88"
        stroke="#171717"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="124" cy="204" r="4" fill="#171717" />
      <circle cx="260" cy="160" r="4" fill="#171717" />
      <circle cx="396" cy="104" r="4" fill="#171717" />
      <rect x="196" y="228" width="72" height="36" rx="6" fill="#d4d4d4" />
      <rect x="276" y="212" width="72" height="52" rx="6" fill="#171717" />
    </svg>
  );
}

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-app/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/dflogo.png"
              alt="DecideFirst"
              width={28}
              height={28}
              priority
            />
            <span className="text-[15px] font-semibold tracking-tight text-ink">
              DecideFirst
            </span>
          </Link>
          <nav className="hidden items-center gap-8 sm:flex">
            <Link
              href="#fitur"
              className="text-sm text-sub transition-colors duration-150 hover:text-ink"
            >
              Fitur
            </Link>
            <Link
              href="#fitur"
              className="text-sm text-sub transition-colors duration-150 hover:text-ink"
            >
              Metode
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-ink transition-colors duration-150 hover:border-neutral-400"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-black"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Simulasikan dampak keputusan bisnis,{" "}
              <em className="font-serif italic text-neutral-900">
                sebelum dieksekusi
              </em>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-neutral-500">
              DecideFirst menghitung dampak finansial dari kenaikan harga, diskon,
              tambah pegawai, dan perubahan stok. Semua angka dihitung dari asumsi
              dan data Anda sendiri, transparan dan bisa diaudit.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-black"
              >
                Request Demo
              </Link>
              <Link
                href="#fitur"
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-150 hover:border-neutral-400"
              >
                Lihat Fitur
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <HeroChart />
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-8">
            <p className="text-[12px] uppercase tracking-wide text-neutral-400">
              Dipakai bisnis kecil dan menengah di Indonesia
            </p>
            {["Kopi Nusantara", "Bengkel Jaya", "Butik Senja", "Toko Beras Makmur", "Studio Rasa"].map(
              (name) => (
                <span
                  key={name}
                  className="text-sm font-semibold text-neutral-400"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </section>

        <section id="fitur" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-10 max-w-lg">
            <h2 className="text-3xl font-semibold tracking-tight text-ink">
              Enam alat untuk keputusan{" "}
              <em className="font-serif italic">yang terukur</em>
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-neutral-500">
              Dari mode manual tanpa data sampai analisis probabilistik dari
              data transaksi Anda, semua dalam satu tempat.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="relative bg-white p-6"
                >
                  <CrossDot className="left-0 top-0" />
                  <CrossDot className="right-0 top-0" />
                  <CrossDot className="bottom-0 left-0" />
                  <CrossDot className="bottom-0 right-0" />
                  <Icon size={20} strokeWidth={1.5} className="text-ink" />
                  <h3 className="mt-4 text-[15px] font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-neutral-500">
                    {feature.description}
                  </p>
                  <div className="mt-6 border-t border-neutral-100 pt-4">
                    <Wireframe variant={feature.wireframe} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/dflogo.png"
              alt="DecideFirst"
              width={20}
              height={20}
            />
            <p className="text-[13px] font-semibold text-ink">DecideFirst</p>
          </div>
          <p className="text-[12px] text-neutral-400">
            Think before you act, with data.
          </p>
        </div>
      </footer>
    </div>
  );
}
