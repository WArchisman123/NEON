"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Copy,
  Check,
  Mail,
  Link as LinkIcon,
  Shield,
  Building2,
  KeyRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrgOption {
  id: string;
  name: string;
  slug: string;
  links?: {
    member: string;
    admin: string;
  };
}

interface InviteTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrgId?: string | null;
}

export function InviteTeamDialog({
  isOpen,
  onClose,
  activeOrgId,
}: InviteTeamDialogProps) {
  const [activeTab, setActiveTab] = useState<"link" | "email" | "demo">("link");
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"org:member" | "org:admin">("org:member");
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  // Link copy state
  const [copiedLink, setCopiedLink] = useState(false);
  const [dynamicLink, setDynamicLink] = useState("");

  // Email invite state
  const [email, setEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Demo credentials copy state
  const [copiedCreds, setCopiedCreds] = useState<"email" | "password" | null>(null);

  // Derive static link if available on the selected organization
  const matchedOrg = organizations.find((o) => o.id === selectedOrgId);
  const staticLink =
    matchedOrg && matchedOrg.links
      ? selectedRole === "org:admin"
        ? matchedOrg.links.admin
        : matchedOrg.links.member
      : "";
  const currentLink = staticLink || dynamicLink;

  // Fetch manageable organizations on modal open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchInviteData = async () => {
      try {
        const res = await fetch("/api/v1/org/invite");
        const data = await res.json();
        if (!isMounted) return;
        if (data.organizations && data.organizations.length > 0) {
          setOrganizations(data.organizations);
          const initialOrgId =
            activeOrgId && data.organizations.some((o: OrgOption) => o.id === activeOrgId)
              ? activeOrgId
              : data.defaultOrgId || data.organizations[0].id;
          setSelectedOrgId(initialOrgId);
        }
      } catch (err) {
        console.error("Error loading invite data:", err);
      } finally {
        if (isMounted) setLoadingOrgs(false);
      }
    };

    fetchInviteData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeOrgId]);

  // Update dynamic link when selectedOrgId or selectedRole changes
  useEffect(() => {
    if (!selectedOrgId || matchedOrg?.links) return;

    let isMounted = true;
    fetch("/api/v1/org/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_link",
        targetOrgId: selectedOrgId,
        role: selectedRole,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.link) setDynamicLink(data.link);
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [selectedOrgId, selectedRole, matchedOrg]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);

  const handleCopyLink = () => {
    if (!currentLink) return;
    navigator.clipboard.writeText(currentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedOrgId) return;

    setSendingEmail(true);
    setEmailStatus(null);

    try {
      const res = await fetch("/api/v1/org/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_email",
          targetOrgId: selectedOrgId,
          email,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send invitation.");
      }

      setEmailStatus({
        type: "success",
        message: `Official Clerk invitation sent to ${email}`,
      });
      setEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error sending invitation";
      setEmailStatus({ type: "error", message: msg });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyCreds = (type: "email" | "password", value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedCreds(type);
    setTimeout(() => setCopiedCreds(null), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl my-auto rounded-2xl bg-[#0B0D13] border border-white/[0.1] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[calc(100vh-3rem)] sm:max-h-[85vh]">
        {/* Top glowing accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent z-10" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] shrink-0 bg-[#0B0D13]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#FF2A85]/20 border border-[#FF2A85]/40 flex items-center justify-center text-[#FF2A85]">
              <UserPlus className="size-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Team Invitations &amp; Access
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Generate org-scoped invite links or send Clerk invitations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close invite modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Organization & Role Selectors */}
          <div className="p-3.5 rounded-xl bg-[#121622] border border-white/[0.08] space-y-3.5">
            {/* Organization Dropdown */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Building2 className="size-3 text-[#FF2A85]" />
                <span>Target Organization (Scoped Access)</span>
              </label>

              {loadingOrgs ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                  <Loader2 className="size-3.5 animate-spin text-[#FF2A85]" />
                  <span>Loading organizations...</span>
                </div>
              ) : organizations.length > 1 ? (
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full bg-[#0B0D13] border border-white/[0.1] hover:border-[#FF2A85]/40 focus:border-[#FF2A85] rounded-lg px-3 py-2 text-xs text-white font-mono transition-all outline-none"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id} className="bg-[#0B0D13] text-white">
                      {org.name} {org.id === "org_3JgZ51s2g9LkRRE0L61kAXDGDWE" ? "(Master Fleet)" : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0B0D13] border border-white/[0.1] text-xs font-mono text-white">
                  <span>{selectedOrg?.name || "iRasus Technologies"}</span>
                  <span className="text-[10px] text-[#00E676] uppercase">Master Org</span>
                </div>
              )}
            </div>

            {/* Role Radio Group */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Shield className="size-3 text-[#FF2A85]" />
                <span>Designated Organization Role</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("org:member")}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedRole === "org:member"
                      ? "bg-[#FF2A85]/15 border-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.3)]"
                      : "bg-[#0B0D13] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.2]"
                  }`}
                >
                  <div className="font-bold text-xs text-white">Site Engineer</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Read-only dispatch telemetry
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("org:admin")}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedRole === "org:admin"
                      ? "bg-[#FF2A85]/15 border-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.3)]"
                      : "bg-[#0B0D13] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.2]"
                  }`}
                >
                  <div className="font-bold text-xs text-white">Organization Admin</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Full fleet control &amp; invites
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/[0.08] gap-4">
            <button
              onClick={() => setActiveTab("link")}
              className={`pb-2 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "link"
                  ? "text-[#FF2A85] border-b-2 border-[#FF2A85]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LinkIcon className="size-3.5" />
              <span>Shareable Link</span>
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`pb-2 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "email"
                  ? "text-[#FF2A85] border-b-2 border-[#FF2A85]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Mail className="size-3.5" />
              <span>Clerk Email</span>
            </button>
            <button
              onClick={() => setActiveTab("demo")}
              className={`pb-2 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "demo"
                  ? "text-[#FF2A85] border-b-2 border-[#FF2A85]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <KeyRound className="size-3.5" />
              <span>Demo Account</span>
            </button>
          </div>

          {/* Tab 1: Shareable Org-Scoped Link */}
          {activeTab === "link" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Send this link to colleagues or investors. When they sign in (via Google or Email),
                Clerk automatically enrolls them into{" "}
                <strong className="text-white">{selectedOrg?.name || "the selected organization"}</strong>{" "}
                with the chosen role.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentLink || "Generating signed link..."}
                  className="flex-1 bg-[#121622] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-slate-300 font-mono outline-none select-all"
                />
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  className="shrink-0 min-h-[38px] px-3.5"
                >
                  {copiedLink ? (
                    <>
                      <Check className="size-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-[#121622]/60 border border-white/[0.05] text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <span className="size-1.5 rounded-full bg-[#00E676]" />
                  <span>Cryptographic Org-Enforced Security</span>
                </div>
                <p>
                  The HMAC token guarantees this link only works for{" "}
                  <span className="text-[#FF2A85]">{selectedOrg?.name}</span>. Uninvited users signing
                  up independently will not gain access.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Send Official Clerk Email */}
          {activeTab === "email" && (
            <form onSubmit={handleSendEmail} className="space-y-3">
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Send an official invitation email directly from Clerk with a secure one-time token.
              </p>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Recipient Email
                </label>
                <Input
                  type="email"
                  placeholder="engineer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#121622]"
                />
              </div>

              {emailStatus && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 text-xs font-mono ${
                    emailStatus.type === "success"
                      ? "bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]"
                      : "bg-[#FF1744]/10 border border-[#FF1744]/30 text-[#FF1744]"
                  }`}
                >
                  {emailStatus.type === "success" ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" />
                  )}
                  <span>{emailStatus.message}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={sendingEmail}
                className="w-full h-11"
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Sending Clerk Invitation...</span>
                  </>
                ) : (
                  <>
                    <Mail className="size-3.5" />
                    <span>Send Clerk Invitation</span>
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Tab 3: Demo Credentials */}
          {activeTab === "demo" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Use these pre-provisioned demo credentials for immediate client or evaluator access
                without requiring them to create a new account:
              </p>

              <div className="p-4 rounded-xl bg-[#121622] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Email</span>
                    <div className="text-xs font-mono font-bold text-white">demo@demo.com</div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyCreds("email", "demo@demo.com")}
                  >
                    {copiedCreds === "email" ? (
                      <Check className="size-3 text-[#00E676]" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>

                <div className="h-px bg-white/[0.06]" />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Password</span>
                    <div className="text-xs font-mono font-bold text-white">demo1234</div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyCreds("password", "demo1234")}
                  >
                    {copiedCreds === "password" ? (
                      <Check className="size-3 text-[#00E676]" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-[11px] font-mono text-slate-500">
                ⭐ Grants full <strong className="text-slate-300">Admin</strong> privileges to the{" "}
                <strong className="text-[#FF2A85]">iRasus Technologies</strong> fleet (6 Solar &amp; BESS sites).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
