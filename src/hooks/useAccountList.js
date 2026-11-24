import { useCallback, useState } from "react";
import { App } from "antd";
import useDebouncedValue from "./useDebouncedValue";
import { getErrorMessage } from "../redux/api/baseApi";

/**
 * Server-side list state for the account pages: pagination, debounced search, status filter,
 * plus a confirmed block/unblock action.
 */
export default function useAccountList(setBlockedMutation, noun) {
  const { modal, message } = App.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const debouncedSearch = useDebouncedValue(search);
  const [setBlocked] = setBlockedMutation();

  const params = { page, limit: pageSize, search: debouncedSearch.trim(), status };

  const onSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const onStatus = useCallback((v) => {
    setStatus(v);
    setPage(1);
  }, []);

  const pagination = (total) => ({
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    showTotal: (t, [from, to]) => `${from}–${to} of ${t}`,
    onChange: (p, s) => {
      setPage(s !== pageSize ? 1 : p);
      setPageSize(s);
    },
  });

  const confirmToggleBlock = (account) => {
    const blocking = !account.isBlocked;
    modal.confirm({
      title: `${blocking ? "Block" : "Unblock"} ${account.name || noun}?`,
      content: blocking
        ? `They won't be able to sign in or use the app until you unblock them.`
        : `They will be able to sign in and use the app again.`,
      okText: blocking ? "Block" : "Unblock",
      okButtonProps: { danger: blocking },
      onOk: async () => {
        try {
          await setBlocked({ id: account._id, blocked: blocking }).unwrap();
          message.success(`${account.name || noun} ${blocking ? "blocked" : "unblocked"}`);
        } catch (err) {
          message.error(getErrorMessage(err));
        }
      },
    });
  };

  return { params, search, status, onSearch, onStatus, pagination, confirmToggleBlock };
}
