function required(v, name) {
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function defaultBaseUrl() {
  return "https://api.openai.com/v1";
}

export async function callOpenAIChatCompletions({ model, baseUrl, apiKey, prompt }) {
  required(apiKey, "apiKey");
  required(model, "model");
  required(prompt?.user, "prompt.user");

  const url = new URL("/chat/completions", baseUrl || defaultBaseUrl());
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(prompt.system ? [{ role: "system", content: prompt.system }] : []),
        { role: "user", content: prompt.user },
      ],
      temperature: 0.2,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data)?.slice(0, 800);
    throw new Error(`OpenAI API error (${res.status}): ${msg}`);
  }

  const text =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    "";
  if (!text) throw new Error("Empty response from provider.");
  return String(text);
}

