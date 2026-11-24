import { useState } from "react";
import { Button, Descriptions, Drawer, Empty, Segmented, Skeleton, Table, Tooltip } from "antd";
import { LuBan, LuCircleCheck, LuEye } from "react-icons/lu";
import {
  useGetPetOwnerQuery,
  useGetPetOwnersQuery,
  useSetPetOwnerBlockedMutation,
} from "../redux/api/accountsApi";
import { getErrorMessage } from "../redux/api/baseApi";
import useAccountList from "../hooks/useAccountList";
import {
  AccountStatusTag,
  ErrorState,
  PageHeader,
  Panel,
  PersonCell,
  SearchInput,
  UserAvatar,
} from "../components/ui";
import { formatDate, titleCase } from "../utils/format";

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Blocked", value: "blocked" },
];

export default function PetOwners() {
  const list = useAccountList(useSetPetOwnerBlockedMutation, "this pet owner");
  const { data, isFetching, error, refetch } = useGetPetOwnersQuery(list.params);
  const [selectedId, setSelectedId] = useState(null);

  const columns = [
    {
      title: "Pet owner",
      key: "name",
      render: (_, r) => <PersonCell name={r.name} subtitle={r.email} src={r.profilePic} />,
    },
    { title: "Phone", dataIndex: "phone", render: (v) => v || "—" },
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
      <PageHeader title="Pet owners" description="People who book services for their pets in the app." />
      <Panel
        bodyClassName="p-0"
        title={
          <SearchInput value={list.search} onChange={list.onSearch} placeholder="Search name, email or phone" />
        }
        extra={<Segmented options={STATUS_OPTIONS} value={list.status} onChange={list.onStatus} />}
      >
        {error ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <Table
            className="clickable-rows"
            rowKey="_id"
            columns={columns}
            dataSource={data?.users || []}
            loading={isFetching}
            pagination={list.pagination(data?.total || 0)}
            onRow={(r) => ({ onClick: () => setSelectedId(r._id) })}
            scroll={{ x: 760 }}
          />
        )}
      </Panel>

      <PetOwnerDrawer id={selectedId} onClose={() => setSelectedId(null)} onToggleBlock={list.confirmToggleBlock} />
    </>
  );
}

function PetOwnerDrawer({ id, onClose, onToggleBlock }) {
  const { data, isFetching } = useGetPetOwnerQuery(id, { skip: !id });
  const user = data?.user;
  const pets = data?.pets || [];

  return (
    <Drawer open={Boolean(id)} onClose={onClose} width={520} title="Pet owner details" destroyOnClose>
      {isFetching || !user ? (
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      ) : (
        <>
          <div className="mb-6 flex items-center gap-4">
            <UserAvatar src={user.profilePic} name={user.name} size={64} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-semibold">{user.name}</div>
              <div className="truncate text-sm text-ink-muted">{user.email}</div>
              <div className="mt-1">
                <AccountStatusTag blocked={user.isBlocked} />
              </div>
            </div>
            <Button danger={!user.isBlocked} onClick={() => onToggleBlock(user)}>
              {user.isBlocked ? "Unblock" : "Block"}
            </Button>
          </div>

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Phone">{user.phone || "—"}</Descriptions.Item>
            <Descriptions.Item label="Address">{user.address || "—"}</Descriptions.Item>
            <Descriptions.Item label="Email verified">{user.isVerified ? "Yes" : "No"}</Descriptions.Item>
            <Descriptions.Item label="Joined">{formatDate(user.createdAt)}</Descriptions.Item>
          </Descriptions>

          <h3 className="mb-3 mt-6 text-base font-semibold">Pets ({pets.length})</h3>
          {pets.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No pets added yet" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pets.map((pet) => (
                <div key={pet._id} className="flex items-center gap-3 rounded-xl border border-solid border-gray-100 p-3">
                  <UserAvatar src={pet.petPhoto} name={pet.name} size={44} />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{pet.name}</div>
                    <div className="truncate text-xs text-ink-muted">
                      {[pet.animalType, pet.breed, pet.gender && titleCase(pet.gender)].filter(Boolean).join(" · ")}
                      {pet.age !== undefined && ` · ${pet.age} yr`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}
