import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, fetchWorkspace } from "@/lib/api";
import { useAuth } from "./useAuth";

export function useWorkspace() {
  const { user, loading } = useAuth();
  const query = useQuery({
    queryKey: ["workspace", user?.id],
    queryFn: () => fetchWorkspace(user!.id),
    enabled: !!user,
  });
  return { ...query, userId: user?.id ?? null, authLoading: loading };
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });
}

export function useRefreshWorkspace() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["workspace"] });
}
