import { useEffect, useState } from "react";
import { Alert, App, Button, Input } from "antd";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useResendResetCodeMutation, useVerifyCodeMutation } from "../redux/api/authApi";
import { getErrorMessage } from "../redux/api/baseApi";
import { AuthHeading } from "./AuthLayout";
import { BackToLogin } from "./ForgotPassword";

const RESEND_SECONDS = 60;

export default function VerifyCode() {
  const { state } = useLocation();
  const email = state?.email;
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [verifyCode, { isLoading }] = useVerifyCodeMutation();
  const [resendCode, { isLoading: isResending }] = useResendResetCodeMutation();

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) return <Navigate to="/forgot-password" replace />;

  const submit = async (value = code) => {
    if (value.length !== 6) return;
    setError("");
    try {
      await verifyCode({ email, code: value }).unwrap();
      navigate("/reset-password", { replace: true, state: { email, code: value } });
    } catch (err) {
      setError(getErrorMessage(err, "That code didn't work. Please try again."));
    }
  };

  const resend = async () => {
    setError("");
    try {
      await resendCode({ email }).unwrap();
      setCode("");
      setCooldown(RESEND_SECONDS);
      message.success("A new code is on its way.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <AuthHeading
        title="Check your email"
        subtitle={
          <>
            Enter the 6-digit code we sent to <span className="font-medium text-ink">{email}</span>.
          </>
        }
      />
      {error && <Alert type="error" showIcon message={error} className="mb-5" />}
      <div className="flex justify-center">
        <Input.OTP
          length={6}
          size="large"
          value={code}
          onChange={(v) => {
            setCode(v);
            submit(v);
          }}
          formatter={(v) => v.replace(/\D/g, "")}
        />
      </div>
      <Button type="primary" block size="large" className="mt-6" loading={isLoading} onClick={() => submit()}>
        Verify code
      </Button>
      <div className="mt-4 text-center text-sm text-ink-muted">
        Didn&apos;t get it?{" "}
        <Button type="link" size="small" className="px-1" disabled={cooldown > 0} loading={isResending} onClick={resend}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </Button>
      </div>
      <BackToLogin />
    </>
  );
}
