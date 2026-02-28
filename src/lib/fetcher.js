import { API_BASE } from "@/config/api";

export async function apiGet(query) {
  const res = await fetch(`${API_BASE}?${query}`);
  if (!res.ok) throw new Error("API Error");
  return res.json();
}

export async function apiPost(body) {
  const res = await fetch(API_BASE, {
    method: "POST",
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error("API Error");
  return res.json();
}