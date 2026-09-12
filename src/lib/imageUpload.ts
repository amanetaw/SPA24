/**
 * Utility to process device image files with client-side canvas resizing
 * and base64 data URL conversion for instant, reliable uploads.
 */

export interface ProcessedImage {
  url: string;
  caption: string;
  alt_text: string;
  is_primary: boolean;
}

/**
 * Format a raw filename into a human-readable title
 * e.g. "ayurvedic_steam_room_01.jpg" -> "Ayurvedic Steam Room"
 */
export function formatFilenameToTitle(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  const clean = withoutExt.replace(/[-_]+/g, ' ').replace(/\d+$/, '').trim();
  if (!clean) return 'Spa Interior Photo';
  return clean
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Resize and compress an image file client-side to prevent gigantic payloads
 * Returns a high-quality data URL string
 */
export async function fileToOptimizedDataUrl(file: File, maxDimension = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file from device.'));

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') {
        return reject(new Error('FileReader did not return a valid string.'));
      }

      // If SVG or small image, return as-is
      if (file.type === 'image/svg+xml' || file.size < 150 * 1024) {
        return resolve(result);
      }

      const img = new Image();
      img.onerror = () => resolve(result); // Fallback to raw data URL on decode failure
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(result);
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const optimizedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(optimizedDataUrl);
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Process one or multiple File objects from a device file input or drop event
 */
export async function processDeviceImageFiles(
  files: FileList | File[],
  businessName = 'Spa Listing'
): Promise<ProcessedImage[]> {
  const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (fileArray.length === 0) return [];

  const results: ProcessedImage[] = [];

  for (const file of fileArray) {
    try {
      const dataUrl = await fileToOptimizedDataUrl(file);
      const title = formatFilenameToTitle(file.name);
      results.push({
        url: dataUrl,
        caption: title,
        alt_text: `${title} at ${businessName} - Verified Wellness & Massage`,
        is_primary: false
      });
    } catch (err) {
      console.error('Error processing device image file:', file.name, err);
    }
  }

  return results;
}
