import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Missing image' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('Analyzing image for wood detection and defects');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in wood furniture analysis. Your task is to:
1. Verify if the image shows wooden furniture
2. If it's wood, identify ONLY the SINGLE MOST SEVERE defect from: CRACKS, SCRATCHES, or MOLD
3. If multiple defects exist, return ONLY the one that causes the most damage
4. Severity ranking: Severe > Moderate > Light. If same severity, prioritize: Cracks > Mold > Scratches
5. Provide accurate, detailed analysis of ONLY that one defect`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image:

STEP 1: Is this wooden furniture?
- Look for wood grain, texture, natural patterns
- If NOT wood (plastic, metal, fabric, etc.), respond with isWood: false

STEP 2: If it IS wood, identify ONLY the SINGLE MOST SEVERE defect from these 3 types:
- Scratches (light/moderate/severe)
- Mold or mildew (light/moderate/severe)
- Cracks or splits (light/moderate/severe)

CRITICAL RULE: Return ONLY ONE defect type - the MOST SEVERE one
- If multiple defects exist, analyze which one causes the MOST DAMAGE to the wood
- Severity ranking: Severe > Moderate > Light
- If same severity level, prioritize: Cracks > Mold > Scratches
- Example: If "light mold" and "severe scratches" exist, return ONLY "Scratches Detected"
- Example: If "moderate cracks" and "moderate scratches" exist, return ONLY "Cracks Detected"

IGNORE all other defect types (discoloration, water damage, worn finish, peeling, dents, etc.)

STEP 3: Determine severity level of the SINGLE most severe defect

Respond in this EXACT JSON format:
{
  "isWood": true or false,
  "reason": "Brief explanation if not wood",
  "defectType": "ONLY ONE defect (ONLY: 'Scratches Detected', 'Mold Found', or 'Cracks Detected')",
  "defectDescription": "Detailed description of ONLY the most severe defect",
  "severity": "Light" or "Moderate" or "Severe" (only if defects found)
}

If isWood is false, only include: isWood, reason.
Return ONLY the MOST SEVERE defect, not multiple defects.
Be accurate and focus on the single most damaging issue.`
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.5,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from OpenAI');
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    if (analysisData.isWood === false) {
      return NextResponse.json(
        { 
          error: 'Not wood furniture',
          message: analysisData.reason || 'The image does not appear to show wooden furniture. Please upload an image of wooden furniture.',
          isWood: false
        },
        { status: 400 }
      );
    }

    return NextResponse.json(analysisData);

  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
