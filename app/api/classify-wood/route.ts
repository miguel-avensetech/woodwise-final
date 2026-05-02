import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route to classify wood using YOLOv8 model
 * Connects to the Python Flask API running on localhost:5000
 */
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Missing image data' },
        { status: 400 }
      );
    }

    // Check if ML API is configured
    const mlApiUrl = process.env.ML_API_URL || 'http://localhost:5000';
    
    console.log('Sending image to YOLOv8 classifier...');

    // Send image to Python Flask API
    const response = await fetch(`${mlApiUrl}/predict-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'ML API request failed');
    }

    const result = await response.json();

    // Return classification results
    return NextResponse.json({
      success: true,
      is_mahogany: result.is_mahogany,
      wood_type: result.wood_type,
      confidence: result.confidence,
      features: result.features,
      all_probabilities: result.all_probabilities,
    });

  } catch (error: any) {
    console.error('Error classifying wood:', error);
    
    // Check if it's a connection error
    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: 'ML API not available',
          message: 'The wood classification service is not running. Please start the Python API server.',
          details: 'Run: cd wood-classifier && python app.py'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to classify wood',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
