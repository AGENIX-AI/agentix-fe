import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  getPackages,
  createPaymentIntent,
  captureAndCheckPayment,
  type Package,
} from "@/api/payments";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

export function BuyCredits() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "capturing" | "completed" | "failed"
  >("pending");

  // Fetch packages on component mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoadingPackages(true);
        const response = await getPackages();

        if (response.success && response.packages) {
          setPackages(response.packages);
        } else {
          toast.error("Failed to load credit packages. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast.error("Failed to load credit packages. Please try again.");
      } finally {
        setIsLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowPayPal(true);
  };

  const createOrder = async (): Promise<string> => {
    if (!selectedPackage) {
      toast.error("Please select a package first");
      throw new Error("No package selected");
    }

    try {
      setIsProcessing(true);
      const response = await createPaymentIntent(selectedPackage.id);

      if (response.success && response.order_id) {
        return response.order_id;
      } else {
        throw new Error(response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create payment order. Please try again.");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to process payment after PayPal approval
  const processPayment = async (orderId: string) => {
    if (!orderId) return;

    try {
      setPaymentStatus("capturing");
      // Capture payment and check status in one call
      const response = await captureAndCheckPayment(orderId);

      if (response.success) {
        if (response.is_completed) {
          // Payment is completed
          toast.success(
            `Payment successful! ${selectedPackage?.credit} credits added to your account.`
          );
          setPaymentStatus("completed");
          setShowPayPal(false);
          setIsProcessing(false);
        } else {
          // Payment failed or incomplete
          throw new Error("Payment was not completed successfully");
        }
      } else {
        throw new Error(response.message || "Payment processing failed");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setPaymentStatus("failed");
      toast.error(
        "Payment processing failed. Please contact support if you were charged."
      );
      setIsProcessing(false);
    }
  };

  const onApprove = async (data: any) => {
    try {
      setIsProcessing(true);

      // Process payment (capture and check status)
      await processPayment(data.orderID);
    } catch (error) {
      console.error("Error in payment approval flow:", error);
      setPaymentStatus("failed");
      toast.error(
        "Payment process failed. Please contact support if you were charged."
      );
      setIsProcessing(false);
    }
  };

  const onError = (err: any) => {
    console.error("PayPal error:", err);
    toast.error("Payment failed. Please try again.");
    setPaymentStatus("failed");
    setIsProcessing(false);
  };

  const resetPaymentState = () => {
    setShowPayPal(false);
    setSelectedPackage(null);
    setPaymentStatus("pending");
    setIsProcessing(false);
  };

  const onCancel = () => {
    toast.info("Payment cancelled");
    resetPaymentState();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background flex items-center h-18 border-b w-full p-4">
        <div className="flex items-center gap-3">
          <CreditCard className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Buy Credits</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {paymentStatus === "completed" ? (
            // Success message when payment is complete
            <div className="text-center p-8 flex flex-col items-center justify-center">
              <div className="mb-4 bg-primary/10 p-4 rounded-full">
                <CheckCircle className="size-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                Payment Successful!
              </h2>
              <p className="text-muted-foreground mb-6">
                {selectedPackage?.credit} credits have been added to your
                account.
              </p>
              <Button
                onClick={() => {
                  // Reset all state values
                  resetPaymentState();
                }}
              >
                Make Another Purchase
              </Button>
            </div>
          ) : (
            // Regular content when not completed
            <>
              {/* Description */}
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold mb-2">
                  Choose Your Credit Package
                </h2>
                <p className="text-muted-foreground">
                  Purchase credits to unlock premium features and enhanced
                  capabilities
                </p>
              </div>

              {/* Credit Packages */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {isLoadingPackages
                  ? // Loading skeleton
                    Array.from({ length: 4 }).map((_, index) => (
                      <Card key={index} className="p-6 animate-pulse">
                        <div className="text-center">
                          <div className="h-8 bg-gray-200 rounded mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded mb-1"></div>
                          <div className="h-4 bg-gray-200 rounded mb-4"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      </Card>
                    ))
                  : packages.map((pkg: Package) => (
                      <Card
                        key={pkg.id}
                        className={`relative p-6 cursor-pointer transition-all border-2 hover:shadow-lg ${
                          selectedPackage?.id === pkg.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        } ${pkg.popular ? "ring-2 ring-primary/20" : ""}`}
                        onClick={() => handlePackageSelect(pkg)}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                              Most Popular
                            </span>
                          </div>
                        )}

                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-2">
                            ${pkg.price}
                          </div>
                          <div className="text-2xl font-semibold mb-1">
                            {pkg.credit.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground mb-4">
                            Credits
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${(pkg.price / (pkg.credit / 1000)).toFixed(3)} per
                            1K credits
                          </div>
                        </div>

                        {selectedPackage?.id === pkg.id && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="size-5 text-primary" />
                          </div>
                        )}
                      </Card>
                    ))}
              </div>

              {/* PayPal Payment Section */}
              {showPayPal && selectedPackage && (
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Complete Your Purchase
                    </h3>
                    <p className="text-muted-foreground">
                      You're purchasing{" "}
                      {selectedPackage.credit.toLocaleString()} credits for $
                      {selectedPackage.price}
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <PayPalScriptProvider
                      options={{
                        clientId: PAYPAL_CLIENT_ID,
                        currency: "USD",
                        intent: "capture",
                      }}
                    >
                      <PayPalButtons
                        style={{
                          layout: "vertical",
                          color: "blue",
                          shape: "rect",
                          label: "paypal",
                        }}
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={onError}
                        onCancel={onCancel}
                        disabled={isProcessing}
                      />
                    </PayPalScriptProvider>

                    {isProcessing && (
                      <div className="flex items-center justify-center mt-4">
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          {paymentStatus === "capturing"
                            ? "Capturing payment..."
                            : "Processing payment..."}
                        </span>
                      </div>
                    )}

                    {paymentStatus === "failed" && !isProcessing && (
                      <div className="flex items-center justify-center mt-4 text-destructive">
                        <span className="text-sm font-medium">
                          Payment failed. Please try again or contact support.
                        </span>
                      </div>
                    )}

                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowPayPal(false);
                          setSelectedPackage(null);
                        }}
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Security Note */}
              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>🔒 Secure payment processing powered by PayPal</p>
                <p>Your payment information is encrypted and protected</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
