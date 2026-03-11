import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export const useStats = () => {
  const queryClient = useQueryClient();

  // Fetch all stats
  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiFetch("/stats"),
  });

  // Fetch stats summary (aggregated data)
  const summaryQuery = useQuery({
    queryKey: ["stats", "summary"],
    queryFn: () => apiFetch("/stats/summary"),
  });

  // Save new quiz result
  const saveStatMutation = useMutation({
    mutationFn: (newStat) =>
      apiFetch("/stats", {
        method: "POST",
        body: JSON.stringify(newStat),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  return {
    stats: statsQuery.data || [],
    isLoading: statsQuery.isLoading,
    summary: summaryQuery.data || {
      totalSessions: 0,
      avgScore: 0,
      totalTime: 0,
      recentHistory: [],
    },
    isLoadingSummary: summaryQuery.isLoading,
    saveStat: saveStatMutation.mutateAsync,
    isSaving: saveStatMutation.isPending,
  };
};
