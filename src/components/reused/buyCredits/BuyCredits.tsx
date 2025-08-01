import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useTranslation } from "react-i18next";
import {
  getPackages,
  createPaymentIntent,
  captureAndCheckPayment,
  redeemVoucher,
  type Package,
} from "@/api/payments";
import { Small } from "@/components/typography";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

export function BuyCredits() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "capturing" | "completed" | "failed"
  >("pending");

  // Voucher redemption states
  const [voucherCode, setVoucherCode] = useState("");
  const [isRedeemingVoucher, setIsRedeemingVoucher] = useState(false);
  const [voucherRedemptionStatus, setVoucherRedemptionStatus] = useState<
    "idle" | "success" | "failed"
  >("idle");

  // Carousel state
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);

  // Fetch packages on component mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoadingPackages(true);
        const response = await getPackages();

        if (response.success && response.packages) {
          setPackages(response.packages);
          // Auto-select the first package
          if (response.packages.length > 0) {
            handlePackageSelect(response.packages[0]);
          }
        } else {
          toast.error(t("credits.errors.load_failed"));
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast.error(t("credits.errors.load_failed"));
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

  const goToNextPackage = () => {
    const nextIndex =
      currentPackageIndex === packages.length - 1 ? 0 : currentPackageIndex + 1;
    setCurrentPackageIndex(nextIndex);
    if (packages[nextIndex]) {
      handlePackageSelect(packages[nextIndex]);
    }
  };

  const goToPreviousPackage = () => {
    const prevIndex =
      currentPackageIndex === 0 ? packages.length - 1 : currentPackageIndex - 1;
    setCurrentPackageIndex(prevIndex);
    if (packages[prevIndex]) {
      handlePackageSelect(packages[prevIndex]);
    }
  };

  const goToPackage = (index: number) => {
    setCurrentPackageIndex(index);
    if (packages[index]) {
      handlePackageSelect(packages[index]);
    }
  };

  const createOrder = async (): Promise<string> => {
    if (!selectedPackage) {
      toast.error(t("credits.errors.select_package"));
      throw new Error("No package selected");
    }

    try {
      setIsProcessing(true);
      const response = await createPaymentIntent(selectedPackage.id);

      if (response.success && response.order_id) {
        return response.order_id;
      } else {
        throw new Error(response.message || t("credits.errors.create_order"));
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(t("credits.errors.payment_order"));
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
            t("credits.success.payment_complete", {
              count: selectedPackage?.credit,
              formattedCount: selectedPackage?.credit.toLocaleString(),
            })
          );
          setPaymentStatus("completed");
          setShowPayPal(false);
          setIsProcessing(false);
        } else {
          // Payment failed or incomplete
          throw new Error(t("credits.errors.payment_incomplete"));
        }
      } else {
        throw new Error(
          response.message || t("credits.errors.payment_processing")
        );
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setPaymentStatus("failed");
      toast.error(t("credits.errors.payment_failed_contact"));
      setIsProcessing(false);
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      setIsProcessing(true);

      // Process payment (capture and check status)
      await processPayment(data.orderID);
    } catch (error) {
      console.error("Error in payment approval flow:", error);
      setPaymentStatus("failed");
      toast.error(t("credits.errors.payment_failed_contact"));
      setIsProcessing(false);
    }
  };

  const onError = (err: unknown) => {
    console.error("PayPal error:", err);
    toast.error(t("credits.errors.payment_failed"));
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
    toast.info(t("credits.info.payment_cancelled"));
    resetPaymentState();
  };

  const handleVoucherRedeem = async () => {
    if (!voucherCode.trim()) {
      toast.error(t("credits.errors.enter_voucher"));
      return;
    }

    try {
      setIsRedeemingVoucher(true);
      setVoucherRedemptionStatus("idle");

      const response = await redeemVoucher(voucherCode.trim());

      if (response.success) {
        toast.success(
          `${
            response.message
          } (${response.credits_added?.toLocaleString()} credits added)`
        );
        setVoucherRedemptionStatus("success");
        setVoucherCode("");
      } else {
        throw new Error(response.message || t("credits.errors.redeem_voucher"));
      }
    } catch (error) {
      console.error("Error redeeming voucher:", error);
      setVoucherRedemptionStatus("failed");
      toast.error(
        error instanceof Error
          ? error.message
          : t("credits.errors.redeem_voucher")
      );
    } finally {
      setIsRedeemingVoucher(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {paymentStatus === "completed" ? (
            // Success message when payment is complete
            <div className="text-center p-8 flex flex-col items-center justify-center">
              <div className="mb-4 bg-primary/10 p-4 rounded-full">
                <CheckCircle className="size-12 text-primary" />
              </div>
              <Small className="text-2xl font-semibold mb-2">
                {t("credits.success.title")}
              </Small>
              <p className="text-muted-foreground mb-6">
                {t("credits.success.credits_added", {
                  count: selectedPackage?.credit,
                  formattedCount: selectedPackage?.credit.toLocaleString(),
                })}
              </p>
              <Button
                onClick={() => {
                  // Reset all state values
                  resetPaymentState();
                }}
              >
                {t("credits.actions.another_purchase")}
              </Button>
            </div>
          ) : (
            // Regular content when not completed
            <>
              {/* Description */}
              <div className="text-center mb-8">
                <Small className="text-xl font-semibold mb-2">
                  {t("credits.choose_package")}
                </Small>
                <p className="text-muted-foreground">
                  {t("credits.description")}
                </p>
              </div>

              {/* Voucher Redemption Section */}
              <Card className="p-6 mb-8">
                <div className="text-center mb-4">
                  <Small className="text-lg font-semibold mb-2">
                    {t("credits.voucher.title")}
                  </Small>
                  <p className="text-sm text-muted-foreground">
                    {t("credits.voucher.description")}
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value.toUpperCase())
                      }
                      placeholder={t("credits.voucher.placeholder")}
                      className="flex-1 px-3 py-2 border border-border rounded-md text-xs min-w-65"
                      disabled={isRedeemingVoucher}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleVoucherRedeem();
                        }
                      }}
                    />
                    <Button
                      onClick={handleVoucherRedeem}
                      disabled={isRedeemingVoucher || !voucherCode.trim()}
                      size="sm"
                    >
                      {isRedeemingVoucher ? (
                        <>
                          <Loader2 className="size-4 mr-1 animate-spin" />
                          {t("credits.voucher.redeeming")}
                        </>
                      ) : (
                        t("credits.voucher.redeem")
                      )}
                    </Button>
                  </div>

                  {voucherRedemptionStatus === "success" && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm text-green-600 dark:text-green-400 text-center">
                        {t("credits.voucher.success")}
                      </p>
                    </div>
                  )}

                  {voucherRedemptionStatus === "failed" && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">
                        {t("credits.voucher.failed")}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Credit Packages Carousel */}
              <div className="mb-8">
                {isLoadingPackages ? (
                  // Loading skeleton
                  <div className="flex justify-center">
                    <Card className="p-4 animate-pulse w-full max-w-xs">
                      <div className="text-center">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </Card>
                  </div>
                ) : packages.length > 0 ? (
                  <div className="relative">
                    {/* Main Package Display */}
                    <div className="flex justify-center mb-4">
                      <div className="relative w-full max-w-xs h-64">
                        {packages.map((pkg: Package, index) => (
                          <Card
                            key={pkg.id}
                            className={`absolute inset-0 p-4 cursor-pointer transition-opacity duration-300 border-2 hover:shadow-lg ${
                              index === currentPackageIndex
                                ? "opacity-100 z-10"
                                : "opacity-0 z-0"
                            } ${
                              selectedPackage?.id === pkg.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            } ${pkg.popular ? "ring-2 ring-primary/20" : ""}`}
                            onClick={() => handlePackageSelect(pkg)}
                          >
                            {pkg.popular && (
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                                  {t("credits.package.most_popular")}
                                </span>
                              </div>
                            )}

                            <div className="text-center">
                              <div className="text-lg font-bold mb-2">
                                {pkg.name}
                              </div>
                              <div className="text-3xl font-bold text-primary mb-2">
                                ${pkg.price}
                              </div>
                              <div className="text-2xl font-semibold mb-1">
                                {pkg.credit.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground mb-3">
                                {t("credits.package.credits")}
                              </div>
                              <div className="text-xs text-muted-foreground mb-3 px-1">
                                {pkg.description}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t("credits.package.per_thousand", {
                                  price: (
                                    pkg.price /
                                    (pkg.credit / 1000)
                                  ).toFixed(3),
                                })}
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
                    </div>

                    {/* Navigation Arrows */}
                    {packages.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 rounded-full shadow-md h-8 w-8 p-0"
                          onClick={goToPreviousPackage}
                        >
                          <ChevronLeft className="size-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 rounded-full shadow-md h-8 w-8 p-0"
                          onClick={goToNextPackage}
                        >
                          <ChevronRight className="size-3" />
                        </Button>
                      </>
                    )}

                    {/* Package Indicators */}
                    {packages.length > 1 && (
                      <div className="flex justify-center space-x-1.5 mt-3">
                        {packages.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === currentPackageIndex
                                ? "bg-primary scale-125"
                                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            }`}
                            onClick={() => goToPackage(index)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Package Counter */}
                    {packages.length > 1 && (
                      <div className="text-center mt-1 text-xs text-muted-foreground">
                        {currentPackageIndex + 1} of {packages.length}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* PayPal Payment Section */}
              {showPayPal && selectedPackage && (
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {t("credits.payment.complete_purchase")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("credits.payment.purchasing", {
                        count: selectedPackage.credit,
                        formattedCount: selectedPackage.credit.toLocaleString(),
                        price: selectedPackage.price,
                      })}
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
                            ? t("credits.payment.capturing")
                            : t("credits.payment.processing")}
                        </span>
                      </div>
                    )}

                    {paymentStatus === "failed" && !isProcessing && (
                      <div className="flex items-center justify-center mt-4 text-destructive">
                        <span className="text-sm font-medium">
                          {t("credits.payment.failed")}
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
                        {t("credits.actions.cancel")}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Security Note */}
              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>{t("credits.security.secure_payment")}</p>
                <p>{t("credits.security.encrypted")}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
