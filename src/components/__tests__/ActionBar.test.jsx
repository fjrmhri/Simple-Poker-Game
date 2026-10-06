import { fireEvent, render, screen } from "@testing-library/react";
import ActionBar from "../ActionBar";

const raiseActions = [
  { type: "fold" },
  { type: "call", amount: 100 },
  { type: "bet", min: 100, max: 800 },
];

describe("ActionBar", () => {
  it("menampilkan total taruhan pada tombol raise", () => {
    render(
      <ActionBar actions={raiseActions} onAction={() => {}} heroBet={20} />,
    );
    expect(
      screen.getByRole("button", { name: "Raise to 220" }),
    ).toBeInTheDocument();
  });

  it("mengirim jumlah kenaikan, bukan total, ke onAction", () => {
    const onAction = vi.fn();
    render(
      <ActionBar actions={raiseActions} onAction={onAction} heroBet={20} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^All-in/ }));
    fireEvent.click(screen.getByRole("button", { name: "All-in (920)" }));
    expect(onAction).toHaveBeenCalledWith("bet", 800);
  });

  it("memakai label Bet saat bisa check", () => {
    render(
      <ActionBar
        actions={[
          { type: "fold" },
          { type: "check" },
          { type: "bet", min: 20, max: 500 },
        ]}
        onAction={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Bet 20" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check" })).toBeEnabled();
  });

  it("menunjukkan siapa yang sedang ditunggu dan menonaktifkan tombol", () => {
    render(<ActionBar actions={[]} onAction={() => {}} waitingFor="Carl" />);
    expect(screen.getByText("Carl is deciding…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fold" })).toBeDisabled();
  });
});
