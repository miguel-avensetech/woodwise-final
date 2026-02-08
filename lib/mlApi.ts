// ML API integration for mahogany detection

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:5000';

export interface MLPrediction {
  is_mahogany: boolean;
  confidence: number;
  wood_type: string;
  defects: Defect[];
  status: string;
  recommendations: Recommendation[];
}

export interface Defect {
  type: string;
  severity: string;
  confidence: number;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: string;
}

export async function analyzeMahoganyImage(file: File): Promise<MLPrediction> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${ML_API_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

export async function checkMLApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_API_URL}/health`);
    const data = await response.json();
    return data.status === 'healthy' && data.model_loaded;
  } catch (error) {
    console.error('ML API health check failed:', error);
    return false;
  }
}
