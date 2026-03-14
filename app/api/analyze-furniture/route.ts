import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { image, furnitureType, placement } = await request.json();

    if (!image || !furnitureType || !placement) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    // Check if API key is available
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    console.log('🔍 Detecting wood in image...');
    console.log('API Key loaded:', OPENAI_API_KEY ? 'Yes' : 'No');
    console.log('API Key length:', OPENAI_API_KEY?.length);
    console.log('API Key starts with:', OPENAI_API_KEY?.substring(0, 20));

    // First, detect if the image contains wood
    const woodDetectionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at identifying wooden furniture in images. Respond only with JSON."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and determine if it contains wooden furniture (chair, table, cabinet, etc.). 
    
Respond with ONLY a JSON object in this exact format:
{
  "isWood": true/false,
  "confidence": "high/medium/low",
  "reason": "brief explanation"
}`
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
      max_tokens: 200,
      temperature: 0.3,
    });

    const woodDetectionContent = woodDetectionResponse.choices[0].message.content;
    
    if (!woodDetectionContent) {
      throw new Error('No response from wood detection');
    }

    const woodJsonMatch = woodDetectionContent.match(/\{[\s\S]*\}/);
    if (!woodJsonMatch) {
      throw new Error('Invalid wood detection response');
    }

    const woodResult = JSON.parse(woodJsonMatch[0]);
    console.log(`✅ Wood detection: ${woodResult.isWood ? 'YES' : 'NO'} (${woodResult.confidence} confidence)`);
    console.log(`   Reason: ${woodResult.reason}`);

    if (!woodResult.isWood) {
      return NextResponse.json(
        { 
          error: 'NOT_WOOD',
          message: 'The image is not identified as wood. Please select or capture another image that has wood for treatment recommendation.'
        },
        { status: 400 }
      );
    }

    console.log('API Key exists:', OPENAI_API_KEY ? 'Yes' : 'No');
    console.log('API Key length:', OPENAI_API_KEY?.length);

    // Call OpenAI Vision API to analyze the image
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in wood furniture analysis and care. Your task is to:
1. First, verify if the image shows wooden furniture (not plastic, metal, or other materials)
2. If it's not wood, respond with isWood: false
3. If it is wood, identify any defects: scratches, mold, cracks, discoloration, water damage, etc.
4. Provide detailed treatment recommendations for mahogany wood care

Be thorough and accurate in your analysis.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image carefully:

STEP 1: Verify if this is wooden furniture
- Look for wood grain, texture, and characteristics
- If this is NOT wood (plastic, metal, fabric, etc.), respond with isWood: false

STEP 2: If it IS wood, identify the furniture type and placement
- Furniture type: ${furnitureType}
- Placement: ${placement}

STEP 3: Detect any defects
- Scratches (light, moderate, deep)
- Mold or mildew
- Cracks or splits
- Discoloration or stains
- Water damage
- Worn finish

STEP 4: Provide comprehensive treatment plan

Respond in this EXACT JSON format:
{
  "isWood": true or false,
  "reason": "Brief explanation if not wood",
  "furnitureType": "${furnitureType}",
  "placement": "${placement}",
  "defectType": "Primary defect found (e.g., 'Scratches Detected', 'Mold Found', 'Cracks Detected', 'No Issues Found')",
  "defectDescription": "Detailed description of the defect",
  "materialsNeeded": [
    {"name": "Material name", "quantity": "quantity"}
  ],
  "diyRecipes": [
    {
      "name": "Recipe name",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"]
    }
  ],
  "treatmentSteps": [
    {
      "title": "Phase name (e.g., Preparation, Cleaning, Repair, Protection)",
      "description": "Brief description",
      "steps": ["detailed step 1", "detailed step 2"]
    }
  ]
}

If isWood is false, only include: isWood, reason fields.
If no defects found, still provide maintenance recommendations.`
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
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from OpenAI');
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    // Check if it's wood
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
    console.error('Error analyzing furniture:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze furniture' },
      { status: 500 }
    );
  }
}
