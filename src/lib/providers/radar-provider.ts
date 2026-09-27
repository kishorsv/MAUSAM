import { IRadarProvider, RadarFrame } from "./contracts";

export class RainViewerRadarProvider implements IRadarProvider {
  readonly id = "rainviewer-radar";
  readonly name = "RainViewer Global Doppler Radar Network";

  async getRadarFrames(): Promise<{
    host: string;
    frames: RadarFrame[];
    currentFrameIndex: number;
    generatedAt: number;
    freshnessMinutes: number;
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch("https://api.rainviewer.com/public/weather-maps.json", {
        signal: controller.signal,
        next: { revalidate: 300 } // Cache for 5 minutes
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`RainViewer HTTP error: ${res.statusText}`);
      }

      const data = await res.json();
      const host = data.host || "https://tilecache.rainviewer.com";
      const past = Array.isArray(data.radar?.past) ? data.radar.past : [];
      const nowcast = Array.isArray(data.radar?.nowcast) ? data.radar.nowcast : [];

      const allRaw = [...past, ...nowcast];
      const nowSeconds = Math.floor(Date.now() / 1000);
      const generatedAt = data.generated || nowSeconds;
      const freshnessMinutes = Math.max(0, Math.floor((nowSeconds - generatedAt) / 60));

      const frames: RadarFrame[] = allRaw.map((item: any, idx: number) => {
        const timeSec = item.time;
        const diffMins = Math.round((timeSec - nowSeconds) / 60);
        let relativeLabel = diffMins === 0 ? "NOW" : diffMins > 0 ? `+${diffMins}m` : `${diffMins}m`;

        const d = new Date(timeSec * 1000);
        const formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          time: timeSec,
          path: item.path,
          formattedTime,
          relativeLabel
        };
      });

      // Find index closest to "NOW"
      let currentFrameIndex = past.length > 0 ? past.length - 1 : 0;

      return {
        host,
        frames,
        currentFrameIndex,
        generatedAt,
        freshnessMinutes
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(`RadarProvider error: ${err.message || 'Radar data unavailable'}`);
    }
  }
}

export const radarProvider = new RainViewerRadarProvider();
