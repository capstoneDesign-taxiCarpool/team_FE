import axios, { AxiosHeaders, AxiosRequestConfig } from "axios";
import { Alert } from "react-native";

import { authCode as accessTokenStorage, refreshCode as refreshTokenStorage } from "./storage";

const handleNotAuth = () => {
  accessTokenStorage.set();
  refreshTokenStorage.set();
  Alert.alert("로그인이 필요합니다.");
  return;
};

const initInstance = (config: AxiosRequestConfig, authContained: boolean) => {
  const instance = axios.create({
    timeout: 5000,
    ...config,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...config.headers,
    },
  });
  // 비동기 토큰 처리
  instance.interceptors.request.use(async (config) => {
    const controller = new AbortController();
    if (authContained) {
      const token = await accessTokenStorage.get();
      if (!token) {
        handleNotAuth();
        controller.abort();
        config.signal = controller.signal;
        return config;
      }
      if (!config.headers) config.headers = new AxiosHeaders();
      (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
    }
    config.signal = controller.signal;
    return config;
  });
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        const refreshToken = await refreshTokenStorage.get();
        if (refreshToken) {
          // refresh 수행
          try {
            const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {
              refreshToken,
            });
            accessTokenStorage.set(res.data.newAccessToken);
            refreshTokenStorage.set(res.data.refreshToken);
            error.config.headers.Authorization = `Bearer ${res.data.newAccessToken}`;
            return axios(error.config);
          } catch {
            return handleNotAuth();
          }
        } else {
          return handleNotAuth();
        }
      }
      return Promise.reject(error);
    },
  );
  return instance;
};

export const isAuthFail = (err: unknown) => !axios.isAxiosError(err);

export const BASE_URL = "https://knu-carpool.store";
/**
 * @param authContained 요청에 인증정보가 필요한가? (인증정보 없으면 로그인이 필요합니다 출력)
 * @param config 추가 헤더 config
 * @returns axios 인스턴스
 */
export const fetchInstance = (authContained?: boolean, config?: AxiosRequestConfig) => {
  return initInstance(
    {
      baseURL: BASE_URL,
      ...config,
    },
    authContained ?? false,
  );
};
