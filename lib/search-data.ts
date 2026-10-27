import { demoAssets, hardwareCatalog } from "@/lib/demo/hardware";

export const searchData = {
  inventory: hardwareCatalog.map((i) => ({ id: i.id, title: i.name, category: i.category as string, sku: i.sku })),
  assets: demoAssets.map((a) => ({ id: a.id, title: a.name, category: a.category, serial: a.serialNumber })),
  reports: [
    { id: "TRX-1000", title: "Dell Latitude 5440", reporter: "Budi Santoso", token: "TOKEN-1000X" },
    { id: "TRX-1001", title: "Dell PowerEdge R650 Server", reporter: "Siti Aminah", token: "TOKEN-1001X" },
  ],
  users: [
    { id: "USR-500", title: "Ahmad", email: "user0@inventra.co.id" },
    { id: "USR-501", title: "Sarah Miller", email: "user1@inventra.co.id" },
    { id: "USR-502", title: "John Doe", email: "user2@inventra.co.id" },
  ],
  vendors: [
    { id: "VND-101", title: "PT. Nusantara Komponen Digital", email: "sales@nusantarakomponen.co.id", category: "Processor & Memory" },
    { id: "VND-102", title: "PT. Prima Chip Teknologi", email: "order@primachip.co.id", category: "Storage" },
  ],
};
