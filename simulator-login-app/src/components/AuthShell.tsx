import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Optional badge above title */
  badge?: string;
};

export function AuthShell({ title, subtitle, children, badge }: Readonly<AuthShellProps>) {
  return (
    <div className="auth-page">
      <aside className="auth-hero" aria-hidden="true">
        <div className="auth-hero__mesh" />
        <div className="auth-hero__content">
          <span className="auth-hero__logo">OTP</span>
          <h2 className="auth-hero__headline">Smart OTP Simulator</h2>
          <p className="auth-hero__text">Giả lập luồng đăng nhập và xác thực OTP</p>
          <ul className="auth-hero__bullets">
            <li>Challenge / verify / resend</li>
            <li>Expired / retries</li>
          </ul>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          {badge ? <span className="auth-badge">{badge}</span> : null}
          <h1 className="auth-title">{title}</h1>
          {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
          {children}
        </div>
      </main>
    </div>
  );
}
