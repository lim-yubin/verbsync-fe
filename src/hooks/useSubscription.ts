import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CreateCheckoutDto {
  plan: "STARTER";
  period?: "month" | "year";
}

export interface CreateCheckoutResponse {
  url: string;
}

/**
 * Paddle Checkout 링크 생성 Hook
 */
export function useCreateCheckout() {
  return useMutation<CreateCheckoutResponse, Error, CreateCheckoutDto>({
    mutationFn: async (data: CreateCheckoutDto) => {
      const { data: response } = await api.post<CreateCheckoutResponse>(
        "/subscription/checkout",
        data
      );
      return response;
    },
  });
}

