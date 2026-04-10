import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { image, furnitureType, placement, aiAnalysis } = await request.json();

    if (!image || !furnitureType || !placement || !aiAnalysis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: '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',
    });

    console.log('Generating treatment plan...');

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

IMPORTANT: Generate a comprehensive treatment plan with SPECIFIC DATES AND TIMES for each maintenance task.
Current date and time: ${new Date().toISOString()}

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
      "steps": ["detailed step 1", "detailed step 2", "detailed step 3"],
      "scheduledDate": "ISO 8601 date string (e.g., 2026-04-15T10:00:00.000Z)",
      "duration": "estimated time in hours (e.g., 2)"
    }
  ],
  "maintenanceSchedule": [
    {
      "title": "Maintenance task title",
      "description": "What needs to be done",
      "scheduledDate": "ISO 8601 date string",
      "frequency": "once, weekly, monthly, quarterly, semi-annually, annually",
      "priority": "low, medium, high"
    }
  ]
}

SCHEDULING GUIDELINES:
- Treatment steps should be scheduled starting from today, with appropriate intervals (e.g., drying time 24-48 hours)
- Include immediate tasks (today), short-term tasks (1-7 days), and follow-up tasks (1-2 weeks)
- Maintenance schedule should include:
  * First inspection (1 week after treatment completion)
  * Monthly check (30 days)
  * Quarterly maintenance (90 days)
  * Semi-annual deep inspection (180 days)
  * Annual refinishing (365 days)
- Use realistic time estimates based on the defect severity
- All dates must be in ISO 8601 format with timezone
- Schedule times during typical working hours (9 AM - 5 PM)

Provide practical, actionable steps for mahogany wood care.
Include 5-7 treatment phases with specific dates.
Be specific and detailed with timing.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

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
