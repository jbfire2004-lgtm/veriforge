import { apiGet } from "@/lib/api";

export default async function PublicCertPage({ params }: any) {
  const id = params.id;

  const data = await apiGet(`/verify/cert/${id}`);

  const { cert } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{cert.name}</h1>

      <section className="bg-white text-black p-4 rounded shadow space-y-2">
        <p><span className="font-semibold">Certification ID:</span> {cert.id}</p>
        <p><span className="font-semibold">Expires:</span> {cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString() : "N/A"}</p>
      </section>
    </div>
  );
}
