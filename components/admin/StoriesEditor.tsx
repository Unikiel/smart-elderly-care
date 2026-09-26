"use client";

import { useState, type ReactNode } from "react";
import { saveStories, uploadStoryPhoto } from "@/lib/actions";
import { FullPhoto } from "@/components/media/FullPhoto";
import type { StoriesContent, StoriesPack, StoryPhoto } from "@/lib/stories";

function nid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function StoriesEditor({
  initial,
  library,
}: {
  initial: StoriesPack;
  library: StoryPhoto[];
}) {
  const [pack, setPack] = useState(initial);
  const [photos, setPhotos] = useState(library);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const content = pack.en.feelings.length ? pack.en : pack.zh;

  function setContent(next: StoriesContent) {
    setPack({ zh: next, en: next });
  }

  async function onSave() {
    setBusy(true);
    setMessage("");
    const form = new FormData();
    form.set("payload", JSON.stringify({ zh: content, en: content }));
    const result = await saveStories(form);
    setBusy(false);
    setMessage(result.error ?? "Saved to the home page");
  }

  async function onUpload(formData: FormData) {
    setBusy(true);
    setMessage("");
    const result = await uploadStoryPhoto(formData);
    setBusy(false);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    if (result.photo) {
      setPhotos((rows) => [...rows, result.photo]);
      setMessage("The photo is in the library. You can use it in a story.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-[22px] bg-white p-5">
        <h2 className="font-bold">Titles</h2>
        <input
          value={content.kicker}
          onChange={(event) => setContent({ ...content, kicker: event.target.value })}
          className="w-full rounded-full bg-canvas px-4 py-2"
          placeholder="Small title, such as: Stories from home"
        />
        <input
          value={content.heading}
          onChange={(event) => setContent({ ...content, heading: event.target.value })}
          className="w-full rounded-full bg-canvas px-4 py-2"
          placeholder="Main title"
        />
      </section>

      <section className="space-y-4 rounded-[22px] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Tap a word</h2>
          <button
            type="button"
            className="rounded-full bg-canvas px-4 py-2 text-sm"
            onClick={() =>
              setContent({
                ...content,
                feelings: [...content.feelings, { id: nid("feeling"), key: "", story: "" }],
              })
            }
          >
            Add a word
          </button>
        </div>
        {content.feelings.map((item, index) => (
          <div key={item.id} className="space-y-2 rounded-[18px] bg-canvas p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Word {index + 1}</p>
              <button
                type="button"
                className="text-sm text-muted"
                onClick={() =>
                  setContent({
                    ...content,
                    feelings: content.feelings.filter((row) => row.id !== item.id),
                  })
                }
              >
                Remove
              </button>
            </div>
            <input
              value={item.key}
              onChange={(event) =>
                setContent({
                  ...content,
                  feelings: content.feelings.map((row) =>
                    row.id === item.id ? { ...row, key: event.target.value } : row,
                  ),
                })
              }
              className="w-full rounded-full bg-white px-4 py-2"
              placeholder="A word, such as: Warmth"
            />
            <textarea
              value={item.story}
              onChange={(event) =>
                setContent({
                  ...content,
                  feelings: content.feelings.map((row) =>
                    row.id === item.id ? { ...row, story: event.target.value } : row,
                  ),
                })
              }
              className="min-h-24 w-full rounded-[18px] bg-white px-4 py-3"
              placeholder="The short story someone sees after tapping this word"
            />
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-[22px] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Sliding photos</h2>
          <button
            type="button"
            className="rounded-full bg-canvas px-4 py-2 text-sm"
            onClick={() =>
              setContent({
                ...content,
                rail: [
                  ...content.rail,
                  { id: nid("rail"), src: photos[0]?.src ?? "", title: "", line: "" },
                ],
              })
            }
          >
            Add a photo
          </button>
        </div>
        {content.rail.map((item) => (
          <PhotoCard
            key={item.id}
            src={item.src}
            photos={photos}
            onRemove={() =>
              setContent({ ...content, rail: content.rail.filter((row) => row.id !== item.id) })
            }
            onSrc={(src) =>
              setContent({
                ...content,
                rail: content.rail.map((row) => (row.id === item.id ? { ...row, src } : row)),
              })
            }
          >
            <input
              value={item.title}
              onChange={(event) =>
                setContent({
                  ...content,
                  rail: content.rail.map((row) =>
                    row.id === item.id ? { ...row, title: event.target.value } : row,
                  ),
                })
              }
              className="w-full rounded-full bg-white px-4 py-2"
              placeholder="Title"
            />
            <input
              value={item.line}
              onChange={(event) =>
                setContent({
                  ...content,
                  rail: content.rail.map((row) =>
                    row.id === item.id ? { ...row, line: event.target.value } : row,
                  ),
                })
              }
              className="w-full rounded-full bg-white px-4 py-2"
              placeholder="One short line"
            />
          </PhotoCard>
        ))}
      </section>

      <section className="rounded-[22px] bg-white p-5">
        <h2 className="font-bold">Photo albums</h2>
        <p className="mt-2 text-sm text-muted">
          The home page albums are the folders inside docs. Each folder name is the album name.
        </p>
      </section>

      <section className="space-y-3 rounded-[22px] bg-white p-5">
        <h2 className="font-bold">Add a photo to the library</h2>
        <p className="text-sm text-muted">After you upload it, each section above can use this photo.</p>
        <form action={onUpload} className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            What to call it
            <input name="label" className="mt-1 block rounded-full bg-canvas px-4 py-2" placeholder="For example: Dining room" />
          </label>
          <label className="text-sm">
            Photo
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="mt-1 block" />
          </label>
          <button className="rounded-full bg-canvas px-4 py-2" disabled={busy}>
            Add to the library
          </button>
        </form>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="rounded-full bg-ink px-5 py-2 text-white"
        >
          {busy ? "Saving…" : "Save to the home page"}
        </button>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </div>
    </div>
  );
}

function PhotoCard({
  src,
  photos,
  onSrc,
  onRemove,
  children,
}: {
  src: string;
  photos: StoryPhoto[];
  onSrc: (src: string) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  const known = photos.some((item) => item.src === src);
  return (
    <div className="grid gap-3 rounded-[18px] bg-canvas p-4 md:grid-cols-[160px_minmax(0,1fr)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-white">
        {src ? <FullPhoto src={src} /> : null}
      </div>
      <div className="space-y-2">
        <div className="flex justify-end">
          <button type="button" className="text-sm text-muted" onClick={onRemove}>
            Remove
          </button>
        </div>
        <select
          value={known ? src : "__custom"}
          onChange={(event) => {
            if (event.target.value !== "__custom") onSrc(event.target.value);
          }}
          className="w-full rounded-full bg-white px-4 py-2"
        >
          {photos.map((item) => (
            <option key={item.id} value={item.src}>
              {item.label}
            </option>
          ))}
          <option value="__custom">Use my own image address</option>
        </select>
        {!known ? (
          <input
            value={src}
            onChange={(event) => onSrc(event.target.value)}
            className="w-full rounded-full bg-white px-4 py-2"
            placeholder="Image address, or upload one below"
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}
