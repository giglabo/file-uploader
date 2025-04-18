export const chunkId = (id: string, num: number) => `${id}-${num}`;

export const hexToBase64 = (hexStr: string) => {
  let base64 = '';
  for (let i = 0; i < hexStr.length; i++) {
    base64 += !((i - 1) & 1) ? String.fromCharCode(parseInt(hexStr.substring(i - 1, i + 1), 16)) : '';
  }
  return btoa(base64);
};

export function normalizeRawError(error: any) {
  if (error instanceof Error) {
    return JSON.stringify({
      _error: error,
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }

  if (error instanceof Object) {
    return error.toString();
  }

  try {
    return JSON.stringify(error);
  } catch (e) {
    console.error(e, 'Failed to stringify error');
  }
}
