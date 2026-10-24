"use client";

import { useState } from "react";
import userService from "@/services/UserService";
import Icon from "./Icon";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "away", label: "Away" },
  { value: "busy", label: "Busy" },
  { value: "do not disturb", label: "Do not disturb" },
  { value: "chilling", label: "Chilling" },
  { value: "inactive", label: "Inactive" },
  { value: "offline", label: "Offline" },
];

type StatusSelectorProps = {
  currentStatus?: string;
  onStatusChange: (newStatus: string) => void;
};

export default function StatusSelector({
  currentStatus = "active",
  onStatusChange,
}: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const handleSelectStatus = async (status: string) => {
    if (status === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setError("");
    try {
      await userService.updateProfile({ status });
      onStatusChange(status);
    } catch {
      setError("Status couldn't be updated.");
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="status-control">
      <button
        className="status-trigger"
        onClick={() => setIsOpen((open) => !open)}
        disabled={isUpdating}
        aria-expanded={isOpen}
      >
        <span className={`status-dot status-${currentStatus.replaceAll(" ", "-")}`} />
        <span>{STATUS_OPTIONS.find((option) => option.value === currentStatus)?.label ?? "Active"}</span>
        <Icon name="chevron" />
      </button>
      {isOpen && (
        <div className="status-menu" role="menu" aria-label="Set your status">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={option.value === currentStatus ? "status-option selected" : "status-option"}
              onClick={() => handleSelectStatus(option.value)}
              role="menuitem"
            >
              <span className={`status-dot status-${option.value.replaceAll(" ", "-")}`} />
              {option.label}
            </button>
          ))}
        </div>
      )}
      {error && <span className="status-error" role="status">{error}</span>}
    </div>
  );
}
