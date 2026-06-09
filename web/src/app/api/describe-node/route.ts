import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filePath, nodeType, exports, connections, usedBy } = body;

    const outCount = connections?.length ?? 0;
    const inCount = usedBy?.length ?? 0;

    const prompt = `You are a senior Next.js architect. Analyse this codebase file and return ONLY a raw JSON object — no markdown fences, no extra text, no explanation.

Return exactly this JSON structure:
{
  "summary": "2-3 sentence precise technical description",
  "role": "one of: Entry Point | Data Layer | UI Component | Business Logic | Configuration | Type Definition | Utility | Layout | API Handler",
  "complexity": "low or medium or high",
  "complexityReason": "one sentence explaining the complexity rating",
  "responsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
  "patterns": ["PatternName: brief description", "PatternName: brief description"],
  "dataFlow": "how data enters, gets transformed, and leaves this file",
  "sideEffects": ["external side effect or dependency 1", "side effect 2"],
  "recommendations": ["actionable improvement 1", "improvement 2"],
  "couplingScore": 5,
  "couplingReason": "one sentence about coupling based on ${outCount} outgoing and ${inCount} incoming connections"
}

FILE:
- Path: ${filePath}
- Type: ${nodeType}
- Exports: ${exports?.join(', ') || 'default only'}
- Imports from (${outCount}): ${(connections || []).slice(0, 8).join(', ') || 'none'}
- Imported by (${inCount}): ${(usedBy || []).slice(0, 8).join(', ') || 'none'}

Be specific to Next.js App Router patterns (RSC, server actions, route handlers, layouts, etc).
Return ONLY the JSON object, starting with { and ending with }.`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a code analysis API. Always respond with valid JSON only. Never include markdown, code fences, or any text outside the JSON object.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq API error ${groqRes.status}: ${errText.slice(0, 200)}`);
    }

    const groqData = await groqRes.json();
    const rawText = groqData.choices[0].message.content.trim();

    // Parse JSON — Groq with response_format:json_object always returns valid JSON
    try {
      const parsed = JSON.parse(rawText);
      // Ensure couplingScore is a number
      if (typeof parsed.couplingScore === 'string') {
        parsed.couplingScore = parseInt(parsed.couplingScore, 10) || 5;
      }
      return NextResponse.json({ description: parsed });
    } catch {
      // JSON parse failed despite response_format — extract manually
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ description: parsed });
      }
      throw new Error('Could not parse AI response as JSON');
    }
  } catch (error: any) {
    console.error('[describe-node] Error:', error?.message ?? error);
    return NextResponse.json(
      { error: error?.message ?? 'Analysis failed' },
      { status: 500 }
    );
  }
}
