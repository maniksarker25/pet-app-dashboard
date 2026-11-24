import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDate = (value, fallback = "—") =>
  value && dayjs(value).isValid() ? dayjs(value).format("MMM D, YYYY") : fallback;

export const formatDateTime = (value, fallback = "—") =>
  value && dayjs(value).isValid() ? dayjs(value).format("MMM D, YYYY · h:mm A") : fallback;

export const fromNow = (value) => (value && dayjs(value).isValid() ? dayjs(value).fromNow() : "");

export const formatNumber = (value) => new Intl.NumberFormat("en-US").format(Number(value) || 0);

export const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
