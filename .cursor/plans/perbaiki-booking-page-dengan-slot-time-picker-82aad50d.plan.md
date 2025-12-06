<!-- 82aad50d-0883-45e5-ad2e-a2e2e049c439 59887dc0-c370-458b-aa05-e225ab1e9911 -->
# Perbaiki Booking Page dengan Slot Time Picker Interaktif

## Masalah yang Akan Diperbaiki

1. **useSearchParams dan formData tidak tersinkron**: useEffect dengan dependency array kosong menyebabkan stale closure
2. **Detail step tidak lengkap**: Missing notes input, submit button, dan time slot picker interaktif
3. **URL state management tidak konsisten**: Penanganan query params perlu diperbaiki

## Implementasi

### 1. Perbaiki Sinkronisasi useSearchParams dengan formData

**File**: `frontend/app/vendor/booking/page.tsx`

- Hapus useEffect dengan dependency kosong (line 188-205)
- Buat useEffect baru yang proper untuk sync URL params ke state ketika component mount
- Pastikan state `selectedWarehouse`, `selectedVehicle`, `selectedDock` juga di-set dari URL params
- Update formData dan URL secara konsisten setiap kali user memilih item

### 2. Buat Komponen Interactive Slot Time Picker

**Pola dari contoh** (dengan adaptasi):

- Tidak ada model Schedule, jadi gunakan Dock `availableFrom`/`availableUntil` sebagai base working hours
- Gunakan DockBusyTime untuk blocked times (inevitable events)
- Gunakan existing bookings untuk taken slots
- Hitung available slots berdasarkan working hours minus busy times minus bookings

**Komponen baru**: `TimeSlotPicker` component

- Fetch dock detail dengan bookings dan busyTimes menggunakan `DockApi` 
- Generate time slots dari availableFrom hingga availableUntil
- Visual grid seperti contoh: timeline horizontal dengan clickable slots
- Warna coding: hijau (tersedia), merah (busy time), abu (taken), biru (selected)
- Handle click untuk memilih start time, calculate end time berdasarkan `durasiBongkar`
- Validasi overlap dengan taken bookings dan busy times

### 3. Lengkapi Detail Form

**File**: `frontend/app/vendor/booking/page.tsx`

- Tambahkan input `notes` (textarea)
- Integrasikan TimeSlotPicker untuk pemilihan arrivalTime
- Tambahkan button submit yang:
- Combine selectedDate dengan selectedArrivalTime menjadi DateTime untuk `arrivalTime`
- Calculate `estimatedFinishTime` berdasarkan `arrivalTime + durasiBongkar`
- Call `BookingApi.createBooking` dengan formData lengkap
- Handle success/error dengan toast
- Redirect ke booking list atau detail page

### 4. Perbaiki URL State Management

- Gunakan URLSearchParams untuk manipulasi yang lebih aman
- Update semua handler untuk maintain URL params dengan benar
- Pastikan back button bekerja dengan URL params yang benar

### 5. Fetch Data untuk Slot Picker

**Dependencies**:

- `selectedDock?.id` untuk fetch dock detail dengan bookings
- `selectedDate` untuk filter bookings yang relevan
- `selectedVehicle?.durasiBongkar` untuk calculate end time

**Query baru**:

- useQuery untuk fetch dock detail dengan groups: ['detail'] untuk dapat bookings dan busyTimes
- Enabled ketika selectedDock dan selectedDate tersedia

### 6. Helper Functions

- `parseTimeToHours`: Convert time string (HH:MM) ke decimal hours
- `formatHoursToTimeString`: Convert decimal hours ke time string
- `getWeekDays`: Helper untuk mendapatkan hari dalam seminggu dari date
- `calculateEstimatedFinishTime`: Calculate finish time dari arrivalTime + durasiBongkar
- `checkOverlap`: Validasi overlap dengan bookings dan busyTimes

## File yang Akan Diubah

- `frontend/app/vendor/booking/page.tsx` - Main booking page dengan semua improvements
- Mungkin perlu update `frontend/api/dock.api.ts` untuk method getDockDetail jika belum ada

## Teknologi

- React hooks: useState, useEffect, useMemo
- Tanstack Query untuk data fetching
- Tailwind CSS + DaisyUI untuk styling
- Sonner untuk toast notifications