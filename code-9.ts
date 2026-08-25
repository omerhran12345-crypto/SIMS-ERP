import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function aiChat(messages: { role: string; content: string }[], dataContext: string) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "أنت مساعد SIMS ERP. تحلل بيانات الشركة وترد بالعربية والإنجليزية حسب لغة المستخدم. بيانات النظام الحالية:
" +
          dataContext,
      },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
  });
  return res.choices[0].message.content;
}
