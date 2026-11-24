import { Avatar, Card, Input, Result, Skeleton, Tag } from "antd";
import { IoSearch } from "react-icons/io5";
import { getImageUrl } from "../../config/envConfig";
import { titleCase } from "../../utils/format";

/** Page title, optional description and right-aligned actions. */
export function PageHeader({ title, description, actions, back }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back}
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="m-0 mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** White rounded panel used for every content block. */
export function Panel({ title, extra, children, className = "", bodyClassName = "" }) {
  return (
    <section className={`rounded-2xl border border-gray-100 bg-white shadow-card ${className}`}>
      {(title || extra) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-0 border-b border-solid border-gray-100 px-5 py-4">
          {title && <h2 className="m-0 text-base font-semibold text-ink">{title}</h2>}
          {extra}
        </header>
      )}
      <div className={bodyClassName || "p-5"}>{children}</div>
    </section>
  );
}

const TONES = {
  green: "bg-brand-50 text-brand-600",
  pink: "bg-accent-50 text-accent-600",
  blue: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  gray: "bg-gray-100 text-gray-600",
};

export function StatCard({ label, value, icon: Icon, tone = "green", hint, loading }) {
  return (
    <Card className="h-full rounded-2xl border-gray-100 shadow-card" styles={{ body: { padding: 20 } }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium text-ink-muted">{label}</p>
          {loading ? (
            <Skeleton.Input active size="small" className="mt-2" />
          ) : (
            <p className="m-0 mt-1 text-3xl font-semibold tracking-tight text-ink">{value}</p>
          )}
          {hint && !loading && <p className="m-0 mt-1 text-xs text-ink-subtle">{hint}</p>}
        </div>
        {Icon && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
            <Icon className="text-xl" />
          </span>
        )}
      </div>
    </Card>
  );
}

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

/** Avatar from an uploaded image, falling back to initials (no third-party avatar service). */
export function UserAvatar({ src, name, size = 40 }) {
  return (
    <Avatar
      size={size}
      src={src ? getImageUrl(src) : undefined}
      className="shrink-0 bg-brand-100 font-semibold text-brand-700"
    >
      {initials(name)}
    </Avatar>
  );
}

export function PersonCell({ name, subtitle, src }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar src={src} name={name} />
      <div className="min-w-0">
        <div className="truncate font-medium text-ink">{name || "Unnamed"}</div>
        {subtitle && <div className="truncate text-xs text-ink-muted">{subtitle}</div>}
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  ACTIVE: "green",
  APPROVED: "green",
  COMPLETED: "green",
  PENDING: "gold",
  INACTIVE: "default",
  REJECTED: "red",
  CANCELLED: "red",
  BLOCKED: "red",
};

export function StatusTag({ status }) {
  const key = String(status || "").toUpperCase();
  return (
    <Tag bordered={false} color={STATUS_COLORS[key] || "default"} className="m-0 rounded-full px-2.5">
      {titleCase(key)}
    </Tag>
  );
}

export function AccountStatusTag({ blocked }) {
  return <StatusTag status={blocked ? "BLOCKED" : "ACTIVE"} />;
}

export function SearchInput({ value, onChange, placeholder = "Search…", className = "" }) {
  return (
    <Input
      allowClear
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      prefix={<IoSearch className="text-gray-400" />}
      className={`w-full sm:w-72 ${className}`}
    />
  );
}

/** Full-panel error with a retry button. */
export function ErrorState({ message, onRetry }) {
  return (
    <Result
      status="warning"
      title="Couldn't load this data"
      subTitle={message}
      extra={
        onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer rounded-lg border-0 bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
          >
            Try again
          </button>
        )
      }
    />
  );
}
