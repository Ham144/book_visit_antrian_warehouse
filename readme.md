# Warehouse Visitation book - CSI

Sistem manajemen Role-Based Access Control (RBAC) untuk warehouse logistics dengan integrasi Active Directory.

---

## 📋 Daftar Isi

- [Inisialisasi Role Pengguna](#inisialisasi-role-pengguna)
- [Alur Booking Kunjungan](#alur-booking-kunjungan)
- [Alur Operasional Normal](#alur-operasional-normal)
- [Penanganan Keterlambatan](#penanganan-keterlambatan)

---

## 🔐 Inisialisasi Role Pengguna

Role pengguna ditentukan secara otomatis saat login melalui Active Directory berdasarkan atribut `physicalDeliveryOfficeName`.

### Role Otomatis (via Active Directory)

| Role                  | Kondisi                                                        |
| --------------------- | -------------------------------------------------------------- |
| **USER_ORGANIZATION** | User memiliki data office (`physicalDeliveryOfficeName`)       |
| **ADMIN_VENDOR**      | User tidak memiliki data office (`physicalDeliveryOfficeName`) |

### Role Manual Assignment

| Role                   | Dibuat Oleh                                        |
| ---------------------- | -------------------------------------------------- |
| **DRIVER_VENDOR**      | Dibuat dan dikelola oleh `ADMIN_VENDOR`            |
| **ADMIN_ORGANIZATION** | Di-assign oleh `ADMIN_ORGANIZATION` yang sudah ada |

---

## 📅 Alur Booking Kunjungan

### Perspektif: Admin Vendor

Langkah-langkah melakukan booking kunjungan:

1. Pilih **warehouse** tujuan
2. Pilih **tanggal** kunjungan
3. Sistem otomatis meng-assign:
   - Dock
   - Jam kedatangan
4. Sistem generate **kode antrian**

### Contoh Output Booking

```
Booking 1: CSI-ham  → 08:00 | Dock A
Booking 2: CSI-jasa → 10:00 | Dock A
```

---

## ✅ Alur Operasional Normal

### Perspektif: Admin Warehouse (Hari H)

Proses standar untuk setiap kunjungan yang dijadwalkan:

1. **Konfirmasi kedatangan** vendor (contoh: `CSI-ham`)
2. Klik tombol **Start Unload**
3. Klik tombol **End Unload**
4. Ulangi proses untuk kunjungan berikutnya (contoh: `CSI-jasa`)

```
Vendor 1 (CSI-ham)
└─ Konfirmasi → Start Unload → End Unload

Vendor 2 (CSI-jasa)
└─ Konfirmasi → Start Unload → End Unload
```

---

## ⚠️ Penanganan Keterlambatan

> **Toleransi keterlambatan:** 15 menit

### Skenario 1: Satu Vendor Terlambat

**Contoh:** `CSI-ham` terlambat, `CSI-jasa` tepat waktu

#### Langkah Admin Warehouse:

1. Set status **"Pending Queue"** untuk `CSI-ham`
2. Proses vendor tepat waktu (`CSI-jasa`):

   ```
   Konfirmasi kedatangan → Start Unload → End Unload
   ```

3. **Penanganan vendor terlambat (`CSI-ham`):**

   #### ✓ Jika waktu kosong tersedia dan cukup:

   ```
   Konfirmasi kedatangan → Start Unload → End Unload
   ```

   #### ✗ Jika waktu kosong tidak tersedia/tidak cukup:

   - Vendor menunggu slot waktu kosong berikutnya yang sesuai

---

### Skenario 2: Dua Vendor Terlambat

**Contoh:** `CSI-ham` dan `CSI-jasa` keduanya terlambat

#### Langkah Admin Warehouse:

1. Tambahkan kedua vendor ke **Pending Queue** dengan urutan prioritas:

   ```
   Priority 1: CSI-ham
   Priority 2: CSI-jasa
   ```

2. Proses vendor berdasarkan:
   - Ketersediaan slot waktu
   - Urutan prioritas dalam queue

---

## 📝 Catatan Penting

- Keterlambatan maksimal sebelum masuk pending queue: **15 menit**
- Vendor yang terlambat diproses berdasarkan ketersediaan slot waktu
- Urutan pending queue mengikuti urutan kedatangan/booking awal
- Sistem dock assignment bersifat otomatis

---

## 📞 Kontak & Support

Untuk pertanyaan lebih lanjut mengenai sistem RBAC ini, silakan hubungi tim IT atau warehouse operations.

---

Dokumentasi terakhir diperbarui: [29/12/2025]
