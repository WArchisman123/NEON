import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEON ENERGY | Industrial Solar & BESS Monitoring Platform",
  description:
    "Real-time renewable energy and battery storage management platform engineered for solar asset managers, microgrid operators, and industrial facility engineers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "#FF2A85",
          colorPrimaryForeground: "#FFFFFF",
          colorBackground: "#0B0D13",
          colorForeground: "#F8FAFC",
          colorMutedForeground: "#94A3B8",
          colorInput: "#121622",
          colorInputForeground: "#F8FAFC",
          colorNeutral: "#F8FAFC",
          colorBorder: "rgba(255, 255, 255, 0.1)",
          colorDanger: "#FF1744",
          colorSuccess: "#00E676",
          colorWarning: "#FFAB00",
          borderRadius: "0.5rem",
        },
        elements: {
          card: "bg-[#0B0D13] border border-white/[0.08] shadow-[0_0_35px_rgba(0,0,0,0.85)] backdrop-blur-xl text-slate-100",
          cardBox: "shadow-none",
          modalContent: "bg-[#0B0D13] border border-white/[0.08] text-slate-100",
          modalCloseButton: "text-slate-400 hover:text-white",
          headerTitle: "text-white font-bold tracking-tight text-lg",
          headerSubtitle: "text-slate-400 text-xs",
          formFieldLabel: "text-slate-300 font-medium text-xs tracking-wide",
          formFieldLabelRow: "text-slate-300",
          formFieldInput:
            "bg-[#121622] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-[#FF2A85] focus:ring-1 focus:ring-[#FF2A85] font-mono rounded-lg transition-colors",
          formFieldInputShowPasswordButton: "text-slate-400 hover:text-white",
          formFieldHintText: "text-slate-400 text-xs",
          formFieldErrorText: "text-[#FF1744] text-xs font-mono",
          formFieldSuccessText: "text-[#00E676] text-xs font-mono",
          formFieldInfoText: "text-slate-400 text-xs",
          formButtonPrimary:
            "bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(255,42,133,0.4)] border border-[#FF2A85]/60 transition-all font-mono",
          formButtonReset: "text-slate-400 hover:text-white",
          footer: "border-t border-white/[0.08] bg-[#0B0D13]",
          footerAction: "text-slate-400 text-xs",
          footerActionText: "text-slate-400 text-xs",
          footerActionLink: "text-[#FF2A85] hover:text-[#ff559f] font-semibold",
          identityPreviewText: "text-slate-200 font-mono",
          identityPreviewEditButton: "text-[#FF2A85] hover:text-[#ff559f]",
          socialButtonsBlockButton:
            "bg-[#121622] border border-white/[0.1] hover:bg-[#1a2030] text-slate-200 hover:text-white font-semibold transition-colors",
          socialButtonsBlockButtonText: "text-slate-200 font-medium",
          dividerLine: "bg-white/[0.1]",
          dividerText: "text-slate-500 text-xs font-mono uppercase",
          userButtonAvatarBox:
            "border border-white/[0.2] shadow-[0_0_8px_rgba(255,42,133,0.4)]",
          userButtonPopoverCard: "bg-[#0B0D13] border border-white/[0.1] shadow-2xl text-slate-100",
          userButtonPopoverActionButton: "text-slate-300 hover:text-white hover:bg-white/[0.05]",
          userButtonPopoverActionButtonText: "text-slate-300 hover:text-white",
          userButtonPopoverFooter: "border-t border-white/[0.08]",
          organizationSwitcherTrigger:
            "bg-[#121622] border border-white/[0.08] hover:border-white/[0.2] text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all",
          organizationSwitcherPopoverCard: "bg-[#0B0D13] border border-white/[0.1] shadow-2xl text-slate-100",
          organizationSwitcherPopoverActionButton: "text-slate-300 hover:text-white hover:bg-white/[0.05]",
          organizationPreviewTextContainer: "text-slate-200 text-xs font-semibold",
          fileDropArea: "bg-[#121622] border border-white/[0.1] text-slate-300 rounded-lg p-4",
          fileDropAreaHint: "text-slate-400 text-xs",
          fileDropAreaButtonPrimary: "text-[#FF2A85] hover:text-[#ff559f] font-semibold",
          avatarUploader: "border-white/[0.1] bg-[#121622] text-slate-300",
          avatarImage: "rounded-lg",
          navbar: "border-r border-white/[0.08]",
          navbarButton: "text-slate-400 hover:text-white hover:bg-white/[0.05] data-[active=true]:text-[#FF2A85] data-[active=true]:bg-[#FF2A85]/10",
          scrollBox: "bg-[#0B0D13]",
          pageScrollBox: "bg-[#0B0D13]",
          profileSection: "border-b border-white/[0.08] pb-4 mb-4",
          profileSectionTitle: "text-white font-bold",
          profileSectionTitleText: "text-white font-bold",
          profileSectionSubtitle: "text-slate-400 text-xs",
          profileSectionContent: "text-slate-200",
          badge: "bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40 font-mono",
          organizationProfile: "bg-[#0B0D13] text-slate-100",
          userProfile: "bg-[#0B0D13] text-slate-100",
          createOrganization: "bg-[#0B0D13] text-slate-100",
          organizationList: "bg-[#0B0D13] text-slate-100",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col bg-[#060709] text-slate-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
