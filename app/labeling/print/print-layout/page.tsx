"use client";

import React, { useEffect, useState } from "react";

export default function PrintLayoutPage() {
  const [printData, setPrintData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("inventra_print_data");
    if (data) {
      setPrintData(JSON.parse(data));
      // Hapus data setelah dibaca agar tidak menumpuk
      // localStorage.removeItem("inventra_print_data");
      
      // Beri sedikit delay agar rendering selesai sebelum print dialog muncul
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, []);

  if (!printData) return <div className="p-10 text-center">Loading print data...</div>;

  const getLabelStyle = () => {
    switch(printData.labelSize) {
      case "S": return "w-[25mm] h-[15mm] text-[7px] p-1";
      case "M": return "w-[40mm] h-[25mm] text-[9px] p-2";
      case "L": return "w-[60mm] h-[40mm] text-[12px] p-3";
      case "XL": return "w-[80mm] h-[50mm] text-[14px] p-4";
      default: return "w-[40mm] h-[25mm]";
    }
  };

  const getPaperStyle = () => {
    switch(printData.paperSize) {
      case "A4": return "w-[210mm]";
      case "A5": return "w-[148mm]";
      case "Letter": return "w-[216mm]";
      default: return "w-[210mm]";
    }
  };

  // Generate flat array based on copies
  const allLabels = printData.items.flatMap((item: any) => 
    Array(printData.copies).fill(item)
  );

  return (
    <div className={`bg-white mx-auto ${getPaperStyle()} min-h-screen p-[10mm] font-sans text-black`}>
      <style jsx global>{`
        @media print {
          body { background: white; margin: 0; padding: 0; }
          @page { margin: 0; }
          .no-print { display: none; }
        }
      `}</style>

      <div className="no-print mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
        <div>
          <p className="text-sm font-bold text-amber-800">Print Preview Mode</p>
          <p className="text-xs text-amber-700">Ukuran Kertas: {printData.paperSize} | Ukuran Label: {printData.labelSize} | Total: {allLabels.length} Label</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-amber-700 transition-all"
        >
          Buka Dialog Cetak
        </button>
      </div>

      <div className="flex flex-wrap gap-2 justify-start content-start">
        {allLabels.map((item: any, idx: number) => (
          <div 
            key={`${item.id}-${idx}`} 
            className={`border border-black flex flex-col overflow-hidden break-inside-avoid ${getLabelStyle()}`}
          >
            <div className="flex justify-between items-start border-b border-black/20 pb-0.5 mb-1">
              <div className="font-black uppercase tracking-tighter">INVENTRA</div>
              <div className="font-mono opacity-50">#LBL</div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <p className="font-bold truncate uppercase tracking-tighter">{item.name}</p>
              <p className="font-mono opacity-70">{item.id}</p>
            </div>
            
            <div className="mt-auto pt-0.5 border-t border-black/20 flex items-center justify-between font-mono">
              <span className="font-bold border border-black px-1">{item.sku}</span>
              <span className="opacity-40">v1.0</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
