/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = "#3B82F6",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-gray-200 rounded-2xl shadow-sm"
    >
      <div
        className="p-4 rounded-full mb-4 animate-bounce"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        <Icon size={44} className="stroke-[1.5]" />
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-2 font-sans">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6 font-sans">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 duration-200 flex items-center gap-2"
          style={{ backgroundColor: accentColor }}
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </motion.div>
  );
}
