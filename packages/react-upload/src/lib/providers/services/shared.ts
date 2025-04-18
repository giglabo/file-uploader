export const backoffRetry = async (fn: () => Promise<Response>, maxRetries = 0, baseDelay = 0): Promise<Response> => {
  let retries = 0;

  while (true) {
    try {
      const response = await fn();
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }
      const delay = Math.pow(2, retries) * baseDelay;
      await new Promise((resolve) => setTimeout(resolve, delay));
      retries++;
    }
  }
};

export const backoffRetryMetadata = <T>(maxRetries = 0, baseDelay = 0) => {
  return (fn: () => Promise<Response>): Promise<T> => {
    return backoffRetry(fn, maxRetries, baseDelay).then((response) => response as T);
  };
};
