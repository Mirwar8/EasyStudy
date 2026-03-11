import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export const useDecks = () => {
  const queryClient = useQueryClient();

  // Fetch all decks
  const decksQuery = useQuery({
    queryKey: ["decks"],
    queryFn: () => apiFetch("/decks"),
  });

  // Create new deck
  const createDeckMutation = useMutation({
    mutationFn: (newDeck) =>
      apiFetch("/decks", {
        method: "POST",
        body: JSON.stringify(newDeck),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  // Update deck
  const updateDeckMutation = useMutation({
    mutationFn: ({ id, ...updatedData }) =>
      apiFetch(`/decks/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  // Delete deck
  const deleteDeckMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/decks/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  return {
    decks: decksQuery.data || [],
    isLoading: decksQuery.isLoading,
    isError: decksQuery.isError,
    error: decksQuery.error,
    createDeck: createDeckMutation.mutateAsync,
    isCreating: createDeckMutation.isPending,
    updateDeck: updateDeckMutation.mutateAsync,
    isUpdating: updateDeckMutation.isPending,
    deleteDeck: deleteDeckMutation.mutateAsync,
    isDeleting: deleteDeckMutation.isPending,
  };
};
