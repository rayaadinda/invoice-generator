import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// SWR fetcher function (unwraps the NestJS TransformInterceptor { data } envelope)
export const fetcher = (url: string) => api.get(url).then((res) => res.data?.data ?? res.data);
