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
[] add: member management
[] add: dashboard driver & vendor admin

//update antrian booking
[] add: perlu jenis VehicleType ada yang bisa masuk dan ada yang tidak bisa
[] add: perlu jenis
[] add: ubah input admin vendor :

- hari
- warehouse
  [] add: konfirmasi admin gudang
- dock
- jam
- vehicle bisa milih jenis driver
