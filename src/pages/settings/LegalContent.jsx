import { useEffect, useState } from "react";
import { App, Button, Skeleton } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  useGetPrivacyQuery,
  useGetTermsQuery,
  useSavePrivacyMutation,
  useSaveTermsMutation,
} from "../../redux/api/contentApi";
import { getErrorMessage } from "../../redux/api/baseApi";
import { ErrorState, PageHeader, Panel } from "../../components/ui";
import { formatDateTime } from "../../utils/format";

const TOOLBAR = [
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "blockquote"],
  ["clean"],
];
// Stable reference: ReactQuill rebuilds the editor whenever `modules` changes identity.
const MODULES = { toolbar: TOOLBAR };

const isEmpty = (html) => !html || html.replace(/<[^>]*>/g, "").trim() === "";

function LegalEditor({ title, description, useGet, useSave }) {
  const { message } = App.useApp();
  const { data, isLoading, error, refetch } = useGet();
  const [save, { isLoading: isSaving }] = useSave();
  const [content, setContent] = useState("");
  // Quill rewrites HTML when it loads, so track real user edits instead of comparing strings.
  const [dirty, setDirty] = useState(false);

  const reset = () => {
    setContent(data?.description || "");
    setDirty(false);
  };

  useEffect(reset, [data]);

  const onSave = async () => {
    if (isEmpty(content)) {
      message.warning("Add some content before saving.");
      return;
    }
    try {
      await save(content).unwrap();
      setDirty(false);
      message.success(`${title} saved`);
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            {dirty && (
              <Button onClick={reset} disabled={isSaving}>
                Discard
              </Button>
            )}
            <Button type="primary" onClick={onSave} loading={isSaving} disabled={!dirty}>
              Save
            </Button>
          </>
        }
      />
      <Panel>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 12 }} />
        ) : (
          <>
            <div className="content-editor">
              <ReactQuill
                theme="snow"
                value={content}
                modules={MODULES}
                onChange={(html, delta, source) => {
                  setContent(html);
                  if (source === "user") setDirty(true);
                }}
              />
            </div>
            {data?.updatedAt && (
              <p className="m-0 mt-3 text-xs text-ink-subtle">Last saved {formatDateTime(data.updatedAt)}</p>
            )}
          </>
        )}
      </Panel>
    </>
  );
}

export function TermsPage() {
  return (
    <LegalEditor
      title="Terms & conditions"
      description="Shown to everyone in the mobile app."
      useGet={useGetTermsQuery}
      useSave={useSaveTermsMutation}
    />
  );
}

export function PrivacyPage() {
  return (
    <LegalEditor
      title="Privacy policy"
      description="Shown to everyone in the mobile app."
      useGet={useGetPrivacyQuery}
      useSave={useSavePrivacyMutation}
    />
  );
}
