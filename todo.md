"
belajar:
@Exclude()
extends PartialType
extends PickType(targetClass, ['pick1','pick2'] as const)
extends OmitType(targetClass, ['pick1','pick2'] as const)
app.useGlobalPipes(new (require('@nestjs/common').ValidationPipe)({
transform: true,
whitelist: true,
forbidNonWhitelisted: true,
}),) //untuk validation
"

start 12/11/2025
[x] add: setup redis
[x] add: authentication
[x] add: frontend mock design full
[x] add: system design
[x] add: Menu all-warehouse management
[70%] add: members management
[x] add: admin/dock
[x] add: admin/organization-management
[x] add: organization swither
[x] add: warehouse swither
[x] add: busy time CRUD
[x] add: Menu my-warehouse management
[x] add: Menu vehicles management
[x] add: admin dock management
[x] add: (main) set booking
[x] add: entitas vendor yang tidak perlu/bisa create dan update
[x] mod: ubah penamaan dock -> gate untuk frontend
[x] add: history booking page
[x] add: plan visit page
[x] add: ROLE untuk fleksibilitas description tidak bisa dijadikan acuan soalnya, penulisannya tidak diketahui, siapa yang bisa buka ini dan itu
[x] authorization decorator tinggal gunakan
[x]add: setup opsi allowedTypes
[x] mod: VehicleType sudah sanget lengkap untuk semua tipe
[x] REMINDER: Jangan pernah pakai enum di database lagi!!
[x] add: member management
[x] add: live queue untuk melihat booking vendor, preview detail booking vendor, mengatur ulang waktu booking vendor

//live queue complex UI drag drop
[x] add: bisa drag dari antrian IN_PROGRESS menjadi UNLOADING
[x] add: bisa drag dari DELAYED menjadi UNLOADING
[x] add: bisa drag dari DELAYED menjadi CANCELED
[] add: bisa tukar urutan dock yang sama :
() smart check after relativePositionTarget
() smart check before relativePositionTarget
[x] add: bisa drag dari antrian ke CANCELED (inventory section)
[x] add: bisa drag dari canceled ke antrian :
() smart check after relativePositionTarget
() smart check before relativePositionTarget
[x] add: bisa drag dari canceled ke unloading

[] add: warehouse setting untuk ruling berbeda tiap warehouse
[] add: My Warehouse belum tau buat apa
[] add: dashboard driver & vendor admin

//update antrian booking
[x] add: perlu jenis VehicleType ada yang bisa masuk dan ada yang tidak bisa
