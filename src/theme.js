// Ant Design theme: one place for the dashboard's look (matches tailwind.config.js colors).
export const BRAND = "#438025";
export const ACCENT = "#e64fa3";

export const antdTheme = {
  token: {
    colorPrimary: BRAND,
    colorLink: BRAND,
    colorInfo: BRAND,
    colorSuccess: "#16a34a",
    colorError: "#dc2626",
    colorWarning: "#d97706",
    borderRadius: 10,
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    colorBgLayout: "#f6f8f5",
    colorTextHeading: "#1f2937",
  },
  components: {
    Table: {
      headerBg: "#f8faf7",
      headerColor: "#4b5563",
      headerSplitColor: "transparent",
      rowHoverBg: "#f4f9f1",
      cellPaddingBlock: 14,
    },
    Card: { paddingLG: 20 },
    Button: { primaryShadow: "none", fontWeight: 500 },
    Segmented: { itemSelectedColor: BRAND },
    Menu: { itemBorderRadius: 8 },
  },
};
