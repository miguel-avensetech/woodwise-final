// Utility functions for image processing

/**
 * Compress an image to reduce file size while maintaining quality
 * @param base64Image - Base64 encoded image string
 * @param maxSizeKB - Maximum size in KB (default: 800KB to stay under Firestore 1MB limit)
 * @param quality - Initial quality (0-1, default: 0.8)
 * @returns Compressed base64 image string
 */
export async function compressImage(
  base64Image: string,
  maxSizeKB: number = 800,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions to reduce size if needed
      const maxDimension = 1920; // Max width or height
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Try to compress with decreasing quality until size is acceptable
      let currentQuality = quality;
      let compressedImage = canvas.toDataURL('image/jpeg', currentQuality);
      
      // Calculate size in KB
      const sizeInKB = (compressedImage.length * 3) / 4 / 1024;
      
      // If still too large, reduce quality further
      while (sizeInKB > maxSizeKB && currentQuality > 0.1) {
        currentQuality -= 0.1;
        compressedImage = canvas.toDataURL('image/jpeg', currentQuality);
        const newSizeInKB = (compressedImage.length * 3) / 4 / 1024;
        
        if (newSizeInKB <= maxSizeKB) {
          break;
        }
      }
      
      resolve(compressedImage);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64Image;
  });
}
