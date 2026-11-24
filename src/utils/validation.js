// Password rules shared by the reset and change-password forms (backend minimum is 6).
export const passwordRules = [
  { required: true, message: "Enter a password" },
  { min: 6, message: "Use at least 6 characters" },
];

export const confirmRules = (field) => [
  { required: true, message: "Confirm the password" },
  ({ getFieldValue }) => ({
    validator: (_, value) =>
      !value || getFieldValue(field) === value ? Promise.resolve() : Promise.reject(new Error("Passwords don't match")),
  }),
];
