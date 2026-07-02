/**
 * @file DateFilePlaceholders.jsx
 * @description High-fidelity DatePicker and FileUpload components for inclusion in transit filter forms.
 */

import React, { useState, useRef } from "react";
import { Calendar, UploadCloud, File, AlertCircle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Date Picker Placeholder Component
export const DatePicker = ({ label, value, onChange, placeholder = "Select Date...", error }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Simulated calendar grid click selection
  const handleSelectSimulatedDate = (day) => {
    const formatted = `2026-07-${day < 10 ? `0${day}` : day}`;
    onChange && onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-1 relative">
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-1 text-sm text-text-primary shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-left",
          error && "border-danger focus:ring-danger"
        )}
      >
        <span className={cn(!value && "text-text-muted")}>
          {value || placeholder}
        </span>
        <Calendar className="h-4 w-4 text-text-muted shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 p-3 rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 w-[240px]">
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-border/40">
            <span className="text-xs font-semibold text-text-primary">July 2026</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-text-muted mb-1">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Render 31 days with offsets */}
            {Array.from({ length: 3 }).map((_, i) => <span key={`empty-${i}`} />)}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const dateStr = `2026-07-${day < 10 ? `0${day}` : day}`;
              const isSelected = value === dateStr;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectSimulatedDate(day)}
                  className={cn(
                    "p-1 rounded-sm text-center font-mono hover:bg-secondary hover:text-text-primary transition-colors",
                    isSelected && "bg-primary text-primary-foreground font-bold hover:bg-primary-hover hover:text-primary-foreground"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
};
DatePicker.displayName = "DatePicker";

// File Upload Placeholder Component
export const FileUpload = ({ label, accept, onFileSelect, maxSizeMb = 5, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setUploadError("");
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (selectedFile) => {
    const sizeMb = selectedFile.size / (1024 * 1024);
    if (sizeMb > maxSizeMb) {
      setUploadError(`File is too large. Max size is ${maxSizeMb}MB.`);
      return;
    }
    setFile(selectedFile);
    onFileSelect && onFileSelect(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
          {label}
        </label>
      )}
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed border-border/80 rounded-lg p-5 bg-card text-center cursor-pointer hover:bg-secondary/10 transition-colors select-none",
          dragActive && "border-primary bg-primary/5",
          (error || uploadError) && "border-danger bg-danger/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {!file ? (
          <>
            <UploadCloud className="h-8 w-8 text-text-muted mb-2 animate-bounce" />
            <p className="text-xs font-semibold text-text-primary">
              Drag & Drop file or <span className="text-primary hover:underline">browse</span>
            </p>
            <p className="text-[10px] text-text-muted mt-1">
              Supports GTFS feed ZIPs, CSV schedules up to {maxSizeMb}MB
            </p>
          </>
        ) : (
          <div className="flex items-center gap-3 w-full text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-2 bg-primary/10 rounded text-primary">
              <File className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{file.name}</p>
              <p className="text-[10px] text-text-muted">{(file.size / 1024).toFixed(1)} KB • Ready</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {(error || uploadError) && (
        <p className="text-xs text-danger font-medium flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {error || uploadError}
        </p>
      )}
    </div>
  );
};
FileUpload.displayName = "FileUpload";
