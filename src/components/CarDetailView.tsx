/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Plus,
  Search,
  Trash2,
  Calendar,
  Gauge,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Info,
  ClipboardList,
} from "lucide-react";
import { Car, CarService, SERVICE_LABELS, ServiceItems } from "../types";
import { toPersianDigits, formatOdometer, formatCost } from "../utils";
import IranPlate from "./IranPlate";
import EmptyState from "./EmptyState";
import AddServiceModal from "./AddServiceModal";

interface CarDetailViewProps {
  car: Car;
  services: CarService[];
  onBack: () => void;
  onAddService: (service: Omit<CarService, "id" | "createdAt">) => void;
  onEditService?: (service: CarService) => void;
  onDeleteService: (serviceId: string) => void;
  onDeleteCar: (carId: string) => void;
}

export default function CarDetailView({
  car,
  services,
  onBack,
  onAddService,
  onEditService,
  onDeleteService,
  onDeleteCar,
}: CarDetailViewProps) {
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<CarService | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [carDeleteConfirm, setCarDeleteConfirm] = useState(false);

  // Sync modal states with history API to support physical back button on mobile devices
  useEffect(() => {
    const handlePopState = () => {
      if (isAddServiceOpen) {
        setIsAddServiceOpen(false);
      } else if (editingService) {
        setEditingService(null);
      } else if (carDeleteConfirm) {
        setCarDeleteConfirm(false);
      } else if (deleteConfirmId) {
        setDeleteConfirmId(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isAddServiceOpen, editingService, carDeleteConfirm, deleteConfirmId]);

  useEffect(() => {
    const hasActiveModal = !!(isAddServiceOpen || editingService || carDeleteConfirm || deleteConfirmId);
    if (hasActiveModal) {
      if (!window.history.state || window.history.state.detailModal !== "open") {
        window.history.pushState({ detailModal: "open" }, "");
      }
    } else {
      if (window.history.state && window.history.state.detailModal === "open") {
        window.history.back();
      }
    }
  }, [isAddServiceOpen, editingService, carDeleteConfirm, deleteConfirmId]);

  // Filter services belong to this car and sort by date descending
  const carServices = services
    .filter((s) => s.carId === car.id)
    .sort((a, b) => {
      // Sort chronologically descending. We can clean date first for sorting, or rely on standard string compare
      return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
    });

  // Filter based on search input
  const filteredServices = carServices.filter((service) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Search in date, odometer, notes, or list of completed services
    const notesMatch = service.notes.toLowerCase().includes(searchLower);
    const dateMatch = service.date.includes(searchLower);
    const odoMatch = String(service.odometer).includes(searchLower);
    
    // Search in names of checked services
    const servicesMatch = Object.keys(service.items).some((key) => {
      const isChecked = service.items[key as keyof ServiceItems];
      if (!isChecked) return false;
      const label = SERVICE_LABELS[key as keyof ServiceItems];
      return label.toLowerCase().includes(searchLower);
    });

    return notesMatch || dateMatch || odoMatch || servicesMatch;
  });

  // Calculate highest odometer reading
  const lastOdometer = carServices.length > 0 ? Math.max(...carServices.map((s) => s.odometer)) : 0;

  // Calculate total cost
  const totalCost = carServices.reduce((sum, s) => {
    if (!s.cost) return sum;
    const num = parseInt(s.cost.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? sum : sum + num;
  }, 0);

  // Parse plate
  let platePart1 = "";
  let plateLetter = "ب";
  let platePart2 = "";
  let plateRegion = "";
  if (car.plateNumber) {
    const parts = car.plateNumber.split("-");
    if (parts.length === 4) {
      [platePart1, plateLetter, platePart2, plateRegion] = parts;
    }
  }

  const handleDeleteServiceClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDeleteService = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteService(id);
    setDeleteConfirmId(null);
  };

  const handleCarDeleteClick = () => {
    setCarDeleteConfirm(true);
  };

  const confirmDeleteCar = () => {
    onDeleteCar(car.id);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50" dir="rtl">
      {/* Top Header Panel */}
      <div
        className="text-white p-5 pt-7 pb-8 rounded-b-[2.5rem] shadow-lg relative overflow-hidden transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${car.color}e0, ${car.color})`,
        }}
      >
        {/* Subtle decorative circles */}
        <div className="absolute top-[-20%] left-[-10%] w-40 h-40 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 rounded-full bg-white/10 blur-xl"></div>

        {/* Navigation / Back Button & Title */}
        <div className="flex items-center justify-between relative z-10 mb-5">
          <button
            onClick={onBack}
            className="p-2 bg-white/25 hover:bg-white/35 active:scale-95 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
            title="برگشت به لیست خودروها"
          >
            <ArrowRight size={20} />
          </button>
          
          <h2 className="text-xl font-black tracking-tight font-sans">
            جزئیات خودرو
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAddServiceOpen(true)}
              className="px-3 py-1.5 bg-white/25 hover:bg-white/35 active:scale-95 text-white border border-white/15 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-bold font-sans shadow-sm"
              title="ثبت سرویس جدید"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>سرویس جدید</span>
            </button>

            <button
              onClick={handleCarDeleteClick}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 active:scale-95 text-red-100 border border-red-500/10 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title="حذف این خودرو"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Car identity header */}
        <div className="flex flex-col items-center justify-center text-center relative z-10 space-y-2">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black drop-shadow-sm font-sans"
            style={{ color: car.textColor }}
          >
            {car.name}
          </motion.h1>

          {car.model && (
            <p className="text-xs font-semibold opacity-90 font-sans" style={{ color: car.textColor }}>
              مدل / سال ساخت: {toPersianDigits(car.model)}
            </p>
          )}

          {/* License Plate Graphic */}
          {car.plateNumber && (
            <div className="pt-2">
              <IranPlate
                part1={platePart1}
                letter={plateLetter}
                part2={platePart2}
                region={plateRegion}
                className="scale-95 shadow-md border-white/20"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 py-6 -mt-4 bg-transparent overflow-y-auto space-y-4 pb-12">
        
        {/* Statistics Widgets */}
        <div className="grid grid-cols-3 gap-3">
          {/* Service Count widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-2xl shadow-sm text-center flex flex-col justify-between h-22 hover:shadow-md transition-all">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block font-sans">تعداد سرویس‌ها</span>
            <div className="text-xl font-black text-slate-800 dark:text-slate-100 my-auto">
              {toPersianDigits(carServices.length)} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">برگه</span>
            </div>
          </div>

          {/* Last Odometer widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-2xl shadow-sm text-center flex flex-col justify-between h-22 hover:shadow-md transition-all">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block font-sans">آخرین کارکرد</span>
            <div className="text-base font-black text-slate-800 dark:text-slate-100 my-auto leading-tight">
              {lastOdometer > 0 ? (
                <>
                  <span className="text-lg font-black">{toPersianDigits(lastOdometer.toLocaleString())}</span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">کیلومتر</span>
                </>
              ) : (
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">ثبت نشده</span>
              )}
            </div>
          </div>

          {/* Total Cost widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-2xl shadow-sm text-center flex flex-col justify-between h-22 hover:shadow-md transition-all">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block font-sans">مجموع هزینه‌ها</span>
            <div className="text-sm font-black text-slate-800 dark:text-slate-100 my-auto leading-tight">
              {totalCost > 0 ? (
                <>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{toPersianDigits(totalCost.toLocaleString())}</span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">تومان</span>
                </>
              ) : (
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">ثبت نشده</span>
              )}
            </div>
          </div>
        </div>

        {/* Services List / Cards */}
        <div className="space-y-4">
            {carServices.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="هیچ برگه سرویسی ثبت نشده است"
                description="برای ثبت اولین چک‌لیست سرویس این ماشین (روغن، فیلترها، لنت و...) دکمه زیر را فشار دهید."
                actionLabel="ثبت برگه سرویس جدید"
                onAction={() => setIsAddServiceOpen(true)}
                accentColor={car.color}
              />
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs font-medium bg-white rounded-2xl border border-gray-100 p-5">
                سرویسی با مشخصات جستجو شده یافت نشد.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredServices.map((service, index) => {
                  // Count completed tasks in this record
                  const completedCount = Object.values(service.items).filter(Boolean).length;
                  const isDeleting = deleteConfirmId === service.id;

                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: car.color }}
                      />

                      {/* Top row: Date and Odometer */}
                      <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold text-xs">
                          <Calendar size={13} className="text-slate-400 dark:text-slate-500" />
                          <span>{toPersianDigits(service.date)}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs bg-indigo-50/60 dark:bg-indigo-950/40 px-2 py-1 rounded-lg border border-indigo-100/30 dark:border-indigo-800/50">
                          <Gauge size={13} className="text-indigo-500" />
                          <span>{formatOdometer(service.odometer)} کیلومتر</span>
                        </div>
                      </div>

                      {/* Cost if present */}
                      {service.cost && (
                        <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-3">
                          <CreditCard size={13} className="text-emerald-500" />
                          <span>هزینه سرویس: {formatCost(service.cost)}</span>
                        </div>
                      )}

                      {/* Checked services visual list */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {Object.keys(service.items).map((itemKey) => {
                          const key = itemKey as keyof ServiceItems;
                          const isChecked = service.items[key];
                          if (!isChecked) return null;
                          return (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800"
                            >
                              <CheckCircle2 size={10} className="text-emerald-500" />
                              <span>{SERVICE_LABELS[key]}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Notes Section if exists */}
                      {service.notes && (
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/60 flex items-start gap-1.5 leading-relaxed">
                          <FileText size={12} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                          <p className="font-medium whitespace-pre-line text-right w-full text-slate-600 dark:text-slate-300">
                            {toPersianDigits(service.notes)}
                          </p>
                        </div>
                      )}

                      {/* Delete actions or confirm block */}
                      <div className="flex items-center justify-end mt-3 border-t border-slate-100 dark:border-slate-800 pt-2 text-[10px]">
                        <AnimatePresence mode="wait">
                          {isDeleting ? (
                            <motion.div
                              key="confirm"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2 bg-red-50 text-red-700 p-1 px-2 rounded-lg"
                            >
                              <AlertTriangle size={12} className="text-red-500 animate-pulse" />
                              <span className="font-bold">حذف این برگه؟</span>
                              <button
                                onClick={(e) => confirmDeleteService(service.id, e)}
                                className="bg-red-600 text-white font-bold px-2 py-0.5 rounded cursor-pointer hover:bg-red-700"
                              >
                                بله، حذف
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded cursor-pointer hover:bg-gray-300"
                              >
                                لغو
                              </button>
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <motion.button
                                key="editBtn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingService(service);
                                }}
                                className="text-slate-400 hover:text-indigo-600 active:scale-95 flex items-center gap-1 transition-all p-1 cursor-pointer font-sans font-semibold"
                              >
                                <FileText size={12} />
                                <span>ویرایش برگه</span>
                              </motion.button>
                              <div className="w-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full" />
                              <motion.button
                                key="deleteBtn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={(e) => handleDeleteServiceClick(service.id, e)}
                                className="text-slate-400 hover:text-red-500 active:scale-95 flex items-center gap-1 transition-all p-1 cursor-pointer font-sans font-semibold"
                              >
                                <Trash2 size={12} />
                                <span>حذف برگه</span>
                              </motion.button>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isAddServiceOpen || !!editingService}
        onClose={() => {
          setIsAddServiceOpen(false);
          setEditingService(null);
        }}
        carId={car.id}
        carName={car.name}
        carColor={car.color}
        lastOdometer={lastOdometer}
        onAddService={onAddService}
        editingService={editingService}
        onEditService={onEditService}
      />

      {/* Car Delete Confirm Modal */}
      {carDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setCarDeleteConfirm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="bg-white rounded-3xl p-6 shadow-2xl relative z-10 max-w-xs w-full text-center border border-gray-100">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="stroke-[2] animate-bounce" />
            </div>
            <h4 className="text-base font-bold text-gray-800 mb-2">حذف خودروی {car.name}؟</h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-6 font-sans">
              آیا از حذف این خودرو اطمینان دارید؟ با حذف خودرو، تمامی تاریخچه و سرویس‌های ثبت شده مربوط به آن نیز به طور کامل پاک خواهند شد و این عملیات قابل برگشت نیست.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={confirmDeleteCar}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                بله، خودرو حذف شود
              </button>
              <button
                onClick={() => setCarDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
