import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProjectDeliveryCard } from "../../../src/features/reports/ProjectDeliveryCard";
import { RevenueTrajectoryChart } from "../../../src/features/reports/RevenueTrajectoryChart";
import { MarginTrajectoryChart } from "../../../src/features/reports/MarginTrajectoryChart";
import { TaskCreateModal } from "../../../src/features/tasks/TaskCreateModal";
import * as projectHooks from "../../../src/features/projects/hooks";

vi.mock("../../../src/features/projects/hooks", () => ({
  useProjects: vi.fn(),
}));
vi.mock("../../../src/features/admin/hooks", () => ({
  useEmployees: () => ({ data: { data: [] } }),
}));
vi.mock("../../../src/features/milestones/hooks", () => ({
  useMilestones: () => ({ data: { data: [] } }),
}));
vi.mock("../../../src/features/tasks/hooks", () => ({
  useCreateTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const makeMonth = (m: string, col: number, isCurrent = false) => ({
  m,
  inv: col,
  col,
  exp: 5,
  invPct: 50,
  colPct: 50,
  expPct: 25,
  isCurrent,
});

describe("Dynamic Dashboard Widgets & Task Search", () => {
  const qc = new QueryClient();

  it("ProjectDeliveryCard renders fallback state when no active project exists", () => {
    render(
      <MemoryRouter>
        <ProjectDeliveryCard c={null} featuredProject={null} />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("No active projects currently in sprint"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Fintech Core Banking API Integration"),
    ).not.toBeInTheDocument();
  });

  it("RevenueTrajectoryChart computes dynamic velocity from collections", () => {
    const trajectories = [makeMonth("Jan", 10), makeMonth("Feb", 20, true)];
    render(
      <MemoryRouter>
        <RevenueTrajectoryChart trajectories={trajectories} />
      </MemoryRouter>,
    );
    expect(screen.getByText("+100.0% Velocity")).toBeInTheDocument();
    expect(screen.queryByText("+18.2% Velocity")).not.toBeInTheDocument();
  });

  it("MarginTrajectoryChart dynamically computes month labels and net values", () => {
    render(
      <MarginTrajectoryChart
        f={
          {
            revenue: "50000",
            expenses: "20000",
            estimatedProfit: "30000",
          } as any
        }
      />,
    );
    expect(screen.getByText("60.0% Margin")).toBeInTheDocument();
    expect(screen.queryByText("Jul ($7k Net)")).not.toBeInTheDocument();
  });

  it("TaskCreateModal allows searching and selecting target project", () => {
    vi.mocked(projectHooks.useProjects).mockReturnValue({
      data: {
        data: [{ id: "p-1", name: "Alpha Redesign", projectCode: "PRJ-1" }],
      },
    } as any);

    render(
      <QueryClientProvider client={qc}>
        <TaskCreateModal isOpen={true} onClose={vi.fn()} />
      </QueryClientProvider>,
    );

    const searchInput = screen.getByPlaceholderText("Search projects...");
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: "Alpha" } });
    expect(screen.getByText("Alpha Redesign (PRJ-1)")).toBeInTheDocument();
  });
});
