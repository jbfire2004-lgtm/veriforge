import { api } from "@/src/utils/api";

type Props = { workerId: string };

export default function CameraUpload({ workerId }: Props) {
  const upload = api.upload.uploadBase64.useMutation();

  const capture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    upload.mutate({
      workerId,
      file,
    });
  };

  return (
    <input
      type="file"
      accept="image/*"
      capture="environment"
      onChange={capture}
    />
  );
}
