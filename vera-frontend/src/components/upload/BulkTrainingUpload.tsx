import { api } from "@/src/utils/api";

type Props = { companyId: string };

export default function BulkTrainingUpload({ companyId }: Props) {
  const upload = api.upload.uploadBulkTraining.useMutation();

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    upload.mutate({
      companyId,
      file,
    });
  };

  return (
    <input
      type="file"
      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json"
      onChange={handle}
    />
  );
}
