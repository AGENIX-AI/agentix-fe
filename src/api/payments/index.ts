import Cookies from "js-cookie";
import * as Sentry from "@sentry/react";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const accessToken = Cookies.get("edvara_access_token");
  const refreshToken = Cookies.get("edvara_refresh_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (refreshToken) {
    headers["X-Refresh-Token"] = refreshToken;
  }

  return headers;
};

// Types for package and payment
export interface Package {
  id: string;
  credit: number;
  price: number;
  popular: boolean;
  name: string;
  description: string;
  currency: string;
  polar_product_id: string;
}

// Credits response interface
export interface Credits {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentIntentRequest {
  package_id: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  order_id?: string;
  transaction_info?: any;
  message?: string;
}

export interface CheckPaymentStatusRequest {
  order_id: string;
}

export interface CheckPaymentStatusResponse {
  success: boolean;
  order_id?: string;
  is_completed?: boolean;
  payment_status_info?: any;
  message?: string;
}

export interface CapturePaymentRequest {
  order_id: string;
}

export interface CapturePaymentResponse {
  success: boolean;
  order_id?: string;
  is_completed?: boolean;
  capture_info?: any;
  message?: string;
}

export interface CaptureAndCheckPaymentRequest {
  order_id: string;
}

export interface CaptureAndCheckPaymentResponse {
  success: boolean;
  order_id?: string;
  is_completed?: boolean;
  message?: string;
}

export interface RedeemVoucherRequest {
  voucher_code: string;
}

export interface RedeemVoucherResponse {
  success: boolean;
  message?: string;
  credits_added?: number;
  new_balance?: number;
}

// Polar payment interfaces
export interface PolarProduct {
  id: string;
  name: string;
  description: string;
  is_recurring: boolean;
  is_archived: boolean;
  prices: {
    id: string;
    type: string;
    price_amount: number;
    price_currency: string;
  }[];
}

export interface PolarProductsResponse {
  products: PolarProduct[];
  total_count: number;
}

export interface CreatePolarPaymentRequest {
  polar_product_id: string;
  success_url: string;
  cancel_url: string;
  metadata: {
    credits: number;
    user_id: string;
  };
}

export interface CreatePolarPaymentResponse {
  checkout_id: string;
  checkout_url: string;
  amount: number;
  currency: string;
  status: string;
  expires_at: string;
}

/**
 * Get list of available packages
 * @returns Promise with the list of packages
 */
export const getPackages = async (): Promise<{
  success: boolean;
  packages?: Package[];
  message?: string;
}> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const response = await fetch(`${baseUrl}/package/get_package`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      packages: data,
    };
  } catch (error) {
    console.error("Error getting packages:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get packages",
    };
  }
};

/**
 * Create a payment intent
 * @param packageId - The package ID to create payment for
 * @returns Promise with the payment intent response including order ID
 */
export const createPaymentIntent = async (
  packageId: string
): Promise<CreatePaymentIntentResponse> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(`${baseUrl}/payment/create_payment_intent`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ package_id: packageId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      Sentry.captureException(
        new Error(`Failed to create payment intent: ${response.statusText}`)
      );
      throw new Error(
        errorData.message ||
          `Failed to create payment intent: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      order_id: data.order_id,
      transaction_info: data.transaction_info,
      message: data.message,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create payment intent",
    };
  }
};

/**
 * Check payment status
 * @param orderId - The order ID to check status for
 * @returns Promise with the payment status response
 */
export const checkPaymentStatus = async (
  orderId: string
): Promise<CheckPaymentStatusResponse> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(`${baseUrl}/payment/check_payment_status`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ order_id: orderId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      Sentry.captureException(
        new Error(`Failed to check payment status: ${response.statusText}`)
      );
      throw new Error(
        errorData.message ||
          `Failed to check payment status: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      order_id: data.order_id,
      is_completed: data.is_completed,
      payment_status_info: data.payment_status_info,
      message: data.message,
    };
  } catch (error) {
    console.error("Error checking payment status:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to check payment status",
    };
  }
};

/**
 * Get user's current credit balance
 * @returns Promise with the user's credit balance
 */
export const getUserCredits = async (): Promise<{
  success: boolean;
  credits?: number;
  message?: string;
}> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(`${baseUrl}/payments/credits/balance`, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      Sentry.captureException(
        new Error(`Failed to get user credits: ${response.statusText}`)
      );
      throw new Error(
        errorData.message ||
          `Failed to get user credits: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      credits: data.credits || data.balance,
      message: data.message,
    };
  } catch (error) {
    console.error("Error getting user credits:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get user credits",
    };
  }
};

/**
 * Get user's credits with full details (for polling)
 * @returns Promise with the credits details
 */
export const getCredits = async (): Promise<Credits> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/credits/get_credits`, {
    method: "GET",
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to get credits: ${response.statusText}`)
    );
    throw new Error(`Failed to get credits: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get payment history for the user
 * @returns Promise with payment history
 */
/**
 * Capture a payment after user approval
 * @param orderId - The order ID to capture payment for
 * @returns Promise with the capture response including order ID and completion status
 */
export const capturePayment = async (
  orderId: string
): Promise<CapturePaymentResponse> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(`${baseUrl}/payment/capture_payment`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ order_id: orderId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      Sentry.captureException(
        new Error(`Failed to capture payment: ${response.statusText}`)
      );
      throw new Error(
        errorData.message || `Failed to capture payment: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      order_id: data.order_id,
      is_completed: data.is_completed,
      capture_info: data.capture_info,
      message: data.message,
    };
  } catch (error) {
    console.error("Error capturing payment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to capture payment",
    };
  }
};

/**
 * Capture and check payment status in one call
 * @param orderId - The order ID to capture payment for
 * @returns Promise with the capture and status response
 */
export const captureAndCheckPayment = async (
  orderId: string
): Promise<CaptureAndCheckPaymentResponse> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(
      `${baseUrl}/payment/capture_and_check_payment`,
      {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ order_id: orderId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      Sentry.captureException(
        new Error(`Failed to process payment: ${response.statusText}`)
      );
      throw new Error(
        errorData.message || `Failed to process payment: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      order_id: data.order_id,
      is_completed: data.is_completed,
      message: data.message,
    };
  } catch (error) {
    console.error("Error processing payment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to process payment",
    };
  }
};

export const getPaymentHistory = async (): Promise<{
  success: boolean;
  payments?: any[];
  message?: string;
}> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(`${baseUrl}/payments/history`, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      Sentry.captureException(
        new Error(`Failed to get payment history: ${response.statusText}`)
      );
      throw new Error(
        errorData.message ||
          `Failed to get payment history: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      payments: data.payments || data.history,
      message: data.message,
    };
  } catch (error) {
    console.error("Error getting payment history:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get payment history",
    };
  }
};

/**
 * Redeem a voucher code to get credits
 * @param voucherCode - The voucher code to redeem
 * @returns Promise with the redemption response including credits added and new balance
 */
export const redeemVoucher = async (
  voucherCode: string
): Promise<RedeemVoucherResponse> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(`${baseUrl}/credits/redeem_voucher`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ voucher_code: voucherCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      Sentry.captureException(
        new Error(`Failed to redeem voucher: ${response.statusText}`)
      );
      throw new Error(
        errorData.message || `Failed to redeem voucher: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
      credits_added: data.credits_added,
      new_balance: data.new_balance,
    };
  } catch (error) {
    console.error("Error redeeming voucher:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to redeem voucher",
    };
  }
};

/**
 * Get Polar products
 * @returns Promise with the list of Polar products
 */
export const getPolarProducts = async (): Promise<{
  success: boolean;
  data?: PolarProductsResponse;
  message?: string;
}> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(`${baseUrl}/payment/polar/products`, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      Sentry.captureException(
        new Error(`Failed to get Polar products: ${response.statusText}`)
      );
      throw new Error(
        errorData.detail ||
          `Failed to get Polar products: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error getting Polar products:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get Polar products",
    };
  }
};

/**
 * Create Polar payment checkout
 * @param request - The payment request data
 * @returns Promise with the checkout response
 */
export const createPolarPayment = async (
  request: CreatePolarPaymentRequest
): Promise<{
  success: boolean;
  data?: CreatePolarPaymentResponse;
  message?: string;
}> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(`${baseUrl}/payment/polar/create_payment`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      Sentry.captureException(
        new Error(`Failed to create Polar payment: ${response.statusText}`)
      );
      throw new Error(
        errorData.detail ||
          `Failed to create Polar payment: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error creating Polar payment:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create Polar payment",
    };
  }
};
