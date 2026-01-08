/**
 * Paddle.js 통합
 * 참고: https://developer.paddle.com/paddlejs
 * 패키지: @paddle/paddle-js
 */

import {
  initializePaddle as paddleInitialize,
  getPaddleInstance,
  type CheckoutOpenOptions,
} from "@paddle/paddle-js";

/**
 * Paddle.js 초기화
 */
export async function initializePaddle(): Promise<void> {
  try {
    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
    const environment = import.meta.env.VITE_PADDLE_ENV || "sandbox";

    if (!clientToken) {
      throw new Error("Paddle client token is not configured");
    }

    // Paddle 초기화 (environment 옵션 포함)
    await paddleInitialize({
      token: clientToken,
      environment: environment === "sandbox" ? "sandbox" : "production",
    });

    console.log("Paddle.js initialized successfully", {
      environment,
      tokenPrefix: clientToken.substring(0, 10) + "...",
    });
  } catch (error) {
    console.error("Paddle initialization error:", error);
    throw error;
  }
}

/**
 * Paddle Checkout 열기
 */
export async function openPaddleCheckout(config: {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
  customData?: Record<string, unknown>;
  successUrl?: string;
}): Promise<void> {
  // Paddle 초기화 확인 및 초기화
  try {
    await initializePaddle();
  } catch (error) {
    console.error("Failed to initialize Paddle:", error);
    throw error;
  }

  // Paddle 인스턴스 가져오기
  const paddle = getPaddleInstance();
  if (!paddle) {
    throw new Error("Paddle instance is not available");
  }

  // Checkout 열기 옵션 구성
  const checkoutConfig: CheckoutOpenOptions = {
    items: [
      {
        priceId: config.priceId,
        quantity: 1,
      },
    ],
    settings: {
      successUrl:
        config.successUrl || `${window.location.origin}/subscription/success`,
      theme: "light",
    },
  };

  // customer 정보 추가 (있는 경우)
  // CheckoutCustomer는 id 또는 email 중 하나만 사용 가능
  if (config.customerId) {
    checkoutConfig.customer = {
      id: config.customerId,
    };
  } else if (config.customerEmail) {
    checkoutConfig.customer = {
      email: config.customerEmail,
    };
  }

  // customData 추가
  if (config.customData) {
    checkoutConfig.customData = config.customData;
  }

  console.log("Opening Paddle Checkout with config:", {
    items: checkoutConfig.items,
    customer: checkoutConfig.customer,
    settings: checkoutConfig.settings,
  });

  try {
    paddle.Checkout.open(checkoutConfig);
  } catch (error) {
    console.error("Paddle Checkout.open error:", error);
    throw error;
  }
}

/**
 * Paddle Checkout 닫기
 */
export function closePaddleCheckout(): void {
  try {
    const paddle = getPaddleInstance();
    if (paddle) {
      paddle.Checkout.close();
    }
  } catch (error) {
    console.error("Failed to close Paddle Checkout:", error);
  }
}
