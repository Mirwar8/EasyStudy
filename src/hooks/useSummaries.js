import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export const useSummaries = (deckId) => {
  const queryClient = useQueryClient();

  // Fetch summaries for a specific deck
  const summariesQuery = useQuery({
    queryKey: ["summaries", deckId],
    queryFn: () => apiFetch(`/summaries/${deckId}`),
    enabled: !!deckId,
  });

  // Create new summary
  const createSummaryMutation = useMutation({
    mutationFn: (newSummary) =>
      apiFetch("/summaries", {
        method: "POST",
        body: JSON.stringify({ ...newSummary, deckId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summaries", deckId] });
    },
  });

  // Update summary
  const updateSummaryMutation = useMutation({
    mutationFn: ({ id, ...updatedData }) =>
      apiFetch(`/summaries/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summaries", deckId] });
    },
  });

  // Delete summary
  const deleteSummaryMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/summaries/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summaries", deckId] });
    },
  });

  // Generate summary with AI
  const generateSummaryAIMutation = useMutation({
    mutationFn: ({ text, title }) =>
      apiFetch("/ai/generate-summary", {
        method: "POST",
        body: JSON.stringify({ text, title }),
      }),
  });

  return {
    summaries: summariesQuery.data || [],
    isLoading: summariesQuery.isLoading,
    isError: summariesQuery.isError,
    createSummary: createSummaryMutation.mutateAsync,
    isCreating: createSummaryMutation.isPending,
    updateSummary: updateSummaryMutation.mutateAsync,
    isUpdating: updateSummaryMutation.isPending,
    deleteSummary: deleteSummaryMutation.mutateAsync,
    isDeleting: deleteSummaryMutation.isPending,
    generateSummaryAI: generateSummaryAIMutation.mutateAsync,
    isGeneratingAI: generateSummaryAIMutation.isPending,
  };
};

export const useSummary = (id) => {
  const summaryQuery = useQuery({
    queryKey: ["summary", id],
    queryFn: () => apiFetch(`/summary/${id}`),
    enabled: !!id,
  });

  return {
    summary: summaryQuery.data,
    isLoading: summaryQuery.isLoading,
    isError: summaryQuery.isError,
  };
};
