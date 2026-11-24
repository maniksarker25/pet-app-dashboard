import {
  LuBell,
  LuBriefcaseBusiness,
  LuCircleHelp,
  LuCrown,
  LuFileText,
  LuLayoutDashboard,
  LuLifeBuoy,
  LuMegaphone,
  LuPawPrint,
  LuShieldCheck,
  LuStethoscope,
  LuUserCog,
} from "react-icons/lu";

export const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LuLayoutDashboard, end: true }],
  },
  {
    title: "Accounts",
    items: [
      { to: "/pet-owners", label: "Pet owners", icon: LuPawPrint },
      { to: "/business-owners", label: "Business owners", icon: LuBriefcaseBusiness },
      { to: "/subscribers", label: "Subscribers", icon: LuCrown },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/services", label: "Services & bookings", icon: LuStethoscope },
      { to: "/ads", label: "Ads", icon: LuMegaphone },
      { to: "/support", label: "Support", icon: LuLifeBuoy },
      { to: "/notifications", label: "Notifications", icon: LuBell },
    ],
  },
  {
    title: "Settings",
    items: [
      { to: "/settings/profile", label: "Profile", icon: LuUserCog },
      { to: "/settings/faq", label: "FAQ", icon: LuCircleHelp },
      { to: "/settings/terms", label: "Terms & conditions", icon: LuFileText },
      { to: "/settings/privacy", label: "Privacy policy", icon: LuShieldCheck },
    ],
  },
];

/** Title for the header, from the current path. */
export const titleForPath = (pathname) => {
  if (pathname.startsWith("/services/")) return "Service bookings";
  for (const section of NAV_SECTIONS) {
    const item = section.items.find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)));
    if (item) return item.label;
  }
  return "";
};
