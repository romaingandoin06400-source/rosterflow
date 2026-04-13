import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { action, contact } = await req.json()

    if (action !== 'summarize_contact') {
      return new Response(JSON.stringify({ error: 'Unknown action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const grokKey = Deno.env.get('GROK_API_KEY')
    if (!grokKey) throw new Error('GROK_API_KEY not set')

    const prompt = `You are a personal dating advisor. Given the following information about someone the user is dating or talking to, write a concise, insightful 2-3 sentence relationship summary. Be warm, honest, and helpful.

Contact details:
- Name: ${contact.name}
- Current stage: ${contact.stage}
- Met via: ${contact.source_app || 'unknown'}
- Notes: ${contact.notes || 'None provided'}

Write the summary in second person ("You met...") and keep it under 80 words.`

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Grok API error: ${err}`)
    }

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content?.trim()

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
