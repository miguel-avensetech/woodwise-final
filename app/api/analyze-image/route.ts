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
      apiKey: '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',
    });

    console.log('Analyzing image for wood detection and defects...');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in wood furniture analysis. Your task is to:
1. Verify if the image shows wooden furniture
2. If it's wood, identify defects and their severity
3. Provide accurate, detailed analysis`
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

STEP 2: If it IS wood, identify defects:
- Scratches (light/moderate/severe)
- Mold or mildew (light/moderate/severe)
- Cracks or splits (light/moderate/severe)
- Discoloration
- Water damage
- Worn finish
- Or "No visible defects"

STEP 3: Determine severity level

Respond in this EXACT JSON format:
{
  "isWood": true or false,
  "reason": "Brief explanation if not wood",
  "defectType": "Primary defect (e.g., 'Scratches Detected', 'Mold Found', 'Cracks Detected', 'No Issues Found')",
  "defectDescription": "Detailed description of what you see",
  "severity": "Light" or "Moderate" or "Severe" (only if defects found),
  "defects": ["list", "of", "all", "defects", "found"]
}

If isWood is false, only include: isWood, reason.
Be accurate and thorough.`
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
