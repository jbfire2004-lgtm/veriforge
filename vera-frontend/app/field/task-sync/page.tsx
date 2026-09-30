import { createFieldModulePage } from "../_lib/create-field-module-page";

export const metadata = {
  title: "Task Sync — FieldOS",
  description:
    "Pending and failed field tasks — sync the binder queue and resolve conflicts.",
};

export default createFieldModulePage("task_sync");
