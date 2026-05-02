/**
 * Wood Classifier API Client
 * Handles communication with YOLOv8 wood classification service
 */

export interface WoodClassificationResult {
  is_mahogany: boolean;
  wood_type: string;
  confidence: number;
  features: {
    color: string;
    texture: string;
    grain_pattern: string;
  };
  all_probabilities?: {
    [key: string]: number;
  };
}

export interface ClassificationError {
  error: string;
  message?: string;
  details?: string;
}

/**
 * Classify wood from base64 image
 */
export async function classifyWood(
  base64Image: string
): Promise<WoodClassificationResult> {
  try {
    const response = await fetch('/api/classify-wood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Classification failed');
    }

    return data;
  } catch (error: any) {
    console.error('Wood classification error:', error);
    throw error;
  }
}

/**
 * Check if ML API is available
 */
export async function checkMLApiHealth(): Promise<boolean> {
  try {
    const mlApiUrl = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:5000';
    const response = await fetch(`${mlApiUrl}/health`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'healthy' && data.model_loaded === true;
  } catch (error) {
    console.error('ML API health check failed:', error);
    return false;
  }
}

/**
 * Convert File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(confidence: number): {
  level: 'high' | 'medium' | 'low';
  description: string;
  color: string;
} {
  if (confidence >= 85) {
    return {
      level: 'high',
      description: 'Very confident',
      color: 'text-green-600',
    };
  } else if (confidence >= 70) {
    return {
      level: 'medium',
      description: 'Moderately confident',
      color: 'text-yellow-600',
    };
  } else {
    return {
      level: 'low',
      description: 'Low confidence',
      color: 'text-red-600',
    };
  }
}
