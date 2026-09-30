import { api } from "@/src/utils/api";

type Props = { workerId: string };

export default function PDFUpload({ workerId }: Props) {
  const upload = api.upload.uploadPDF.useMutation();

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    upload.mutate({
      workerId,
      file,
    });
  };

  return <input type="file" accept="application/pdf" onChange={handle} />;
}
