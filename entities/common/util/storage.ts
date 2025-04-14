export interface StorageKey {
  authCode?: string | null;
}

/**
 * @param key
 * @returns 입력된 key에 해당하는 secure-store 객체 생성
 */
const initStorage = <T extends keyof StorageKey>(key: T) => {
  const storageKey = String(key);
  const get = async (): Promise<StorageKey[T]> => {
    const value = localStorage.getItem(storageKey);
    return JSON.parse(value as string);
  };
  const set = (value?: StorageKey[T]) => {
    if (value === undefined || value == null) {
      return localStorage.removeItem(storageKey);
    }
    localStorage.setItem(storageKey, JSON.stringify(value));
  };
  return { get, set };
};

export const authCode = initStorage("authCode");
