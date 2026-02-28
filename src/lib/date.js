export function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function getCurrentPayMonth() {
  const today = new Date();
  const day = today.getDate();

  let year = today.getFullYear();
  let month = today.getMonth(); // 0-11

  // ถ้าวันที่ >= 21 ให้ถือว่าเป็นเดือนถัดไป
  if (day >= 21) {
    month += 1;
  }

  // ป้องกันเดือนเกิน 11
  if (month > 11) {
    month = 0;
    year += 1;
  }

  return `${year}-${String(month + 1).padStart(2, "0")}`;
}