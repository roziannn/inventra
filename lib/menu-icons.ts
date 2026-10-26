import {
  IconBell,
  IconBoxSeam,
  IconBuildingSkyscraper,
  IconBuildingWarehouse,
  IconChartBar,
  IconClipboardList,
  IconFileAnalytics,
  IconFolder,
  IconHistory,
  IconLayoutDashboard,
  IconMap,
  IconPackage,
  IconSettings,
  IconShoppingCart,
  IconTags,
  IconTool,
  IconTruck,
  IconUsers,
} from "@tabler/icons-react";

export const MENU_ICONS = {
  dashboard: IconLayoutDashboard,
  inventory: IconPackage,
  assets: IconBoxSeam,
  storage: IconBuildingWarehouse,
  vendors: IconBuildingSkyscraper,
  users: IconUsers,
  labeling: IconTags,
  reports: IconFileAnalytics,
  audit: IconHistory,
  settings: IconSettings,
  bell: IconBell,
  chart: IconChartBar,
  clipboard: IconClipboardList,
  folder: IconFolder,
  map: IconMap,
  cart: IconShoppingCart,
  tool: IconTool,
  truck: IconTruck,
} as const;

export type MenuIconKey = keyof typeof MENU_ICONS;
export const MENU_ICON_KEYS = Object.keys(MENU_ICONS) as MenuIconKey[];
