"use client";

import React, { useState, useEffect, useRef } from "react";
import { IconSearch, IconChevronDown, IconCheck } from "@tabler/icons-react";

interface Option {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  required?: boolean;
}

export default function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  label,
  required 
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.label === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      {label && <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border transition-all cursor-pointer rounded-xl ${
          isOpen ? "ring-2 ring-violet-500/10 border-violet-300/40 bg-white" : "border-gray-100"
        }`}
      >
        <span className={`text-sm ${!value ? "text-gray-400" : "text-gray-900 font-medium"}`}>
          {value || placeholder}
        </span>
        <IconChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[200] mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-gray-50">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                autoFocus
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs focus:ring-0"
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.label);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="px-4 py-3 hover:bg-violet-50 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-800 group-hover:text-violet-500">{opt.label}</p>
                    {opt.sublabel && <p className="text-xs text-gray-400">{opt.sublabel}</p>}
                  </div>
                  {value === opt.label && <IconCheck size={16} className="text-violet-500" stroke={3} />}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400 text-xs italic">
                Tidak ada hasil ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
