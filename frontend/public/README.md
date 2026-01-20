# Warehouse Visitation book - CSI

Sistem manajemen Role-Based Access Control (RBAC) untuk warehouse logistics dengan credential Active Directory.

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
2. Pilih **driver** anda
2. Pilih **kendaraan** 
2. Pilih **tanggal** kunjungan
4. Pilih  **Dock** yang cocok


### Contoh Output Booking

```
Booking 1: CSI-ham  → 08:00 | Dock A
Booking 2: CSI-csi → 10:00 | Dock A
```

---

## ✅ Alur Operasional Normal

### Perspektif: Admin Warehouse (Hari H)

Proses standar untuk setiap kunjungan yang dijadwalkan:

1. **Konfirmasi kedatangan** vendor (contoh: `CSI-ham`) di live queue atau /admin/dashboard
2. Klik tombol **Konfirmasi Telah Tiba** untuk mencatat bahwa ia telah tiba
2. Klik cancel untuk membuat waktu booking bisa di ambil alih
2. bukan hanya canceled, arrival time yang dijanjikan yang lebih dari jam saat ini tapi belum juga datang juga akan bisa diambil alih (DELAYED)
3. geser booking ke unloading section (waktu unloading akan dimulai disitu) 
4. jika unloading telah selesai maka tekan tombol "mark selesai"

---

## ⚠️ Penanganan Keterlambatan

> **Toleransi keterlambatan:** 15 menit (bisa di setting di admin page)
 
### Skenario 1: Satu Vendor Terlambat

**Contoh:** `CSI-ham` terlambat, `CSI-csi` tepat waktu

#### Langkah Admin Warehouse:

1. Set status **"Pending Queue"** untuk `CSI-ham`
2. Proses vendor tepat waktu (`CSI-csi`):

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

**Contoh:** `CSI-ham` dan `CSI-csi` keduanya terlambat

#### Langkah Admin Warehouse:

1. Tambahkan kedua vendor ke **Pending Queue** dengan urutan prioritas:

   ```
   Priority 1: CSI-ham
   Priority 2: CSI-csi
   ```

2. Proses vendor berdasarkan:
   - Ketersediaan slot waktu
   - Urutan prioritas dalam queue

---

## 📝 Catatan Penting

- Keterlambatan maksimal sebelum masuk pending queue: **15 menit** (bisa disetting di setting warehouse)
- Vendor yang terlambat diproses berdasarkan ketersediaan slot waktu

---

Dokumentasi terakhir diperbarui: [29/12/2025]
