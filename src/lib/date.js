// ==============================
// DATE UTIL (Local Time Safe)
// ==============================

// YYYY-MM-DD (ตามเวลาท้องถิ่น)
export function getToday() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// YYYY-MM (เดือนปฏิทินปกติ)
export function getCurrentMonth() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

// YYYY-MM (รอบเงินเดือน 21–20)
export function getCurrentPayMonth() {
  const today = new Date();
  const day = today.getDate();

  let year = today.getFullYear();
  let month = today.getMonth(); // 0–11

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