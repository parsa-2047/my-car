/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Car, Palette } from "lucide-react";
import { PRESET_COLORS, Car as CarType } from "../types";
import IranPlate, { PLATE_LETTERS } from "./IranPlate";

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCar: (car: Omit<CarType, "id" | "createdAt">) => void;
  editingCar?: CarType | null;
  onEditCar?: (car: CarType) => void;
}

export default function AddCarModal({
  isOpen,
  onClose,
  onAddCar,
  editingCar,
  onEditCar,
}: AddCarModalProps) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  
  // Plate parts
  const [plate1, setPlate1] = useState("");
  const [plateLetter, setPlateLetter] = useState("ب");
  const [plate2, setPlate2] = useState("");
  const [plateRegion, setPlateRegion] = useState("");
  
  // Color selection
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[1]); // Default to Blue
  const [customColor, setCustomColor] = useState("");
  const [isCustomColorActive, setIsCustomColorActive] = useState(false);

  const [error, setError] = useState("");

  // Sync state when open or editingCar changes
  React.useEffect(() => {
    if (isOpen) {
      if (editingCar) {
        setName(editingCar.name);
        setModel(editingCar.model || "");
        
        let p1 = "";
        let pLetter = "ب";
        let p2 = "";
        let pReg = "";
        if (editingCar.plateNumber) {
          const parts = editingCar.plateNumber.split("-");
          if (parts.length === 4) {
            [p1, pLetter, p2, pReg] = parts;
          }
        }
        setPlate1(p1);
        setPlateLetter(pLetter);
        setPlate2(p2);
        setPlateRegion(pReg);
        
        // Match color with presets
        const matchedPreset = PRESET_COLORS.find(c => c.hex.toLowerCase() === editingCar.color.toLowerCase());
        if (matchedPreset) {
          setSelectedColor(matchedPreset);
          setIsCustomColorActive(false);
          setCustomColor("");
        } else {
          setIsCustomColorActive(true);
          setCustomColor(editingCar.color);
        }
      } else {
        setName("");
        setModel("");
        setPlate1("");
        setPlateLetter("ب");
        setPlate2("");
        setPlateRegion("");
        setSelectedColor(PRESET_COLORS[1]);
        setIsCustomColorActive(false);
        setCustomColor("");
      }
      setError("");
    }
  }, [isOpen, editingCar]);

  if (!isOpen) return null;

  const handlePlateNumberChange = (value: string, setter: (val: string) => void, maxLength: number) => {
    // Only allow numbers
    const clean = value.replace(/[^0-9]/g, "");
    if (clean.length <= maxLength) {
      setter(clean);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("لطفاً نام خودرو را وارد کنید.");
      return;
    }

    // Plate string representation or separate? We store plate details in model if we want,
    // let's pack plateNumber as a formatted string like: "12-ب-345-22"
    let formattedPlate = "";
    if (plate1 || plate2 || plateRegion) {
      formattedPlate = `${plate1 || ""}-${plateLetter || "ب"}-${plate2 || ""}-${plateRegion || ""}`;
    }

    const hexColor = isCustomColorActive ? customColor || "#3B82F6" : selectedColor.hex;
    
    // Determine light/dark text contrast color
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    const textColor = yiq >= 128 ? "#1F2937" : "#FFFFFF"; // Dark gray or White

    if (editingCar) {
      onEditCar?.({
        ...editingCar,
        name: name.trim(),
        model: model.trim() || undefined,
        plateNumber: formattedPlate || undefined,
        color: hexColor,
        textColor: textColor,
      });
    } else {
      onAddCar({
        name: name.trim(),
        model: model.trim() || undefined,
        plateNumber: formattedPlate || undefined,
        color: hexColor,
        textColor: textColor,
      });
    }

    // Reset state
    setName("");
    setModel("");
    setPlate1("");
    setPlateLetter("ب");
    setPlate2("");
    setPlateRegion("");
    setSelectedColor(PRESET_COLORS[1]);
    setIsCustomColorActive(false);
    setCustomColor("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col z-10 text-right border border-gray-100"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Car size={20} className="stroke-[2]" />
              </span>
              <span>{editingCar ? "ویرایش مشخصات خودرو" : "افزودن خودروی جدید"}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto max-h-[80vh] space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* Car Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">نام خودرو *</label>
              <input
                type="text"
                placeholder="مثلاً: پژو ۲۰۷، دنا پلاس، پراید ۱۱۱"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-right"
                maxLength={40}
                required
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">مدل / سال ساخت (اختیاری)</label>
              <input
                type="text"
                placeholder="مثلاً: ۱۴۰۱ یا ۲۰۲۲"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-right"
                maxLength={20}
              />
            </div>

            {/* License Plate Visual Builder */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">شماره پلاک (اختیاری)</label>
              
              {/* Visual Preview */}
              <div className="flex justify-center mb-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <IranPlate
                  part1={plate1}
                  letter={plateLetter}
                  part2={plate2}
                  region={plateRegion}
                />
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-4 gap-2" dir="ltr">
                {/* Part 1 (2 Digits) */}
                <div className="text-center">
                  <span className="block text-[10px] text-gray-400 font-bold mb-1">۲ رقم سمت چپ</span>
                  <input
                    type="text"
                    value={plate1}
                    onChange={(e) => handlePlateNumberChange(e.target.value, setPlate1, 2)}
                    placeholder="۱۲"
                    className="w-full text-center py-2 border border-gray-200 rounded-xl text-base font-bold bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Letter Selection */}
                <div className="text-center">
                  <span className="block text-[10px] text-gray-400 font-bold mb-1">حرف وسط</span>
                  <select
                    value={plateLetter}
                    onChange={(e) => setPlateLetter(e.target.value)}
                    className="w-full text-center py-2 border border-gray-200 rounded-xl text-sm font-bold bg-white focus:outline-none focus:border-blue-500 h-[42px] appearance-none"
                    dir="rtl"
                  >
                    {PLATE_LETTERS.map((letter) => (
                      <option key={letter} value={letter}>
                        {letter}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Part 2 (3 Digits) */}
                <div className="text-center">
                  <span className="block text-[10px] text-gray-400 font-bold mb-1">۳ رقم وسط</span>
                  <input
                    type="text"
                    value={plate2}
                    onChange={(e) => handlePlateNumberChange(e.target.value, setPlate2, 3)}
                    placeholder="۳۴۵"
                    className="w-full text-center py-2 border border-gray-200 rounded-xl text-base font-bold bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Region Code (2 Digits) */}
                <div className="text-center">
                  <span className="block text-[10px] text-gray-400 font-bold mb-1">کد ایران</span>
                  <input
                    type="text"
                    value={plateRegion}
                    onChange={(e) => handlePlateNumberChange(e.target.value, setPlateRegion, 2)}
                    placeholder="۲۲"
                    className="w-full text-center py-2 border border-gray-200 rounded-xl text-base font-bold bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Custom Color Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
                <Palette size={14} className="text-gray-400" />
                <span>رنگ اختصاصی خودرو</span>
              </label>

              {/* Preset circle grid */}
              <div className="grid grid-cols-6 gap-2.5 mb-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      setIsCustomColorActive(false);
                    }}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                      !isCustomColorActive && selectedColor.hex === color.hex
                        ? "border-black scale-110 shadow-md"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {!isCustomColorActive && selectedColor.hex === color.hex && (
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color.text }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom hex toggle */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <input
                  type="checkbox"
                  id="customColorCheckbox"
                  checked={isCustomColorActive}
                  onChange={(e) => setIsCustomColorActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="customColorCheckbox"
                  className="text-xs text-gray-600 select-none cursor-pointer font-sans"
                >
                  انتخاب رنگ دلخواه دیگر:
                </label>
                {isCustomColorActive && (
                  <input
                    type="color"
                    value={customColor || selectedColor.hex}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-indigo-300 active:scale-95 transition-all cursor-pointer"
              >
                {editingCar ? "ثبت تغییرات" : "ذخیره خودرو"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold text-sm active:scale-95 transition-all cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
