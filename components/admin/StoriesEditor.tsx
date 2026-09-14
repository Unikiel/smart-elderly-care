"use client";

import { useState, type ReactNode } from "react";
import { saveStories, uploadStoryPhoto } from "@/lib/actions";
import { FullPhoto } from "@/components/media/FullPhoto";
import type { Locale } from "@/lib/i18n";
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
  const [tab, setTab] = useState<Locale>("zh");
  const [photos, setPhotos] = useState(library);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const content = pack[tab];

  function setContent(next: StoriesContent) {
    setPack({ ...pack, [tab]: next });
  }

  async function onSave() {
    setBusy(true);
    setMessage("");
    const form = new FormData();
    form.set("payload", JSON.stringify(pack));
    const result = await saveStories(form);
    setBusy(false);
    setMessage(result.error ?? "已写上首页");
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
      setMessage("照片已加入图库，可以选进故事里");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["zh", "en"] as Locale[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm ${tab === item ? "bg-ink text-white" : "bg-white"}`}
          >
            {item === "zh" ? "中文" : "English"}
          </button>
        ))}
      </div>
      <section className="space-y-3 rounded-[22px] bg-white p-5">
        <h2 className="font-bold">标题</h2>
        <input
          value={content.kicker}
          onChange={(event) => setContent({ ...content, kicker: event.target.value })}
          className="w-full rounded-full bg-canvas px-4 py-2"
          placeholder="小标题，比如：院里的故事"
        />
        <input
          value={content.heading}
          onChange={(event) => setContent({ ...content, heading: event.target.value })}
          className="w-full rounded-full bg-canvas px-4 py-2"
          placeholder="大标题"
        />
      </section>

      <section className="space-y-4 rounded-[22px] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">点一个词</h2>
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
            加一个词
          </button>
        </div>
        {content.feelings.map((item, index) => (
          <div key={item.id} className="space-y-2 rounded-[18px] bg-canvas p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">词 {index + 1}</p>
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
                去掉
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
              placeholder="词，比如：温暖"
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
              placeholder="点这个词后，长者会看到的一段话"
            />
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-[22px] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">横着滑的照片</h2>
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
            加一张
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
              placeholder="标题"
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
              placeholder="一句短话"
            />
          </PhotoCard>
        ))}
      </section>

      <section className="space-y-4 rounded-[22px] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">院里相册</h2>
          <button
            type="button"
            className="rounded-full bg-canvas px-4 py-2 text-sm"
            onClick={() =>
              setContent({
                ...content,
                grid: [...content.grid, { id: nid("grid"), src: photos[0]?.src ?? "", title: "" }],
              })
            }
          >
            加一张
          </button>
        </div>
        {content.grid.map((item) => (
          <PhotoCard
            key={item.id}
            src={item.src}
            photos={photos}
            onRemove={() =>
              setContent({ ...content, grid: content.grid.filter((row) => row.id !== item.id) })
            }
            onSrc={(src) =>
              setContent({
                ...content,
                grid: content.grid.map((row) => (row.id === item.id ? { ...row, src } : row)),
              })
            }
          >
            <input
              value={item.title}
              onChange={(event) =>
                setContent({
                  ...content,
                  grid: content.grid.map((row) =>
                    row.id === item.id ? { ...row, title: event.target.value } : row,
                  ),
                })
              }
              className="w-full rounded-full bg-white px-4 py-2"
              placeholder="标题，比如：陪伴"
            />
          </PhotoCard>
        ))}
      </section>

      <section className="space-y-3 rounded-[22px] bg-white p-5">
        <h2 className="font-bold">把院里的照片加进图库</h2>
        <p className="text-sm text-muted">上传后，上面每一段都可以选这张照片。</p>
        <form action={onUpload} className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            叫它什么
            <input name="label" className="mt-1 block rounded-full bg-canvas px-4 py-2" placeholder="比如：食堂" />
          </label>
          <label className="text-sm">
            照片
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="mt-1 block" />
          </label>
          <button className="rounded-full bg-canvas px-4 py-2" disabled={busy}>
            加入图库
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
          {busy ? "正在写下…" : "写上首页"}
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
            去掉
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
          <option value="__custom">用自己的图片地址</option>
        </select>
        {!known ? (
          <input
            value={src}
            onChange={(event) => onSrc(event.target.value)}
            className="w-full rounded-full bg-white px-4 py-2"
            placeholder="图片地址，或先在下面上传"
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}
