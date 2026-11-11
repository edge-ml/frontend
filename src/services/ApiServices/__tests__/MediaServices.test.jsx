import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../../../tests/setup";
import apiConsts from "../ApiConstants";
import {
  deleteMedia,
  getMediaPeaks,
  getMediaUrl,
  updateMedia,
  uploadMedia,
} from "../MediaServices";

const base = `${apiConsts.DATASET_STORE}datasets/d1/media`;
const url = (path) => new URL(path, window.location.origin).toString();

describe("MediaServices", () => {
  it("uploads a file as multipart form data", async () => {
    let received;
    server.use(
      http.post(url(base), async ({ request }) => {
        const form = await request.formData();
        received = {
          contentType: request.headers.get("content-type"),
          size: form.get("file").size,
          name: form.get("name"),
          start: form.get("start"),
        };
        return HttpResponse.json({ _id: "m1", kind: "audio" }, { status: 201 });
      })
    );
    const file = new File(["abc"], "voice.mp3", { type: "audio/mpeg" });
    const result = await uploadMedia("d1", file, { name: "mic", start: 1234.6 });
    expect(result).toEqual({ _id: "m1", kind: "audio" });
    expect(received.contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(received).toMatchObject({ size: 3, name: "mic", start: "1235" });
  });

  it("passes the server's reason on when a file is refused", async () => {
    server.use(
      http.post(url(base), () =>
        HttpResponse.json({ detail: "This video format cannot be played" }, { status: 400 })
      )
    );
    await expect(uploadMedia("d1", new File(["x"], "old.avi"))).rejects.toThrow(
      "This video format cannot be played"
    );
  });

  it("renames, moves and deletes", async () => {
    const calls = [];
    server.use(
      http.put(url(`${base}/m1`), async ({ request }) => {
        calls.push(await request.json());
        return HttpResponse.json({});
      }),
      http.delete(url(`${base}/m1`), () => {
        calls.push("deleted");
        return HttpResponse.json({ message: "success" });
      })
    );
    await updateMedia("d1", "m1", { name: "front" });
    await updateMedia("d1", "m1", { start: 5000 });
    await deleteMedia("d1", "m1");
    expect(calls).toEqual([{ name: "front" }, { start: 5000 }, "deleted"]);
  });

  it("loads the waveform", async () => {
    server.use(
      http.get(url(`${base}/m1/peaks`), () =>
        HttpResponse.json({ rate: 50, min: [-1], max: [1] })
      )
    );
    expect(await getMediaPeaks("d1", "m1")).toEqual({ rate: 50, min: [-1], max: [1] });
  });

  it("turns the playback link into a URL on the dataset store", async () => {
    server.use(
      http.get(url(`${base}/m1/link`), () =>
        HttpResponse.json({ path: "/ds/media/m1?token=abc", expires: 1 })
      )
    );
    const expected =
      new URL(apiConsts.DATASET_STORE, window.location.origin).href.replace(/\/ds\/?$/, "") +
      "/ds/media/m1?token=abc";
    expect(await getMediaUrl("d1", "m1")).toBe(expected);
  });
});
