/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Converts a Gregorian Date object into a Shamsi (Solar Hijri) date string (yyyy/mm/dd).
 */
export function getPersianDate(date: Date): string {
  const g_y = date.getFullYear();
  const g_m = date.getMonth() + 1;
  const g_d = date.getDate();
  
  const g_days_in_month = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Check leap year
  if (g_y % 4 === 0 && (g_y % 100 !== 0 || g_y % 400 === 0)) {
    g_days_in_month[2] = 29;
  }
  
  let gy = g_y - 1600;
  let gm = g_m - 1;
  let gd = g_d - 1;
  
  let g_day_no = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);
  for (let i = 0; gm > i; ++i) {
    g_day_no += g_days_in_month[i + 1];
  }
  g_day_no += gd;
  
  let j_day_no = g_day_no - 79;
  let j_np = Math.floor(j_day_no / 12053);
  j_day_no %= 12053;
  
  let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
  j_day_no %= 1461;
  
  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }
  
  let jm = -1;
  let jd = -1;
  for (let i = 0; i < 11; ++i) {
    const days = i < 6 ? 31 : 30;
    if (j_day_no < days) {
      jm = i;
      jd = j_day_no;
      break;
    }
    j_day_no -= days;
  }
  if (jm === -1 && jd === -1) {
    jm = 11;
    jd = j_day_no;
  }
  
  const pY = jy;
  const pM = jm + 1;
  const pD = jd + 1;
  
  const pad = (num: number) => num < 10 ? '0' + num : num.toString();
  return `${pY}/${pad(pM)}/${pad(pD)}`;
}

/**
 * Replaces English digits with Persian digits.
 */
export function toPersianDigits(num: number | string): string {
  if (num === undefined || num === null) return "";
  const str = num.toString();
  const englishDigits = /0|1|2|3|4|5|6|7|8|9/g;
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(englishDigits, (w) => persianDigits[parseInt(w, 10)]);
}

/**
 * Formats a number with comma separators and converts to Persian digits.
 */
export function formatOdometer(num: number | string): string {
  if (!num) return toPersianDigits(0);
  const clean = num.toString().replace(/[^0-9]/g, "");
  const formatted = Number(clean).toLocaleString("en-US");
  return toPersianDigits(formatted);
}

/**
 * Formats cost/price with currency.
 */
export function formatCost(cost: string | number | undefined): string {
  if (!cost) return "";
  const cleanStr = cost.toString().replace(/[^0-9]/g, "");
  if (!cleanStr) return "";
  const formatted = Number(cleanStr).toLocaleString("en-US");
  return `${toPersianDigits(formatted)} تومان`;
}

/**
 * Custom hook equivalent / raw function for safe localStorage integration.
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.error(`Error loading key "${key}" from localStorage:`, error);
  }
  return defaultValue;
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving key "${key}" to localStorage:`, error);
  }
}
