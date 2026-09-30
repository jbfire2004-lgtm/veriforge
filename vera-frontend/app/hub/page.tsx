import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { fetchHomepage } from "@/lib/hub/homepage-api";
import { emptyHomepagePayload } from "@/lib/hub/empty-homepage";
import { articleJsonLd, jobPostingJsonLd } from "@/lib/hub/json-ld";
import { HubHomepage } from "@/components/hub/HubHomepage";
import { HubIndustryPanels } from "@/components/public-safety/HubIndustryPanels";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vera.app";

export default async function HubPage() {
  const session = await getServerSession(authOptions);

  let data;
  let apiOffline = false;
  try {
    data = await fetchHomepage(session, { refresh: false });
  } catch {
    apiOffline = true;
    data = emptyHomepagePayload(session?.user?.role ?? null);
  }

  const jsonLd = [
    ...data.jobPreview.slice(0, 3).map((j) => jobPostingJsonLd(j, siteUrl)),
    ...data.safetyBlogPreview.slice(0, 3).map((a) => articleJsonLd(a, siteUrl)),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-8">
        <HubHomepage
          data={data}
          userName={session?.user?.name ?? null}
          role={session?.user?.role ?? null}
          apiOffline={apiOffline}
        />
        <HubIndustryPanels />
      </div>
    </>
  );
}
