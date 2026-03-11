import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export const useCards = (deckId) => {
  const queryClient = useQueryClient();

  // Fetch all cards for a specific deck
  const cardsQuery = useQuery({
    queryKey: ["cards", deckId],
    queryFn: () => apiFetch(`/cards/${deckId}`),
    enabled: !!deckId, // Sólo ejecutar si hay un deckId
  });

  // Create new card
  const createCardMutation = useMutation({
    mutationFn: (newCard) =>
      apiFetch("/cards", {
        method: "POST",
        body: JSON.stringify({ ...newCard, deckId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks"] }); // Para actualizar el cardCount
    },
  });

  // Update card
  const updateCardMutation = useMutation({
    mutationFn: ({ id, ...updatedData }) =>
      apiFetch(`/cards/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", deckId] });
    },
  });

  // Delete card
  const deleteCardMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/cards/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks"] }); // Para actualizar el cardCount
    },
  });

  // Generate cards with AI
  const generateCardsAIMutation = useMutation({
    mutationFn: ({ text, count }) =>
      apiFetch("/ai/generate-cards", {
        method: "POST",
        body: JSON.stringify({ text, count }),
      }),
  });

  return {
    cards: cardsQuery.data || [],
    isLoading: cardsQuery.isLoading,
    isError: cardsQuery.isError,
    error: cardsQuery.error,
    createCard: createCardMutation.mutateAsync,
    isCreating: createCardMutation.isPending,
    updateCard: updateCardMutation.mutateAsync,
    isUpdating: updateCardMutation.isPending,
    deleteCard: deleteCardMutation.mutateAsync,
    isDeleting: deleteCardMutation.isPending,
    generateCardsAI: generateCardsAIMutation.mutateAsync,
    isGeneratingAI: generateCardsAIMutation.isPending,
  };
};
