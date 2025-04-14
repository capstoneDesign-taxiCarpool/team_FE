import * as SecureStore from "expo-secure-store";

import { StorageKey } from "./storage";

const initStorage = <T extends keyof StorageKey>(key: T) => {
  const storageKey = String(key);
  const get = async (): Promise<StorageKey[T]> => {
    return await SecureStore.getItemAsync(storageKey);
  };
  const set = async (value?: StorageKey[T]) => {
    if (value === undefined || value == null) {
      return await SecureStore.deleteItemAsync(storageKey);
    }
    return await SecureStore.setItemAsync(storageKey, value);
  };
  return { get, set };
};

export const authCode = initStorage("authCode");
