import { useMemo, useState } from "react";
import { App, Empty, Image, Segmented, Skeleton, Switch } from "antd";
import { useGetAllAdsQuery, useUpdateAdStatusMutation } from "../redux/api/moderationApi";
import { getErrorMessage } from "../redux/api/baseApi";
import { ErrorState, PageHeader, PersonCell, StatusTag } from "../components/ui";
import { getImageUrl } from "../config/envConfig";
import { formatDate } from "../utils/format";

const FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Pending review", value: "INACTIVE" },
  { label: "Live", value: "ACTIVE" },
];

export default function Ads() {
  const { message } = App.useApp();
  const { data: ads = [], isLoading, error, refetch } = useGetAllAdsQuery();
  const [updateStatus] = useUpdateAdStatusMutation();
  const [filter, setFilter] = useState("ALL");
  const [pendingId, setPendingId] = useState(null);

  const counts = useMemo(
    () => ({
      ALL: ads.length,
      ACTIVE: ads.filter((a) => a.status === "ACTIVE").length,
      INACTIVE: ads.filter((a) => a.status !== "ACTIVE").length,
    }),
    [ads],
  );
  const visible = filter === "ALL" ? ads : ads.filter((a) => (filter === "ACTIVE" ? a.status === "ACTIVE" : a.status !== "ACTIVE"));

  const toggle = async (ad, live) => {
    setPendingId(ad._id);
    try {
      await updateStatus({ id: ad._id, status: live ? "ACTIVE" : "INACTIVE" }).unwrap();
      message.success(live ? "Ad is now live in the app" : "Ad taken down");
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Ads"
        description="Business owners submit ads from the app. Switch an ad on to show it to pet owners."
        actions={
          <Segmented
            value={filter}
            onChange={setFilter}
            options={FILTERS.map((f) => ({ ...f, label: `${f.label} (${counts[f.value]})` }))}
          />
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-card">
              <Skeleton.Image active className="!h-44 !w-full" />
              <Skeleton active paragraph={{ rows: 2 }} className="mt-4" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 shadow-card">
          <Empty description="No ads here" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((ad) => {
            const images = (ad.advertisementImg || []).map(getImageUrl);
            const owner = ad.ownerId && typeof ad.ownerId === "object" ? ad.ownerId : null;
            return (
              <article key={ad._id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
                <div className="relative aspect-[16/9] bg-gray-50">
                  {images.length ? (
                    <Image.PreviewGroup items={images}>
                      <Image
                        src={images[0]}
                        alt="Ad"
                        width="100%"
                        height="100%"
                        className="object-cover"
                        rootClassName="!block h-full w-full"
                      />
                    </Image.PreviewGroup>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-ink-subtle">No image</div>
                  )}
                  {images.length > 1 && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                      +{images.length - 1} more
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <PersonCell
                    name={owner?.name || "Unknown owner"}
                    subtitle={ad.businessId?.businessName || owner?.email}
                    src={owner?.profilePic}
                  />
                  <div className="mt-auto flex items-center justify-between border-0 border-t border-solid border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                      <StatusTag status={ad.status === "ACTIVE" ? "ACTIVE" : "PENDING"} />
                      <span className="text-xs text-ink-subtle">{formatDate(ad.createdAt)}</span>
                    </div>
                    <Switch
                      checked={ad.status === "ACTIVE"}
                      loading={pendingId === ad._id}
                      onChange={(live) => toggle(ad, live)}
                      checkedChildren="Live"
                      unCheckedChildren="Off"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
