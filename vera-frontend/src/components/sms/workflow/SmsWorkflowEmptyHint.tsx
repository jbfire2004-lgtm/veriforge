import { SmsEmptyState } from "@/src/components/sms/design-system";

type Props = {
  title: string;
  description?: string;
};

/** Compact empty state for inactive workflow step panels. */
export function SmsWorkflowEmptyHint({ title, description }: Props) {
  return (
    <SmsEmptyState
      title={title}
      description={description}
      className="py-[var(--sms-space-6)]"
    />
  );
}
