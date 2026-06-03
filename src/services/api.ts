import type { AnalysisData, Design, GenerationInputs } from "@/types";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function apiHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("pf_api_token") ??
        process.env.NEXT_PUBLIC_INTERNAL_API_KEY
      : process.env.INTERNAL_API_KEY ?? process.env.NEXT_PUBLIC_INTERNAL_API_KEY;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export async function verifyStaffPassword(password: string): Promise<string> {
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await parseJson<{ token: string }>(res);
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("pf_api_token", data.token);
  }
  return data.token;
}

export async function generateDesigns(
  inputs: GenerationInputs
): Promise<Design[]> {
  const res = await fetch("/api/designs/generate", {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify(inputs),
  });
  return parseJson<Design[]>(res);
}

export async function getDesignById(designId: string): Promise<Design | null> {
  const res = await fetch(`/api/designs/${designId}`, {
    headers: apiHeaders(),
  });
  if (res.status === 404) return null;
  return parseJson<Design>(res);
}

export async function getDesignAnalysis(
  designId: string
): Promise<AnalysisData> {
  const res = await fetch(`/api/designs/${designId}/analysis`, {
    headers: apiHeaders(),
  });
  return parseJson<AnalysisData>(res);
}
