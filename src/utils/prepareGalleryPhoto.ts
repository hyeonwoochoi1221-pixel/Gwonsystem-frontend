const MAX_UPLOAD_BYTES = 1024 * 1024;
const MAX_INPUT_BYTES = 30 * 1024 * 1024;

export async function prepareGalleryPhoto(original: File) {
  if (!['image/jpeg', 'image/png'].includes(original.type)) {
    throw new Error('JPG 또는 PNG 사진을 선택해 주세요. HEIC 사진은 JPG로 변환해 주세요.');
  }
  if (!original.size) throw new Error('비어 있는 사진 파일입니다. 다른 사진을 선택해 주세요.');
  if (original.size > MAX_INPUT_BYTES) throw new Error('원본 사진은 최대 30MB까지 지원합니다. 용량을 줄인 후 선택해 주세요.');

  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(original); }
  catch { throw new Error('사진을 읽을 수 없습니다. 손상되지 않은 JPG 또는 PNG를 선택해 주세요.'); }
  try {
    if (bitmap.width * bitmap.height > 60_000_000) throw new Error('6천만 화소를 초과한 사진입니다. 해상도를 줄인 후 선택해 주세요.');
    if (original.size <= MAX_UPLOAD_BYTES && bitmap.width * bitmap.height <= 20_000_000) {
      return { file: original, message: `원본 사용 · ${bitmap.width} × ${bitmap.height}px · ${Math.ceil(original.size / 1024)}KB` };
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('이 브라우저에서는 사진 자동 변환을 지원하지 않습니다. 1MB 이하 사진을 선택해 주세요.');
    let longestSide = Math.min(2560, Math.max(bitmap.width, bitmap.height));
    for (let attempt = 0; attempt < 6; attempt++) {
      const ratio = longestSide / Math.max(bitmap.width, bitmap.height);
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      // JPEG conversion gives transparent PNGs a white background.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.9, 0.8, 0.7]) {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (blob && blob.size <= MAX_UPLOAD_BYTES) {
          const file = new File([blob], original.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
          return { file, message: `자동 최적화 · ${Math.ceil(original.size / 1024)}KB → ${Math.ceil(file.size / 1024)}KB · ${bitmap.width} × ${bitmap.height}px → ${canvas.width} × ${canvas.height}px (JPG)` };
        }
      }
      longestSide = Math.floor(longestSide * 0.8);
    }
    throw new Error('사진을 1MB 이하로 줄이지 못했습니다. 해상도나 용량을 줄인 후 선택해 주세요.');
  } finally { bitmap.close(); }
}
