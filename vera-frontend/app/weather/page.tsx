import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { WeatherDetailView } from "@/components/weather/WeatherDetailView";

export const metadata = {
  title: "Weather & hazards — VERA",
  description: "Hourly forecast, wind gusts, lightning risk, heat/cold stress, AQI, and fire ban signals.",
};

export default function WeatherPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-[#64748b]">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F8F8C]" aria-hidden />
        </div>
      }
    >
      <WeatherDetailView />
    </Suspense>
  );
}
