import axios, { AxiosRequestConfig } from "axios";

const initInstance = (config: AxiosRequestConfig) => {
  const instance = axios.create({
    timeout: 5000,
    ...config,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...config.headers,
    },
  });

  return instance;
};

export const BASE_URL = "http://knu-carpool.store";
/**
 * @param config 추가 헤더 config
 * @returns
 */
export const fetchInstance = (config?: AxiosRequestConfig) => {
  return initInstance({
    baseURL: BASE_URL,
    ...config,
  });
};
