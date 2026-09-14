import { Landing } from "@/components/landing/Landing";
import { getStoriesPack, listFrontSurveys } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Home() {
  const surveys = listFrontSurveys();
  const stories = getStoriesPack();
  return <Landing surveys={surveys} stories={stories} />;
}
