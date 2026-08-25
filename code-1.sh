sims/
├── .env
├── package.json
├── next.config.js
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── middleware.ts
│   ├── i18n/
│   │   ├── ar.json
│   │   └── en.json
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── accounting.ts
│   │   ├── barcode.ts
│   │   └── openai.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── (auth)/register/page.tsx
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/forgot-password/page.tsx
│   │   ├── kyc/page.tsx
│   │   ├── dashboard/layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── dashboard/products/new/page.tsx
│   │   ├── dashboard/pos/page.tsx
│   │   ├── dashboard/forecast/page.tsx
│   │   ├── dashboard/ai-chat/page.tsx
│   │   ├── dashboard/inventory/page.tsx
│   │   ├── dashboard/quality/page.tsx
│   │   ├── dashboard/accounting/page.tsx
│   │   ├── dashboard/settings/page.tsx
│   │   ├── dashboard/partners/page.tsx
│   │   ├── portal/citizen/page.tsx
│   │   ├── portal/suppliers/page.tsx
│   │   ├── portal/doctors/page.tsx
│   │   ├── delivery/page.tsx
│   │   └── support/page.tsx
│   └── components/
│       ├── ThemeToggle.tsx
│       ├── LangToggle.tsx
│       ├── PrintButton.tsx
│       ├── ExportExcel.tsx
│       └── InvoicePrint.tsx
