import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const PROMPT = `You are a nutrition expert. Analyze the food described and return ONLY a JSON object with this exact shape:
{"description":"short label for the meal","calories":number,"protein_g":number,"carbs_g":number,"fat_g":number}

Rules:
- Use realistic Indian food nutrition data where relevant
- Estimate conservatively (don't inflate calories)
- description should be a short label like "Chicken + chapati + dal"
- Return ONLY the JSON — no explanation, no markdown`

export async function POST(req: Request) {
  const { type, content, mimeType } = await req.json()

  try {
    const userContent =
      type === 'image'
        ? [
            {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: (mimeType ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: content,
              },
            },
            { type: 'text' as const, text: 'Estimate the nutrition for the food in this image.' },
          ]
        : [{ type: 'text' as const, text: `Food: ${content}` }]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: PROMPT,
      messages: [{ role: 'user', content: userContent }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    const json = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return Response.json({
      description: String(json.description ?? 'Meal'),
      calories: Math.round(Number(json.calories) || 0),
      protein_g: Math.round(Number(json.protein_g) || 0),
      carbs_g: Math.round(Number(json.carbs_g) || 0),
      fat_g: Math.round(Number(json.fat_g) || 0),
    })
  } catch {
    return Response.json(
      { error: 'Could not analyze food. Try a more specific description.' },
      { status: 422 }
    )
  }
}
