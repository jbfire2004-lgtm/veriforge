import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { InspectionItemPhotoFindings } from "@/components/inspection/InspectionItemPhotoFindings";
import type { InspectionPhotoDisplayItem } from "@/lib/inspection-photo-findings";

const displays: InspectionPhotoDisplayItem[] = [
  {
    id: "f1",
    title: "Debris in walkway",
    imageUrl: "data:image/svg+xml,<svg/>",
    ocrText: "CAUTION TRIP HAZARD",
    hazardTags: ["housekeeping", "medium"],
    syncState: "synced",
    checklistItemId: "item2",
    severity: "medium",
  },
  {
    id: "pending-1",
    title: "Queued photo",
    imageUrl: "data:image/svg+xml,<svg/>",
    ocrText: "Awaiting sync",
    hazardTags: ["pending sync"],
    syncState: "pending",
    checklistItemId: "item2",
  },
];

describe("InspectionItemPhotoFindings", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders thumbnails with OCR text and hazard tags", () => {
    render(<InspectionItemPhotoFindings displays={displays} />);

    expect(screen.getByTestId("inspection-item-photo-findings")).toBeInTheDocument();
    expect(screen.getByTestId("photo-thumbnail-f1")).toBeInTheDocument();
    expect(screen.getByTestId("photo-ocr-f1")).toHaveTextContent("CAUTION TRIP HAZARD");
    expect(screen.getByTestId("photo-tags-f1")).toHaveTextContent("housekeeping");
    expect(screen.getByTestId("photo-sync-badge-pending")).toHaveTextContent(
      "Pending sync",
    );
  });

  it("opens full-screen viewer when a thumbnail is clicked", () => {
    render(<InspectionItemPhotoFindings displays={displays} />);

    fireEvent.click(screen.getByTestId("photo-thumbnail-f1"));
    expect(screen.getByTestId("inspection-photo-viewer")).toBeInTheDocument();
    expect(screen.getByText("CAUTION TRIP HAZARD")).toBeInTheDocument();
  });
});
