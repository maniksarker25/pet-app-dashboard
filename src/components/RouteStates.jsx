import { useRouteError } from "react-router-dom";
import { Button, Result } from "antd";

export function RouteError() {
  const error = useRouteError();
  // A new deploy replaces chunk files: reload to fetch the current ones.
  const isChunkError = /dynamically imported module|Loading chunk/i.test(error?.message || "");
  return (
    <Result
      status={isChunkError ? "info" : "error"}
      title={isChunkError ? "A new version is available" : "Something went wrong"}
      subTitle={isChunkError ? "Reload the page to continue." : error?.statusText || error?.message}
      extra={
        <Button type="primary" onClick={() => window.location.reload()}>
          Reload
        </Button>
      }
    />
  );
}

export function NotFound() {
  return (
    <Result
      status="404"
      title="Page not found"
      extra={
        <Button type="primary" href="/">
          Back to dashboard
        </Button>
      }
    />
  );
}
