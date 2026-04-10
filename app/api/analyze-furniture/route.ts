import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { image, furnitureType, placement } = await request.json();

    if (!image || !furnitureType || !placement) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Hardcoded API key - will work immediately
    const openai = new OpenAI({
      apiKey: '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',
    });

    console.log('🔍 Detecting wood in image...');

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
              text: `Analyze this image and determine if it contains wooden furniture. Respond with ONLY a JSON object in this exact format:
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

    if (!woodResult.isWood) {
      return NextResponse.json(
        { 
          error: 'NOT_WOOD',
          message: 'The image is not identified as wood. Please select or capture another image that has wood for treatment recommendation.'
        },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in wood furniture analysis and care.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this wooden furniture image:

Furniture type: ${furnitureType}
Placement: ${placement}

Detect any defects and provide a comprehensive treatment plan.

Respond in this EXACT JSON format:
{
  "isWood": true,
  "furnitureType": "${furnitureType}",
  "placement": "${placement}",
  "defectType": "Primary defect found",
  "defectDescription": "Detailed description",
  "materialsNeeded": [{"name": "Material", "quantity": "qty"}],
  "diyRecipes": [{"name": "Recipe", "ingredients": [], "instructions": []}],
  "treatmentSteps": [{"title": "Phase", "description": "desc", "steps": []}]
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

    const analysisData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(analysisData);

  } catch (error: any) {
    console.error('Error analyzing furniture:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze furniture' },
      { status: 500 }
    );
  }
}
