import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// Force structured output via tool_use — Claude MUST call this tool,
// so we always get clean JSON back with no parsing gymnastics.
const NUTRITION_TOOL: Anthropic.Tool = {
  name: 'log_nutrition',
  description: 'Log the estimated nutrition values for the food',
  input_schema: {
    type: 'object' as const,
    properties: {
      description: { type: 'string', description: 'Short label, e.g. "Banana + toned milk + dry fruits"' },
      calories:    { type: 'number', description: 'Total kcal' },
      protein_g:   { type: 'number', description: 'Protein in grams' },
      carbs_g:     { type: 'number', description: 'Carbohydrates in grams' },
      fat_g:       { type: 'number', description: 'Fat in grams' },
    },
    required: ['description', 'calories', 'protein_g', 'carbs_g', 'fat_g'],
  },
}

const SYSTEM = `You are a nutrition expert with deep knowledge of Indian food.
Estimate realistic macro-nutrients for whatever food the user describes or shows.
Always call the log_nutrition tool — never reply with plain text.
Use conservative estimates. For mixed items, sum each component.`

export async function POST(req: Request) {
  const { type, content, mimeType } = await req.json()

  const userContent: Anthropic.MessageParam['content'] =
    type === 'image'
      ? [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: (mimeType ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: content,
            },
          },
          { type: 'text', text: 'Estimate the nutrition for all food visible in this image.' },
        ]
      : `Estimate nutrition for: ${content}`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM,
      tools: [NUTRITION_TOOL],
      tool_choice: { type: 'any' },
      messages: [{ role: 'user', content: userContent }],
    })

    // Find the tool_use block — guaranteed by tool_choice: any
    const toolBlock = response.content.find(b => b.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new Error('No tool call in response')
    }

    const input = toolBlock.input as Record<string, unknown>

    return Response.json({
      description: String(input.description ?? 'Meal'),
      calories:    Math.round(Number(input.calories)  || 0),
      protein_g:   Math.round(Number(input.protein_g) || 0),
      carbs_g:     Math.round(Number(input.carbs_g)   || 0),
      fat_g:       Math.round(Number(input.fat_g)     || 0),
    })
  } catch (err) {
    console.error('[analyze-food]', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 422 }
    )
  }
}
