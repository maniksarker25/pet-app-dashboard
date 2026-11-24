import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Table } from "antd";
import { useGetServicesWithStatsQuery } from "../redux/api/dashboardApi";
import { getErrorMessage } from "../redux/api/baseApi";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { ErrorState, PageHeader, Panel, SearchInput, StatusTag } from "../components/ui";
import { formatNumber, titleCase } from "../utils/format";

// Matches the Service.serviceType enum in the backend.
const SERVICE_TYPES = ["VET", "GROOMING", "HOTEL", "TRAINING", "SHOP", "FRIENDLY"];

export default function Services() {
  const navigate = useNavigate();
  const { data: services = [], isFetching, error, refetch } = useGetServicesWithStatsQuery();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const q = useDebouncedValue(search, 200).trim().toLowerCase();

  const rows = useMemo(
    () =>
      services.filter((s) => {
        if (type !== "all" && s.serviceType !== type) return false;
        if (!q) return true;
        return [s.serviceName, s.businessName, s.ownerName, s.location]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      }),
    [services, type, q],
  );

  const totalBookings = useMemo(() => services.reduce((n, s) => n + (s.totalBookings || 0), 0), [services]);

  const columns = [
    {
      title: "Service",
      key: "service",
      render: (_, r) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{r.serviceName || titleCase(r.serviceType)}</div>
          <div className="truncate text-xs text-ink-muted">{r.businessName}</div>
        </div>
      ),
    },
    { title: "Type", dataIndex: "serviceType", render: (v) => titleCase(v) },
    {
      title: "Owner",
      key: "owner",
      render: (_, r) => (
        <div className="min-w-0">
          <div className="truncate">{r.ownerName}</div>
          <div className="truncate text-xs text-ink-muted">{r.ownerPhone !== "N/A" ? r.ownerPhone : r.ownerEmail}</div>
        </div>
      ),
    },
    {
      title: "Hours",
      key: "hours",
      render: (_, r) =>
        r.openingTime || r.closingTime ? (
          <div>
            <div>
              {r.openingTime || "?"} – {r.closingTime || "?"}
            </div>
            {r.offDay?.length > 0 && (
              <div className="text-xs text-ink-muted">
                Closed {Array.isArray(r.offDay) ? r.offDay.join(", ") : r.offDay}
              </div>
            )}
          </div>
        ) : (
          "—"
        ),
    },
    { title: "Status", key: "status", render: (_, r) => <StatusTag status={r.isActive === false ? "INACTIVE" : "ACTIVE"} /> },
    {
      title: "Bookings",
      dataIndex: "totalBookings",
      align: "right",
      sorter: (a, b) => a.totalBookings - b.totalBookings,
      defaultSortOrder: "descend",
      render: (v) => <span className="font-semibold">{formatNumber(v)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Services & bookings"
        description={`${formatNumber(services.length)} services · ${formatNumber(totalBookings)} bookings in total. Select a service to see its bookings.`}
      />
      <Panel
        bodyClassName="p-0"
        title={<SearchInput value={search} onChange={setSearch} placeholder="Search service, business or owner" />}
        extra={
          <Select
            value={type}
            onChange={setType}
            className="w-40"
            options={[{ value: "all", label: "All types" }, ...SERVICE_TYPES.map((t) => ({ value: t, label: titleCase(t) }))]}
          />
        }
      >
        {error ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <Table
            className="clickable-rows"
            rowKey="serviceId"
            columns={columns}
            dataSource={rows}
            loading={isFetching}
            onRow={(r) => ({ onClick: () => navigate(`/services/${r.serviceId}`) })}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} services` }}
            scroll={{ x: 900 }}
          />
        )}
      </Panel>
    </>
  );
}
