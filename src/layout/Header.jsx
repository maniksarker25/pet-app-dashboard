import { Badge, Dropdown } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LuBell, LuLogOut, LuMenu, LuUserCog } from "react-icons/lu";
import { useGetAdminProfileQuery } from "../redux/api/profileApi";
import { useGetAdminNotificationsQuery } from "../redux/api/moderationApi";
import { UserAvatar } from "../components/ui";
import { titleCase } from "../utils/format";
import { titleForPath } from "./navItems";

export default function Header({ onMenuClick, onLogout }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: admin } = useGetAdminProfileQuery();
  const { data: notifications = [] } = useGetAdminNotificationsQuery(undefined, {
    pollingInterval: 60_000,
    skipPollingIfUnfocused: true,
  });
  const unread = notifications.filter((n) => !n.isRead).length;

  const menuItems = [
    { key: "profile", icon: <LuUserCog />, label: "Profile settings" },
    { type: "divider" },
    { key: "logout", icon: <LuLogOut />, label: "Sign out", danger: true },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-0 border-b border-solid border-gray-100 bg-white/90 px-4 backdrop-blur md:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="-ml-1 flex cursor-pointer items-center rounded-lg border-0 bg-transparent p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
      >
        <LuMenu className="text-xl" />
      </button>

      <div className="min-w-0 flex-1 truncate text-sm font-medium text-ink-muted">{titleForPath(pathname)}</div>

      <Link
        to="/notifications"
        aria-label="Notifications"
        className="flex items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
      >
        <Badge count={unread} size="small" overflowCount={99}>
          <LuBell className="text-xl text-gray-600" />
        </Badge>
      </Link>

      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        menu={{
          items: menuItems,
          onClick: ({ key }) => (key === "logout" ? onLogout() : navigate("/settings/profile")),
        }}
      >
        <button
          type="button"
          className="flex cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent py-1 pl-1 pr-2 hover:bg-gray-100"
        >
          <UserAvatar src={admin?.profilePic} name={admin?.name} size={36} />
          <span className="hidden text-left leading-tight sm:block">
            <span className="block max-w-[160px] truncate text-sm font-semibold text-ink">
              {admin?.name || "Admin"}
            </span>
            <span className="block text-xs text-ink-muted">{titleCase(admin?.role || "ADMIN")}</span>
          </span>
        </button>
      </Dropdown>
    </header>
  );
}
