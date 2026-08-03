# PLAN.md — Rencana Implementasi Teknis
**Produk:** DecideFirst (Decision Simulator for Business)
**Rujukan:** PRD.md v1.0
**Prinsip:** Zero cost mutlak, tanpa dependency eksternal berbayar, tanpa LLM

---

## Cara Baca Dokumen Ini

Setiap phase punya: tujuan, deliverable konkret, urutan kerja, dan **definition of done** (kapan phase dianggap selesai dan boleh lanjut ke phase berikutnya). Dikerjakan berurutan — jangan loncat phase sebelum DoD sebelumnya terpenuhi, karena tiap phase adalah fondasi phase berikutnya.

---

## Phase 0 — Setup & Fondasi Proyek

**Tujuan:** Semua tooling, akun, dan skeleton project siap jalan sebelum menulis fitur apa pun.

### Langkah Kerja
1. **Setup akun (semua gratis, tanpa kartu kredit kecuali diminta eksplisit):**
   - GitHub (repo kode)
   - Vercel (hosting frontend, hubungkan ke GitHub)
   - Supabase (database + auth)
2. **Init project Next.js**
   - `npx create-next-app@latest` — App Router, TypeScript, Tailwind CSS
   - Struktur folder awal: `/app`, `/lib`, `/components`, `/types`
3. **Setup Supabase project**
   - Buat project baru di dashboard Supabase
   - Catat `SUPABASE_URL` & `SUPABASE_ANON_KEY`, simpan di `.env.local` (jangan commit ke git — pastikan `.gitignore` benar)
4. **Install dependency inti**
   - `@supabase/supabase-js` (client Supabase)
   - `recharts` (charting)
   - `papaparse` (CSV parsing, dipakai mulai Phase 2)
   - `zod` (validasi schema input, penting karena semua kalkulasi harus type-safe)
5. **Setup deployment pipeline**
   - Hubungkan repo GitHub ke Vercel → auto-deploy tiap push ke branch `main`
   - Pastikan environment variables (Supabase keys) juga diset di dashboard Vercel, bukan cuma lokal

### Definition of Done
- [ ] `npm run dev` jalan lokal tanpa error
- [ ] Push ke GitHub → otomatis ter-deploy ke Vercel (cek URL `*.vercel.app` bisa diakses)
- [ ] Koneksi ke Supabase berhasil (test query sederhana, misal `select 1`)

---

## Phase 1 — MVP: Mode A (What-If Calculator)

**Tujuan:** Fitur inti yang **tidak butuh data historis sama sekali** — user isi asumsi, sistem hitung konsekuensi. Ini fondasi seluruh value proposition.

### Langkah Kerja

**1.1 — Data Model & Skema Database**
- Buat tabel di Supabase sesuai §9 PRD: `businesses`, `simulations`, `decision_log` (skip `transactions`/`pricing_history` dulu — baru dipakai Phase 2)
- Setup Row Level Security (RLS) di Supabase: user hanya bisa akses data miliknya sendiri

**1.2 — Auth Dasar**
- Implementasi Supabase Auth (email/password atau magic link — magic link lebih simpel, tidak perlu handle reset password manual)
- Halaman: `/login`, `/register`, proteksi route dashboard dengan middleware

**1.3 — Onboarding Ringan**
- Form: nama bisnis, jenis bisnis (dropdown: F&B, retail, jasa, lainnya), mata uang (default IDR)
- Simpan ke tabel `businesses`

**1.4 — Scenario Builder (fitur inti)**
- Form input per jenis skenario:
  - **Pricing:** harga saat ini, harga baru, estimasi perubahan volume penjualan (%)
  - **Discount:** persentase diskon, estimasi kenaikan volume dari diskon
  - **Staffing:** gaji tambahan, estimasi kenaikan omzet yang dibutuhkan
  - **Inventory:** perubahan stok (%), estimasi lost-sales atau saving biaya
- Validasi input pakai `zod` (semua angka harus masuk akal — no negative price, dsb)

**1.5 — Simulation Engine (murni TypeScript, tanpa backend Python)**
- Buat fungsi kalkulasi murni di `/lib/simulation/`:
  - `calculateProfitImpact()` — profit sebelum vs sesudah
  - `calculateBreakeven()` — titik impas dari perubahan
  - `calculateMargin()` — margin sebelum vs sesudah
- **Penting:** fungsi-fungsi ini harus pure function (tidak ada side effect), supaya mudah di-unit-test dan diaudit — ini krusial karena user mempercayai angka dari sini untuk keputusan nyata

**1.6 — Hasil Simulasi (UI)**
- Tampilkan profit before/after, margin, breakeven dalam grafik bar sederhana (Recharts)
- Simpan hasil ke tabel `simulations`

**1.7 — Insight Rule-Based (Template NLG sederhana, versi awal)**
- Buat set template kalimat kondisional dasar di `/lib/insights/templates.ts`
- Contoh logika: `if (profitChange > 0 && customerDropAssumed < breakevenDropThreshold) → tampilkan insight positif dengan angka ambang batas`
- Ini versi ringan dari yang akan diperluas di Phase 4

**1.8 — Decision Log**
- Setiap simulasi otomatis tersimpan sebagai entry di `decision_log`
- UI list sederhana: riwayat simulasi yang pernah dibuat

### Definition of Done
- [ ] User bisa registrasi, login, isi onboarding
- [ ] User bisa membuat simulasi di keempat jenis skenario (pricing/discount/staffing/inventory)
- [ ] Hasil kalkulasi benar secara matematis (**wajib ada unit test** untuk tiap fungsi di simulation engine — ini paling kritikal karena salah hitung = user ambil keputusan salah)
- [ ] Insight rule-based dasar muncul dan masuk akal
- [ ] Deploy production di Vercel, bisa diakses publik

---

## Phase 2 — Data-Driven Ringan (Mode B awal)

**Tujuan:** User bisa mulai input data transaksi untuk mendapat konteks tambahan (bukan prediksi otomatis, sesuai batasan §7 PRD).

### Langkah Kerja

**2.1 — Tabel `transactions` & `pricing_history`**
- Tambah skema sesuai PRD §9
- RLS disesuaikan

**2.2 — Upload CSV**
- UI upload file, parsing pakai PapaParse (client-side, tidak butuh backend khusus)
- Validasi format kolom (tanggal, item, quantity, harga, cost)
- Preview data sebelum konfirmasi simpan ke Supabase

**2.3 — Insight Berbasis Tren (bukan elastisitas otomatis)**
- Hitung metrik deskriptif murni: rata-rata omzet per bulan, growth rate, item terlaris
- **Eksplisit tidak** menghitung elastisitas harga otomatis di sini (sesuai batasan §7 — baru masuk akal kalau ada variasi harga historis yang cukup)
- Tampilkan sebagai dashboard ringkas di halaman terpisah dari Scenario Builder

**2.4 — Benchmark Industri (data statis, dikurasi manual)**
- Buat file data statis (`/lib/data/benchmarks.ts`) berisi angka referensi umum per jenis bisnis (mis. margin tipikal F&B, elastisitas umum kategori tertentu — dari riset publik, bukan dari user)
- Tampilkan sebagai pembanding opsional saat user isi asumsi manual di Scenario Builder — bukan angka otomatis yang dipakai sistem, murni referensi untuk bantu user

**2.5 — Integrasi Scenario Builder dengan Data**
- Saat user buat simulasi baru, tampilkan data historis relevan sebagai *bantuan konteks* (misal: "Rata-rata volume penjualan bulan lalu: X unit") di sebelah form, tanpa auto-fill asumsi

### Definition of Done
- [ ] User bisa upload CSV transaksi dan lihat preview sebelum simpan
- [ ] Dashboard tren dasar (omzet, growth) tampil benar dari data ter-upload
- [ ] Benchmark industri muncul sebagai referensi di Scenario Builder
- [ ] Tidak ada klaim "elastisitas dari data Anda" di UI manapun — audit ulang semua copy/teks di aplikasi untuk pastikan sesuai batasan PRD §7

---

## Phase 3 — Statistik Lanjutan (Elastisitas & Simulasi Probabilistik)

**Tujuan:** Baru masuk fitur statistik yang lebih dalam, **hanya untuk user yang datanya memenuhi syarat** (ada variasi harga historis).

### Langkah Kerja

**3.1 — Deteksi Kelayakan Data**
- Fungsi pengecek: apakah `pricing_history` user punya minimal 2-3 titik harga berbeda dengan data volume penjualan yang cukup?
- Kalau tidak memenuhi syarat → fitur ini disembunyikan/disabled dengan pesan jelas kenapa (bukan error samar)

**3.2 — Estimasi Elastisitas (regresi linear sederhana)**
- Implementasi regresi linear murni di TypeScript (tidak perlu Python/NumPy untuk kasus sederhana — bisa pakai formula least-squares manual atau library ringan seperti `simple-statistics`)
- Tampilkan hasil dengan confidence yang jujur (mis. R² ditampilkan, bukan disembunyikan)

**3.3 — Simulasi Probabilistik Ringan (Monte Carlo versi TS)**
- Implementasi Monte Carlo sederhana di client-side/serverless function (loop random sampling berbasis distribusi dari data historis user)
- Untuk skala kecil (ratusan–ribuan iterasi), ini tetap ringan dijalankan di Vercel serverless function tanpa biaya tambahan
- Output: distribusi probabilitas profit (histogram), bukan angka tunggal

**3.4 — Update UI Hasil Simulasi**
- Untuk user yang datanya memenuhi syarat: tampilkan opsi "Simulasi Lanjutan (Probabilistik)" di samping hasil dasar Mode A
- Untuk user yang belum: tetap dapat Mode A + Mode B dasar, tanpa merasa fitur "rusak"

### Definition of Done
- [ ] Sistem secara akurat mendeteksi kapan data user cukup untuk elastisitas/Monte Carlo
- [ ] Estimasi elastisitas disertai indikator kepercayaan (bukan angka pasti tanpa konteks)
- [ ] Monte Carlo berjalan tanpa menambah biaya infra (tetap di serverless function gratis Vercel)
- [ ] Unit test untuk fungsi statistik (regresi, sampling)

---

## Phase 4 — Smart Layer (Non-LLM: Template NLG + Decision Tree)

**Tujuan:** Insight dan rekomendasi yang lebih kaya, tetap 100% tanpa dependency eksternal.

### Langkah Kerja

**4.1 — Perluasan Template NLG**
- Ekspansi `/lib/insights/templates.ts` dari Phase 1: tambah variasi kalimat per kondisi (beberapa versi per skenario, dipilih kontekstual agar tidak terasa berulang)
- Kategorikan template per jenis skenario (pricing/discount/staffing/inventory) x per hasil (positif/negatif/netral)

**4.2 — Decision Tree Kurasi Manual**
- Riset domain (F&B/retail UMKM) untuk menyusun logika rekomendasi eksplisit
- Implementasi sebagai struktur kondisional bertingkat di `/lib/recommendations/decisionTree.ts` — bukan black box, setiap cabang logika didokumentasikan alasannya
- Contoh cabang: margin rendah + kompetitor lebih murah → rekomendasi efisiensi biaya dulu

**4.3 — Parsing Input Semi-Natural**
- Untuk fitur "ketik skenario dalam kalimat" (opsional, enhancement UX): regex pattern matching untuk pola kalimat umum ("naikkan harga X%", "diskon Y%")
- Fuzzy matching ringan (`Fuse.js`) untuk toleransi typo/variasi kata
- Fallback: kalau pola tidak dikenali, arahkan user ke Scenario Builder form biasa (bukan error)

### Definition of Done
- [ ] Insight terasa variatif, tidak berulang secara mencolok
- [ ] Decision tree terdokumentasi jelas (setiap rule ada alasan bisnisnya)
- [ ] Parsing input semi-natural berhasil untuk pola-pola umum yang ditest, fallback graceful untuk yang tidak dikenali
- [ ] Tidak ada panggilan API eksternal di seluruh Smart Layer — audit codebase untuk pastikan

---

## Lintas-Phase: Praktik yang Selalu Berlaku

### Testing
- Simulation engine (Phase 1) dan fungsi statistik (Phase 3) **wajib** unit test — ini bagian paling kritikal karena langsung mempengaruhi keputusan bisnis user
- Testing framework: Vitest (ringan, cocok untuk Next.js, gratis)

### Version Control & Deploy
- Branch `main` = production (auto-deploy Vercel)
- Branch `dev` untuk kerja aktif, merge ke `main` setelah DoD phase terpenuhi
- Commit message jelas per fitur, memudahkan rollback kalau ada bug di production

### Monitoring Zero-Cost
- Vercel Analytics (tier gratis) untuk pantau traffic dasar
- Supabase dashboard bawaan untuk pantau usage DB (penting untuk tahu kapan mendekati limit free tier 500MB)
- Set reminder manual untuk cek Supabase project tidak auto-pause (idle 7 hari) kalau butuh selalu online

### Dokumentasi Berjalan
- Update `CLAUDE.md` (atau setara) di tiap phase — catat keputusan teknis penting, supaya AI-assisted development (kalau dilanjutkan pakai Claude Code) selalu punya konteks akurat, tidak perlu re-explain dari nol

---

## Ringkasan Urutan Phase

| Phase | Fokus | Butuh Data Historis? | Kompleksitas |
|---|---|---|---|
| 0 | Setup & fondasi | Tidak | Rendah |
| 1 | Mode A — What-If Calculator | Tidak | Sedang |
| 2 | Mode B — Data-driven ringan | Ya (opsional) | Sedang |
| 3 | Statistik lanjutan (elastisitas, Monte Carlo) | Ya (wajib, dengan syarat kelayakan) | Tinggi |
| 4 | Smart Layer (non-LLM) | Tidak | Sedang-Tinggi |

**Prinsip penting:** Phase 1 harus benar-benar solid dan bernilai berdiri sendiri sebelum lanjut — karena ini satu-satunya fitur yang tidak bergantung kualitas data user, jadi ini yang menentukan apakah produk berguna dari hari pertama.
