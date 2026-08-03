# DESIGN.md

Dokumen ini adalah spesifikasi UI/UX untuk DecideFirst. Referensi gaya: dashboard clean SaaS bergaya seperti TripSunnah (sidebar kiri, card putih dengan border tipis, tipografi tegas, aksen warna minimal, banyak whitespace).

Rujukan terkait: `PRD.md` (fitur), `PLAN.md` (urutan build), `ARCHITECTURE.md` (struktur sistem).

---

## 1. Prinsip Desain

1. **Clean & tidak ramai** — whitespace generous, satu fokus per section, tidak ada dekorasi yang tidak fungsional.
2. **Data harus terasa terpercaya** — tipografi tegas untuk angka penting, warna status yang konsisten dan bermakna (bukan sekadar estetika), tidak ada elemen yang membuat angka terasa "dibesar-besarkan."
3. **Card-based layout** — setiap unit fungsional (form, riwayat, FAQ) dibungkus card putih dengan border tipis, bukan shadow berat.
4. **Sidebar navigasi persisten** — struktur menu kiri konsisten di semua halaman, memudahkan orientasi.
5. **Progressive disclosure** — sesuai prinsip di PRD, fitur lanjutan (Phase 2/3) tidak boleh terasa membebani UI Phase 1 yang sederhana.

---

## 2. Design Tokens

### 2.1 Warna

```css
:root {
  /* Base */
  --color-bg-app: #F3F4F6;        /* background di luar card, abu sangat muda */
  --color-bg-card: #FFFFFF;
  --color-border: #E5E7EB;         /* border tipis card & input */
  --color-border-hover: #D1D5DB;

  /* Text */
  --color-text-primary: #111827;   /* judul, angka penting */
  --color-text-secondary: #6B7280; /* label, deskripsi */
  --color-text-muted: #9CA3AF;     /* placeholder, teks tersier */

  /* Aksen — dipakai konsisten sesuai makna, bukan dekoratif */
  --color-accent: #2563EB;         /* primary action (tombol utama, link aktif) */
  --color-accent-hover: #1D4ED8;

  /* Status Semantik (dipakai di insight, decision log, badge) */
  --color-status-positive: #16A34A;  /* profit naik, rekomendasi baik, "Approve" */
  --color-status-negative: #DC2626;  /* profit turun, risiko tinggi, "Cancel" */
  --color-status-warning: #D97706;   /* perlu perhatian, data belum cukup */
  --color-status-neutral: #7C3AED;   /* proses berjalan, "Inprocess" */
  --color-status-info: #2563EB;      /* status submit/default */

  /* Sidebar (dark, kontras dengan area konten terang) */
  --color-sidebar-bg: #111827;
  --color-sidebar-text: #D1D5DB;
  --color-sidebar-text-active: #FFFFFF;
  --color-sidebar-active-bg: #2563EB;
}
```

**Catatan penting soal warna status:** karena produk ini soal kejujuran data (lihat PRD §7), warna status TIDAK BOLEH dipakai untuk membuat sesuatu "terlihat" lebih positif dari kenyataan angkanya. Warna hijau/merah harus selalu align 1:1 dengan makna data (profit naik = hijau, bukan sebaliknya).

### 2.2 Tipografi

```css
:root {
  --font-family: 'Inter', -apple-system, sans-serif;

  /* Ukuran */
  --text-display: 28px;   /* judul halaman, mis. "Simulasi Baru" */
  --text-h2: 20px;         /* judul card/section */
  --text-h3: 16px;         /* sub-section, label form penting */
  --text-body: 14px;       /* teks umum */
  --text-small: 13px;      /* label, caption, metadata */
  --text-tiny: 12px;       /* badge, timestamp */

  /* Weight */
  --weight-bold: 700;      /* judul, angka hasil simulasi */
  --weight-semibold: 600;  /* label section, nama tombol */
  --weight-regular: 400;   /* body text */
}
```

**Angka hasil simulasi (profit, margin, breakeven) selalu pakai `--weight-bold` di ukuran besar (24-32px)** — ini adalah elemen paling penting yang harus langsung terbaca, mirip cara "$1,120" ditampilkan tegas di reference image.

### 2.3 Spacing & Radius

```css
:root {
  --radius-card: 12px;
  --radius-input: 8px;
  --radius-button: 8px;
  --radius-badge: 6px;

  --space-card-padding: 24px;
  --space-section-gap: 32px;
  --space-element-gap: 16px;
  --space-inline-gap: 8px;
}
```

### 2.4 Border & Shadow

Hindari shadow berat. Gunakan border tipis sebagai pemisah utama (sesuai reference image yang nyaris tanpa shadow):

```css
:root {
  --border-default: 1px solid var(--color-border);
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.04); /* nyaris tidak terlihat, hanya micro-depth */
}
```

### 2.5 Grid System (Presisi, Bukan Perkiraan)

Semua layout wajib mengikuti grid 8px sebagai satuan dasar — tidak ada angka spacing sembarang (`13px`, `21px`, dsb):

```css
:root {
  --grid-unit: 8px;

  /* Turunan dari grid-unit, dipakai konsisten di semua komponen */
  --space-1: 4px;   /* setengah unit, untuk gap sangat rapat (icon+label) */
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 48px;
  --space-7: 64px;
}
```

**Aturan pemakaian:**
- Padding dalam card: selalu `--space-4` (24px), tidak boleh berbeda antar card di halaman yang sama
- Gap antar card dalam satu grid: `--space-4` (24px)
- Gap antar section (mis. Scenario Builder ke Decision Log di bawahnya): `--space-5` (32px)
- Gap antar elemen form (label ke input, input ke input berikutnya): `--space-2` (8px) untuk label-input, `--space-3` (16px) untuk antar-field
- Gap icon ke teks label (sidebar menu, tombol dengan icon): `--space-2` (8px), align vertikal center, bukan baseline

**Kolom grid halaman:** 12-column grid, max-width content area `1200px`, margin sidebar tetap 240px terpisah dari grid ini. Card mengambil kelipatan kolom (mis. form utama 8 kolom, panel insight kanan 4 kolom — rasio 2:1 seperti reference image).

**Alignment presisi:** semua elemen dalam satu row (label, input, tombol) harus align pada baseline yang sama secara vertikal. Tidak ada elemen yang "mengambang" beberapa pixel lebih tinggi/rendah dari yang lain dalam row yang sama — cek dengan grid overlay saat development.

### 2.6 Icon System

**Library:** Lucide Icons (turunan Feather Icons, lebih lengkap set-nya dan aktif di-maintain). Semua icon di seluruh produk wajib dari satu library ini — tidak boleh campur dengan icon set lain (Font Awesome, Heroicons, custom SVG) supaya visual weight dan style-nya konsisten.

**Aturan pemakaian:**
- Ukuran default: `20px` untuk icon di sidebar/tombol, `16px` untuk icon inline di teks/badge, `24px` untuk icon empty-state
- Stroke width: `1.5` (default Lucide) — konsisten di semua tempat, jangan campur stroke tebal-tipis
- Warna icon mengikuti warna teks di sekitarnya (`currentColor`), bukan warna fix independen, kecuali icon status yang memang perlu warna semantik (§2.1)
- Icon selalu punya pasangan label teks di navigasi utama (sidebar) — tidak ada icon-only tanpa penjelasan kecuali di state collapsed (§6)

**Daftar icon per fungsi (referensi cepat):**
| Fungsi | Icon Lucide |
|---|---|
| Dashboard | `LayoutGrid` |
| Scenario Builder | `Calculator` |
| Decision Log | `History` |
| Data Bisnis | `Database` |
| Insight | `Lightbulb` |
| Pengaturan | `Settings` |
| Search | `Search` |
| Export | `Download` |
| Kalender/tanggal | `Calendar` |
| Dropdown chevron | `ChevronDown` |
| Profit naik | `TrendingUp` |
| Profit turun | `TrendingDown` |
| Peringatan/data kurang | `AlertTriangle` |
| Sukses/tersimpan | `CheckCircle2` |

### 2.7 Menghindari Kesan "AI Slop" (Wajib Diperhatikan)

Ini bagian yang sengaja ditulis eksplisit karena mudah lolos tanpa sadar saat development cepat, terutama kalau banyak dibantu AI coding agent.

**Dilarang di seluruh UI copy dan visual:**
- ❌ Emoji di label, tombol, judul, atau insight teks (✨ 🚀 💡 dsb) — icon Lucide sudah cukup untuk penanda visual, tidak butuh emoji tambahan
- ❌ Em dash/en dash ("—", "–") di UI copy — gunakan kalimat pendek terpisah, atau koma, bukan tanda pisah panjang yang jadi ciri khas teks buatan AI
- ❌ Tiga titik dekoratif atau bullet titik (•) yang tidak fungsional sebagai daftar — kalau butuh pemisah, gunakan spacing/border, bukan karakter titik
- ❌ Judul/copy yang terasa "generated" seperti "Unlock Powerful Insights" atau "Supercharge Your Decisions" — bahasa harus lugas dan fungsional, sesuai gaya factual di PRD (contoh benar: "Simulasi Baru", bukan "Ciptakan Simulasi Impianmu")
- ❌ Icon dekoratif yang tidak fungsional (mis. bintang berkilau, checklist mengambang) hanya untuk "mempercantik" tanpa makna informasi

**Hover & interaksi:**
- ❌ Hover state yang berkedip, memantul (bounce), atau berubah warna drastis dalam animasi cepat berulang — ini terasa murahan dan mengganggu, bukan premium
- ✅ Hover state harus **tenang**: transisi halus satu kali `150-200ms ease`, perubahan warna/background subtle (mis. card border dari `--color-border` ke `--color-border-hover`, row background ke `#F9FAFB`), tidak ada efek looping/berulang selama cursor diam di atas elemen
- ✅ Focus state (keyboard navigation) jelas terlihat tapi tetap tenang — outline tipis warna accent, bukan glow tebal

**Prinsip umum:** setiap elemen visual harus punya alasan fungsional untuk ada. Kalau sebuah dekorasi/animasi/copy hanya ada untuk "terlihat modern" tanpa menambah kejelasan informasi, itu dihapus. Produk ini menjual kepercayaan lewat kejelasan data, bukan lewat visual yang mencolok.



### 3.1 Struktur Halaman Utama

```
┌──────────┬────────────────────────────────────────────┐
│           │  Topbar: judul halaman + deskripsi singkat │
│  Sidebar  │  + action buttons kanan (opsional)         │
│  (fixed,  ├────────────────────────────────────────────┤
│  240px)   │                                              │
│           │  Content area (card-based, max-width       │
│           │  dengan padding konsisten)                  │
│           │                                              │
└──────────┴────────────────────────────────────────────┘
```

### 3.2 Sidebar

- Lebar tetap ~240px, background gelap (`--color-sidebar-bg`)
- Logo/nama produk di atas
- Menu utama dengan ikon + label:
  - Dashboard
  - Scenario Builder (pengganti "Booking Pad" di referensi — entry point utama buat simulasi baru)
  - Decision Log (riwayat simulasi)
  - Data Bisnis (upload transaksi, Phase 2)
  - Insight & Benchmark (Phase 2+)
  - Pengaturan
- Item aktif: background `--color-sidebar-active-bg`, teks putih, sisanya abu-abu muted
- Konsisten di semua halaman — tidak berubah struktur antar page

### 3.3 Topbar per Halaman

Mengikuti pola reference image: judul besar (`--text-display`) + deskripsi 1 baris di bawahnya + action button di kanan (align sejajar dengan judul, bukan di bawahnya).

Contoh (halaman Scenario Builder):
```
Simulasi Baru                              [Riwayat]  [Buat Simulasi Baru →]
Buat skenario keputusan dan lihat dampaknya sebelum dieksekusi.
```

---

## 4. Komponen Utama

### 4.1 Card

- Background putih, border `1px solid var(--color-border)`, radius `12px`, padding `24px`
- Judul card: `--text-h2`, `--weight-semibold`, warna `--color-text-primary`
- Deskripsi di bawah judul: `--text-small`, `--color-text-secondary`
- Tidak ada shadow berat — cukup border untuk pemisahan visual dari `--color-bg-app`

### 4.2 Form Input

Mengikuti pola grid 3-4 kolom seperti reference (Select Request Type, Search PNR, Passenger Name, dst. dalam satu row):

- Label di atas input: `--text-small`, `--color-text-secondary`
- Input: border `1px solid var(--color-border)`, radius `8px`, padding `10px 12px`, teks `--text-body`
- Input aktif/focus: border berubah ke `--color-accent`, tanpa glow berlebihan
- Dropdown & date picker: ikon chevron/calendar di kanan input, konsisten dengan reference

**Grid Scenario Builder (menyesuaikan 4 jenis skenario dari PRD):**
```
Row 1: [Jenis Skenario ▾]  [Harga/Parameter Saat Ini]  [Parameter Baru]  [Estimasi Dampak %]
Row 2: [Kategori spesifik ▾]  [Tanggal berlaku 📅]  [Catatan tambahan (opsional)]
```

### 4.3 Tombol

| Jenis | Style |
|---|---|
| Primary (mis. "Jalankan Simulasi") | Background `--color-accent`, teks putih, radius `8px`, padding `10px 20px`, `--weight-semibold` |
| Secondary (mis. "Export", "Riwayat") | Background putih, border `1px solid var(--color-border)`, teks `--color-text-primary` |
| Icon button | Border tipis, icon saja, dipakai untuk aksi sekunder (search, download) |

### 4.4 Badge Status (untuk Decision Log)

Mengikuti pola warna teks-only di reference (bukan pill solid berwarna, hanya teks berwarna + label di bawahnya):

```
Profit Naik           →  --color-status-positive, --weight-semibold
Profit Turun           →  --color-status-negative, --weight-semibold
Perlu Data Tambahan    →  --color-status-warning, --weight-semibold
Simulasi Tersimpan     →  --color-status-info, --weight-semibold
```

### 4.5 Tabel/List Riwayat (Decision Log)

Mengikuti struktur "Latest Support History" di reference — bukan tabel grid kaku, tapi list row dengan 4 kolom informasi + status di kanan:

```
SIM#20260803-01        Kenaikan Harga         03/08/2026         Profit Naik +12%
Jenis Simulasi          Kategori               Tanggal            Hasil
```

- Setiap baris dipisah border tipis bawah (`border-bottom: 1px solid var(--color-border)`)
- Hover row: background sangat halus (`#F9FAFB`)
- Klik row → buka detail simulasi

### 4.6 Panel Insight (pengganti FAQ di reference)

Card di sisi kanan dashboard/hasil simulasi, mirip posisi "Frequently Asked Questions" — tapi isinya insight otomatis (Template NLG dari PRD Phase 1/4):

```
┌─────────────────────────────┐
│ Insight Simulasi Ini          │
├─────────────────────────────┤
│ ▾ Kenaikan harga ini masih    │
│   menguntungkan selama        │
│   pelanggan tidak turun       │
│   lebih dari 12%.             │
│                                │
│   Breakeven point: 8% ↓       │
│   pelanggan                   │
└─────────────────────────────┘
```

Style accordion (collapsible) seperti FAQ di reference untuk insight yang lebih dari satu poin.

---

## 5. Halaman Utama (Wireframe Deskriptif)

### 5.1 Dashboard (Landing setelah login)

- Ringkasan: jumlah simulasi bulan ini, quick-access ke Scenario Builder
- Card "Simulasi Terbaru" (3-5 entry terakhir dari Decision Log)
- Kalau Phase 2 aktif: card kecil tren data bisnis (omzet bulan ini vs bulan lalu)

### 5.2 Scenario Builder

- Card besar "Buat Simulasi Baru" (mirip "Create New Ticket" di reference) — form input sesuai §4.2
- Tombol submit besar, warna accent, di kiri bawah form
- Setelah submit → tampilkan card hasil di bawahnya: grafik profit before/after (Recharts, bar chart sederhana, warna positif/negatif sesuai token) + panel insight di kanan (§4.6)

### 5.3 Decision Log

- List riwayat penuh (§4.5), dengan filter di atas (jenis skenario, rentang tanggal, status hasil)
- Tombol "Export" di kanan atas card (CSV), mengikuti pola reference

### 5.4 Data Bisnis (Phase 2)

- Card upload CSV (drag-drop area sederhana)
- Card preview data sebelum konfirmasi simpan
- Card tren dasar (grafik omzet/growth) setelah data tersimpan

---

## 6. Prinsip Responsif

- Breakpoint utama: desktop-first (target user adalah owner bisnis yang kemungkinan pakai laptop untuk kerja serius), tapi tetap harus fungsional di tablet/mobile untuk cek cepat.
- Sidebar collapse jadi ikon-only di layar < 1024px, full-hidden dengan hamburger toggle di < 768px.
- Grid form (§4.2) turun dari 4 kolom → 2 kolom → 1 kolom sesuai lebar layar.

---

## 7. Aksesibilitas Dasar

- Kontras warna teks vs background minimal WCAG AA (terutama `--color-text-secondary` di atas putih — sudah dicek aman di atas)
- Semua input punya `<label>` yang terhubung eksplisit, bukan cuma placeholder
- Status warna (§4.4) tidak hanya mengandalkan warna — selalu disertai teks label eksplisit ("Profit Naik", bukan cuma warna hijau)

---

## 8. Yang Sengaja Dihindari

- ❌ Gradient mencolok atau efek glassmorphism berlebihan — reference-nya flat & clean, bukan trendy-heavy
- ❌ Animasi berlebihan — transisi halus secukupnya (hover, focus), tidak ada animasi dekoratif yang memperlambat UX
- ❌ Terlalu banyak warna aksen berbeda — palet dibatasi ketat sesuai §2.1 supaya konsisten dan tidak norak
- ❌ Dark mode di MVP (bisa jadi enhancement nanti, bukan prioritas Phase 1)
