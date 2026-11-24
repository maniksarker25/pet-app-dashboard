import { Tag, Tooltip } from "antd";
import { formatDate } from "../utils/format";

/**
 * Shows the owner's RevenueCat subscription as computed by the backend (toPublicStatus).
 * `status` may be undefined for owners who never subscribed.
 */
export default function SubscriptionTag({ status }) {
  if (status?.active) {
    const until = status.isLifetime ? "Lifetime" : `Until ${formatDate(status.expiresAt)}`;
    const warn = status.billingIssue || status.inGracePeriod;
    return (
      <Tooltip title={[status.plan, until, status.isSandbox && "Sandbox"].filter(Boolean).join(" · ")}>
        <Tag bordered={false} color={warn ? "orange" : "green"} className="m-0 rounded-full px-2.5">
          {warn ? "Billing issue" : status.isSandbox ? "Active (test)" : "Active"}
        </Tag>
      </Tooltip>
    );
  }
  if (status?.expiresAt) {
    return (
      <Tooltip title={`Expired ${formatDate(status.expiresAt)}`}>
        <Tag bordered={false} className="m-0 rounded-full px-2.5">
          Expired
        </Tag>
      </Tooltip>
    );
  }
  return <span className="text-ink-subtle">Free</span>;
}
