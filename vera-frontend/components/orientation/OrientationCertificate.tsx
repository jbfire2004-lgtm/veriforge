"use client";

type Props = {
  workerName: string;
  packageTitle: string;
  certificateId: string;
  languageCode: string;
  completedAt: string;
};

export function OrientationCertificate({
  workerName,
  packageTitle,
  certificateId,
  languageCode,
  completedAt,
}: Props) {
  return (
    <div className="rounded-2xl border-2 border-[#2F8F8C]/30 bg-gradient-to-br from-[#E4F3F2] to-white p-8 text-center shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2F8F8C]">
        Certificate of orientation
      </p>
      <h2 className="mt-4 text-2xl font-bold text-[#2A2E33]">{workerName}</h2>
      <p className="mt-2 text-sm text-[#5a6b7c]">Completed: {packageTitle}</p>
      <p className="mt-6 text-xs text-[#64748b]">
        {new Date(completedAt).toLocaleString()} · {languageCode.toUpperCase()}
      </p>
      <p className="mt-2 font-mono text-[10px] text-[#94a3b8]">{certificateId}</p>
    </div>
  );
}
