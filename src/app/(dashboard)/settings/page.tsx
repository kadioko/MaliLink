"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader, SectionCard, Badge } from "@/components/dashboard-ui";
import { User, Lock, Building2, MapPin, Phone, Mail, CheckCircle2, AlertCircle } from "lucide-react";

type ProfileData = {
  id: string;
  email: string;
  name: string;
  businessName: string;
  phone: string;
  location: string | null;
  role: string;
  kycStatus: string;
  tinNumber: string | null;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  createdAt: string;
};

type AlertState = { type: "success" | "error"; message: string } | null;

function FieldGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-gray-50 disabled:text-gray-500"
    />
  );
}

function Alert({ state }: { state: AlertState }) {
  if (!state) return null;
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
        state.type === "success"
          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {state.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      {state.message}
    </div>
  );
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [profileAlert, setProfileAlert] = useState<AlertState>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordAlert, setPasswordAlert] = useState<AlertState>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ user }) => {
        setProfile(user);
        setName(user.name);
        setBusinessName(user.businessName);
        setLocation(user.location ?? "");
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setProfileAlert(null);
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, businessName, location }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setProfileAlert({ type: "error", message: typeof payload.error === "string" ? payload.error : "Update failed." });
      } else {
        setProfile((p) => (p ? { ...p, ...payload.user } : p));
        setProfileAlert({ type: "success", message: "Profile updated successfully." });
        await update({ name: payload.user.name, businessName: payload.user.businessName });
      }
    } catch {
      setProfileAlert({ type: "error", message: "Network error — please try again." });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSave(e: FormEvent) {
    e.preventDefault();
    setPasswordAlert(null);
    if (newPassword !== confirmPassword) {
      setPasswordAlert({ type: "error", message: "New passwords do not match." });
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change-password", currentPassword, newPassword }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setPasswordAlert({ type: "error", message: typeof payload.error === "string" ? payload.error : "Password change failed." });
      } else {
        setPasswordAlert({ type: "success", message: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordAlert({ type: "error", message: "Network error — please try again." });
    } finally {
      setIsSavingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
        <div className="h-32 animate-pulse rounded-[2rem] bg-white/60" />
        <div className="h-64 animate-pulse rounded-[1.75rem] bg-white/60" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Account Settings"
        description="Manage your profile information, business details, and account security."
        badge={<Badge tone={profile?.kycStatus === "VERIFIED" ? "success" : "warning"}>{profile?.kycStatus ?? "KYC"}</Badge>}
      />

      <SectionCard
        title="Account Overview"
        description="Read-only identity fields. Contact support to update email."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-800">{profile?.email}</p>
            </div>
            {profile?.emailVerifiedAt ? (
              <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="ml-auto h-4 w-4 text-amber-500" />
            )}
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-800">{profile?.phone}</p>
            </div>
            {profile?.phoneVerifiedAt ? (
              <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="ml-auto h-4 w-4 text-amber-500" />
            )}
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
            <User className="h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Role</p>
              <p className="text-sm font-medium text-gray-800">{profile?.role}</p>
            </div>
          </div>
          {profile?.tinNumber ? (
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
              <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">TIN</p>
                <p className="text-sm font-medium text-gray-800">{profile.tinNumber}</p>
              </div>
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="Profile Details" description="Update your display name, business name, and location.">
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Full Name" icon={<User className="h-3.5 w-3.5 text-gray-400" />}>
              <InputField
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                minLength={2}
              />
            </FieldGroup>
            <FieldGroup label="Business Name" icon={<Building2 className="h-3.5 w-3.5 text-gray-400" />}>
              <InputField
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                autoComplete="organization"
                required
                minLength={2}
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Location" icon={<MapPin className="h-3.5 w-3.5 text-gray-400" />}>
            <InputField
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kariakoo, Dar es Salaam"
              autoComplete="address-level2"
            />
          </FieldGroup>
          <Alert state={profileAlert} />
          <button
            type="submit"
            disabled={isSavingProfile}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSavingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Change Password" description="Use a strong, unique password at least 8 characters long.">
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <FieldGroup label="Current Password" icon={<Lock className="h-3.5 w-3.5 text-gray-400" />}>
            <InputField
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="New Password" icon={<Lock className="h-3.5 w-3.5 text-gray-400" />}>
              <InputField
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </FieldGroup>
            <FieldGroup label="Confirm New Password" icon={<Lock className="h-3.5 w-3.5 text-gray-400" />}>
              <InputField
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </FieldGroup>
          </div>
          <Alert state={passwordAlert} />
          <button
            type="submit"
            disabled={isSavingPassword}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isSavingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
