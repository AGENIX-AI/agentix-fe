import {
  X,
  CreditCard,
  User,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  packageName: string;
  amount: number;
  status: "completed" | "pending" | "failed" | "refunded";
  paymentMethod: "credit_card" | "paypal" | "bank_transfer" | "crypto";
  createdAt: string;
  description?: string;
}

interface TransactionDetailSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionDetailSidebar({
  isVisible,
  onClose,
  transaction,
}: TransactionDetailSidebarProps) {
  if (!isVisible || !transaction) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "refunded":
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "refunded":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card";
      case "paypal":
        return "PayPal";
      case "bank_transfer":
        return "Bank Transfer";
      case "crypto":
        return "Cryptocurrency";
      default:
        return method;
    }
  };

  const getPaymentMethodIcon = () => {
    return <CreditCard className="h-4 w-4" />;
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-background border-l border-border shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Transaction Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Transaction Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">
              Transaction Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(transaction.status)}
                <Badge
                  variant={getStatusVariant(transaction.status)}
                  className="text-xs"
                >
                  {transaction.status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Transaction ID: {transaction.id}
                </div>
              </div>
            </div>

            {transaction.description && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium">Description</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {transaction.description}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Customer Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={transaction.userAvatar}
                  alt={transaction.userName}
                />
                <AvatarFallback className="text-sm">
                  {getInitials(transaction.userName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">{transaction.userName}</h3>
                <p className="text-xs text-muted-foreground">
                  {transaction.userEmail}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium">User ID</p>
                <p className="text-muted-foreground text-[10px] break-all">
                  {transaction.userId}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Package Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium text-sm">{transaction.packageName}</p>
              <p className="text-xs text-muted-foreground">
                Subscription package
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-medium">Amount</p>
                <p className="text-muted-foreground">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              <div>
                <p className="font-medium">Type</p>
                <p className="text-muted-foreground">
                  {transaction.packageName.includes("Monthly")
                    ? "Monthly"
                    : "Yearly"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Payment Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              {getPaymentMethodIcon()}
              <span className="text-sm font-medium">
                {getPaymentMethodDisplay(transaction.paymentMethod)}
              </span>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-3 text-xs">
              <div>
                <p className="font-medium">Payment Method</p>
                <p className="text-muted-foreground">
                  {getPaymentMethodDisplay(transaction.paymentMethod)}
                </p>
              </div>
              <div>
                <p className="font-medium">Transaction Date</p>
                <p className="text-muted-foreground">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Transaction Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Transaction Initiated</p>
                  <p className="text-muted-foreground">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
              </div>

              {transaction.status === "completed" && (
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Payment Completed</p>
                    <p className="text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
              )}

              {transaction.status === "failed" && (
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Payment Failed</p>
                    <p className="text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
              )}

              {transaction.status === "refunded" && (
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Refund Processed</p>
                    <p className="text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {transaction.status === "completed" && (
              <Button variant="outline" size="sm" className="w-full text-xs">
                Process Refund
              </Button>
            )}
            {transaction.status === "failed" && (
              <Button variant="outline" size="sm" className="w-full text-xs">
                Retry Payment
              </Button>
            )}
            <Button variant="outline" size="sm" className="w-full text-xs">
              Send Receipt
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs">
              Contact Customer
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs">
              View Full History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
