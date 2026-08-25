// بدل: const hash = await bcrypt.hash("admin123", 10);
const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@SIMS2026!", 10);
