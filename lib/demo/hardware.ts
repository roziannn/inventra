// Demo data for an IT hardware warehouse (PC components, peripherals, networking). Replace with API data later.

export const hardwareCategories = ["Processor", "Memory", "Storage", "Graphics Card", "Motherboard", "Power Supply", "Cooling", "Casing", "Peripheral", "Networking", "Cable & Accessories"] as const;
export type HardwareCategory = (typeof hardwareCategories)[number];

export interface HardwareItem {
  id: string;
  name: string;
  category: HardwareCategory;
  sku: string;
  unit: string;
  stock: number;
  minStock: number;
}

const h = (n: number, name: string, category: HardwareCategory, sku: string, unit: string, stock: number, minStock: number): HardwareItem => ({
  id: `INV-${1000 + n}`,
  name,
  category,
  sku,
  unit,
  stock,
  minStock,
});

export const hardwareCatalog: HardwareItem[] = [
  h(1, "Intel Core i9-14900K", "Processor", "CPU-I9-14900K", "Pcs", 14, 10),
  h(2, "Intel Core i7-14700K", "Processor", "CPU-I7-14700K", "Pcs", 26, 12),
  h(3, "Intel Core i5-14600K", "Processor", "CPU-I5-14600K", "Pcs", 38, 15),
  h(4, "AMD Ryzen 9 7950X", "Processor", "CPU-R9-7950X", "Pcs", 9, 10),
  h(5, "AMD Ryzen 7 7800X3D", "Processor", "CPU-R7-7800X3D", "Pcs", 21, 12),
  h(6, "AMD Ryzen 5 7600X", "Processor", "CPU-R5-7600X", "Pcs", 33, 15),
  h(7, "Corsair Vengeance DDR5 32GB 6000MHz", "Memory", "RAM-D5-32-6000", "Kit", 4, 20),
  h(8, "Kingston Fury Beast DDR4 16GB 3200MHz", "Memory", "RAM-D4-16-3200", "Pcs", 64, 30),
  h(9, "G.Skill Trident Z5 DDR5 64GB 6400MHz", "Memory", "RAM-D5-64-6400", "Kit", 11, 8),
  h(10, "Samsung 990 Pro NVMe 1TB", "Storage", "SSD-990P-1T", "Pcs", 42, 20),
  h(11, "WD Black SN850X NVMe 2TB", "Storage", "SSD-SN850X-2T", "Pcs", 18, 10),
  h(12, "Crucial MX500 SATA SSD 500GB", "Storage", "SSD-MX500-500", "Pcs", 55, 25),
  h(13, "Seagate BarraCuda HDD 4TB", "Storage", "HDD-BC-4T", "Pcs", 27, 12),
  h(14, "NVIDIA GeForce RTX 4070 12GB", "Graphics Card", "GPU-RTX4070-12", "Pcs", 12, 8),
  h(15, "NVIDIA GeForce RTX 4060 8GB", "Graphics Card", "GPU-RTX4060-8", "Pcs", 19, 10),
  h(16, "AMD Radeon RX 7800 XT 16GB", "Graphics Card", "GPU-RX7800XT-16", "Pcs", 7, 8),
  h(17, "ASUS ROG Strix B760-F Gaming", "Motherboard", "MB-B760F-ASUS", "Pcs", 16, 10),
  h(18, "MSI MAG B650 Tomahawk WiFi", "Motherboard", "MB-B650T-MSI", "Pcs", 13, 10),
  h(19, "Gigabyte Z790 AORUS Elite AX", "Motherboard", "MB-Z790AE-GB", "Pcs", 8, 6),
  h(20, "Corsair RM850x 850W 80+ Gold", "Power Supply", "PSU-RM850X", "Pcs", 22, 10),
  h(21, "Seasonic Focus GX-750 750W", "Power Supply", "PSU-GX750", "Pcs", 17, 10),
  h(22, "Noctua NH-D15 CPU Cooler", "Cooling", "CLR-NH-D15", "Pcs", 15, 8),
  h(23, "Arctic Liquid Freezer II 360", "Cooling", "CLR-LF2-360", "Pcs", 10, 6),
  h(24, "Thermal Grizzly Kryonaut 1g", "Cooling", "THM-KRYO-1G", "Pcs", 9, 40),
  h(25, "NZXT H510 Mid Tower", "Casing", "CSE-H510", "Unit", 20, 10),
  h(26, "Lian Li O11 Dynamic EVO", "Casing", "CSE-O11D", "Unit", 6, 6),
  h(27, "Logitech MX Master 3S Mouse", "Peripheral", "PER-MXM3S", "Pcs", 31, 15),
  h(28, "Keychron K8 Pro Keyboard", "Peripheral", "PER-K8PRO", "Pcs", 24, 12),
  h(29, "Dell UltraSharp U2723QE 27 inch", "Peripheral", "MON-U2723QE", "Unit", 12, 8),
  h(30, "LG 24MP400 24 inch IPS", "Peripheral", "MON-24MP400", "Unit", 28, 15),
  h(31, "TP-Link Archer AX55 WiFi 6 Router", "Networking", "NET-AX55", "Unit", 23, 12),
  h(32, "Ubiquiti UniFi Switch 24 PoE", "Networking", "NET-USW24POE", "Unit", 5, 4),
  h(33, "Intel AX210 WiFi 6E Card", "Networking", "NET-AX210", "Pcs", 36, 20),
  h(34, "Kabel UTP Cat6 305m", "Cable & Accessories", "CBL-CAT6-305", "Roll", 8, 6),
  h(35, "RJ45 Connector Cat6 (isi 100)", "Cable & Accessories", "CBL-RJ45-100", "Pack", 42, 60),
  h(36, "HDMI 2.1 Cable 2m", "Cable & Accessories", "CBL-HDMI21-2M", "Pcs", 75, 30),
  h(37, "Baterai CMOS CR2032", "Cable & Accessories", "ACC-CR2032", "Pcs", 14, 40),
  h(38, "Cable Ties 20cm (isi 100)", "Cable & Accessories", "ACC-TIE-20", "Pack", 75, 50),
];

export const isLowStock = (item: Pick<HardwareItem, "stock" | "minStock">) => item.stock < item.minStock;

/** how far below its minimum an item is: "Urgent" below 40% of the minimum, otherwise "Low" */
export const lowStockLevel = (item: Pick<HardwareItem, "stock" | "minStock">) => (item.stock < item.minStock * 0.4 ? "Urgent" : "Low");

export const lowStockItems = hardwareCatalog.filter(isLowStock);
export const totalStock = hardwareCatalog.reduce((sum, i) => sum + i.stock, 0);

// ---------- assets (company-owned IT equipment) ----------

export const assetCategories = ["Laptop", "Desktop & Workstation", "Server", "Monitor", "Networking", "Printer & Scanner", "Power (UPS)"] as const;

const assetTemplates: { name: string; category: (typeof assetCategories)[number]; prefix: string }[] = [
  { name: "Dell Latitude 5440", category: "Laptop", prefix: "DL" },
  { name: "Lenovo ThinkPad T14 Gen 4", category: "Laptop", prefix: "LN" },
  { name: "MacBook Pro 14 M3", category: "Laptop", prefix: "MB" },
  { name: "HP EliteBook 840 G10", category: "Laptop", prefix: "HP" },
  { name: "Dell Precision 3660 Tower", category: "Desktop & Workstation", prefix: "PR" },
  { name: "HP Z2 G9 Workstation", category: "Desktop & Workstation", prefix: "HZ" },
  { name: "Dell PowerEdge R650 Server", category: "Server", prefix: "PE" },
  { name: "HPE ProLiant DL380 Gen10", category: "Server", prefix: "DL" },
  { name: "Dell UltraSharp U2723QE 27 inch", category: "Monitor", prefix: "UD" },
  { name: "LG 27UK850 4K Monitor", category: "Monitor", prefix: "LG" },
  { name: "Cisco Catalyst 2960-X Switch", category: "Networking", prefix: "CS" },
  { name: "Ubiquiti UniFi U6 Pro Access Point", category: "Networking", prefix: "UB" },
  { name: "Zebra ZD421 Label Printer", category: "Printer & Scanner", prefix: "ZB" },
  { name: "HP LaserJet Pro M404dn", category: "Printer & Scanner", prefix: "LJ" },
  { name: "APC Smart-UPS 1500VA", category: "Power (UPS)", prefix: "AP" },
];

const assetPeople = ["Budi Santoso", "Siti Aminah", "Andi Wijaya", "Rina Permata", "Unassigned"];

export const demoAssets = Array.from({ length: 30 }, (_, i) => {
  const t = assetTemplates[i % assetTemplates.length];
  return {
    id: `AST-${2000 + i}`,
    name: t.name,
    category: t.category as string,
    serialNumber: `${t.prefix}${2023 + (i % 3)}${String(48210 + i * 37).padStart(6, "0")}`,
    condition: i % 7 === 0 ? "Maintenance" : i % 11 === 5 ? "Broken" : "Good",
    assignee: t.category === "Server" || t.category === "Networking" || t.category === "Power (UPS)" ? "IT Infrastructure" : assetPeople[i % assetPeople.length],
  };
});

// ---------- vendors ----------

export const vendorCategories = ["Processor & Memory", "Storage", "Peripheral & Monitor", "Networking", "Cooling & Casing", "Power & UPS"] as const;
