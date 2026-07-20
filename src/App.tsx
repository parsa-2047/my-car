/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Car as CarIcon,
  Plus,
  Search,
  Wrench,
  ChevronLeft,
  Gauge,
  ClipboardCheck,
  BookOpen,
  Info,
  Calendar,
  AlertTriangle,
  MoreVertical,
  Pin,
  PinOff,
  Trash2,
  Edit,
  Palette,
  Settings,
  Moon,
  Sun,
  Type,
  X,
  Download,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import { Car, CarService } from "./types";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  toPersianDigits,
  formatOdometer,
} from "./utils";
import MobileFrame from "./components/MobileFrame";
import EmptyState from "./components/EmptyState";
import AddCarModal from "./components/AddCarModal";
import CarDetailView from "./components/CarDetailView";
import IranPlate from "./components/IranPlate";

// Default/pre-populated cars for initial user onboarding
const DEFAULT_CARS: Car[] = [
  {
    id: "car-1",
    name: "پژو ۲۰۶ تیپ ۵",
    model: "۱۳۹۸",
    plateNumber: "۲۲-ب-۳۴۵-۸۸",
    color: "#3B82F6", // Blue
    textColor: "#FFFFFF",
    createdAt: "2026-07-01T12:00:00.000Z",
  },
  {
    id: "car-2",
    name: "تارا اتوماتیک V4",
    model: "۱۴۰۲",
    plateNumber: "۷۷-ج-۱۲۳-۴۵",
    color: "#EF4444", // Red
    textColor: "#FFFFFF",
    createdAt: "2026-07-02T12:00:00.000Z",
  },
];

const DEFAULT_SERVICES: CarService[] = [
  {
    id: "service-1",
    carId: "car-1",
    date: "۱۴۰۵/۰۲/۱۵",
    odometer: 84200,
    items: {
      engineOil: true,
      oilFilter: true,
      airFilter: true,
      cabinFilter: true,
      brakePads: false,
      timingBelt: false,
      gearboxOil: false,
      sparkPlugs: false,
      coolant: true,
      suspension: false,
      other: false,
    },
    notes: "تعویض روغن موتور کاسترول ۱۰W40 به همراه فیلترهای هوا، روغن و کابین. ضدیخ سرریز شد.",
    cost: "۱۴۰۰۰۰۰",
    createdAt: "2026-07-01T14:00:00.000Z",
  },
  {
    id: "service-2",
    carId: "car-2",
    date: "۱۴۰۵/۰۳/۲۰",
    odometer: 15400,
    items: {
      engineOil: true,
      oilFilter: true,
      airFilter: true,
      cabinFilter: false,
      brakePads: false,
      timingBelt: false,
      gearboxOil: false,
      sparkPlugs: false,
      coolant: false,
      suspension: false,
      other: false,
    },
    notes: "روغن موتور ۵W30 تعویض گردید. فیلتر هوا نیز تعویض شد.",
    cost: "۱۲۵۰۰۰۰",
    createdAt: "2026-07-02T15:00:00.000Z",
  },
];

// Reference guidelines for Iranian drivers
const MAINTENANCE_RECOMMENDATIONS = [
  { part: "روغن موتور", interval: "۵,۰۰۰ تا ۸,۰۰۰ کیلومتر", notes: "یا حداقل سالی یک‌بار" },
  { part: "فیلتر هوا", interval: "۵,۰۰۰ کیلومتر", notes: "همزمان با تعویض روغن موتور" },
  { part: "فیلتر کابین", interval: "۱۰,۰۰۰ تا ۱۵,۰۰۰ کیلومتر", notes: "هر سال یک‌بار قبل از فصل گرما" },
  { part: "لنت ترمز جلو", interval: "۳۰,۰۰۰ تا ۴۰,۰۰0 کیلومتر", notes: "بستگی به نوع رانندگی و لرزش پدال" },
  { part: "تسمه تایم", interval: "۶۰,۰۰۰ تا ۸۰,۰۰۰ کیلومتر", notes: "بسیار حیاتی برای سلامت موتور" },
  { part: "روغن گیربکس", interval: "۴۰,۰۰۰ تا ۶۰,۰۰0 کیلومتر", notes: "برای خودروهای دنده‌ای و اتومات" },
  { part: "شمع موتور", interval: "۳۰,۰۰۰ تا ۴۰,۰۰۰ کیلومتر", notes: "جهت کاهش مصرف سوخت و شتاب‌گیری بهتر" },
];

export default function App() {
  const [cars, setCars] = useState<Car[]>(() =>
    loadFromLocalStorage<Car[]>("cars", DEFAULT_CARS)
  );
  
  const [services, setServices] = useState<CarService[]>(() =>
    loadFromLocalStorage<CarService[]>("services", DEFAULT_SERVICES)
  );

  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [actionCar, setActionCar] = useState<Car | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeInstallTab, setActiveInstallTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [searchTerm, setSearchTerm] = useState("");
  const [showGuidelines, setShowGuidelines] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    loadFromLocalStorage<boolean>("isDarkMode", false)
  );
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>(() =>
    loadFromLocalStorage<'sm' | 'md' | 'lg'>("fontSize", "md")
  );
  const [activeFont, setActiveFont] = useState<'vazirmatn' | 'notoSans' | 'amiri' | 'reemKufi'>(() =>
    loadFromLocalStorage<'vazirmatn' | 'notoSans' | 'amiri' | 'reemKufi'>("activeFont", "vazirmatn")
  );

  // Sync state to localStorage & document classes
  useEffect(() => {
    saveToLocalStorage("isDarkMode", isDarkMode);
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    saveToLocalStorage("fontSize", fontSize);
    const root = document.documentElement;
    if (fontSize === "sm") {
      root.style.fontSize = "15px";
    } else if (fontSize === "lg") {
      root.style.fontSize = "20px";
    } else {
      root.style.fontSize = "17.5px";
    }
  }, [fontSize]);

  useEffect(() => {
    saveToLocalStorage("activeFont", activeFont);
    const root = document.documentElement;
    root.classList.remove("font-vazirmatn", "font-notosans", "font-amiri", "font-reemkufi");
    if (activeFont === "vazirmatn") {
      root.classList.add("font-vazirmatn");
    } else if (activeFont === "notoSans") {
      root.classList.add("font-notosans");
    } else if (activeFont === "amiri") {
      root.classList.add("font-amiri");
    } else if (activeFont === "reemKufi") {
      root.classList.add("font-reemkufi");
    }
  }, [activeFont]);

  // Handle hardware back button navigation on mobile devices
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (actionCar) {
        setActionCar(null);
      } else if (isSettingsOpen) {
        setIsSettingsOpen(false);
      } else if (isInstallModalOpen) {
        setIsInstallModalOpen(false);
      } else if (isAddCarOpen || editingCar) {
        setIsAddCarOpen(false);
        setEditingCar(null);
      } else if (showGuidelines) {
        setShowGuidelines(false);
      } else if (selectedCarId) {
        setSelectedCarId(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [selectedCarId, isSettingsOpen, isInstallModalOpen, isAddCarOpen, editingCar, actionCar, showGuidelines]);

  // Sync state transitions to the history API
  useEffect(() => {
    const hasActiveSubView = !!(selectedCarId || isSettingsOpen || isInstallModalOpen || isAddCarOpen || editingCar || actionCar || showGuidelines);
    
    if (hasActiveSubView) {
      if (!window.history.state || window.history.state.appView !== "sub") {
        window.history.pushState({ appView: "sub" }, "");
      }
    } else {
      if (window.history.state && window.history.state.appView === "sub") {
        window.history.back();
      }
    }
  }, [selectedCarId, isSettingsOpen, isInstallModalOpen, isAddCarOpen, editingCar, actionCar, showGuidelines]);

  // Long press detection refs and handlers
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef<boolean>(false);

  const handleTouchStart = (car: Car) => {
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setActionCar(car);
    }, 600); // 600ms hold time
  };

  const handleTouchEnd = (e: React.TouchEvent, car: Car) => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseDown = (car: Car) => {
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setActionCar(car);
    }, 600);
  };

  const handleMouseUp = (e: React.MouseEvent, car: Car) => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseLeave = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  const handleCarClick = (car: Car) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    setSelectedCarId(car.id);
  };

  // Sync state to localStorage
  useEffect(() => {
    saveToLocalStorage("cars", cars);
  }, [cars]);

  useEffect(() => {
    saveToLocalStorage("services", services);
  }, [services]);

  const handleAddCar = (newCarData: Omit<Car, "id" | "createdAt">) => {
    const newCar: Car = {
      ...newCarData,
      id: `car-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCars((prev) => [newCar, ...prev]);
  };

  const handleAddService = (newServiceData: Omit<CarService, "id" | "createdAt">) => {
    const newService: CarService = {
      ...newServiceData,
      id: `service-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setServices((prev) => [newService, ...prev]);
  };

  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const handleEditService = (updatedService: CarService) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updatedService.id ? updatedService : s))
    );
  };

  const handleDeleteCar = (carId: string) => {
    // Delete car and all its service logs
    setCars((prev) => prev.filter((c) => c.id !== carId));
    setServices((prev) => prev.filter((s) => s.carId !== carId));
    setSelectedCarId(null);
  };

  const handleEditCar = (updatedCar: Car) => {
    setCars((prev) =>
      prev.map((c) => (c.id === updatedCar.id ? updatedCar : c))
    );
    if (actionCar?.id === updatedCar.id) {
      setActionCar(updatedCar);
    }
  };

  const handleTogglePinCar = (carId: string) => {
    setCars((prev) =>
      prev.map((c) => (c.id === carId ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const handleQuickColorChange = (carId: string, colorHex: string) => {
    // Determine light/dark text contrast color
    const hex = colorHex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    const textColor = yiq >= 128 ? "#1F2937" : "#FFFFFF"; // Dark gray or White

    setCars((prev) =>
      prev.map((c) =>
        c.id === carId ? { ...c, color: colorHex, textColor } : c
      )
    );
  };

  const getCarLastOdometer = (carId: string) => {
    const carServices = services.filter((s) => s.carId === carId);
    if (carServices.length === 0) return 0;
    return Math.max(...carServices.map((s) => s.odometer));
  };

  const getCarServiceCount = (carId: string) => {
    return services.filter((s) => s.carId === carId).length;
  };

  // Filter cars based on search input
  const filteredCars = cars.filter((car) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = car.name.toLowerCase().includes(searchLower);
    const modelMatch = car.model?.toLowerCase().includes(searchLower);
    const plateMatch = car.plateNumber?.toLowerCase().includes(searchLower);
    return nameMatch || modelMatch || plateMatch;
  });

  // Sort: Pinned cars first, then newest first
  const sortedCars = [...filteredCars].sort((a, b) => {
    const aPinned = a.pinned ? 1 : 0;
    const bPinned = b.pinned ? 1 : 0;
    if (aPinned !== bPinned) {
      return bPinned - aPinned; // Pinned first
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const selectedCar = cars.find((c) => c.id === selectedCarId);

  return (
    <MobileFrame>
      <AnimatePresence>
        {selectedCar ? (
          /* Car Details View */
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute inset-0 z-10 flex flex-col h-full bg-white dark:bg-slate-950 transform-gpu will-change-[transform,opacity]"
          >
            <CarDetailView
              car={selectedCar}
              services={services}
              onBack={() => setSelectedCarId(null)}
              onAddService={handleAddService}
              onEditService={handleEditService}
              onDeleteService={handleDeleteService}
              onDeleteCar={handleDeleteCar}
            />
          </motion.div>
        ) : (
          /* Cars List Main View */
          <motion.div
            key="list"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950 transform-gpu will-change-[transform,opacity]"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-indigo-900 dark:bg-indigo-950 text-white px-5 pt-6 pb-6 rounded-b-[2rem] shadow-lg border-b border-indigo-950 flex flex-col gap-3 relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-[-50%] left-[-20%] w-48 h-48 rounded-full bg-indigo-500/15 blur-2xl"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-500/90 text-white rounded-2xl shadow-md">
                    <Wrench size={20} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-white tracking-tight font-sans">
                      My Car
                    </h1>
                    <span className="text-[10px] font-bold text-indigo-200 block font-sans">
                      مدیریت و ثبت اطلاعات دوره‌ای خودرو
                    </span>
                  </div>
                </div>

                 <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2.5 bg-indigo-800/60 hover:bg-indigo-700/80 text-white active:scale-95 transition-all rounded-xl border border-indigo-400/10 shadow-md cursor-pointer flex items-center justify-center"
                    title="تنظیمات"
                  >
                    <Settings size={15} />
                  </button>

                  <button
                    onClick={() => setIsInstallModalOpen(true)}
                    className="p-2.5 bg-indigo-800/60 hover:bg-indigo-700/80 text-white active:scale-95 transition-all rounded-xl border border-indigo-400/10 shadow-md cursor-pointer flex items-center justify-center animate-pulse"
                    title="نصب وب‌اپلیکیشن"
                  >
                    <Download size={15} className="stroke-[2.5]" />
                  </button>

                  <button
                    onClick={() => setIsAddCarOpen(true)}
                    className="p-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 transition-all rounded-xl flex items-center gap-1 text-xs font-bold cursor-pointer border border-indigo-400/20 shadow-md"
                    title="افزودن ماشین جدید"
                  >
                    <Plus size={14} className="stroke-[3]" />
                    <span>افزودن خودرو</span>
                  </button>
                </div>
              </div>

              {/* Quick Search */}
              {cars.length > 0 && (
                <div className="relative mt-1 z-10">
                  <input
                    type="text"
                    placeholder="جستجوی نام خودرو، مدل، پلاک..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-2xl text-xs placeholder-indigo-200 text-white focus:outline-none focus:bg-white focus:text-slate-800 focus:placeholder-slate-400 transition-all text-right"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-200 pointer-events-none">
                    <Search size={15} />
                  </span>
                </div>
              )}
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-24">
              
              {cars.length === 0 ? (
                /* Empty state for cars */
                <EmptyState
                  icon={CarIcon}
                  title="هیچ خودرویی ثبت نشده است"
                  description="برای شروع ثبت خدمات دوره‌ای ابتدا با کلیک روی دکمه زیر اطلاعات خودروی خود را وارد کنید."
                  actionLabel="افزودن اولین خودرو"
                  onAction={() => setIsAddCarOpen(true)}
                  accentColor="#4F46E5"
                />
              ) : (
                /* Grid of Cars */
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-sans">
                      لیست خودروهای شما
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-sans">
                      برای منو نگه‌دارید یا کلیک کنید
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {sortedCars.map((car, index) => {
                      const lastOdo = getCarLastOdometer(car.id);
                      const servicesCount = getCarServiceCount(car.id);
                      
                      // Split plate code
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

                      return (
                        <motion.div
                          key={car.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleCarClick(car)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActionCar(car);
                          }}
                          onTouchStart={() => handleTouchStart(car)}
                          onTouchEnd={(e) => handleTouchEnd(e, car)}
                          onMouseDown={() => handleMouseDown(car)}
                          onMouseUp={(e) => handleMouseUp(e, car)}
                          onMouseLeave={handleMouseLeave}
                          className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[1.75rem] p-4.5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden select-none"
                        >
                          {/* Accent Gradient Border representing car custom color on right side */}
                          <div
                            className="absolute right-0 top-0 bottom-0 w-2"
                            style={{
                              background: `linear-gradient(to bottom, ${car.color}, ${car.color}bb)`,
                            }}
                          />

                          <div className="flex justify-between items-start pr-1.5">
                            {/* Car Name & Details */}
                            <div className="space-y-1 flex-1">
                              <h4 className="text-base font-black text-slate-800 dark:text-slate-100 font-sans flex items-center gap-1.5">
                                {car.pinned && (
                                  <Pin size={12} className="text-indigo-500 fill-indigo-500 rotate-45 shrink-0" />
                                )}
                                <span>{car.name}</span>
                              </h4>
                              {car.model && (
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                  سال ساخت / مدل: {toPersianDigits(car.model)}
                                </p>
                              )}

                              {/* License Plate Indicator */}
                              {car.plateNumber ? (
                                <div className="pt-1.5 pb-0.5">
                                  <IranPlate
                                    part1={platePart1}
                                    letter={plateLetter}
                                    part2={platePart2}
                                    region={plateRegion}
                                    className="scale-90 origin-right shadow-sm"
                                  />
                                </div>
                              ) : (
                                <span className="inline-block text-[10px] text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
                                  بدون پلاک ثبت شده
                                </span>
                              )}
                            </div>

                            {/* Chevron and Action Menu */}
                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActionCar(car);
                                }}
                                className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
                                title="مدیریت خودرو"
                              >
                                <MoreVertical size={16} />
                              </button>
                              
                              <div className="p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-400 dark:text-slate-500 shrink-0">
                                <ChevronLeft size={16} />
                              </div>
                            </div>
                          </div>

                          {/* Footer Stats row */}
                          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-semibold font-sans pr-1.5">
                            <div className="flex items-center gap-1">
                              <Gauge size={12} className="text-slate-400 dark:text-slate-500" />
                              <span>کارکرد:</span>
                              <strong className="text-slate-800 dark:text-slate-200">
                                {lastOdo > 0 ? `${formatOdometer(lastOdo)} کیلومتر` : "ثبت نشده"}
                              </strong>
                            </div>

                            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />

                            <div className="flex items-center gap-1">
                              <ClipboardCheck size={12} className="text-slate-400 dark:text-slate-500" />
                              <span>سرویس‌ها:</span>
                              <strong className="text-slate-800 dark:text-slate-200">
                                {toPersianDigits(servicesCount)} بار
                              </strong>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {filteredCars.length === 0 && searchTerm && (
                      <div className="text-center py-6 text-xs text-slate-400 bg-white border border-slate-100 rounded-2xl p-4">
                        خودرویی با عبارت "{searchTerm}" یافت نشد.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vehicle Health recommendations panel */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowGuidelines(!showGuidelines)}
                  className="w-full p-4 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 rounded-2xl flex items-center justify-between text-right text-indigo-950 transition-colors cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-600 stroke-[2.5]" />
                    <div>
                      <span className="text-xs font-black block font-sans">راهنمای طلایی تعویض قطعات مصرفی</span>
                      <span className="text-[10px] text-indigo-500 font-bold block">بهترین زمان تعویض فیلترها، تسمه‌ها و روغن خودرو</span>
                    </div>
                  </div>
                  <ChevronLeft
                    size={16}
                    className={`text-indigo-600 transition-transform duration-300 ${
                      showGuidelines ? "rotate-90" : "rotate-0"
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showGuidelines && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden bg-slate-50 border-x border-b border-indigo-100 rounded-b-2xl -mt-2 p-4 pt-6 space-y-3"
                    >
                      <div className="flex items-start gap-2 text-[10px] text-slate-600 bg-white p-2.5 rounded-xl leading-relaxed mb-1.5 border border-slate-100">
                        <Info size={13} className="text-indigo-500 shrink-0 mt-0.5" />
                        <p className="font-bold">
                          دوره‌های زمانی پیشنهادی در جدول زیر حدودی بوده و به شرایط آب و هوا، کیفیت قطعات و نوع رانندگی شما بستگی دارد.
                        </p>
                      </div>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {MAINTENANCE_RECOMMENDATIONS.map((rec) => (
                          <div
                            key={rec.part}
                            className="bg-white border border-slate-200/60 p-3 rounded-xl flex flex-col gap-1 text-[11px] font-sans shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-indigo-950">{rec.part}</span>
                              <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg text-[10px]">
                                {toPersianDigits(rec.interval)}
                              </span>
                            </div>
                            <span className="text-slate-500 font-semibold text-[10px]">{rec.notes}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>



            {/* Add / Edit Car Modal */}
            <AddCarModal
              isOpen={isAddCarOpen || editingCar !== null}
              onClose={() => {
                setIsAddCarOpen(false);
                setEditingCar(null);
              }}
              onAddCar={handleAddCar}
              editingCar={editingCar || undefined}
              onEditCar={handleEditCar}
            />

            {/* Settings Modal */}
            <AnimatePresence>
              {isSettingsOpen && (
                <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
                  {/* Backdrop Close */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSettingsOpen(false)}
                    className="absolute inset-0 animate-fade-in"
                  />

                  {/* Settings Sheet */}
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2rem] p-6 shadow-2xl border-t border-slate-200/80 dark:border-slate-800 z-10 flex flex-col gap-5 relative text-right"
                    dir="rtl"
                  >
                    {/* Header line */}
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2" />

                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 font-sans">
                        <Settings size={18} className="text-indigo-600" />
                        <span>تنظیمات برنامه</span>
                      </h3>
                      <button
                        onClick={() => setIsSettingsOpen(false)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl cursor-pointer transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Dark Mode toggle */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">حالت تاریک (شب)</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">کاهش خستگی چشم در محیط‌های تاریک</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`w-11 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
                          isDarkMode ? "bg-indigo-600" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                            isDarkMode ? "-translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Font size picker */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                          <Type size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">سایز نوشته‌ها</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans font-semibold">تغییر اندازه قلم در تمام بخش‌های برنامه</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-1 font-sans">
                        {(['sm', 'md', 'lg'] as const).map((size) => {
                          const labels = { sm: "کوچک", md: "استاندارد", lg: "بزرگ" };
                          const isSelected = fontSize === size;
                          return (
                            <button
                              key={size}
                              onClick={() => setFontSize(size)}
                              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {labels[size]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Font family picker */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                          <Palette size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">نوع قلم (فونت فارسی)</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans font-semibold">انتخاب فونت و ظاهر کل بخش‌های برنامه</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {[
                          { id: "vazirmatn", label: "وزیر متن (پیش‌فرض)", style: "font-sans font-black" },
                          { id: "notoSans", label: "نوترو سانز (ساده)", style: "font-notosans font-black" },
                          { id: "amiri", label: "امیری (کلاسیک)", style: "font-amiri font-bold" },
                          { id: "reemKufi", label: "ریم کوفی (تزئینی)", style: "font-reemkufi font-bold" },
                        ].map((font) => {
                          const isSelected = activeFont === font.id;
                          return (
                            <button
                              key={font.id}
                              onClick={() => setActiveFont(font.id as any)}
                              className={`py-2 px-1 text-xs rounded-xl transition-all border cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                              } ${font.style}`}
                            >
                              {font.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add PWA install shortcut in settings */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                      <button
                        onClick={() => {
                          setIsSettingsOpen(false);
                          setTimeout(() => {
                            setIsInstallModalOpen(true);
                          }, 150);
                        }}
                        className="w-full py-3.5 px-4 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-black text-xs rounded-2xl cursor-pointer active:scale-98 transition-all flex items-center justify-between border border-indigo-100 dark:border-indigo-950/60"
                      >
                        <div className="flex items-center gap-2">
                          <Smartphone size={16} />
                          <span>راهنمای نصب وب‌اپلیکیشن (آفلاین)</span>
                        </div>
                        <ChevronLeft size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer active:scale-98 transition-all shadow-md shadow-indigo-600/10 mt-1 font-sans"
                    >
                      تایید و ذخیره تنظیمات
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* PWA Installation Modal */}
            <AnimatePresence>
              {isInstallModalOpen && (
                <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
                  {/* Backdrop Close */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsInstallModalOpen(false)}
                    className="absolute inset-0 z-10"
                  />

                  {/* Settings Sheet */}
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2rem] p-6 shadow-2xl border-t border-slate-200/80 dark:border-slate-800 z-20 flex flex-col gap-4 relative text-right"
                    dir="rtl"
                  >
                    {/* Header line */}
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-1" />

                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 font-sans">
                        <Smartphone size={18} className="text-indigo-600" />
                        <span>راهنمای نصب وب‌اپلیکیشن (PWA)</span>
                      </h3>
                      <button
                        onClick={() => setIsInstallModalOpen(false)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl cursor-pointer transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* App Icon Preview & Name */}
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <img
                        src="/icon_192.png"
                        alt="My Car Icon"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/icon_192.png";
                        }}
                      />
                      <div className="flex-1 text-right">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 font-sans">
                          وب‌اپلیکیشن مدیریت خودرو (My Car)
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans leading-relaxed">
                          با نصب این برنامه روی صفحه اصلی گوشی خود، می‌توانید در هر زمان به سرعت و به صورت کاملاً آفلاین به خدمات خودروی خود دسترسی داشته باشید.
                        </p>
                      </div>
                    </div>

                    {/* IFrame warning if running inside an iframe */}
                    {window.self !== window.top && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-3.5 flex items-start gap-2 text-xs">
                        <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-amber-800 dark:text-amber-300 block">توجه برای نصب:</span>
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold leading-relaxed block mt-0.5">
                            به دلیل اجرا شدن برنامه در داخل فریم بررسی هوشمند، قابلیت نصب مستقیم مرورگر غیرفعال است. لطفاً ابتدا دکمه زیر را بزنید تا برنامه در یک تب مجزا باز شود، سپس اقدام به نصب نمایید.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Interactive platform tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      {[
                        { id: 'android', label: 'اندروید' },
                        { id: 'ios', label: 'آیفون / iOS' },
                        { id: 'desktop', label: 'کامپیوتر' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveInstallTab(tab.id as any)}
                          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                            activeInstallTab === tab.id
                              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab contents */}
                    <div className="min-h-[140px] px-1 text-right">
                      {activeInstallTab === 'android' && (
                        <ol className="list-decimal list-inside space-y-2 text-xs font-sans font-semibold text-slate-600 dark:text-slate-300">
                          <li>مرورگر <strong className="text-indigo-600 dark:text-indigo-400">Chrome</strong> را روی گوشی خود باز کنید.</li>
                          <li>وارد لینک اصلی برنامه (با زدن دکمه باز کردن در تب جدید) شوید.</li>
                          <li>روی دکمه سه نقطه <strong className="text-slate-800 dark:text-slate-100">⋮</strong> در بالا سمت راست ضربه بزنید.</li>
                          <li>گزینه <strong className="text-slate-800 dark:text-slate-100">«Install app»</strong> یا <strong className="text-slate-800 dark:text-slate-100">«Add to Home screen»</strong> را انتخاب کنید.</li>
                          <li>در پیام ظاهر شده روی دکمه <strong className="text-indigo-600 dark:text-indigo-400">Install</strong> ضربه بزنید.</li>
                        </ol>
                      )}

                      {activeInstallTab === 'ios' && (
                        <ol className="list-decimal list-inside space-y-2 text-xs font-sans font-semibold text-slate-600 dark:text-slate-300">
                          <li>مرورگر <strong className="text-indigo-600 dark:text-indigo-400">Safari</strong> را باز کرده و به لینک برنامه بروید.</li>
                          <li>در نوار پایین روی دکمه اشتراک‌گذاری یا <strong className="text-slate-800 dark:text-slate-100">«Share»</strong> (مربع با فلش رو به بالا) ضربه بزنید.</li>
                          <li>منو را به بالا بکشید و گزینه <strong className="text-indigo-600 dark:text-indigo-400">«Add to Home Screen»</strong> (افزودن به صفحه اصلی) را انتخاب کنید.</li>
                          <li>در بالا سمت راست، دکمه <strong className="text-indigo-600 dark:text-indigo-400">Add</strong> یا <strong className="text-indigo-600 dark:text-indigo-400">افزودن</strong> را بزنید.</li>
                        </ol>
                      )}

                      {activeInstallTab === 'desktop' && (
                        <ol className="list-decimal list-inside space-y-2 text-xs font-sans font-semibold text-slate-600 dark:text-slate-300">
                          <li>برنامه را در مرورگر کروم، اج یا فایرفاکس سیستم باز کنید.</li>
                          <li>در انتهای نوار آدرس بالا، روی آیکون <strong className="text-indigo-600 dark:text-indigo-400">Install</strong> (نماد مانیتور با فلش رو به پایین یا علامت مثبت) کلیک کنید.</li>
                          <li>در پنجره باز شده روی دکمه <strong className="text-indigo-600 dark:text-indigo-400">Install</strong> کلیک نمایید.</li>
                          <li>برنامه مانند یک نرم‌افزار دسکتاپ مستقل با آیکون اختصاصی اجرا خواهد شد.</li>
                        </ol>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        onClick={() => {
                          window.open(window.location.origin, "_blank");
                        }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer active:scale-98 transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 font-sans"
                      >
                        <Download size={14} className="stroke-[2.5]" />
                        <span>باز کردن برنامه در تب جدید جهت نصب</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2 font-sans border border-slate-200 dark:border-slate-800"
                      >
                        {isCopied ? (
                          <>
                            <Check size={14} className="text-emerald-500 stroke-[2.5]" />
                            <span className="text-emerald-600 dark:text-emerald-400">لینک برنامه با موفقیت کپی شد!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>کپی لینک مستقیم برای ارسال به دوستان</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Car Action Menu (Long press menu) */}
            <AnimatePresence>
              {actionCar && (
                <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-xs">
                  {/* Backdrop Close */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActionCar(null)}
                    className="absolute inset-0"
                  />

                  {/* Actions Sheet */}
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2rem] p-6 shadow-2xl border-t border-slate-200/80 dark:border-slate-800 z-10 flex flex-col gap-4 text-right"
                    dir="rtl"
                  >
                    {/* Header drag line */}
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-1" />

                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 font-sans">
                          {actionCar.name}
                        </h3>
                        {actionCar.model && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">
                            مدل {toPersianDigits(actionCar.model)}
                          </span>
                        )}
                      </div>
                      <span className="inline-block w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: actionCar.color }} />
                    </div>

                    {/* Action Items List */}
                    <div className="space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                      
                      {/* Pin Button */}
                      <button
                        onClick={() => {
                          handleTogglePinCar(actionCar.id);
                          setActionCar(null);
                        }}
                        className="w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {actionCar.pinned ? (
                            <PinOff size={16} className="text-slate-400 dark:text-slate-500" />
                          ) : (
                            <Pin size={16} className="text-slate-400 dark:text-slate-500" />
                          )}
                          <span>{actionCar.pinned ? "برداشتن پین از بالا" : "پین کردن در بالای فهرست"}</span>
                        </div>
                        <span className="text-[10px] text-indigo-500 font-bold font-sans">
                          {actionCar.pinned ? "حذف سنجاق" : "سنجاق کردن"}
                        </span>
                      </button>

                      {/* Edit Details */}
                      <button
                        onClick={() => {
                          const carToEdit = actionCar;
                          setActionCar(null);
                          // Delay slightly so previous modal closes beautifully
                          setTimeout(() => {
                            setEditingCar(carToEdit);
                          }, 150);
                        }}
                        className="w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Edit size={16} className="text-slate-400 dark:text-slate-500" />
                          <span>ویرایش مشخصات خودرو</span>
                        </div>
                        <span className="text-[10px] text-amber-600 font-bold font-sans">ویرایش</span>
                      </button>

                      {/* Quick Color Change Selector */}
                      <div className="w-full p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl flex flex-col gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <Palette size={16} className="text-slate-400 dark:text-slate-500" />
                          <span className="text-slate-800 dark:text-slate-100 text-xs">تغییر سریع رنگ کارت</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 justify-center py-1.5 px-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50">
                          {[
                            "#4F46E5", // Indigo
                            "#0EA5E9", // Sky Blue
                            "#10B981", // Emerald
                            "#F43F5E", // Coral Red
                            "#F59E0B", // Yellow Gold
                            "#8B5CF6", // Purple
                            "#374151", // Charcoal
                          ].map((col) => {
                            const isCurrent = actionCar.color.toLowerCase() === col.toLowerCase();
                            return (
                              <button
                                key={col}
                                onClick={() => handleQuickColorChange(actionCar.id, col)}
                                className={`w-5 h-5 rounded-full transition-all active:scale-90 cursor-pointer ${
                                  isCurrent ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110 shadow-md" : "hover:scale-105"
                                }`}
                                style={{ backgroundColor: col }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Delete Vehicle */}
                      <button
                        onClick={() => {
                          if (window.confirm(`آیا از حذف خودروی "${actionCar.name}" با تمام مشخصات و تاریخچه خدمات آن اطمینان دارید؟`)) {
                            handleDeleteCar(actionCar.id);
                            setActionCar(null);
                          }
                        }}
                        className="w-full p-3 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-between transition-colors cursor-pointer mt-1"
                      >
                        <div className="flex items-center gap-2.5">
                          <Trash2 size={16} className="text-red-500" />
                          <span className="font-extrabold text-red-600 dark:text-red-400">حذف این خودرو با تمام اطلاعات</span>
                        </div>
                        <span className="text-[10px] bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-bold px-2 py-0.5 rounded-lg font-sans">خطرناک</span>
                      </button>

                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>


          </motion.div>
        )}
      </AnimatePresence>
    </MobileFrame>
  );
}
