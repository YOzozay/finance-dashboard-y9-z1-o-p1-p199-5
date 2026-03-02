export const API_BASE = 
"https://script.google.com/macros/s/AKfycbx0p8yP_p8NG4ZOKAuVGeiQhIqfZxA5MjdDHCWXwmbf6u4nskvrccFBeh5N1Awyulr6/exec";

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
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error("API Error");
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  return data;
}