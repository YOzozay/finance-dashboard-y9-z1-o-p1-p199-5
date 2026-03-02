export const API_BASE = 
"https://script.google.com/macros/s/AKfycbwr_0eZ8eONmAuAufviBtf84-YY5yWN7dSkw_7FoumSU2okatO3X8Wlb0azBd2t1yMJ/exec";

export async function apiGet(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}?${query}`);

  if (!res.ok) throw new Error("API Error");
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  return data;
}

export async function apiPost(body = {}) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error("API Error");
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  return data;
}