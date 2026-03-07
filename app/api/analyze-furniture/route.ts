import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@/lib/config';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
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

    // Check if API key is available
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
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
          content: `You are an expert in mahogany wood furniture care and maintenance. Analyze furniture images and provide detailed treatment recommendations. Always assume the furniture is made of mahogany wood.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${placement} ${furnitureType} made of mahogany wood. Identify any defects (cracks, scratches, mold, discoloration, water damage, etc.) and provide:

1. Defect type and severity
2. Materials needed for treatment
3. DIY solution recipes (if applicable)
4. Step-by-step treatment guide with multiple phases (Preparation, Initial Cleaning, Deep Cleaning, Drying, Protection & Prevention)

Format your response as JSON with this structure:
{
  "furnitureType": "${furnitureType}",
  "placement": "${placement}",
  "defectType": "string (e.g., 'Crack Detected', 'Mold Found')",
  "defectDescription": "string (brief description)",
  "materialsNeeded": [
    {"name": "Material name", "quantity": "optional quantity"}
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
      "title": "Phase name",
      "description": "Brief description",
      "steps": ["step 1", "step 2", "step 3"]
    }
  ]
}

Provide comprehensive, practical advice for mahogany furniture care.`
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

    const treatmentData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(treatmentData);

  } catch (error: any) {
    console.error('Error analyzing furniture:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze furniture' },
      { status: 500 }
    );
  }
}
