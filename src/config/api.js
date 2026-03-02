export const API_BASE =
  "https://script.google.com/macros/s/AKfycbzmcozhvLNm1vLoFFaVFdQLW9zMW_QDZFBg-BjGqnlYAKP7cvyzBAePpC9UAxzOG8Z_/exec";

export async function apiGet(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    )
  ).toString();

  const res = await fetch(`${API_BASE}?${query}`);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);

  const data = await res.json();
  if (data && data.error) throw new Error(data.error);

  return data;
}

export async function apiPost(body = {}) {
  const res = await fetch(API_BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);

  const data = await res.json();
  if (data && data.error) throw new Error(data.error);

  return data;
}