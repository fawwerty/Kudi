export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
let isRefreshing = false;

function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

async function refreshTokens() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired");
  }

  const data = await response.json();
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data.accessToken;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  let token = getToken();
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
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    if (refreshToken) {
      isRefreshing = true;
      try {
        const newToken = await refreshTokens();
        isRefreshing = false;
        // Retry with new token
        headers.set("Authorization", `Bearer ${newToken}`);
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
        if (!retryResponse.ok) return retryResponse.json(); 
        return retryResponse.json();
      } catch (err) {
        isRefreshing = false;
        // Silent fail for background auth checks
        if (endpoint === "/auth/me") return null;
        throw err;
      }
    } else {
      // No refresh token and 401? User is just not logged in.
      if (endpoint === "/auth/me") return null;
    }
  }

  if (!response.ok) {
    // Return early for 401s without throwing to keep console clean
    if (response.status === 401) return null;

    let errorMsg = "API request failed";
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  return response.json();
}

