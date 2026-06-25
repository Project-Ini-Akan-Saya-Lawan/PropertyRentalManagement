import { Workspace } from "@/types";
import { workspaces, getWorkspaceBySlug } from "@/data/workspaces";

const API = process.env.NEXT_PUBLIC_API_URL;

export const workspaceService = {
  async getAll(): Promise<Workspace[]> {
    if (API) return fetch(`${API}/workspaces`).then(r => r.json());
    return Promise.resolve(workspaces);
  },
  async getBySlug(slug: string): Promise<Workspace | undefined> {
    if (API) return fetch(`${API}/workspaces/${slug}`).then(r => r.json());
    return Promise.resolve(getWorkspaceBySlug(slug));
  },
};
