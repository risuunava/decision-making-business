# ARCHITECTURE.md

Dokumen ini menjelaskan **bagaimana sistem tersusun** dan **kenapa** keputusan arsitektur tertentu diambil. Beda dengan `PLAN.md` (langkah kerja per phase) — dokumen ini fokus ke gambaran struktural yang harusnya tetap relevan meski implementasi detail berubah.

Rujukan terkait: `PRD.md` (requirement produk), `PLAN.md` (breakdown kerja).

---

## 1. Gambaran Umum Sistem

```
┌─────────────────────────────────────────────────┐
│                   Browser User                   │
└───────────────────────┬───────────────────────────┘
                         │ HTTPS
┌───────────────────────▼───────────────────────────┐
│              Next.js (Vercel)                      │
│  ┌─────────────┐  ┌──────────────────────────┐    │
│  │  App Router  │  │  API Routes /             │   │
│  │  (UI Pages)  │  │  Server Actions           │   │
│  └─────────────┘  └───────────┬────────────────┘   │
│                                 │                    │
│  ┌──────────────────────────────▼───────────────┐  │
│  │  /lib — Business Logic (pure functions)        │  │
│  │  - simulation/   (kalkulasi profit, breakeven)  │  │
│  │  - insights/     (template NLG)                 │  │
│  │  - recommendations/ (decision tree)              │  │
│  └──────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────┘
                         │ Supabase Client SDK
┌───────────────────────▼───────────────────────────┐
│                   Supabase                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Postgres   │  │    Auth     │  │     RLS       │  │
│  │  (data)     │  │             │  │  (per-user)   │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
```

**Satu kalimat ringkas:** semua logic (UI, backend, kalkulasi) hidup dalam satu codebase Next.js yang deploy ke Vercel; satu-satunya layanan eksternal adalah Supabase untuk data & auth. Tidak ada server terpisah, tidak ada microservice, tidak ada AI/LLM eksternal.

---

## 2. Keputusan Arsitektur & Alasannya

### 2.1 Kenapa Next.js full-stack, bukan Next.js (FE) + FastAPI (BE) terpisah?

**Keputusan awal di brainstorming:** pakai FastAPI karena "mudah untuk statistik & simulation, scalable ke ML."

**Kenapa diubah:** Untuk MVP (Phase 1-2), kalkulasi yang dibutuhkan (profit, margin, breakeven, rata-rata, growth rate) itu matematika sederhana yang sepenuhnya bisa dilakukan di TypeScript tanpa NumPy/Pandas. Punya backend Python terpisah berarti:
- Butuh hosting kedua (Railway/VPS) → keluar dari free tier begitu traffic naik → melanggar prinsip zero-cost
- Kompleksitas deployment ganda (dua service untuk dijaga sinkron)
- Overhead network call FE→BE yang sebenarnya tidak perlu untuk operasi sesederhana ini

**Kapan dipertimbangkan ulang:** Kalau di masa depan (bukan bagian roadmap sekarang) benar-benar butuh komputasi statistik berat yang gak feasible di JS/serverless function, itu jadi diskusi ulang — bukan default di awal.

### 2.2 Kenapa Supabase, bukan database self-managed?

Supabase = Postgres + Auth + RLS dalam satu paket gratis, tanpa perlu setup server database sendiri atau bikin sistem auth dari nol. Untuk solo developer dengan prinsip zero-cost, ini mengurangi permukaan yang harus di-maintain sendiri (patching, backup, security auth) sambil tetap dapat database relasional penuh (bukan vendor lock-in ke NoSQL proprietary).

**Trade-off yang disadari:** Supabase free tier auto-pause kalau idle 7 hari, dan limit 500MB storage. Ini diterima sebagai batasan wajar untuk tahap MVP/validasi — bukan masalah untuk skala saat ini.

### 2.3 Kenapa tidak ada LLM/AI generatif?

Dibahas panjang di `PRD.md` §Phase 4. Ringkasnya: semua opsi LLM (bahkan free tier seperti Groq/Gemini) tetap punya dependency eksternal — rate limit yang bisa berubah, kebijakan provider yang terbukti berubah dalam hitungan bulan, dan butuh panggilan API ke pihak luar. Untuk produk yang benar-benar $0 dan sepenuhnya dalam kendali sendiri, insight & rekomendasi dibangun dari **Template NLG + Decision Tree** yang dikurasi manual — deterministik, bisa diaudit, zero dependency.

### 2.4 Kenapa business logic dipisah di `/lib`, bukan langsung di komponen/route?

Fungsi seperti `calculateProfitImpact()` atau `calculateBreakeven()` harus **pure function** — input tertentu selalu menghasilkan output yang sama, tanpa side effect. Alasan:
- **Testability** — bisa di-unit-test terisolasi tanpa perlu mock UI atau database
- **Auditability** — karena produk ini menjual kepercayaan lewat transparansi kalkulasi (bukan black-box AI), logic harus mudah ditelusuri dan dijelaskan ke user kalau ditanya "kok hasilnya segini?"
- **Reusability** — logic yang sama bisa dipanggil dari API route, server action, atau nanti dari test suite tanpa duplikasi

### 2.5 Kenapa Row Level Security (RLS) wajib, bukan opsional?

Karena data yang disimpan (transaksi bisnis, histori harga) sensitif secara komersial untuk user. RLS di level database memastikan proteksi data terjadi di layer paling fundamental (bukan cuma di application logic yang bisa ada celah), sehingga meski ada bug di frontend/API route, user tetap tidak bisa akses data user lain.

---

## 3. Alur Data: Contoh Skenario "User Membuat Simulasi Pricing"

```
1. User isi form Scenario Builder (harga lama, harga baru, estimasi % perubahan volume)
        │
2. Validasi input di client (Zod schema) — cegah input tidak masuk akal sebelum submit
        │
3. Server Action dipanggil → data mentah diteruskan ke /lib/simulation/calculateProfitImpact()
        │
4. Pure function menghitung: profit_before, profit_after, margin, breakeven
        │
5. Hasil dikirim ke /lib/insights/ untuk digenerate narasi (template NLG, bukan AI)
        │
6. Hasil akhir (angka + insight teks) disimpan ke tabel `simulations` di Supabase
        │
7. UI menampilkan grafik (Recharts) + insight teks ke user
```

**Poin penting:** tidak ada langkah dalam alur ini yang bergantung ke layanan eksternal selain Supabase (yang cuma untuk penyimpanan, bukan komputasi).

---

## 4. Batasan Kelayakan Data (Arsitektural, Bukan Cuma UI)

Ini bukan sekadar aturan tampilan — ini harus jadi **guard di level logic**, bukan asumsi UI saja:

```typescript
// Contoh pola wajib sebelum fitur statistik lanjutan (Phase 3) dijalankan
function isDataEligibleForElasticity(pricingHistory: PricingPoint[]): boolean {
  // minimal 2-3 titik harga berbeda + data volume cukup
  // return false kalau tidak memenuhi syarat
}

// Dipanggil SEBELUM function elastisitas/Monte Carlo dieksekusi, bukan sesudah
if (!isDataEligibleForElasticity(data)) {
  // tampilkan pesan jelas, JANGAN jalankan estimasi dengan data tidak cukup
}
```

Alasan ini ditulis eksplisit di ARCHITECTURE.md (bukan cuma PRD): supaya siapa pun yang mengembangkan fitur baru di Phase 3 tahu bahwa pengecekan ini bukan nice-to-have UI, tapi bagian dari kontrak fungsi yang wajib dipatuhi di level kode.

---

## 5. Skalabilitas & Titik Migrasi (Kalau Nanti Dibutuhkan)

Dokumen ini sengaja tidak merancang untuk skala besar dari awal (over-engineering untuk solo/early-stage project itu buang waktu). Tapi berikut titik-titik yang **kalau** traffic/data tumbuh signifikan, baru relevan dipertimbangkan:

| Trigger | Kemungkinan Migrasi |
|---|---|
| Supabase mendekati limit 500MB | Upgrade tier Supabase (berbayar) — baru masuk akal kalau sudah ada revenue |
| Kalkulasi statistik jadi terlalu berat untuk serverless function Vercel | Pertimbangkan backend Python terpisah (FastAPI) khusus untuk komputasi berat, bukan mengganti seluruh arsitektur |
| Traffic tinggi & butuh SLA komersial | Upgrade Vercel dari Hobby ke Pro plan |
| Butuh fitur AI yang benar-benar dibutuhkan user (bukan asumsi) | Evaluasi ulang trade-off LLM vs non-LLM dengan data revenue nyata sebagai justifikasi biaya |

**Prinsip:** migrasi dilakukan reaktif berdasar kebutuhan nyata (data/traffic/revenue), bukan proaktif berdasar asumsi "nanti pasti butuh."

---

## 6. Yang Sengaja Tidak Ada di Arsitektur Ini

Supaya jelas dan tidak ada yang secara gak sengaja menambahkannya di kemudian hari tanpa diskusi ulang:

- ❌ Backend terpisah (FastAPI/Express/dsb)
- ❌ Message queue (Redis/RabbitMQ) — belum ada kebutuhan async job di skala ini
- ❌ Microservices — satu monolith Next.js sudah cukup untuk kompleksitas saat ini
- ❌ LLM/AI generatif API apa pun
- ❌ Custom authentication system — pakai Supabase Auth
- ❌ ORM tambahan di atas Supabase client (kecuali benar-benar dibutuhkan nanti — Supabase client SDK sudah cukup untuk kompleksitas query saat ini)
