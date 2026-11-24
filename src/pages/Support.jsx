import { useMemo, useState } from "react";
import { App, Button, Descriptions, Modal, Segmented, Table, Tooltip } from "antd";
import { LuCircleCheck, LuMail, LuRotateCcw, LuTrash2 } from "react-icons/lu";
import {
  useDeleteSupportTicketMutation,
  useGetSupportTicketsQuery,
  useUpdateSupportStatusMutation,
} from "../redux/api/moderationApi";
import { getErrorMessage } from "../redux/api/baseApi";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { ErrorState, PageHeader, Panel, SearchInput, StatusTag } from "../components/ui";
import { formatDate, formatDateTime, fromNow } from "../utils/format";

export default function Support() {
  const { message, modal } = App.useApp();
  const { data: tickets = [], isFetching, error, refetch } = useGetSupportTicketsQuery();
  const [updateStatus] = useUpdateSupportStatusMutation();
  const [deleteTicket] = useDeleteSupportTicketMutation();
  const [filter, setFilter] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const q = useDebouncedValue(search, 200).trim().toLowerCase();

  const pendingCount = useMemo(() => tickets.filter((t) => t.status !== "COMPLETED").length, [tickets]);
  const rows = useMemo(
    () =>
      tickets.filter((t) => {
        if (filter === "PENDING" && t.status === "COMPLETED") return false;
        if (filter === "COMPLETED" && t.status !== "COMPLETED") return false;
        if (!q) return true;
        return [t.email, t.phone, t.message].some((v) => String(v || "").toLowerCase().includes(q));
      }),
    [tickets, filter, q],
  );

  const setStatus = async (ticket, status) => {
    try {
      await updateStatus({ id: ticket._id, status }).unwrap();
      message.success(status === "COMPLETED" ? "Marked as resolved" : "Reopened");
      setSelected((s) => (s && s._id === ticket._id ? { ...s, status } : s));
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const confirmDelete = (ticket) =>
    modal.confirm({
      title: "Delete this request?",
      content: "This can't be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteTicket(ticket._id).unwrap();
          message.success("Request deleted");
          setSelected(null);
        } catch (err) {
          message.error(getErrorMessage(err));
        }
      },
    });

  const columns = [
    {
      title: "From",
      key: "from",
      render: (_, r) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{r.email || "—"}</div>
          <div className="truncate text-xs text-ink-muted">{r.phone || ""}</div>
        </div>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      render: (v) => <div className="line-clamp-2 max-w-md text-ink">{v}</div>,
    },
    {
      title: "Received",
      dataIndex: "createdAt",
      render: (v) => (
        <Tooltip title={formatDateTime(v)}>
          <span className="whitespace-nowrap">{fromNow(v) || formatDate(v)}</span>
        </Tooltip>
      ),
    },
    { title: "Status", dataIndex: "status", render: (v) => <StatusTag status={v === "COMPLETED" ? "COMPLETED" : "PENDING"} /> },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {r.status === "COMPLETED" ? (
            <Tooltip title="Reopen">
              <Button type="text" icon={<LuRotateCcw />} onClick={() => setStatus(r, "PENDING")} />
            </Tooltip>
          ) : (
            <Tooltip title="Mark resolved">
              <Button type="text" icon={<LuCircleCheck className="text-brand-600" />} onClick={() => setStatus(r, "COMPLETED")} />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button type="text" danger icon={<LuTrash2 />} onClick={() => confirmDelete(r)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Support" description="Help requests sent from the app by pet owners and business owners." />
      <Panel
        bodyClassName="p-0"
        title={<SearchInput value={search} onChange={setSearch} placeholder="Search email, phone or message" />}
        extra={
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: "PENDING", label: `Open (${pendingCount})` },
              { value: "COMPLETED", label: "Resolved" },
              { value: "ALL", label: "All" },
            ]}
          />
        }
      >
        {error ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <Table
            className="clickable-rows"
            rowKey="_id"
            columns={columns}
            dataSource={rows}
            loading={isFetching}
            onRow={(r) => ({ onClick: () => setSelected(r) })}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: 820 }}
            locale={{ emptyText: filter === "PENDING" ? "No open requests 🎉" : "No requests" }}
          />
        )}
      </Panel>

      <Modal
        open={Boolean(selected)}
        onCancel={() => setSelected(null)}
        title="Support request"
        footer={
          selected && [
            <Button key="delete" danger onClick={() => confirmDelete(selected)}>
              Delete
            </Button>,
            selected.email && (
              <Button key="reply" icon={<LuMail />} href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: your Sansaland support request")}`}>
                Reply by email
              </Button>
            ),
            selected.status === "COMPLETED" ? (
              <Button key="reopen" onClick={() => setStatus(selected, "PENDING")}>
                Reopen
              </Button>
            ) : (
              <Button key="resolve" type="primary" onClick={() => setStatus(selected, "COMPLETED")}>
                Mark resolved
              </Button>
            ),
          ]
        }
      >
        {selected && (
          <>
            <Descriptions column={1} size="small" bordered className="mb-4">
              <Descriptions.Item label="Email">{selected.email || "—"}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selected.phone || "—"}</Descriptions.Item>
              <Descriptions.Item label="Received">{formatDateTime(selected.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusTag status={selected.status === "COMPLETED" ? "COMPLETED" : "PENDING"} />
              </Descriptions.Item>
            </Descriptions>
            <div className="whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-ink">
              {selected.message}
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
