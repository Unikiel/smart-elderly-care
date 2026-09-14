import { StoriesEditor } from "@/components/admin/StoriesEditor";
import { builtInPhotos } from "@/lib/stories";
import { getStoriesPack, listStoryPhotos } from "@/lib/store";
import { StoriesAdminIntro } from "@/components/admin/StoriesAdminIntro";

export default function StoriesAdminPage() {
  const stories = getStoriesPack();
  const library = [...builtInPhotos, ...listStoryPhotos()];

  return (
    <div className="space-y-5">
      <StoriesAdminIntro />
      <StoriesEditor initial={stories} library={library} />
    </div>
  );
}
