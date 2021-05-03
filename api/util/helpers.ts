export const base64This = (str: string) => Buffer.from(str).toString('base64');

export const awaitError = (prom: Promise<any>): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await prom;
      resolve(data);
    } catch (error) {
      resolve({ error: error });
    }
  });
};

/**
 * Returns a promise and accepts function with callback function.
 * This function handles the async functions try/catch situation and rejects when error is through
 * @param fu async function to call and resolve
 */
export const promisify = (fu: Function): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      await fu(resolve, reject);
    } catch (error) {
      reject(error);
    }
  });
};

export const nonEmpty = (s: any): boolean => {
  if (Array.isArray(s) && s.length > 0) {
    return true;
  }
  if (typeof s === 'object' && Object.keys(s).length > 0) {
    return false;
  }

  return Boolean(s);
};
