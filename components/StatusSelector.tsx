"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

// Status Configuration Mapping
const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "bg-emerald-500", icon: "🟢", desc: "Online and available" },
  { value: "away", label: "Away", color: "bg-amber-500", icon: "🌙", desc: "Stepped away briefly" },
  { value: "busy", label: "Busy", color: "bg-rose-500", icon: "⛔", desc: "Do not disturb" },
  { value: "do not disturb", label: "Do Not Disturb", color: "bg-rose-600", icon: "🔕", desc: "Mute notifications" },
  { value: "chilling", label: "Chilling", color: "bg-indigo-500", icon: "🎧", desc: "Relaxing / Listening" },
  { value: "inactive", label: "Inactive", color: "bg-gray-400", icon: "💤", desc: "Idle mode" },
  { value: "offline", label: "Offline", color: "bg-gray-500", icon: "⚪", desc: "Appear offline" },
];

interface StatusSelectorProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

export default function StatusSelector({ currentStatus, onStatusChange }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = STATUS_OPTIONS.find((s) => s.value === currentStatus) || STATUS_OPTIONS[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStatus = async (statusValue: string) => {
    if (statusValue === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await axios.put(
        "http://localhost:3000/api/user/profile",
        { status: statusValue },
        { withCredentials: true }
      );
      onStatusChange(statusValue);
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200 shadow-sm"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${activeOption.color} animate-pulse`} />
        <span className="capitalize">{activeOption.label}</span>
        <span className="text-xs text-gray-400">▾</span>
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 py-2">
            Set Status
          </p>
          <div className="space-y-1">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectStatus(option.value)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                  currentStatus === option.value
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{option.icon}</span>
                  <div>
                    <p className="text-sm leading-none capitalize">{option.label}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{option.desc}</p>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${option.color}`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}