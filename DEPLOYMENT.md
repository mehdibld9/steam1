# دليل النشر — Deployment Guide

## 1. رفع المشروع على GitHub (Push to GitHub)

### الخطوة 1: إنشاء مستودع GitHub
1. اذهب إلى [github.com/new](https://github.com/new)
2. اختر اسماً للمستودع (مثلاً `arabic-mods`)
3. اضغط **Create repository**

### الخطوة 2: ربط المشروع بـ GitHub
افتح الـ Shell في Replit ونفّذ هذه الأوامر:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### الخطوة 3: رفع التحديثات لاحقاً
```bash
git add .
git commit -m "describe your changes"
git push
```

---

## 2. استخدام قاعدة بيانات Supabase

### الخطوة 1: إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com) وسجّل دخولك
2. اضغط **New Project** واختر اسماً وكلمة مرور لقاعدة البيانات
3. انتظر حتى يتم إنشاء المشروع (دقيقة أو دقيقتان)

### الخطوة 2: نسخ رابط الاتصال
1. اذهب إلى **Settings → Database**
2. في قسم **Connection string** اختر **URI**
3. انسخ الرابط — يبدأ بـ `postgresql://postgres:...`
4. **مهم:** استخدم رابط **Transaction pooler** (port 6543) للمشاريع التي تعمل على Vercel

### الخطوة 3: تحديث متغير البيئة
في Replit، اذهب إلى **Secrets** وحدّث قيمة `DATABASE_URL` بالرابط الجديد من Supabase.

ثم اضغط على المخطط لقاعدة البيانات:
```bash
pnpm --filter @workspace/db run push
```

---

## 3. نشر الواجهة الأمامية على Vercel

الواجهة الأمامية (React) تُنشر بشكل ثابت على Vercel.
سيحتاج الـ API server إلى نشر منفصل (Railway أو Render).

### نشر الـ Frontend على Vercel:
1. اذهب إلى [vercel.com](https://vercel.com) وسجّل دخولك بحساب GitHub
2. اضغط **Add New → Project**
3. اختر المستودع من GitHub
4. في إعدادات البناء:
   - **Framework Preset:** Vite
   - **Root Directory:** `artifacts/arabic-mods`
   - **Build Command:** `cd ../.. && pnpm install && pnpm --filter @workspace/api-spec run codegen && pnpm --filter @workspace/arabic-mods run build`
   - **Output Directory:** `dist/public`
5. أضف متغيرات البيئة (إن وجدت)
6. اضغط **Deploy**

### نشر الـ API Server على Railway:
1. اذهب إلى [railway.app](https://railway.app)
2. اضغط **New Project → Deploy from GitHub repo**
3. اختر المستودع
4. أضف متغيرات البيئة:
   - `DATABASE_URL` — رابط Supabase
   - `ADMIN_USERNAME` — اسم مستخدم الأدمن
   - `ADMIN_PASSWORD` — كلمة مرور الأدمن
   - `PORT` — يُعيّن Railway هذا تلقائياً
5. في إعدادات الـ Build:
   - **Root Directory:** `artifacts/api-server`
   - **Build Command:** `cd ../.. && pnpm install && pnpm --filter @workspace/api-server run build`
   - **Start Command:** `node --enable-source-maps dist/index.mjs`

### ربط الـ Frontend بالـ API:
بعد نشر الـ API، احصل على رابطه (مثلاً `https://arabic-mods-api.up.railway.app`) وأضفه في Vercel كمتغير بيئة:
```
VITE_API_URL=https://arabic-mods-api.up.railway.app
```

---

## 4. المتغيرات المطلوبة

| المتغير | الوصف |
|---------|--------|
| `DATABASE_URL` | رابط اتصال PostgreSQL (Supabase أو غيره) |
| `ADMIN_USERNAME` | اسم مستخدم لوحة التحكم |
| `ADMIN_PASSWORD` | كلمة مرور لوحة التحكم |
| `SESSION_SECRET` | مفتاح سري للجلسات |
