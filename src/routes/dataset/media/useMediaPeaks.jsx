import { useEffect, useState } from "react";
import { getMediaPeaks } from "../../../services/ApiServices/MediaServices";

// A waveform never changes once computed, so it is loaded once per recording.
const cache = new Map();

const useMediaPeaks = (datasetId, media) => {
  const [peaks, setPeaks] = useState(() => cache.get(media._id));

  useEffect(() => {
    if (!media.hasPeaks || cache.has(media._id)) {
      setPeaks(cache.get(media._id));
      return undefined;
    }
    let cancelled = false;
    getMediaPeaks(datasetId, media._id)
      .then((result) => {
        cache.set(media._id, result);
        if (!cancelled) setPeaks(result);
      })
      .catch((error) => console.error("Could not load the waveform", error));
    return () => {
      cancelled = true;
    };
  }, [datasetId, media._id, media.hasPeaks]);

  return peaks;
};

export default useMediaPeaks;
