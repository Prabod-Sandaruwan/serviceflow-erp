import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AuditLogDetails } from "../../../src/features/admin/AuditLogDetails";

describe("AuditLogDetails Component", () => {
  it("renders creation attributes in user-friendly format", () => {
    const log = {
      id: 1,
      action: "USER_CREATED",
      actor: { email: "admin@serviceflow.lk" },
      ipAddress: "192.168.1.5",
      requestId: "req-abc-12345678",
      before: null,
      after: { email: "engineer@serviceflow.lk", role: "STAFF" },
    };

    render(<AuditLogDetails log={log} />);

    expect(
      screen.getByText("Configured Entity Attributes"),
    ).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("engineer@serviceflow.lk")).toBeInTheDocument();
    expect(screen.getByText("IP: 192.168.1.5")).toBeInTheDocument();
  });

  it("renders update diff with previous and new values", () => {
    const log = {
      id: 2,
      action: "ROLE_CHANGED",
      actorRole: "ADMIN",
      before: { role: "STAFF" },
      after: { role: "MANAGER" },
    };

    render(<AuditLogDetails log={log} />);

    expect(
      screen.getByText("Recorded Field Modifications"),
    ).toBeInTheDocument();
    expect(screen.getByText("STAFF")).toBeInTheDocument();
    expect(screen.getByText("MANAGER")).toBeInTheDocument();
  });

  it("toggles raw JSON view on demand", () => {
    const log = {
      id: 3,
      action: "LOGIN",
      before: null,
      after: null,
    };

    render(<AuditLogDetails log={log} />);

    expect(
      screen.getByText(/No entity state modifications/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/{\s*"before":/i)).not.toBeInTheDocument();

    const toggleBtn = screen.getByRole("button", { name: /Show Raw JSON/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/{\s*"before":/i)).toBeInTheDocument();
  });
});
