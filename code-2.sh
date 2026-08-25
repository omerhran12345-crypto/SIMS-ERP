src/
├── app/
│   ├── (auth)/          # login, register, forgot-password
│   ├── (dashboard)/     # dashboard, pos, products, inventory,
│   │                    # accounting, quality, forecast, ai-chat...
│   ├── portal/          # citizen, suppliers, doctors
│   ├── delivery/        # لوحة السائق
│   ├── support/         # اتصل بنا
│   └── actions/         # server actions (auth, product, invoice, ai)
├── components/ui/       # DataTable, InvoicePrint, ExportExcel...
├── i18n/messages/       # ar.json, en.json
└── lib/                 # prisma, auth, accounting, barcode
prisma/seed.ts           # دليل حسابات + 6 شركات تجريبية
public/models/           # face-api.js models
