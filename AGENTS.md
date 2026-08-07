# AGENTS.md

Dokumen ini adalah konteks kerja untuk AI coding agent, format terbuka yang bisa dibaca oleh berbagai tool seperti Cursor, GitHub Copilot agent mode, Aider, Windsurf, dan sejenisnya. Baca file ini terlebih dahulu sebelum mengerjakan task apa pun di repo ini.

---

## Ringkasan Proyek

Nama: DecideFirst (Decision Simulator for Business)

Apa ini: Web app yang membantu UMKM dan solopreneur mensimulasikan dampak finansial dari keputusan bisnis (naik harga, diskon, tambah pegawai, ubah stok) sebelum dieksekusi.

Positioning: "Think before you act, with data."

Dokumen rujukan lengkap ada di root repo. Baca semuanya untuk konteks penuh sebelum mengerjakan task besar:
- `PRD.md`, product requirement, scope, dan batasan produk
- `PLAN.md`, breakdown implementasi per phase
- `ARCHITECTURE.md`, struktur sistem dan alasan keputusan teknis
- `DESIGN.md`, sistem desain UI, grid, tipografi, dan aturan visual

Dokumen ini, AGENTS.md, hanya ringkasan operasional untuk keperluan sehari-hari, bukan pengganti keempat dokumen di atas.

---

## Prinsip Non-Negotiable

Wajib dipatuhi di semua task, tanpa pengecualian kecuali dikonfirmasi ulang oleh user.

1. Zero cost mutlak. Tidak boleh menambah dependency yang berbayar atau punya biaya tersembunyi, termasuk API pihak ketiga berbayar dan layanan yang butuh kartu kredit. Kalau ragu apakah sesuatu benar-benar gratis, tanyakan ke user dulu sebelum implementasi.

2. Tidak ada LLM atau AI generatif dalam produk. Insight dan rekomendasi dibangun dari template kalimat kondisional, Template NLG, dan decision tree kurasi manual, bukan panggilan ke OpenAI, Anthropic, Google, Groq, atau provider LLM apa pun. Ini keputusan produk final, bukan keterbatasan sementara.

3. Jangan pernah tampilkan angka statistik yang tidak didukung data yang cukup. Elastisitas harga, prediksi, atau simulasi probabilistik hanya ditampilkan kalau data user lolos syarat kelayakan sesuai PRD bagian 7. Kalau tidak lolos, tampilkan pesan jelas kenapa fitur tidak tersedia. Jangan tampilkan angka default yang seolah berasal dari data user.

4. Simulation engine harus pure function dan wajib punya unit test. Fungsi kalkulasi di `/lib/simulation/` langsung mempengaruhi keputusan bisnis nyata user. Kesalahan di sini bukan bug kosmetik. Setiap perubahan di folder ini wajib disertai atau memperbarui unit test.

5. Mode A, What-If Calculator, tidak boleh bergantung pada data historis. Ini fitur inti yang harus selalu berfungsi penuh meski user belum punya data transaksi sama sekali.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend dan Backend | Next.js, App Router, TypeScript. Satu codebase, API routes dan server actions untuk logic backend |
| Database dan Auth | Supabase, Postgres, Auth, RLS |
| Hosting | Vercel, frontend dan serverless functions |
| Charting | Recharts |
| CSV Parsing | PapaParse |
| Validasi Schema | Zod |
| Fuzzy Matching, Phase 4 | Fuse.js |
| Icon | Lucide Icons, satu-satunya icon library yang dipakai di seluruh produk |
| Testing | Vitest |

Tidak dipakai, sengaja dihindari: FastAPI atau Python backend terpisah, Redis, NumPy, Pandas, semua provider LLM, custom domain berbayar.

---

## Struktur Folder

```
/app                     routes Next.js, App Router
/components               UI components
/lib
  /simulation              fungsi kalkulasi murni, profit, margin, breakeven, wajib pure function dan unit test
  /insights                 template NLG, Phase 1 dan 4
  /recommendations          decision tree, Phase 4
  /data                     benchmark industri statis, Phase 2
  /supabase                 client dan helper Supabase
/types                    TypeScript types dan interfaces
```

---

## Skema Database (Supabase)

Rujuk `PRD.md` bagian 9 untuk skema lengkap. Ringkasan tabel:
- `businesses`, profil bisnis user
- `transactions`, data transaksi, mulai Phase 2
- `pricing_history`, histori perubahan harga, mulai Phase 2
- `simulations`, hasil tiap simulasi yang dijalankan
- `decision_log`, riwayat keputusan yang disimulasikan dan hasil aktual, opsional

Semua tabel wajib pakai Row Level Security. User hanya boleh akses data miliknya sendiri. Jangan pernah nonaktifkan RLS untuk kemudahan development.

---

## Aturan UI dan Visual

Rujuk `DESIGN.md` untuk spesifikasi lengkap. Poin yang wajib dipatuhi konsisten di setiap komponen baru:

1. Grid spacing wajib kelipatan 8px, gunakan token `--space-1` sampai `--space-7` di `DESIGN.md` bagian 2.5. Jangan menulis angka spacing sembarang.
2. Icon hanya dari Lucide Icons. Jangan campur dengan library icon lain.
3. Tidak ada emoji di UI copy, label, tombol, judul, maupun insight teks.
4. Tidak ada em dash atau en dash di UI copy. Gunakan kalimat pendek terpisah atau koma.
5. Tidak ada titik dekoratif atau bullet titik yang tidak fungsional sebagai daftar.
6. Bahasa UI harus lugas dan fungsional, bukan gaya marketing generik. Contoh yang benar: "Simulasi Baru". Contoh yang salah: "Ciptakan Simulasi Impianmu".
7. Hover state harus tenang, transisi satu kali 150 sampai 200 milidetik, tidak ada animasi berkedip atau memantul berulang.

---

## Batasan Copy Produk

Saat menulis teks di UI, insight, hasil simulasi, atau label fitur, hindari klaim yang melebihi kemampuan data.

Jangan tulis: "Elastisitas harga produk Anda adalah -1.5", kalau data belum lolos syarat kelayakan.
Boleh tulis: "Berdasarkan pola umum industri F&B, elastisitas harga biasanya berkisar -1 sampai -2. Ini estimasi umum, bukan dari data spesifik Anda."

Jangan tulis: "AI merekomendasikan...", karena tidak ada AI atau LLM di produk ini.
Boleh tulis: "Berdasarkan analisis skenario Anda..." atau "Rekomendasi berdasarkan kondisi berikut...".

---

## Git Workflow dan Commit Otomatis

Ini bagian yang menentukan bagaimana agent melakukan commit ke GitHub tanpa perlu diminta manual tiap kali.

### Kapan agent boleh commit otomatis

Commit otomatis dilakukan setelah satu unit kerja selesai dan dalam kondisi berjalan, bukan setelah tiap baris kode diketik. Satu unit kerja berarti: satu fungsi selesai dan lolos test, satu komponen UI selesai dirender tanpa error, atau satu perbaikan bug selesai diverifikasi.

Agent tidak boleh commit kode yang belum selesai, kode yang error saat dijalankan, atau kode yang belum lolos test yang relevan di folder tersebut.

### Format commit message

Gunakan Conventional Commits, format ini yang paling umum dibaca oleh tooling maupun manusia.

```
feat: tambah fungsi calculateProfitImpact di simulation engine
fix: perbaiki validasi input negatif di form pricing
refactor: pisah logic insight ke file terpisah
test: tambah unit test untuk calculateBreakeven
docs: update PLAN.md progress Phase 1
style: sesuaikan spacing form sesuai grid 8px di DESIGN.md
```

Prefix yang dipakai: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`. Pesan commit ditulis singkat, dalam bahasa Indonesia, menjelaskan apa yang berubah bukan bagaimana caranya.

### Sebelum commit, wajib dijalankan

1. Jalankan test yang relevan dengan file yang berubah, terutama untuk apa pun di `/lib/simulation/`.
2. Pastikan tidak ada error TypeScript, `tsc --noEmit`.
3. Pastikan build tidak gagal untuk perubahan yang menyentuh routing atau komponen halaman.

Kalau salah satu poin di atas gagal, agent tidak commit, agent memperbaiki dulu atau melaporkan masalahnya ke user.

### Branch

Kerja harian dilakukan di branch `dev`. Commit otomatis terjadi di branch ini. Merge ke `main` hanya dilakukan secara manual oleh user setelah review, bukan otomatis oleh agent, karena `main` terhubung langsung ke deployment production di Vercel.

### Yang tidak boleh masuk commit

File `.env.local` dan kredensial apa pun tidak boleh pernah masuk commit. Pastikan `.gitignore` selalu mencakup file environment variable sebelum commit pertama dijalankan.

---

## Progress Phase

Update manual setiap phase selesai, sesuai Definition of Done di `PLAN.md`.

- [x] Phase 0, setup dan fondasi proyek
- [ ] Phase 1, MVP, Mode A, What-If Calculator (kode selesai, menunggu deploy Vercel oleh user)
- [ ] Phase 2, data-driven ringan, Mode B awal, CSV upload, benchmark (kode selesai, menunggu migrasi 0002 dijalankan oleh user di Supabase)
- [ ] Phase 3, statistik lanjutan, elastisitas, Monte Carlo, hanya untuk data yang layak (kode selesai, menunggu deploy Vercel oleh user)
- [ ] Phase 4, Smart Layer non-LLM, Template NLG lanjutan, decision tree, parsing input

Checklist ini membantu AI agent tahu posisi project tanpa harus membaca ulang seluruh histori percakapan.

---

## Catatan untuk AI Agent

Kalau task yang diminta berpotensi melanggar prinsip non-negotiable di atas, misalnya "tambahkan fitur AI chat" atau "pakai OpenAI API", konfirmasi dulu ke user sebelum implementasi. Jangan asumsikan itu perubahan arah produk yang sudah disetujui.

Kalau butuh menambah dependency baru, cek dulu apakah itu benar-benar gratis dan tidak butuh API key berbayar atau kartu kredit.

Kalau membuat komponen UI baru, cek `DESIGN.md` dulu untuk token warna, spacing, dan icon yang sudah ditentukan. Jangan membuat token baru tanpa alasan kuat.

Prioritaskan kode yang mudah diaudit dan dijelaskan. Produk ini menjual kepercayaan lewat transparansi kalkulasi, bukan lewat kesan pintar yang tidak bisa dijelaskan.