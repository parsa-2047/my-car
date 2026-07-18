/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ClipboardList, Calendar, Gauge, CreditCard, FileText } from "lucide-react";
import { CarService, ServiceItems, SERVICE_LABELS } from "../types";
import { getPersianDate, toPersianDigits } from "../utils";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  carName: string;
  carColor: string;
  lastOdometer?: number; // Pre-fill suggestion
  onAddService: (service: Omit<CarService, "id" | "createdAt">) => void;
  editingService?: CarService | null;
  onEditService?: (service: CarService) => void;
}

const defaultItemsState: ServiceItems = {
  engineOil: false,
  oilFilter: false,
  airFilter: false,
  cabinFilter: false,
  brakePads: false,
  timingBelt: false,
  gearboxOil: false,
  sparkPlugs: false,
  coolant: false,
  suspension: false,
  other: false,
};

export default function AddServiceModal({
  isOpen,
  onClose,
  carId,
  carName,
  carColor,
  lastOdometer = 0,
  onAddService,
  editingService,
  onEditService,
}: AddServiceModalProps) {
  const [date, setDate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  
  // Checklist items
  const [items, setItems] = useState<ServiceItems>({ ...defaultItemsState });
  
  const [error, setError] = useState("");
 
  // Update date to current Shamsi date when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingService) {
        setDate(editingService.date);
        setOdometer(String(editingService.odometer));
        setCost(editingService.cost || "");
        setNotes(editingService.notes);
        setItems({ ...editingService.items });
      } else {
        setDate(getPersianDate(new Date()));
        // Always empty by default for fresh service entries
        setOdometer("");
        setCost("");
        setNotes("");
        setItems({ ...defaultItemsState });
      }
      setError("");
    }
  }, [isOpen, lastOdometer, editingService]);

  if (!isOpen) return null;

  const handleCheckboxChange = (key: keyof ServiceItems) => {
    setItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleOdometerChange = (value: string) => {
    // Only digits
    const clean = value.replace(/[^0-9]/g, "");
    setOdometer(clean);
  };

  const handleCostChange = (value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    setCost(clean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!date.trim()) {
      setError("لطفاً تاریخ سرویس را وارد کنید.");
      return;
    }

    if (!odometer.trim() || isNaN(Number(odometer))) {
      setError("لطفاً میزان کارکرد (کیلومتر) فعلی خودرو را وارد کنید.");
      return;
    }

    const currentOdo = Number(odometer);
    if (!editingService && lastOdometer > 0 && currentOdo < lastOdometer) {
      setError(`کیلومتر وارد شده (${toPersianDigits(currentOdo)}) نمی‌تواند از کیلومتر آخرین سرویس (${toPersianDigits(lastOdometer)}) کمتر باشد.`);
      return;
    }

    // Check if at least one checkbox is selected
    const anyChecked = Object.values(items).some((val) => val === true);
    if (!anyChecked) {
      setError("لطفاً حداقل یکی از موارد سرویس را انتخاب کنید.");
      return;
    }

    if (editingService) {
      onEditService?.({
        ...editingService,
        date: date.trim(),
        odometer: currentOdo,
        items,
        notes: notes.trim(),
        cost: cost.trim() || undefined,
      });
    } else {
      onAddService({
        carId,
        date: date.trim(),
        odometer: currentOdo,
        items,
        notes: notes.trim(),
        cost: cost.trim() || undefined,
      });
    }

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
          className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col z-10 text-right border border-gray-100"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span
                className="p-2 rounded-xl text-white shadow-sm"
                style={{ backgroundColor: carColor }}
              >
                <ClipboardList size={20} className="stroke-[2]" />
              </span>
              <div>
                <span>{editingService ? "ویرایش برگه سرویس" : "ثبت برگه سرویس جدید"}</span>
                <span className="block text-xs font-medium text-gray-500 mt-0.5">
                  برای خودروی <strong style={{ color: carColor }}>{carName}</strong>
                </span>
              </div>
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

            {/* Grid for Date and Kilometer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Service Date */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                  <Calendar size={13} className="text-gray-400" />
                  <span>تاریخ انجام سرویس *</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: ۱۴۰۵/۰۴/۲۰"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-center"
                  maxLength={10}
                  required
                />
              </div>

              {/* Odometer / Kilometer */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                  <Gauge size={13} className="text-gray-400" />
                  <span>کارکرد کیلومتر فعلی *</span>
                </label>
                <input
                  type="text"
                  placeholder="کیلومتر شمار ماشین را وارد کنید"
                  value={odometer}
                  onChange={(e) => handleOdometerChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-center"
                  required
                />
                {lastOdometer > 0 && (
                  <p className="text-[10px] text-gray-400 mt-1 text-right">
                    آخرین کارکرد ثبت شده: {toPersianDigits(lastOdometer.toLocaleString())} کیلومتر
                  </p>
                )}
              </div>
            </div>

            {/* Checkbox Checklist options */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-3">
                کارهای انجام شده در این سرویس (موارد تیک‌دار):
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 overflow-hidden">
                {(Object.keys(SERVICE_LABELS) as Array<keyof ServiceItems>)
                  .sort((a, b) => {
                    const aChecked = items[a] ? 1 : 0;
                    const bChecked = items[b] ? 1 : 0;
                    return bChecked - aChecked; // Place checked ones on top
                  })
                  .map((key) => {
                    const serviceKey = key as keyof ServiceItems;
                    const label = SERVICE_LABELS[serviceKey];
                    const isChecked = items[serviceKey];
                    return (
                      <motion.label
                        layout
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        key={serviceKey}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer select-none ${
                          isChecked
                            ? "bg-white border-indigo-200 text-indigo-700 shadow-sm"
                            : "bg-white/40 border-gray-100 text-gray-600 hover:bg-white/80"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(serviceKey)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                        <span>{label}</span>
                      </motion.label>
                    );
                  })}
              </div>
            </div>

            {/* Optional Cost & Text Area */}
            <div className="grid grid-cols-1 gap-4">
              {/* Cost */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                  <CreditCard size={13} className="text-gray-400" />
                  <span>هزینه کل سرویس (تومان - اختیاری)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: ۱,۲۰۰,۰۰۰"
                    value={cost}
                    onChange={(e) => handleCostChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-right"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    تومان
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                  <FileText size={13} className="text-gray-400" />
                  <span>توضیحات و نکات تکمیلی</span>
                </label>
                <textarea
                  placeholder="مثال: استفاده از روغن الف ۱۰W40، فیلتر سرکان، یا تعویض قطعات خاص..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-right h-20 resize-none"
                  maxLength={500}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="flex-1 py-3 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
                style={{ backgroundColor: carColor }}
              >
                {editingService ? "ذخیره تغییرات سرویس" : "ثبت و ذخیره سرویس"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold text-sm active:scale-95 transition-all"
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
