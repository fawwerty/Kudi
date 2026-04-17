import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// For physical devices, use your machine's local IP (detected as 172.20.10.4)
// For Android emulator, use 10.0.2.2. For iOS emulator, use localhost.
const LOCAL_IP = "172.20.10.4"; // CURRENT LOCAL IP
const PROD_URL = "https://kudi-p2wf.onrender.com/api";

let isRefreshing = false;

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "android") return `http://${LOCAL_IP}:5000/api`;
    return `http://localhost:5000/api`;
  }
  return PROD_URL;
};

export const API_BASE_URL = getBaseUrl();

async function getToken() {
  try {
    return await AsyncStorage.getItem("accessToken");
  } catch (e) {
    return null;
  }
}

async function refreshTokens() {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    // Clear everything if refresh fails
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
    throw new Error("Session expired. Please log in again.");
  }

  const data = await response.json();
  await AsyncStorage.setItem("accessToken", data.accessToken);
  await AsyncStorage.setItem("refreshToken", data.refreshToken);
  return data.accessToken;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  let token = await getToken();
  const headers = new Headers(options.headers || {});
  
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Token Expiration (401)
  if (response.status === 401 && !isRefreshing) {
    isRefreshing = true;
    try {
      const newToken = await refreshTokens();
      isRefreshing = false;
      // Retry request with new token
      headers.set("Authorization", `Bearer ${newToken}`);
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      if (!retryResponse.ok) throw new Error(await retryResponse.text());
      return retryResponse.json();
    } catch (err) {
      isRefreshing = false;
      throw err;
    }
  }

  if (!response.ok) {
    let errorMsg = "API request failed";
    let detail = "";
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
      detail = JSON.stringify(errorData);
    } catch { /* ignore */ }
    
    console.error(`❌ API Error [${endpoint}]:`, errorMsg, detail);
    throw new Error(errorMsg);
  }

  return response.json();
}

