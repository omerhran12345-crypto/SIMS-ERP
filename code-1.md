# 🏗️ SIMS ERP — نظام إدارة موارد الشركات

نظام ERP متكامل للسوق السوداني يدعم 6 قطاعات:
💊 الصيدليات | 🛒 السوبرماركت | 🏭 المصانع | 🛋️ الأثاث | 🔧 المغالق | 👕 الملابس

## ✨ المميزات

- 🔐 **تسجيل دخول + OTP** عبر Resend
- 🪪 **KYC كامل**: سيلفي + face-api.js + استخراج بيانات الجواز بـ Tesseract.js
- 📦 **إدارة منتجات**: باركود تلقائي + Blockchain Hash + صور
- 💰 **POS**: بيع سريع (كاش/بطاقة/آجل) + فاتورة A4/A5 مع QR
- 📊 **محاسبة كاملة**: دليل حسابات، قيود يومية، ميزان مراجعة، قائمة دخل، ميزانية
- 📋 **جرد**: 3 أنواع (سريع/كامل/دوري) + ماسح باركود + تسوية بقيد محاسبي
- ⏰ **جودة**: تنبيهات انتهاء < 30 يوم + فحوصات جودة بالصور
- 🤖 **AI Chat**: مساعد ذكي متصل بقاعدة البيانات + توقع الطلب (Forecast)
- 🚚 **توصيل**: خريطة مباشرة + إسناد أقرب سائق
- 🌐 **Portal عام**: مواطن يبحث عن المنتجات بدون تسجيل + موردون + أطباء
- 🌍 **ثنائي اللغة**: عربي / إنجليزي (next-intl)
- 🌙 **Dark Mode**

## 🛠️ التقنيات

Next.js 14 · TypeScript · Prisma · PostgreSQL · Tailwind CSS · shadcn/ui ·
next-intl · recharts · @react-google-maps/api · face-api.js · Tesseract.js ·
OpenAI · Resend · xlsx

## ⚙️ التشغيل

```bash
npm install
npm i recharts @react-google-maps/api @vladmandic/face-api tesseract.js resend openai xlsx qrcode.react bcryptjs

cp .env.example .env   # ثم عدّل القيم

npx prisma migrate dev
npx prisma db seed
npm run dev
