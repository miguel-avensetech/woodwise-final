import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Hardcoded API key to bypass environment variable issues
const OPENAI_API_KEY = "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";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { image, furnitureType, placement, aiAnalysis } = await request.json();

    if (!image || !furnitureType || !placement || !aiAnalysis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Generating treatment plan...');

    // Call OpenAI to generate treatment plan
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in mahogany wood furniture care and restoration. Generate comprehensive treatment plans based on defect analysis.`
        },
        {
          role: "user",
          content: `Generate a detailed treatment plan for this wooden furniture:

FURNITURE DETAILS:
- Type: ${furnitureType}
- Placement: ${placement}

AI ANALYSIS RESULTS:
- Defect Type: ${aiAnalysis.defectType}
- Description: ${aiAnalysis.defectDescription}
- Severity: ${aiAnalysis.severity || 'Not specified'}
- Defects Found: ${aiAnalysis.defects?.join(', ') || 'None'}

Provide a comprehensive treatment plan in this EXACT JSON format:
{
  "furnitureType": "${furnitureType}",
  "placement": "${placement}",
  "defectType": "${aiAnalysis.defectType}",
  "defectDescription": "${aiAnalysis.defectDescription}",
  "severity": "${aiAnalysis.severity || 'N/A'}",
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
      "title": "Phase name (e.g., Preparation, Cleaning, Repair, Drying, Protection)",
      "description": "Brief description",
      "steps": ["detailed step 1", "detailed step 2", "detailed step 3"]
    }
  ]
}

Provide practical, actionable steps for mahogany wood care.
Include 5-7 treatment phases.
Be specific and detailed.`
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
    console.error('Error generating treatment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate treatment' },
      { status: 500 }
    );
  }
}
