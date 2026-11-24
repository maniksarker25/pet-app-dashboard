import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Select, Skeleton, Table } from "antd";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LuBriefcaseBusiness,
  LuCalendarCheck,
  LuCalendarClock,
  LuCrown,
  LuPawPrint,
  LuStore,
  LuStethoscope,
} from "react-icons/lu";
import { useGetDashboardStatsQuery } from "../redux/api/dashboardApi";
import { getErrorMessage } from "../redux/api/baseApi";
import { ErrorState, PageHeader, Panel, PersonCell, StatCard } from "../components/ui";
import { formatDate, formatNumber } from "../utils/format";
import { ACCENT, BRAND } from "../theme";

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => ({ value: currentYear - i, label: String(currentYear - i) }));

export default function Dashboard() {
  const [year, setYear] = useState(currentYear);
  const { data, isLoading, isFetching, error, refetch } = useGetDashboardStatsQuery(year);
  const extra = data?.additionalStats || {};

  const chartData = useMemo(() => {
    const users = data?.userGrowth?.monthlyData || [];
    const sellers = data?.sellerGrowth?.monthlyData || [];
    return users.map((u, i) => ({
      month: u.month,
      "Pet owners": u.count,
      "Business owners": sellers[i]?.count ?? 0,
    }));
  }, [data]);

  const yearTotals = useMemo(
    () => ({
      users: data?.userGrowth?.monthlyData?.at(-1)?.cumulative ?? 0,
      sellers: data?.sellerGrowth?.monthlyData?.at(-1)?.cumulative ?? 0,
    }),
    [data],
  );

  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const cards = [
    { label: "Pet owners", value: formatNumber(data?.totalUsers), icon: LuPawPrint, tone: "green" },
    { label: "Business owners", value: formatNumber(data?.totalSellers), icon: LuBriefcaseBusiness, tone: "pink" },
    {
      label: "Active subscribers",
      value: formatNumber(data?.activeSubscribers),
      icon: LuCrown,
      tone: "amber",
      hint: "Business owners with a paid plan",
    },
    { label: "Total bookings", value: formatNumber(extra.totalBookings), icon: LuCalendarCheck, tone: "blue" },
  ];

  const minorStats = [
    { label: "Pending bookings", value: extra.pendingBookings, icon: LuCalendarClock },
    { label: "Completed bookings", value: extra.completedBookings, icon: LuCalendarCheck },
    { label: "Businesses", value: extra.totalBusinesses, icon: LuStore },
    {
      label: "Active services",
      value: extra.totalServices !== undefined ? `${formatNumber(extra.activeServices)} / ${formatNumber(extra.totalServices)}` : undefined,
      icon: LuStethoscope,
    },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="A snapshot of activity across Sansaland." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} loading={isLoading} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {minorStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-card">
            <Icon className="shrink-0 text-lg text-gray-400" />
            <div className="min-w-0">
              <div className="truncate text-xs text-ink-muted">{label}</div>
              <div className="text-base font-semibold text-ink">
                {isLoading ? "…" : typeof value === "string" ? value : formatNumber(value)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Panel
        className="mt-6"
        title="New sign-ups"
        extra={
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-ink-muted sm:inline">
              {formatNumber(yearTotals.users)} pet owners · {formatNumber(yearTotals.sellers)} business owners
            </span>
            <Select value={year} onChange={setYear} options={YEAR_OPTIONS} className="w-24" loading={isFetching} />
          </div>
        }
      >
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSellers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0ee" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,.06)" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
                <Area type="monotone" dataKey="Pet owners" stroke={BRAND} strokeWidth={2} fill="url(#gUsers)" />
                <Area type="monotone" dataKey="Business owners" stroke={ACCENT} strokeWidth={2} fill="url(#gSellers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel
        className="mt-6"
        title="Newest business owners"
        bodyClassName="p-0"
        extra={
          <Link to="/business-owners">
            <Button type="link" className="px-0">
              View all
            </Button>
          </Link>
        }
      >
        <Table
          rowKey={(r) => r.id || r.email}
          loading={isLoading}
          dataSource={data?.businessOwners || []}
          pagination={false}
          scroll={{ x: 640 }}
          columns={[
            {
              title: "Owner",
              render: (_, r) => <PersonCell name={r.shopOwnerName} subtitle={r.email} />,
            },
            { title: "Business", dataIndex: "shopName", render: (v) => (v === "Pending" ? <span className="text-ink-subtle">Not set up yet</span> : v) },
            { title: "Phone", dataIndex: "phone", render: (v) => v || "—" },
            { title: "Joined", render: (_, r) => formatDate(r.createdAt || r.date) },
          ]}
        />
      </Panel>
    </>
  );
}
