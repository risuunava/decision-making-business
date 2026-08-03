# PRD — Decision Simulator for Business
**Codename:** DecideFirst (working name)
**Versi Dokumen:** 1.0
**Tanggal:** 1 Agustus 2026
**Status:** Draft untuk validasi

---

## 1. Ringkasan Eksekutif

DecideFirst adalah alat simulasi keputusan bisnis yang membantu UMKM, freelancer, dan solopreneur memahami dampak finansial dari sebuah keputusan **sebelum** dieksekusi — kenaikan harga, diskon, penambahan karyawan, atau perubahan stok — menggunakan kalkulasi transparan dan (secara bertahap) data historis mereka sendiri.

**Positioning:** *"Think before you act — with data."*

**Prinsip desain utama:** Jujur terhadap keterbatasan data. Produk tidak berpura-pura punya kepastian statistik yang sebenarnya tidak ada.

---

## 2. Masalah

Pemilik UMKM/solopreneur mengambil keputusan bisnis (naikkan harga, kasih diskon, tambah pegawai) secara intuitif, tanpa gambaran kuantitatif dampaknya terhadap profit. Tools yang ada saat ini tidak menjembatani gap ini:

| Tool | Kekurangan |
|---|---|
| Excel/manual | Butuh keahlian, tidak intuitif, gampang salah rumus |
| POS system | Mencatat data, tapi tidak memberi insight "bagaimana jika" |
| BI Tools (Looker, PowerBI, dsb) | Terlalu kompleks & mahal untuk skala UMKM |

**Gap:** Tidak ada alat yang murah, sederhana, dan jujur untuk mensimulasikan skenario keputusan sebelum dieksekusi.

---

## 3. Tujuan Produk

### Goals (MVP)
1. User bisa memasukkan skenario keputusan (harga, diskon, biaya operasional) dan mendapat proyeksi dampak profit secara instan.
2. User bisa menyimpan data transaksi dasar untuk mulai membangun histori.
3. Semua hasil simulasi harus **explainable** — user tahu dari mana angka itu berasal.

### Non-Goals (secara eksplisit, untuk MVP)
- **Tidak** menghitung elastisitas harga otomatis dari data user (butuh data historis dengan variasi harga yang jarang dimiliki UMKM baru — lihat §7 Risiko).
- **Tidak** melakukan Monte Carlo simulation di Phase 1 (butuh basis data yang cukup panjang & bervariasi agar tidak menyesatkan).
- **Tidak** integrasi otomatis ke POS pihak ketiga di MVP.

---

## 4. Target User

**Primary (validasi awal):** Solopreneur / owner F&B skala kecil-menengah yang *sudah* mencatat transaksi secara digital (spreadsheet atau POS sederhana) — bukan warung yang masih manual total. Alasan: mereka punya data untuk diinput, dan willingness-to-pay lebih tinggi karena sudah terbiasa dengan tools digital.

**Secondary (ekspansi):** Warung/UMKM tradisional — masuk setelah UX simulasi tanpa data historis (mode what-if) sudah tervalidasi, karena mode ini tidak butuh histori sama sekali.

### Use Case Inti
- 💰 **Pricing:** "Kalau saya naikkan harga 10%, berapa penurunan pelanggan yang masih membuat saya untung?"
- 🏷️ **Promo:** "Diskon 20% ini untung atau rugi secara net?"
- 👥 **Operasional:** "Tambah 1 karyawan dengan gaji X, butuh berapa kenaikan omzet untuk balik modal?"
- 📦 **Inventory:** "Stok saya kurangi 30%, berapa potensi lost-sales vs saving biaya?"

---

## 5. Arsitektur Produk: Dua Mode (Kunci Diferensiasi & Kejujuran Data)

Ini adalah keputusan produk paling penting hasil dari analisis risiko data.

### Mode A — What-If Calculator (Inti MVP, selalu bisa jalan)
User memasukkan **asumsinya sendiri** (mis. "saya kira pelanggan turun 10% kalau harga naik 15%"). Sistem murni menghitung konsekuensi matematis (profit, margin, break-even). Tidak butuh histori data sama sekali. **Robust, cepat dibangun, zero risiko akurasi karena tidak ada klaim prediktif.**

### Mode B — Data-Driven Insight (progresif, tergantung kualitas data user)
Begitu user mengisi data transaksi, sistem memberi **konteks tambahan** (rata-rata, tren, benchmark industri) untuk membantu user menentukan asumsi yang lebih realistis di Mode A. Tingkat kepercayaan insight ditampilkan secara eksplisit ke user (lihat tabel §7).

Mode B **tidak pernah** menggantikan Mode A — hanya membantu mengisi asumsi dengan lebih baik.

---

## 6. Ruang Lingkup MVP (Phase 1)

### Fitur
1. **Onboarding ringan** — jenis bisnis, mata uang, (opsional) upload data transaksi awal (CSV).
2. **Scenario Builder** — form input: jenis keputusan (harga/diskon/pegawai/stok), parameter perubahan, asumsi dampak (user isi manual atau pakai benchmark default).
3. **Hasil Simulasi** — profit sebelum vs sesudah, margin, break-even point, ditampilkan dengan grafik sederhana.
4. **Insight Otomatis (rule-based, bukan AI/ML)** — narasi otomatis dari hasil angka, mis. "Kenaikan harga ini menguntungkan selama pelanggan tidak turun lebih dari 12%."
5. **Decision Log** — simpan setiap simulasi + (opsional) catat hasil realisasi aktual untuk pembelajaran ke depan.

### Eksplisit di luar MVP
- Elastisitas otomatis dari data historis
- Monte Carlo / distribusi probabilistik
- AI/LLM untuk natural language input
- Integrasi POS pihak ketiga

---

## 7. Strategi Data & Mitigasi Risiko Elastisitas

| Tingkat kematangan data user | Yang bisa ditawarkan | Klaim ke user |
|---|---|---|
| Tidak ada data historis | Benchmark industri umum (dikurasi manual, per jenis bisnis) | "Estimasi umum industri, bukan dari data Anda" |
| Ada data transaksi, harga tidak pernah berubah | Rata-rata & tren volume/omzet saja | "Berdasar tren transaksi Anda, tanpa estimasi elastisitas harga" |
| Ada data + minimal 2–3 titik harga berbeda dengan histori volume | Estimasi elastisitas kasar (regresi linear sederhana) | "Estimasi awal dari data Anda — makin banyak data, makin akurat" |
| Data time-series panjang & konsisten (Phase 3+) | Simulasi probabilistik (Monte Carlo) | "Berbasis pola data Anda, ditampilkan sebagai rentang kemungkinan" |

Prinsip: **produk tidak pernah menampilkan angka pasti yang sebenarnya tidak didukung data.** Transparansi tingkat kepercayaan adalah bagian dari UI, bukan detail teknis tersembunyi.

---

## 8. Tech Stack — Zero Cost

Prioritas: seluruh MVP berjalan di tier gratis, tanpa biaya infra bulanan, dengan jalur upgrade jelas saat ada traksi/revenue.

| Layer | Pilihan | Alasan Zero-Cost |
|---|---|---|
| Frontend | Next.js (App Router) | Deploy gratis di Vercel Hobby tier |
| Hosting Frontend | Vercel (Free) | Termasuk edge functions, cukup untuk MVP traffic rendah |
| Backend Logic | **Next.js API Routes / Server Actions** (bukan FastAPI terpisah) | Menghindari biaya hosting server Python terpisah (Railway dsb berbayar setelah free credit habis). Kalkulasi profit & simulasi ringan cukup dilakukan di JS/TS — tidak butuh Python di MVP karena belum ada ML sungguhan |
| Database | Supabase (Free tier: 500MB DB, Auth built-in) | Postgres gratis + auth + row-level security, tidak perlu bangun auth sendiri |
| Simulation Engine | TypeScript murni (fungsi matematis: profit, margin, break-even) | Tidak butuh NumPy/Pandas untuk kalkulasi dasar Mode A |
| Charting | Recharts (client-side) | Gratis, ringan |
| CSV Upload/Parsing | PapaParse (client-side) | Tidak butuh backend parsing khusus |
| Auth | Supabase Auth (Free) | Termasuk di free tier |

**Catatan penting:** FastAPI + Python/NumPy/Redis (dari brainstorming awal) **ditunda ke Phase 3+**, saat Monte Carlo betulan dibutuhkan dan ada justifikasi biaya (revenue awal). Ini konsisten dengan prinsip zero-cost dan juga menghindari over-engineering MVP.

---

## 9. Data Model (MVP)

```
businesses
- id, owner_id, name, business_type, currency, created_at

transactions
- id, business_id, date, item_name, quantity, unit_price, cost_per_unit

pricing_history (opsional, terisi natural dari transactions jika harga berubah)
- id, business_id, item_name, price, effective_date

simulations
- id, business_id, scenario_type (pricing/discount/staffing/inventory)
- input_params (jsonb)
- assumption_source ('manual' | 'benchmark' | 'estimated')
- result (jsonb: profit_before, profit_after, breakeven, margin)
- created_at

decision_log
- id, simulation_id, executed_at, actual_result (jsonb, opsional, diisi belakangan)
```

---

## 10. Roadmap

**Phase 1 (MVP — Zero Cost, target validasi)**
- Mode A (What-If Calculator) penuh
- Insight rule-based
- Decision log dasar
- Stack: Next.js + Supabase + Vercel, semua tier gratis

**Phase 2 (Data-Driven Ringan)**
- Upload CSV transaksi
- Insight berbasis tren (rata-rata, growth rate)
- Benchmark industri per kategori bisnis

**Phase 3 (Statistik Lanjutan — mulai butuh biaya jika traffic naik)**
- Estimasi elastisitas dari data dengan variasi harga
- Monte Carlo ringan (bisa tetap di TS/JS dengan library statistik ringan sebelum migrasi ke Python)

**Phase 4 (Smart Layer — non-LLM, 100% zero cost & zero dependency eksternal)**

Keputusan final: **tidak menggunakan LLM/AI generatif dalam bentuk apa pun**, termasuk free tier provider luar (Groq, Gemini, dsb). Alasan: free tier LLM tetap punya dependency eksternal (rate limit yang bisa berubah kapan saja, kebijakan provider yang terbukti berubah signifikan dalam hitungan bulan, butuh koneksi ke pihak ketiga). Untuk produk yang benar-benar $0 dan sepenuhnya dalam kendali sendiri, Phase 4 diganti total dengan:

1. **Template-Based Insight Generation** — insight bukan digenerate AI, tapi disusun dari kumpulan template kalimat kondisional yang dikurasi manual, dengan beberapa variasi kalimat per kondisi (supaya tidak terasa kaku/berulang). Contoh:
   > "Kenaikan harga {X}% berpotensi menaikkan profit hingga {Y}%, selama pelanggan tidak turun lebih dari {Z}%."

2. **Decision Tree / Expert System** — rekomendasi disusun dari pohon keputusan eksplisit hasil kurasi manual (berdasar riset domain F&B/retail UMKM), bukan black-box AI. Contoh logika: jika margin < 15% dan ada indikasi kompetitor lebih murah → sarankan efisiensi biaya dulu sebelum menaikkan harga.

3. **Parsing Input Semi-Natural (bukan NLP penuh)** — untuk input seperti "naikkan harga 10%", cukup pakai regex/keyword matching pattern-based, dilengkapi fuzzy matching ringan (mis. library seperti Fuse.js) untuk toleransi typo/variasi kata. Tidak butuh model bahasa sama sekali.

**Konsekuensi desain:** insight dan rekomendasi jadi lebih terbatas cakupannya (hanya menjangkau skenario yang sudah dikurasi eksplisit), tapi keuntungannya: transparan, bisa diaudit, konsisten, dan **tidak ada risiko biaya atau dependency eksternal sama sekali** — sepenuhnya berjalan di kode sendiri, tanpa panggilan API ke pihak luar.

**Catatan roadmap jangka panjang:** LLM tetap bisa dipertimbangkan di masa depan sebagai *opsi tambahan yang benar-benar opsional* (bukan dependency inti), HANYA jika suatu saat sudah ada revenue nyata yang membenarkan biaya operasionalnya. Bukan bagian dari roadmap zero-cost ini.

---

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Data user tidak cukup untuk elastisitas | Mode A tidak bergantung pada data sama sekali; Mode B transparan soal tingkat kepercayaan (§7) |
| User bingung dengan konsep simulasi | Progressive disclosure — mulai dari 1 skenario sederhana, bukan dashboard penuh di awal |
| Free tier Supabase/Vercel terlampaui | Set limit soft di aplikasi (mis. jumlah transaksi per akun) sebelum upgrade tier dibutuhkan |
| Insight rule-based terasa generik | Kurasi benchmark per jenis bisnis secara spesifik (F&B, retail, jasa) alih-alih satu angka umum |

---

## 12. Monetisasi (Bukan Fokus MVP, Arah Jangka Panjang)

- **Free:** Mode A tanpa batas, decision log terbatas
- **Pro (berbayar setelah Phase 2/3):** Data sync tanpa batas, insight berbasis data, benchmark industri lengkap
- **B2B (Phase 4+):** Dashboard multi-user untuk bisnis dengan beberapa cabang

---

## 13. Metrik Keberhasilan MVP

- Jumlah skenario yang disimulasikan per user per minggu
- Rasio user yang mengisi decision log (indikasi keputusan benar-benar dieksekusi)
- Retensi mingguan (user kembali untuk simulasi baru)

---

## 14. Ringkasan Perubahan dari Ide Awal

| Ide Awal | Perubahan | Alasan |
|---|---|---|
| FastAPI + Python sejak awal | Next.js API Routes saja di MVP | Zero infra cost, hindari over-engineering |
| Elastisitas otomatis dari data user | Dipisah jadi Mode A (manual) vs Mode B (data-driven bertahap) | Mayoritas UMKM tidak punya data cukup untuk elastisitas valid |
| Monte Carlo di Phase 3 | Tetap, tapi eksplisit ditunda sampai data historis memadai | Mencegah angka yang keliatan canggih tapi menyesatkan |
| AI Layer di Phase 4 | Diganti total jadi "Smart Layer" non-LLM: Template NLG + Decision Tree kurasi manual + regex/fuzzy matching untuk parsing input | Menghindari dependency eksternal & risiko kebijakan free tier provider LLM berubah; memastikan benar-benar $0 tanpa syarat |
