import { notFound } from "next/navigation";
import { workspaces, getWorkspaceBySlug } from "@/data/workspaces";
import WorkspaceDetailClient from "./WorkspaceDetailClient";

export function generateStaticParams() {
  return workspaces.map((w) => ({ slug: w.slug }));
}

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = getWorkspaceBySlug(slug);
  if (!workspace) notFound();
  return <WorkspaceDetailClient workspace={workspace} />;
}
