import /*axios,*/ { AxiosError } from 'axios';
//import { axiosInstance } from './axiosInstance';
import type { AxiosRequestConfig} from 'axios'
import axios from '../api/axios.tsx';

export interface ApiRequestOptions {
    subscriptionRequired?: boolean;
}

type RequestAction<T> = () => Promise<T>;

// Injected dependencies — swap these for your actual implementations
interface ApiClientDeps {
    getAuthHeaders: () => Record<string, string>;
    logout: () => void;
    //showLoginDialog: () => Promise<boolean>;
    //resetUser: () => void;
    //navigate: (path: string) => void;
}

export function createApiClient(deps: ApiClientDeps) {
    const { getAuthHeaders, logout/*, showLoginDialog, resetUser, navigate*/ } = deps;

    function getConfig(): AxiosRequestConfig {
        return { headers: getAuthHeaders() };
    }

    async function doRequest<T>(
        action: RequestAction<T>,
        options?: ApiRequestOptions
    ): Promise<T> {
        while (true) {
            try {
                return await action();
            } catch (err) {
                const error = err as AxiosError;

                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }

                // if (error.response?.status === 401) {
                //     logout();
                //     const loggedIn = await showLoginDialog();
                //     if (loggedIn) continue; // retry after successful login
                // }

                // if (options?.subscriptionRequired && error.response?.status === 402) {
                //     resetUser();
                //     navigate('/profile');
                //     return undefined as unknown as T;
                // }

                throw error;
            }
        }
    }

    return {
        get<T>(url: string, options?: ApiRequestOptions): Promise<T> {
            return doRequest(
                () => axios.get<T>(url, getConfig()).then((r) => r.data),
                options
            );
        },

        post<T>(url: string, body: unknown, options?: ApiRequestOptions): Promise<T> {
            return doRequest(
                () => axios.post<T>(url, body, getConfig()).then((r) => r.data),
                options
            );
        },

        patch<T>(url: string, body: unknown, options?: ApiRequestOptions): Promise<T> {
            return doRequest(
                () => axios.patch<T>(url, body, getConfig()).then((r) => r.data),
                options
            );
        },

        delete<T>(url: string, options?: ApiRequestOptions): Promise<T> {
            return doRequest(
                () => axios.delete<T>(url, getConfig()).then((r) => r.data),
                options
            );
        },
    };
}

// Singleton — wire up your real deps here
import { authService } from './authService';
//import { appRouter } from './appRouter';

export const apiClient = createApiClient({
    getAuthHeaders: () => authService.getAuthHeaders(),
    logout: () => authService.logout(),
    //showLoginDialog: () => authService.showLoginDialog(),
    //resetUser: () => authService.resetUser(),
    //navigate: (path) => appRouter.navigate(path),
});