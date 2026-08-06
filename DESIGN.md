# DESIGN.md

Dokumen ini adalah spesifikasi UI/UX untuk DecideFirst. Referensi gaya: dashboard SaaS monokrom bergaya Linear.app / Vercel (bento grid, border netral dengan cross-dot di persimpangan, tipografi tegas, tanpa warna selain hitam-putih-abu).

Rujukan terkait: `PRD.md` (fitur), `PLAN.md` (urutan build), `ARCHITECTURE.md` (struktur sistem).

---

## 1. Prinsip Desain

1. **Monokrom murni** — hitam, putih, dan abu-abu adalah satu-satunya warna. Tidak ada aksen biru, hijau, atau warna lain. Diferensiasi visual dilakukan lewat bobot tipografi, icon, dan level keabuan, bukan hue.
2. **Bento grid & border system** — komponen disusun dalam grid kartu dengan garis border netral sebagai pemisah; titik plus/cross-dot menghiasi setiap persimpangan grid (ala Linear). Sudut kartu `rounded-xl` sampai `rounded-2xl`.
3. **Clean & tidak ramai** — whitespace generous, satu fokus per section, tanpa dekorasi yang tidak fungsional.
4. **Data harus terasa terpercaya** — tipografi tegas untuk angka penting. Status (naik/turun/peringatan) dibawa oleh label teks eksplisit dan icon, karena warna tidak lagi bisa membedakan makna.
5. **Sidebar navigasi persisten** — struktur menu kiri konsisten di semua halaman ber-login.
6. **Progressive disclosure** — fitur lanjutan (Phase 2/3) tidak boleh membebani UI Phase 1.

---

## 2. Design Tokens

### 2.1 Warna (Monochrome)

```css
:root {
  /* Base */
  --color-bg-app: #F8F8F8;        /* background utama, off-white sangat lembut */
  --color-bg-card: #FFFFFF;
  --color-border: #E5E5E5;         /* neutral-200, border tipis card & input */
  --color-border-hover: #D4D4D4;   /* neutral-300 */

  /* Text */
  --color-text-primary: #171717;   /* neutral-900, judul & angka penting */
  --color-text-secondary: #737373; /* neutral-500, deskripsi */
  --color-text-muted: #A3A3A3;     /* neutral-400, placeholder & teks tersier */

  /* Aksen — hitam saja */
  --color-accent: #171717;         /* tombol utama, item aktif */
  --color-accent-hover: #000000;

  /* Status semantik monokrom: makna dibawa label + icon, bukan hue */
  --color-status-positive: #171717;  /* profit naik, strong = baik */
  --color-status-negative: #737373;  /* profit turun, subdued */
  --color-status-warning: #A3A3A3;   /* perlu perhatian */
  --color-status-neutral: #525252;   /* proses berjalan */
  --color-status-info: #171717;      /* status default */

  /* Sidebar (hitam pekat, kontras dengan konten terang) */
  --color-sidebar-bg: #111827;
  --color-sidebar-text: #D4D4D4;
  --color-sidebar-text-active: #FFFFFF;  /* logo & hover */
  --color-sidebar-active-bg: #FFFFFF;    /* item aktif: putih, teks hitam */
}
```

**Catatan soal status:** karena produk ini menjual kejujuran data, warna monokrom tidak boleh mengaburkan makna. "Profit Naik" selalu ditulis sebagai label eksplisit dengan icon `TrendingUp`, "Profit Turun" dengan `TrendingDown`. Warna hanya menegaskan level: hitam = kuat/positif, abu = melemah/negatif.

### 2.2 Tipografi

```css
:root {
  --font-family: 'Inter', -apple-system, sans-serif;
  --text-display: 28px;
  --text-h2: 20px;
  --text-h3: 16px;
  --text-body: 14px;
  --text-small: 13px;
  --text-tiny: 12px;
  --weight-bold: 700;
  --weight-semibold: 600;
  --weight-regular: 400;
}
```

**Aturan khusus landing page (hero):**
- Judul utama memakai `Inter` semibold, dan satu kata penekanan memakai **serif miring** (`font-serif italic`, stack serif sistem: Georgia). Contoh: "Simulasikan dampak keputusan bisnis, *sebelum dieksekusi*".
- Hanya satu kata/frasa pendek yang boleh serif miring per judul. Jangan lebih.
- Deskripsi: `--text-small` sampai `--text-body`, warna `--color-text-secondary`.

**Angka hasil simulasi selalu `--weight-bold` di ukuran besar (24-32px)** — elemen paling penting yang harus langsung terbaca.

### 2.3 Spacing & Radius

```css
:root {
  --radius-card: 12px;
  --radius-input: 8px;
  --radius-button: 8px;
  --radius-badge: 6px;
  --space-1: 4px;   /* setengah unit, gap sangat rapat */
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;  /* padding card */
  --space-5: 32px;
  --space-6: 48px;
  --space-7: 64px;
}
```

### 2.4 Border & Shadow

Hindari shadow tebal. Pemisah utama adalah border tipis 1px:

```css
:root {
  --border-default: 1px solid var(--color-border);
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.04); /* micro-depth saja */
}
```

### 2.5 Grid System (Presisi, Bukan Perkiraan)

Semua layout wajib mengikuti grid 8px. Tidak ada angka spacing sembarang.

**Bento grid:**
- Grid kartu memakai `gap-px` dengan background container `--color-border`, sehingga garis pemisah antar kartu terbentuk dari celah 1px itu sendiri.
- Setiap kartu: `bg-white`, `rounded-xl`/`rounded-2xl` di tepi luar grid, padding `--space-4`.
- **Cross-dot:** setiap sudut kartu mendapat marker plus kecil (SVG 9x9, garis 1px, warna `--color-text-muted`) yang diposisikan tepat di titik persimpangan garis grid (`-translate-x-1/2 -translate-y-1/2`). Kartu tetangga berbagi titik yang sama, hasilnya satu dot per persimpangan.

**Kolom grid halaman:** 12-column grid, max-width content area `1200px`, sidebar 240px terpisah dari grid.

### 2.6 Icon System

**Library:** Lucide Icons saja, `strokeWidth 1.5`, ukuran default 20px (tombol/sidebar) dan 16px (inline), `currentColor`.

| Fungsi | Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Scenario Builder | `FlaskConical` |
| Decision Log | `History` |
| Data Bisnis | `Database` |
| Profit naik / turun | `TrendingUp` / `TrendingDown` |
| Simulasi probabilistik | `FlaskConical` |
| Peringatan | `AlertTriangle` |

### 2.7 Menghindari Kesan "AI Slop" (Wajib)

**Dilarang di seluruh UI:**
- Emoji, em dash/en dash, bullet titik dekoratif.
- Copy marketing generik. Bahasa lugas dan fungsional.
- Gradient, glassmorphism, glow, shadow tebal.
- **Semua warna selain hitam, putih, dan abu-abu** (termasuk di chart, border, icon, dan hover).

**Hover & interaksi:**
- Transisi tenang satu kali `150-200ms`, perubahan subtle (border `--color-border` → `--color-border-hover`, row → `#F8F8F8`).
- Focus state jelas tapi tenang: outline tipis hitam.

---

## 3. Struktur Halaman

### 3.1 Landing Page (`/`)

```
┌────────────────────────────────────────────────────────────┐
│ Navbar: Logo kiri, menu tengah, pill "Log in" + "Sign Up"   │
├────────────────────────────────────────────────────────────┤
│ Hero: judul besar (serif italic) + deskripsi + CTA hitam    │
│       pill "Request Demo" + ilustrasi line-art di kanan     │
├────────────────────────────────────────────────────────────┤
│ Social proof bar: baris nama mitra monokrom, border atas    │
├────────────────────────────────────────────────────────────┤
│ Feature grid 3 kolom: 6 kartu (icon, judul, deskripsi,      │
│       wireframe mini monokrom), cross-dot di persimpangan   │
├────────────────────────────────────────────────────────────┤
│ Footer minimal                                               │
└────────────────────────────────────────────────────────────┘
```

- Navbar: sticky, border bawah, CTA kanan berbentuk pill (`rounded-full`), "Sign Up" hitam dengan teks putih.
- Hero: grid 2 kolom, ilustrasi SVG line-art (axes, garis putus-putus, polyline hitam, dot) di dalam card putih.
- Social proof: teks wordmark `--color-text-muted` semibold, tanpa logo gambar.

### 3.2 Halaman Ber-login

```
┌──────────┬────────────────────────────────────────────┐
│          │  Topbar: judul halaman + deskripsi          │
│  Sidebar │  + action buttons kanan (opsional)          │
│  (fixed, ├────────────────────────────────────────────┤
│  240px,  │  Content area card-based, max-width,        │
│  hitam)  │  gap antar card 24px                        │
└──────────┴────────────────────────────────────────────┘
```

- Sidebar hitam pekat (`--color-sidebar-bg`), item aktif **putih dengan teks hitam**, sisanya abu terang.
- Semua card: putih, border tipis, `rounded-xl`, padding 24px.

---

## 4. Komponen Utama

### 4.1 Card
Background putih, border `1px solid var(--color-border)`, `rounded-xl`, padding `24px`. Judul card `--text-h2` semibold `--color-text-primary`, deskripsi `--text-small` `--color-text-secondary`.

### 4.2 Form Input
Label di atas input (`--text-small`, secondary), input border `--color-border` `rounded-lg`, focus border hitam. Tanpa glow.

### 4.3 Tombol
| Jenis | Style |
|---|---|
| Primary ("Jalankan Simulasi", "Sign Up") | Background hitam (`--color-accent`), teks putih, semibold |
| Secondary | Background putih, border `--color-border`, teks `--color-text-primary` |
| Pill (landing CTA) | `rounded-full`, hitam/outline |

### 4.4 Badge Status
Teks berwarna monokrom + label eksplisit ("Profit Naik" hitam, "Profit Turun" abu) + icon status. Tidak hanya mengandalkan warna.

### 4.5 Tabel/List Riwayat
Row list dengan border bawah tipis, hover `#F8F8F8`, klik menuju detail.

### 4.6 Panel Insight
Card insight dengan icon semantik (TrendingUp/TrendingDown/AlertTriangle/Info), teks `--text-body` `--color-text-primary`.

### 4.7 Chart
Semua chart monokrom: grid `#E5E5E5`, ticks `#A3A3A3`, garis/bar utama `#171717`, bar sekunder `#D4D4D4`, cursor tooltip `#FAFAFA`. Profit naik vs turun dibedakan level keabuan + label.

---

## 5. Halaman Utama (Wireframe Deskriptif)

### 5.1 Dashboard
Ringkasan simulasi bulan ini, quick-access Scenario Builder, card "Simulasi Terbaru", card kecil tren data.

### 5.2 Scenario Builder
Card besar "Buat Simulasi Baru": form 4 jenis skenario, tombol submit hitam. Hasil: chart bar before/after monokrom + panel insight + kartu "Analisis dari Data Anda" (elastisitas, Monte Carlo).

### 5.3 Decision Log
List riwayat penuh dengan filter, status monokrom berlabel.

### 5.4 Data Bisnis
Card upload CSV, preview, tren omzet (line chart hitam), item terlaris.

---

## 6. Prinsip Responsif

- Desktop-first, tetap fungsional di tablet/mobile.
- Sidebar collapse jadi icon-only di < 1024px, hidden dengan hamburger di < 768px.
- Grid form turun dari 4 → 2 → 1 kolom. Bento grid turun 3 → 2 → 1 kolom.

---

## 7. Aksesibilitas Dasar

- Kontras teks vs background minimal WCAG AA (text-secondary `#737373` di atas putih aman).
- Semua input punya `<label>` eksplisit.
- Status tidak hanya mengandalkan warna: selalu ada label teks + icon.

---

## 8. Yang Sengaja Dihindari

- ❌ Semua warna non-monokrom: gradient, neon, glassmorphism, shadow tebal.
- ❌ Animasi berlebihan; transisi hanya untuk hover/focus.
- ❌ Lebih dari satu kata serif miring per judul.
- ❌ Dark mode kedua: sidebar hitam sudah menjadi area gelap; konten tetap terang.
