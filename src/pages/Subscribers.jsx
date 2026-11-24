import { useState } from "react";
import { Alert, Table, Tag } from "antd";
import { useGetBusinessOwnersQuery, useSetBusinessOwnerBlockedMutation } from "../redux/api/accountsApi";
import { getErrorMessage } from "../redux/api/baseApi";
import useAccountList from "../hooks/useAccountList";
import SubscriptionTag from "../components/SubscriptionTag";
import { ErrorState, PageHeader, Panel, PersonCell, SearchInput } from "../components/ui";
import { formatDate, titleCase } from "../utils/format";
import { BusinessOwnerDrawer } from "./BusinessOwners";

export default function Subscribers() {
  const list = useAccountList(useSetBusinessOwnerBlockedMutation, "this business owner");
  const { data, isFetching, error, refetch } = useGetBusinessOwnersQuery({ ...list.params, subscription: "active" });
  const [selectedId, setSelectedId] = useState(null);

  const columns = [
    {
      title: "Business owner",
      key: "name",
      render: (_, r) => <PersonCell name={r.name} subtitle={r.email} src={r.profilePic} />,
    },
    {
      title: "Plan",
      key: "plan",
      render: (_, r) => r.subscriptionStatus?.plan || r.subscriptionStatus?.entitlementId || "—",
    },
    { title: "Status", key: "status", render: (_, r) => <SubscriptionTag status={r.subscriptionStatus} /> },
    {
      title: "Store",
      key: "store",
      render: (_, r) => (r.subscriptionStatus?.store ? titleCase(r.subscriptionStatus.store) : "—"),
    },
    {
      title: "Renews / expires",
      key: "expires",
      render: (_, r) => {
        const s = r.subscriptionStatus || {};
        if (s.isLifetime) return "Lifetime";
        return (
          <span className="flex items-center gap-2">
            {formatDate(s.expiresAt)}
            {!s.willRenew && (
              <Tag bordered={false} color="default" className="m-0 rounded-full">
                Won&apos;t renew
              </Tag>
            )}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Subscribers"
        description="Business owners with an active paid plan. Plans and prices are managed in RevenueCat and the app stores."
      />
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="Subscription data is synced from RevenueCat automatically (on purchase, by webhook and hourly)."
      />
      <Panel
        bodyClassName="p-0"
        title={<SearchInput value={list.search} onChange={list.onSearch} placeholder="Search name, email or phone" />}
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
            scroll={{ x: 820 }}
            locale={{ emptyText: "No active subscribers yet" }}
          />
        )}
      </Panel>
      <BusinessOwnerDrawer id={selectedId} onClose={() => setSelectedId(null)} onToggleBlock={list.confirmToggleBlock} />
    </>
  );
}
