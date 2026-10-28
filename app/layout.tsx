import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthSyncListener } from "@/components/auth/auth-sync-listener";
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

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('neon-theme');
    var isDark = true;
    if (stored === 'light') {
      isDark = false;
    } else if (stored === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else if (stored === 'dark') {
      isDark = true;
    } else {
      var match = document.cookie.match(/(?:^|; )neon-theme=([^;]*)/);
      if (match && match[1] === 'light') {
        isDark = false;
      }
    }
    var root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(isDark ? 'dark' : 'light');
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("neon-theme")?.value;
  const isServerDark = themeCookie !== "light";

  return (
    <ClerkProvider
      appearance={{
        theme: isServerDark ? dark : undefined,
        variables: {
          colorPrimary: "#FF2A85",
          colorPrimaryForeground: "#FFFFFF",
          colorBackground: isServerDark ? "#0B0D13" : "#FFFFFF",
          colorForeground: isServerDark ? "#F8FAFC" : "#0B0F19",
          colorMutedForeground: isServerDark ? "#94A3B8" : "#475569",
          colorInput: isServerDark ? "#121622" : "#EAEFF8",
          colorInputForeground: isServerDark ? "#F8FAFC" : "#0B0F19",
          colorNeutral: isServerDark ? "#F8FAFC" : "#0B0F19",
          colorBorder: isServerDark ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.12)",
          colorDanger: "#FF1744",
          colorSuccess: "#00E676",
          colorWarning: "#FFAB00",
          borderRadius: "0.5rem",
        },
        elements: {
          card: "bg-theme-card border border-theme-subtle shadow-2xl backdrop-blur-xl text-theme-primary",
          cardBox: "shadow-none",
          modalContent: "bg-theme-card border border-theme-subtle text-theme-primary",
          modalCloseButton: "text-theme-secondary hover:text-theme-primary",
          headerTitle: "text-theme-primary font-bold tracking-tight text-lg",
          headerSubtitle: "text-theme-secondary text-xs",
          formFieldLabel: "text-theme-primary font-medium text-xs tracking-wide",
          formFieldLabelRow: "text-theme-primary",
          formFieldInput:
            "bg-theme-elevated border border-theme-subtle text-theme-primary placeholder:text-theme-secondary focus:border-[#FF2A85] focus:ring-1 focus:ring-[#FF2A85] font-mono rounded-lg transition-colors",
          formFieldInputShowPasswordButton: "text-theme-secondary hover:text-theme-primary",
          formFieldHintText: "text-theme-secondary text-xs",
          formFieldErrorText: "text-[#FF1744] text-xs font-mono",
          formFieldSuccessText: "text-[#00E676] text-xs font-mono",
          formFieldInfoText: "text-theme-secondary text-xs",
          formButtonPrimary:
            "bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(255,42,133,0.4)] border border-[#FF2A85]/60 transition-all font-mono",
          formButtonReset: "text-theme-secondary hover:text-theme-primary",
          footer: "border-t border-theme-subtle bg-theme-card",
          footerAction: "text-theme-secondary text-xs",
          footerActionText: "text-theme-secondary text-xs",
          footerActionLink: "text-[#FF2A85] hover:text-[#ff559f] font-semibold",
          identityPreviewText: "text-theme-primary font-mono",
          identityPreviewEditButton: "text-[#FF2A85] hover:text-[#ff559f]",
          socialButtonsBlockButton:
            "bg-theme-elevated border border-theme-subtle hover:bg-theme-card text-theme-primary font-semibold transition-colors",
          socialButtonsBlockButtonText: "text-theme-primary font-medium",
          dividerLine: "bg-theme-subtle",
          dividerText: "text-theme-secondary text-xs font-mono uppercase",
          userButtonAvatarBox:
            "border border-white/[0.2] shadow-[0_0_8px_rgba(255,42,133,0.4)]",
          userButtonPopoverCard: "bg-theme-card border border-theme-subtle shadow-2xl text-theme-primary",
          userButtonPopoverActionButton: "text-theme-primary hover:bg-theme-elevated transition-colors",
          userButtonPopoverActionButtonText: "text-theme-primary",
          userButtonPopoverFooter: "border-t border-theme-subtle bg-theme-elevated/40",
          organizationSwitcherTrigger:
            "bg-theme-elevated border border-theme-subtle hover:border-[#FF2A85]/40 text-theme-primary text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all",
          organizationSwitcherPopoverCard: "bg-theme-card border border-theme-subtle shadow-2xl text-theme-primary",
          organizationSwitcherPopoverActionButton: "text-theme-primary hover:bg-theme-elevated transition-colors",
          organizationPreviewTextContainer: "text-theme-primary text-xs font-semibold",
          fileDropArea: "bg-theme-elevated border border-theme-subtle text-theme-primary rounded-lg p-4",
          fileDropAreaHint: "text-theme-secondary text-xs",
          fileDropAreaButtonPrimary: "text-[#FF2A85] hover:text-[#ff559f] font-semibold",
          avatarUploader: "border-theme-subtle bg-theme-elevated text-theme-primary",
          avatarImage: "rounded-lg",
          navbar: "border-r border-theme-subtle",
          navbarButton: "text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated data-[active=true]:text-[#FF2A85] data-[active=true]:bg-[#FF2A85]/10",
          scrollBox: "bg-theme-card",
          pageScrollBox: "bg-theme-card",
          profileSection: "border-b border-theme-subtle pb-4 mb-4",
          profileSectionTitle: "text-theme-primary font-bold",
          profileSectionTitleText: "text-theme-primary font-bold",
          profileSectionSubtitle: "text-theme-secondary text-xs",
          profileSectionContent: "text-theme-primary",
          badge: "bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40 font-mono",
          organizationProfile: "bg-theme-card text-theme-primary",
          userProfile: "bg-theme-card text-theme-primary",
          createOrganization: "bg-theme-card text-theme-primary",
          organizationList: "bg-theme-card text-theme-primary",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${isServerDark ? "dark" : "light"}`}
        data-theme={isServerDark ? "dark" : "light"}
        suppressHydrationWarning
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="min-h-full flex flex-col bg-theme-canvas text-theme-primary transition-colors duration-200">
          <ThemeProvider>
            <AuthSyncListener />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
