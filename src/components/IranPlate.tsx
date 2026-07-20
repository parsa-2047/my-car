/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { toPersianDigits } from "../utils";

interface IranPlateProps {
  part1: string;  // 2 digits, e.g. "۱۲"
  letter: string; // Persian letter, e.g. "ب"
  part2: string;  // 3 digits, e.g. "۳۴۵"
  region: string; // 2 digits, e.g. "۲۲"
  className?: string;
}

export default function IranPlate({
  part1,
  letter,
  part2,
  region,
  className = "",
}: IranPlateProps) {
  // If no plate details are provided, return empty
  if (!part1 && !letter && !part2 && !region) {
    return null;
  }

  return (
    <div
      dir="ltr"
      className={`inline-flex items-center select-none bg-white border-2 border-gray-800 rounded-md shadow-sm overflow-hidden h-10 font-sans ${className}`}
      style={{ minWidth: "180px" }}
    >
      {/* Blue Section (I.R. IRAN) */}
      <div className="bg-[#1D4ED8] text-white flex flex-col justify-between items-center px-1 py-0.5 h-full text-[8px] border-r border-gray-800 w-6 shrink-0">
        <div className="flex flex-col items-center gap-0.5">
          {/* Mock Flag */}
          <div className="flex flex-col h-2 w-3 border border-white/20">
            <div className="bg-[#10B981] h-1/3 w-full"></div>
            <div className="bg-white h-1/3 w-full flex items-center justify-center">
              <div className="bg-red-500 w-0.5 h-0.5 rounded-full"></div>
            </div>
            <div className="bg-[#EF4444] h-1/3 w-full"></div>
          </div>
          <span className="font-semibold tracking-wider text-[6px]">I.R.</span>
        </div>
        <span className="font-bold text-[6px] scale-90 -translate-y-0.5">IRAN</span>
      </div>

      {/* Plate Main Content */}
      <div className="flex items-center justify-around px-2 text-gray-900 font-bold text-lg leading-none grow gap-1 tracking-wider h-full select-all">
        <span className="text-xl font-extrabold">{toPersianDigits(part1 || "••")}</span>
        <span className="text-base text-blue-800 font-black px-1.5 py-0.5 bg-blue-50 rounded border border-blue-100">{letter || "؟"}</span>
        <span className="text-xl font-extrabold">{toPersianDigits(part2 || "•••")}</span>
      </div>

      {/* Iran Region Code Box */}
      <div className="flex flex-col justify-center items-center bg-white border-l border-gray-800 px-1.5 h-full text-gray-900 shrink-0 w-11">
        <span className="text-[7px] text-gray-500 font-bold -mb-0.5" style={{ fontSize: "7px" }}>ایران</span>
        <span className="text-sm font-extrabold leading-none">{toPersianDigits(region || "••")}</span>
      </div>
    </div>
  );
}

// Persian alphabet options commonly used on license plates
export const PLATE_LETTERS = [
  "الف",
  "ب",
  "ج",
  "د",
  "س",
  "ص",
  "ط",
  "ق",
  "ل",
  "م",
  "ن",
  "و",
  "ه",
  "ی",
  "ت", // تاکسی
  "ع", // عمومی
];
