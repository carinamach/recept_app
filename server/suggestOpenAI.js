/**
 * Call OpenAI Chat Completions. Requires OPENAI_API_KEY in environment.
 * @param {{ mood?: string, ingredients?: string, recipeTitles?: string[] }} input
 * @returns {Promise<string[]>}
 */
export async function openAISuggestRecipes(input) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const err = new Error('OPENAI_API_KEY is not set');
    /** @type {any} */ (err).code = 'NO_KEY';
    throw err;
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const titles = input.recipeTitles?.filter(Boolean) ?? [];
  const titlesBlock =
    titles.length > 0
      ? `\nAnvändaren har redan dessa recept i appen (för inspiration, kopiera inte ordagrant): ${titles.slice(0, 12).join(', ')}.`
      : '';

  const userMsg = `Stämning / kök: ${input.mood?.trim() || 'valfri'}
Det som finns hemma: ${input.ingredients?.trim() || 'inte angivet'}${titlesBlock}

Ge exakt 3 korta matidéer (en mening per rad). Svara bara med de 3 raderna, ingen numrering, inga punkter.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'Du är en kreativ hemmakock som föreslår konkreta rätter. Svara med exakt tre rader, varje rad ett eget förslag.',
        },
        { role: 'user', content: userMsg },
      ],
      max_tokens: 500,
      temperature: 0.85,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim() || '';
  const lines = text
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/^[-*•]\s*/, '')
        .trim(),
    )
    .filter(Boolean);

  return lines.slice(0, 5);
}
