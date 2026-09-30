import { VeraPageLayout } from "@/src/components/navigation";
import { SelectorSystemView } from "@/components/selector-system/SelectorSystemView";

export const metadata = {
  title: "Selector System",
  description:
    "Industry, entity type, subtype, scale, and region selectors with dynamic filtering and plane isolation.",
};

export default function SelectorSystemPage() {
  return (
    <VeraPageLayout>
      <SelectorSystemView />
    </VeraPageLayout>
  );
}
