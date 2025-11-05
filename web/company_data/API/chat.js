import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "No message received" });

  const faq = require("../company_data/company_faq.json");

  // Try to find relevant info from company_faq.json
  let companyInfo = "";
  for (const [key, value] of Object.entries(faq)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      companyInfo += `${key}: ${value}\n`;
    }
  }

  const prompt = `
You are a friendly demo chatbot for a real estate company.
If company info is provided, use it to answer.
Company info:
${companyInfo || "None available."}
User question: ${message}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300
    })
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn’t find an answer.";

  res.status(200).json({ reply });
}
