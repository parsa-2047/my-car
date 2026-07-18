/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Wifi, Battery, Signal } from "lucide-react";
import { toPersianDigits } from "../utils";

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const [time, setTime] = useState("۰۰:۰۰");

  // Dynamic live clock for the status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(toPersianDigits(`${hours}:${minutes}`));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-zinc-200 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-0 md:p-6 select-none overflow-x-hidden transition-colors duration-300">
      
      {/* Phone Mockup Body (Only applied on desktop, collapses cleanly on real mobile) */}
      <div className="w-full h-screen md:h-[840px] md:w-[412px] bg-white dark:bg-slate-950 md:rounded-[3rem] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] md:border-[12px] md:border-slate-800 dark:md:border-slate-900 relative flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Mock Top Camera / Dynamic Island Notch (Only on desktop) */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-40">
          {/* Camera Lens */}
          <div className="absolute right-6 top-1.5 w-2.5 h-2.5 bg-slate-950 rounded-full border border-slate-700/50"></div>
          {/* Sensor */}
          <div className="absolute left-8 top-2.5 w-8 h-1 bg-slate-900 rounded-full"></div>
        </div>

        {/* Mock Android Status Bar (Shown everywhere to keep consistency) */}
        <div
          dir="rtl"
          className="bg-black/5 dark:bg-black/20 backdrop-blur-md text-gray-800 dark:text-slate-200 px-6 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-bold select-none z-30 shrink-0 select-none pointer-events-none transition-colors duration-300"
        >
          {/* Right Status (Clock) */}
          <div className="font-sans font-bold text-gray-800 dark:text-slate-300">{time}</div>

          {/* Left Status (Wifi, Signal, Battery) */}
          <div className="flex items-center gap-1.5">
            <Signal size={12} className="text-gray-700 dark:text-slate-400" />
            <Wifi size={12} className="text-gray-700 dark:text-slate-400" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] scale-90 text-gray-600 dark:text-slate-400">{toPersianDigits(98)}٪</span>
              <Battery size={13} className="text-gray-700 dark:text-slate-400 rotate-180" />
            </div>
          </div>
        </div>

        {/* Main Application Container */}
        <div className="flex-1 relative flex flex-col overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
          {children}
        </div>

        {/* Bottom Home Gesture Indicator (Only on desktop) */}
        <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300/80 rounded-full z-40"></div>
      </div>
    </div>
  );
}
