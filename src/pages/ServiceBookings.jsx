import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Descriptions, Drawer, Segmented, Table } from "antd";
import { LuArrowLeft } from "react-icons/lu";
import { useGetServiceBookingsQuery } from "../redux/api/dashboardApi";
import { getErrorMessage } from "../redux/api/baseApi";
import { ErrorState, PageHeader, Panel, PersonCell, StatusTag, UserAvatar } from "../components/ui";
import { formatDate, formatDateTime, titleCase } from "../utils/format";

const STATUSES = ["PENDING", "APPROVED", "COMPLETED", "REJECTED", "CANCELLED"];

const when = (b) => {
  if (b.checkInDate || b.checkOutDate) {
    return `${formatDate(b.checkInDate)} → ${formatDate(b.checkOutDate)}`;
  }
  return [formatDate(b.bookingDate, ""), b.bookingTime].filter(Boolean).join(" · ") || "—";
};

export default function ServiceBookings() {
  const { serviceId } = useParams();
  const { data, isFetching, error, refetch } = useGetServiceBookingsQuery(serviceId);
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const info = data?.serviceInfo;
  const bookings = useMemo(() => data?.bookings || [], [data]);

  const counts = useMemo(() => {
    const c = { ALL: bookings.length };
    bookings.forEach((b) => {
      c[b.bookingStatus] = (c[b.bookingStatus] || 0) + 1;
    });
    return c;
  }, [bookings]);

  const rows = status === "ALL" ? bookings : bookings.filter((b) => b.bookingStatus === status);

  const columns = [
    {
      title: "Pet owner",
      key: "owner",
      render: (_, r) => <PersonCell name={r.petOwner?.name} subtitle={r.petOwner?.email} src={r.petOwner?.profilePic} />,
    },
    {
      title: "Pet",
      key: "pet",
      render: (_, r) => (
        <div>
          <div className="font-medium">{r.petDetails?.petName}</div>
          <div className="text-xs text-ink-muted">
            {[r.petDetails?.animalType, r.petDetails?.breed].filter((v) => v && v !== "N/A").join(" · ")}
          </div>
        </div>
      ),
    },
    { title: "When", key: "when", render: (_, r) => when(r) },
    { title: "Status", dataIndex: "bookingStatus", render: (v) => <StatusTag status={v} /> },
    { title: "Booked", dataIndex: "createdAt", render: (v) => formatDate(v) },
  ];

  const back = (
    <Link to="/services" className="mb-2 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
      <LuArrowLeft /> All services
    </Link>
  );

  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        back={back}
        title={info?.serviceName || (info ? titleCase(info.serviceType) : "Service bookings")}
        description={info && [titleCase(info.serviceType), info.businessName, info.ownerName].filter(Boolean).join(" · ")}
      />
      <Panel
        bodyClassName="p-0"
        title={`${bookings.length} booking${bookings.length === 1 ? "" : "s"}`}
        extra={
          <Segmented
            value={status}
            onChange={setStatus}
            options={["ALL", ...STATUSES].map((s) => ({
              value: s,
              label: `${s === "ALL" ? "All" : titleCase(s)}${counts[s] ? ` (${counts[s]})` : ""}`,
            }))}
          />
        }
      >
        <Table
          className="clickable-rows"
          rowKey="bookingId"
          columns={columns}
          dataSource={rows}
          loading={isFetching}
          onRow={(r) => ({ onClick: () => setSelected(r) })}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          scroll={{ x: 820 }}
          locale={{ emptyText: "No bookings" }}
        />
      </Panel>

      <Drawer open={Boolean(selected)} onClose={() => setSelected(null)} width={480} title="Booking details">
        {selected && (
          <>
            <div className="mb-5 flex items-center gap-3">
              <UserAvatar src={selected.petDetails?.petPhoto} name={selected.petDetails?.petName} size={56} />
              <div>
                <div className="text-lg font-semibold">{selected.petDetails?.petName}</div>
                <StatusTag status={selected.bookingStatus} />
              </div>
            </div>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="When">{when(selected)}</Descriptions.Item>
              {selected.selectedService && (
                <Descriptions.Item label="Service">
                  {Array.isArray(selected.selectedService) ? selected.selectedService.join(", ") : String(selected.selectedService)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Pet">
                {[selected.petDetails?.animalType, selected.petDetails?.breed, selected.petDetails?.gender && titleCase(selected.petDetails.gender)]
                  .filter((v) => v && v !== "N/A")
                  .join(" · ") || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Owner">{selected.petOwner?.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selected.petOwner?.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selected.petOwner?.phone}</Descriptions.Item>
              {selected.notes && <Descriptions.Item label="Notes">{selected.notes}</Descriptions.Item>}
              {selected.cancellationReason && (
                <Descriptions.Item label="Cancellation reason">{selected.cancellationReason}</Descriptions.Item>
              )}
              <Descriptions.Item label="Booked at">{formatDateTime(selected.createdAt)}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>
    </>
  );
}
