import { useState } from "react";
import { Empty, Pagination, Skeleton, Tooltip } from "antd";
import { LuBell } from "react-icons/lu";
import { useGetAdminNotificationsQuery } from "../redux/api/moderationApi";
import { getErrorMessage } from "../redux/api/baseApi";
import { ErrorState, PageHeader, Panel } from "../components/ui";
import { formatDateTime, fromNow } from "../utils/format";

const PAGE_SIZE = 15;

export default function Notifications() {
  const { data: items = [], isLoading, error, refetch } = useGetAdminNotificationsQuery();
  const [page, setPage] = useState(1);
  const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <>
      <PageHeader title="Notifications" description="Platform events such as new sign-ups, bookings and requests." />
      <Panel bodyClassName="p-0">
        {isLoading ? (
          <div className="p-5">
            <Skeleton active avatar paragraph={{ rows: 6 }} />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16">
            <Empty description="You're all caught up" />
          </div>
        ) : (
          <ul className="m-0 list-none divide-y divide-gray-100 p-0">
            {visible.map((n) => (
              <li key={n._id} className="flex gap-4 px-5 py-4">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    n.isRead ? "bg-gray-100 text-gray-400" : "bg-brand-50 text-brand-600"
                  }`}
                >
                  <LuBell />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`font-medium ${n.isRead ? "text-ink-muted" : "text-ink"}`}>{n.title}</div>
                    <Tooltip title={formatDateTime(n.createdAt)}>
                      <span className="shrink-0 text-xs text-ink-subtle">{fromNow(n.createdAt)}</span>
                    </Tooltip>
                  </div>
                  <p className="m-0 mt-0.5 text-sm text-ink-muted">{n.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      {items.length > PAGE_SIZE && (
        <div className="mt-4 flex justify-end">
          <Pagination current={page} pageSize={PAGE_SIZE} total={items.length} onChange={setPage} showSizeChanger={false} />
        </div>
      )}
    </>
  );
}
