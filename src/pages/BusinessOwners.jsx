import { useState } from "react";
import { Button, Descriptions, Drawer, Empty, Rate, Segmented, Skeleton, Table, Tooltip } from "antd";
import { LuBan, LuCircleCheck, LuEye } from "react-icons/lu";
import {
  useGetBusinessOwnerQuery,
  useGetBusinessOwnersQuery,
  useSetBusinessOwnerBlockedMutation,
} from "../redux/api/accountsApi";
import { getErrorMessage } from "../redux/api/baseApi";
import useAccountList from "../hooks/useAccountList";
import SubscriptionTag from "../components/SubscriptionTag";
import {
  AccountStatusTag,
  ErrorState,
  PageHeader,
  Panel,
  PersonCell,
  SearchInput,
  StatusTag,
  UserAvatar,
} from "../components/ui";
import { formatDate, titleCase } from "../utils/format";

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Blocked", value: "blocked" },
];

export default function BusinessOwners() {
  const list = useAccountList(useSetBusinessOwnerBlockedMutation, "this business owner");
  const { data, isFetching, error, refetch } = useGetBusinessOwnersQuery(list.params);
  const [selectedId, setSelectedId] = useState(null);

  const columns = [
    {
      title: "Business owner",
      key: "name",
      render: (_, r) => <PersonCell name={r.name} subtitle={r.email} src={r.profilePic} />,
    },
    {
      title: "Business",
      key: "business",
      render: (_, r) => r.businesses?.businessName || <span className="text-ink-subtle">Not set up</span>,
    },
    { title: "Plan", key: "plan", render: (_, r) => <SubscriptionTag status={r.subscriptionStatus} /> },
    { title: "Joined", dataIndex: "createdAt", render: (v) => formatDate(v) },
    { title: "Status", key: "status", render: (_, r) => <AccountStatusTag blocked={r.isBlocked} /> },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="View details">
            <Button type="text" icon={<LuEye />} onClick={() => setSelectedId(r._id)} />
          </Tooltip>
          <Tooltip title={r.isBlocked ? "Unblock" : "Block"}>
            <Button
              type="text"
              danger={!r.isBlocked}
              icon={r.isBlocked ? <LuCircleCheck className="text-brand-600" /> : <LuBan />}
              onClick={() => list.confirmToggleBlock(r)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Business owners" description="Vets, groomers, hotels, trainers and shops offering services." />
      <Panel
        bodyClassName="p-0"
        title={<SearchInput value={list.search} onChange={list.onSearch} placeholder="Search name, email or phone" />}
        extra={<Segmented options={STATUS_OPTIONS} value={list.status} onChange={list.onStatus} />}
      >
        {error ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <Table
            className="clickable-rows"
            rowKey="_id"
            columns={columns}
            dataSource={data?.owners || []}
            loading={isFetching}
            pagination={list.pagination(data?.total || 0)}
            onRow={(r) => ({ onClick: () => setSelectedId(r._id) })}
            scroll={{ x: 900 }}
          />
        )}
      </Panel>

      <BusinessOwnerDrawer id={selectedId} onClose={() => setSelectedId(null)} onToggleBlock={list.confirmToggleBlock} />
    </>
  );
}

export function BusinessOwnerDrawer({ id, onClose, onToggleBlock }) {
  const { data, isFetching } = useGetBusinessOwnerQuery(id, { skip: !id });
  const owner = data?.owner;
  const business = data?.business;
  const services = data?.services || [];
  const reviews = data?.reviews || [];
  const sub = owner?.subscriptionStatus;
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length
    : 0;

  return (
    <Drawer open={Boolean(id)} onClose={onClose} width={560} title="Business owner details" destroyOnClose>
      {isFetching || !owner ? (
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      ) : (
        <>
          <div className="mb-6 flex items-center gap-4">
            <UserAvatar src={owner.profilePic} name={owner.name} size={64} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-semibold">{owner.name}</div>
              <div className="truncate text-sm text-ink-muted">{owner.email}</div>
              <div className="mt-1 flex gap-2">
                <AccountStatusTag blocked={owner.isBlocked} />
                <SubscriptionTag status={sub} />
              </div>
            </div>
            {onToggleBlock && (
              <Button danger={!owner.isBlocked} onClick={() => onToggleBlock(owner)}>
                {owner.isBlocked ? "Unblock" : "Block"}
              </Button>
            )}
          </div>

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Phone">{owner.phone || "—"}</Descriptions.Item>
            <Descriptions.Item label="Address">{owner.address || "—"}</Descriptions.Item>
            <Descriptions.Item label="Email verified">{owner.isVerified ? "Yes" : "No"}</Descriptions.Item>
            <Descriptions.Item label="Joined">{formatDate(owner.createdAt)}</Descriptions.Item>
          </Descriptions>

          <h3 className="mb-3 mt-6 text-base font-semibold">Subscription</h3>
          {sub?.active || sub?.expiresAt ? (
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Plan">{sub.plan || sub.entitlementId || "—"}</Descriptions.Item>
              <Descriptions.Item label="Store">{sub.store ? titleCase(sub.store) : "—"}</Descriptions.Item>
              <Descriptions.Item label={sub.active ? "Renews / expires" : "Expired"}>
                {sub.isLifetime ? "Lifetime" : formatDate(sub.expiresAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Auto-renew">{sub.willRenew ? "On" : "Off"}</Descriptions.Item>
              {sub.billingIssue && <Descriptions.Item label="Billing">Payment problem reported by the store</Descriptions.Item>}
              {sub.isSandbox && <Descriptions.Item label="Environment">Sandbox (test purchase)</Descriptions.Item>}
              <Descriptions.Item label="Last synced">{formatDate(sub.lastSyncedAt)}</Descriptions.Item>
            </Descriptions>
          ) : (
            <p className="m-0 text-sm text-ink-muted">No subscription.</p>
          )}

          <h3 className="mb-3 mt-6 text-base font-semibold">Business</h3>
          {!business ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="This owner hasn't set up a business yet" />
          ) : (
            <>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Name">{business.businessName || "—"}</Descriptions.Item>
                <Descriptions.Item label="Address">{business.address || "—"}</Descriptions.Item>
                <Descriptions.Item label="Website">
                  {/^https?:\/\//i.test(business.website || "") ? (
                    <a href={business.website} target="_blank" rel="noopener noreferrer nofollow">
                      {business.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Reviews">
                  {reviews.length ? (
                    <span className="flex items-center gap-2">
                      <Rate disabled allowHalf value={Math.round(avgRating * 2) / 2} className="text-sm" />
                      {avgRating.toFixed(1)} ({reviews.length})
                    </span>
                  ) : (
                    "No reviews yet"
                  )}
                </Descriptions.Item>
              </Descriptions>

              <h3 className="mb-3 mt-6 text-base font-semibold">Services ({services.length})</h3>
              {services.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No services yet" />
              ) : (
                <div className="space-y-2">
                  {services.map((s) => (
                    <div key={s._id} className="flex items-center justify-between gap-3 rounded-xl border border-solid border-gray-100 p-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{s.serviceName || titleCase(s.serviceType)}</div>
                        <div className="truncate text-xs text-ink-muted">
                          {titleCase(s.serviceType)}
                          {s.location ? ` · ${s.location}` : ""}
                        </div>
                      </div>
                      <StatusTag status={s.isActive === false ? "INACTIVE" : "ACTIVE"} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </Drawer>
  );
}
