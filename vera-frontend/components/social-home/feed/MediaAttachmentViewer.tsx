"use client";

type Media = { id: string; fileType: string; url: string };

export function MediaAttachmentViewer({ media }: { media: Media[] }) {
  if (!media.length) return null;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {media.map((m) => (
        <div key={m.id} className="overflow-hidden rounded-lg border dark:border-zinc-700">
          {m.fileType === "video" ? (
            <video src={m.url} controls className="max-h-80 w-full" />
          ) : m.fileType === "pdf" ? (
            <a
              href={m.url}
              target="_blank"
              rel="noreferrer"
              className="block p-4 text-sm text-vera-teal underline"
            >
              View PDF attachment
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.url} alt="" className="max-h-80 w-full object-cover" />
          )}
        </div>
      ))}
    </div>
  );
}
