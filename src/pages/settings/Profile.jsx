import { useEffect, useState } from "react";
import { App, Button, Form, Input, Skeleton, Tabs, Upload } from "antd";
import { LuCamera } from "react-icons/lu";
import {
  useChangeAdminPasswordMutation,
  useGetAdminProfileQuery,
  useUpdateProfileMutation,
} from "../../redux/api/profileApi";
import { getErrorMessage } from "../../redux/api/baseApi";
import useLogout from "../../hooks/useLogout";
import { ErrorState, PageHeader, Panel, UserAvatar } from "../../components/ui";
import { confirmRules, passwordRules } from "../../utils/validation";
import { titleCase } from "../../utils/format";

const MAX_IMAGE_MB = 5;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function Profile() {
  const { data: admin, isLoading, error, refetch } = useGetAdminProfileQuery();

  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <>
      <PageHeader title="Profile" description="Your admin account details and password." />
      <Panel className="max-w-3xl">
        {isLoading ? (
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        ) : (
          <Tabs
            items={[
              { key: "profile", label: "Account", children: <ProfileForm admin={admin} /> },
              { key: "password", label: "Password", children: <PasswordForm /> },
            ]}
          />
        )}
      </Panel>
    </>
  );
}

function ProfileForm({ admin }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    form.setFieldsValue({ name: admin?.name, email: admin?.email, phone: admin?.phone });
  }, [admin, form]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const beforeUpload = (f) => {
    if (!IMAGE_TYPES.includes(f.type)) {
      message.error("Use a JPG, PNG or WebP image.");
      return Upload.LIST_IGNORE;
    }
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      message.error(`Image must be smaller than ${MAX_IMAGE_MB} MB.`);
      return Upload.LIST_IGNORE;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    return false; // upload together with the form
  };

  const onFinish = async ({ name, phone }) => {
    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("phone", (phone || "").trim());
    if (file) fd.append("profilePic", file);
    try {
      await updateProfile(fd).unwrap();
      setFile(null);
      message.success("Profile updated");
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <Form form={form} layout="vertical" requiredMark={false} onFinish={onFinish} className="pt-2">
      <div className="mb-6 flex items-center gap-5">
        {preview ? (
          <img src={preview} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <UserAvatar src={admin?.profilePic} name={admin?.name} size={80} />
        )}
        <div>
          <Upload accept={IMAGE_TYPES.join(",")} showUploadList={false} beforeUpload={beforeUpload} maxCount={1}>
            <Button icon={<LuCamera />}>Change photo</Button>
          </Upload>
          <p className="m-0 mt-2 text-xs text-ink-subtle">JPG, PNG or WebP, up to {MAX_IMAGE_MB} MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Form.Item name="name" label="Full name" rules={[{ required: true, whitespace: true, message: "Enter your name" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" extra="Contact a super admin to change the sign-in email.">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Role">
          <Input disabled value={titleCase(admin?.role || "ADMIN")} />
        </Form.Item>
      </div>

      <Button type="primary" htmlType="submit" loading={isLoading}>
        Save changes
      </Button>
    </Form>
  );
}

function PasswordForm() {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [changePassword, { isLoading }] = useChangeAdminPasswordMutation();
  const logout = useLogout();
  const [error, setError] = useState("");

  const onFinish = async (values) => {
    setError("");
    try {
      await changePassword(values).unwrap();
      form.resetFields();
      // The backend revokes every session on password change.
      modal.success({
        title: "Password changed",
        content: "For security you've been signed out everywhere. Sign in with your new password.",
        okText: "Sign in",
        afterClose: logout,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Form form={form} layout="vertical" requiredMark={false} onFinish={onFinish} className="max-w-md pt-2">
      <Form.Item name="oldPassword" label="Current password" rules={[{ required: true, message: "Enter your current password" }]}>
        <Input.Password autoComplete="current-password" />
      </Form.Item>
      <Form.Item name="newPassword" label="New password" rules={passwordRules}>
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Form.Item
        name="confirmNewPassword"
        label="Confirm new password"
        dependencies={["newPassword"]}
        rules={confirmRules("newPassword")}
        validateStatus={error ? "error" : undefined}
        help={error || undefined}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={isLoading}>
        Change password
      </Button>
    </Form>
  );
}
