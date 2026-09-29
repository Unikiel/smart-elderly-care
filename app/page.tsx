import { Landing } from "@/components/landing/Landing";
import { listAlbums } from "@/lib/albums";
import { listCerts } from "@/lib/certs";
import { readEssay } from "@/lib/essay";
import { listFrontSurveys } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Home() {
  const surveys = listFrontSurveys();
  return <Landing surveys={surveys} essay={readEssay()} albums={listAlbums()} certs={listCerts()} />;
}
