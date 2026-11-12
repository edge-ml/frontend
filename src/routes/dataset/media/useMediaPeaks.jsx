import { useEffect, useState } from "react";
import { getMediaPeaks } from "../../../services/ApiServices/MediaServices";

// A waveform never changes once computed, so it is loaded once per recording.
const cache = new Map();

// What there is to say about the waveform of a recording with sound while
// it is not drawn: "processing" (the server is computing it), "loading",
// "failed" (it could not be fetched) or "missing" (the server could not
// compute one). undefined: it is there, or there is no sound to draw.
export const waveformState = (media, peaks, failed) => {
  if (!media.meta?.audioCodec || peaks) return undefined;
  if (media.status === "processing") return "processing";
  if (!media.hasPeaks) return "missing";
  return failed ? "failed" : "loading";
};

// { peaks, state (see waveformState), retry() }
const useMediaPeaks = (datasetId, media) => {
  const [peaks, setPeaks] = useState(() => cache.get(media._id));
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setFailed(false);
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
      .catch((error) => {
        console.error("Could not load the waveform", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [datasetId, media._id, media.hasPeaks, attempt]);

  return {
    peaks,
    state: waveformState(media, peaks, failed),
    retry: () => setAttempt((value) => value + 1),
  };
};

export default useMediaPeaks;
