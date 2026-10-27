export interface AuditLog {
  id: string;
  action: string;
  target: string;
  description: string;
  user: string;
  date: string;
}

const auditTemplates = [
  { action: "Create", target: "Inventory", description: "Menambahkan 20 unit Intel Core i7-14700K dari penerimaan barang vendor." },
  { action: "Update", target: "Asset", description: "Memperbarui kondisi aset Dell PowerEdge R650 menjadi Maintenance." },
  { action: "Delete", target: "User", description: "Menghapus akun staf gudang yang sudah dinonaktifkan." },
  { action: "Login", target: "System", description: "Masuk ke dashboard Inventra melalui halaman login." },
  { action: "Update", target: "Vendor", description: "Memperbarui nomor kontak PT Nusantara Komponen Digital." },
  { action: "Create", target: "Report", description: "Membuat laporan kerusakan SSD NVMe tidak terdeteksi pada ThinkPad T14." },
  { action: "Export", target: "Audit Trail", description: "Mengunduh log audit trail dalam format PDF." },
  { action: "Update", target: "Storage", description: "Memindahkan 12 unit RTX 4070 ke Rak GPU tingkat 2 di Gudang Komponen." },
  { action: "Create", target: "Asset", description: "Menambahkan aset baru berupa printer label Zebra ZD421." },
  { action: "Update", target: "Inventory", description: "Menyesuaikan stok Thermal Grizzly Kryonaut 1g setelah stock opname." },
];

const auditUsers = ["Admin User", "Manager User", "Supervisor Gudang", "Staff Inventory"];

export const auditLogs: AuditLog[] = Array.from({ length: 30 }, (_, i) => {
  const template = auditTemplates[i % auditTemplates.length];

  return {
    id: `LOG-${5000 + i}`,
    action: template.action,
    target: template.target,
    description: template.description,
    user: auditUsers[i % auditUsers.length],
    date: `2026-03-${String((i % 28) + 1).padStart(2, "0")} ${String(8 + (i % 9)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:${String((i * 11) % 60).padStart(2, "0")}`,
  };
});

export const formatAuditDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/,/g, "");
};

export const formatAuditDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
};

export const filterAuditLogsByRange = (logs: AuditLog[], startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59.999`);

  return logs.filter((log) => {
    const logDate = new Date(log.date.replace(" ", "T"));
    return logDate >= start && logDate <= end;
  });
};
