import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../services/api";
import { useAppStore } from "../store/useAppStore";

export const useAuth = () => {
  const loginFn = useAppStore((state) => state.login);
  const logoutFn = useAppStore((state) => state.logout);

  const loginMutation = useMutation({
    mutationFn: (credentials) =>
      apiFetch("/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      loginFn(data.user, data.token);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData) =>
      apiFetch("/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    onSuccess: (data) => {
      loginFn(data.user, data.token);
    },
  });

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutFn,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};
