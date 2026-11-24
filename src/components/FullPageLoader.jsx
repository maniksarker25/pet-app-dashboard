import { Spin } from "antd";

export default function FullPageLoader() {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
      <Spin size="large" />
    </div>
  );
}
