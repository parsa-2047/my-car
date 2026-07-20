/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServiceItems {
  engineOil: boolean;      // تعویض روغن موتور
  oilFilter: boolean;      // تعویض فیلتر روغن
  airFilter: boolean;      // تعویض فیلتر هوا
  cabinFilter: boolean;    // تعویض فیلتر کابین
  brakePads: boolean;      // لنت ترمز
  timingBelt: boolean;     // تسمه تایم
  gearboxOil: boolean;     // روغن گیربکس
  sparkPlugs: boolean;     // شمع موتور
  coolant: boolean;        // مایع خنک‌کننده / ضدیخ
  suspension: boolean;     // سرویس جلوبندی / کمک فنر
  other: boolean;          // سایر موارد
}

export interface CarService {
  id: string;
  carId: string;
  date: string;            // تاریخ سرویس (مثلا ۱۴۰۵/۰۴/۲۰)
  odometer: number;        // کارکرد کیلومتر
  items: ServiceItems;
  notes: string;           // توضیحات تکمیلی
  cost?: string;           // هزینه سرویس (اختیاری)
  createdAt: string;
}

export interface Car {
  id: string;
  name: string;            // نام خودرو
  model?: string;          // مدل / سال ساخت
  plateNumber?: string;    // شماره پلاک
  color: string;           // رنگ دلخواه (کد هگز یا کلاس تیلوند)
  textColor: string;       // رنگ متن متناسب با زمینه خودرو (تیره یا روشن)
  pinned?: boolean;        // پین شده در بالای لیست
  createdAt: string;
}

export const PRESET_COLORS = [
  { hex: "#EF4444", name: "قرمز", text: "#FFFFFF" },
  { hex: "#3B82F6", name: "آبی", text: "#FFFFFF" },
  { hex: "#10B981", name: "سبز", text: "#FFFFFF" },
  { hex: "#F59E0B", name: "نارنجی", text: "#FFFFFF" },
  { hex: "#8B5CF6", name: "بنفش", text: "#FFFFFF" },
  { hex: "#EC4899", name: "صورتی", text: "#FFFFFF" },
  { hex: "#4B5563", name: "خاکستری تیره", text: "#FFFFFF" },
  { hex: "#111827", name: "مشکی", text: "#FFFFFF" },
  { hex: "#F3F4F6", name: "سفید صدفی", text: "#1F2937" },
  { hex: "#06B6D4", name: "فیروزه‌ای", text: "#FFFFFF" },
  { hex: "#14B8A6", name: "یشمی", text: "#FFFFFF" },
  { hex: "#84CC16", name: "فسفری", text: "#1F2937" },
];

export const SERVICE_LABELS: Record<keyof ServiceItems, string> = {
  engineOil: "تعویض روغن موتور",
  oilFilter: "تعویض فیلتر روغن",
  airFilter: "تعویض فیلتر هوا",
  cabinFilter: "تعویض فیلتر کابین",
  brakePads: "تعویض لنت ترمز",
  timingBelt: "تعویض تسمه تایم",
  gearboxOil: "تعویض روغن گیربکس",
  sparkPlugs: "تعویض شمع موتور",
  coolant: "تعویض مایع خنک‌کننده (ضدیخ)",
  suspension: "سرویس و تعمیر جلوبندی",
  other: "سایر سرویس‌ها و خدمات",
};
