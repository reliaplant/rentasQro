import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5,          // Reduced from 0.8 to 0.5
    maxWidthOrHeight: 1280,   // Reduced from 1920 to 1280
    useWebWorker: true,
    initialQuality: 0.7,      // Added initial quality setting
    maxIteration: 10,         // Added max iterations for compression
    fileType: 'image/jpeg'    // Force JPEG format which typically results in smaller files
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    
    // Double-check the size and compress again if still too large
    if (compressedFile.size > 1000000) {  // If still larger than ~1MB
      const moreCompressedOptions = {
        ...options,
        maxSizeMB: 0.3,
        initialQuality: 0.5
      };
      return await imageCompression(compressedFile, moreCompressedOptions);
    }
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}

export async function compressImageToDataURL(file: File): Promise<string> {
  const compressedFile = await compressImage(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(compressedFile);
  });
}
