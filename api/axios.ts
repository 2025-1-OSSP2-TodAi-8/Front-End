/* eslint-disable @typescript-eslint/no-unused-vars */
// ───────────────────────────────────────────────────────────────────────
// 파일: src/api/axios.ts
// ───────────────────────────────────────────────────────────────────────

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_URL, REFRESH_URL } from '@env'; // env에 REFRESH_URL 예: "/api/people/refresh"
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 1) 기본 Axios 인스턴스 생성
 *    - baseURL: 환경변수(API_URL)로부터 가져옴 (예: http://127.0.0.1:8000)
 *    - Content-Type: application/json
 */
const API = axios.create({
    baseURL: 'https://port-0-back-end-ma5ak09e7076228d.sel4.cloudtype.app',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 2) 요청 인터셉터 (Request Interceptor)
 *    - 요청을 보내기 전에 AsyncStorage에서 accessToken을 꺼내와,
 *      Authorization 헤더에 `Bearer <accessToken>`을 붙여준다.
 */
API.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (token && config.headers) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (err) {
            console.warn('[API] AsyncStorage 에서 토큰을 가져오는 중 에러 발생:', err);
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

/**
 * 3) 응답 인터셉터 (Response Interceptor)
 *    - 서버 응답 중 401(권한 거부) 에러가 발생하면,
 *      refreshToken을 사용하여 accessToken을 갱신한 뒤,
 *      실패했던 요청을 재시도한다.
 */
API.interceptors.response.use(
    (response: AxiosResponse) => {
        // 성공적인 응답은 그대로 반환
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 1) 에러 응답이 없거나, HTTP 401이 아닌 경우: 그냥 에러 던지기
        if (
            !error.response ||
            error.response.status !== 401 ||
            originalRequest._retry
        ) {
            return Promise.reject(error);
        }

        // 2) 여기부터는 401 에러(토큰 만료 가능성)
        originalRequest._retry = true; // 재시도 요청 표시

        try {
            // 3) AsyncStorage에서 refreshToken을 가져옴
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (!refreshToken) {
                // 리프레시 토큰도 없는 경우 → 로그아웃 처리 또는 사용자에게 재로그인 요구
                await AsyncStorage.removeItem('accessToken');
                await AsyncStorage.removeItem('refreshToken');
                return Promise.reject(error);
            }

            // 4) 서버에 refreshToken을 보내고, 새로운 accessToken을 받아옴
            const refreshResponse = await axios.post(
                `${API_URL}${REFRESH_URL}`,
                { refresh: refreshToken },
                { headers: { 'Content-Type': 'application/json' } }
            );
            // 예시 응답: { access: 'newAccessTokenString', refresh: 'newRefreshTokenString (선택)' }

            if (refreshResponse.status === 200 && refreshResponse.data) {
                const { access: newAccess, refresh: newRefresh } = refreshResponse.data as {
                    access: string;
                    refresh?: string;
                };

                // 5) AsyncStorage에 새로 받은 토큰 저장
                await AsyncStorage.setItem('accessToken', newAccess);
                if (newRefresh) {
                    // 서버가 새로운 refreshToken을 주는 경우 저장
                    await AsyncStorage.setItem('refreshToken', newRefresh);
                }

                // 6) 실패했던 원래 요청에 새로운 accessToken 헤더를 붙여서 재시도
                if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                }
                return API(originalRequest);
            } else {
                // 서버가 200이 아니거나 data가 비어 있는 경우 → 재로그인 필요
                await AsyncStorage.removeItem('accessToken');
                await AsyncStorage.removeItem('refreshToken');
                return Promise.reject(error);
            }
        } catch (refreshError) {
            console.error('[API] 리프레시 토큰 요청 중 에러:', refreshError);
            // 리프레시를 시도했으나 실패 → 토큰 삭제 후 에러 던지기
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            return Promise.reject(refreshError);
        }
    }
);

export default API;