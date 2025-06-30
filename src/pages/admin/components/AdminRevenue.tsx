import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/ui/pagination";
import { Download, DollarSign, CreditCard } from "lucide-react";
import { TransactionDetailSidebar } from "@/pages/admin/components/sidebars/TransactionDetailSidebar";
import {
  adminApi,
  type TransactionsByDayResponse,
  type TransactionData,
  type DailyTransactionData,
} from "@/api/admin";

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

interface RevenueOverview {
  today: number;
  thisMonth: number;
  thisYear: number;
}

interface ChartData {
  date: string;
  revenue: number;
}

export function AdminRevenue() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [revenueOverview, setRevenueOverview] = useState<RevenueOverview>({
    today: 0,
    thisMonth: 0,
    thisYear: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("");
  const [chartPackageFilter, setChartPackageFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Sidebar
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const showTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSidebarVisible(true);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
    setSelectedTransaction(null);
  };

  // Transform API data to match UI format
  const transformTransactionData = (
    apiData: TransactionsByDayResponse
  ): Transaction[] => {
    const allTransactions: Transaction[] = [];

    apiData.data.forEach((dayData: DailyTransactionData) => {
      dayData.transactions.forEach((txn: TransactionData) => {
        allTransactions.push({
          id: txn.payment_id || txn.id || "unknown",
          userId: txn.user_info.id,
          userEmail: txn.user_info.email,
          userName: txn.user_info.full_name,
          userAvatar: txn.user_info.avatar_url,
          packageName: `${txn.package.credit} Credits Package`,
          amount: txn.amount,
          status: txn.status as "completed" | "pending" | "failed" | "refunded",
          paymentMethod: "credit_card", // Default since API doesn't specify
          createdAt: txn.completed_at,
          description: `Purchase of ${txn.package.credit} credits`,
        });
      });
    });

    return allTransactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const transformChartData = (
    apiData: TransactionsByDayResponse
  ): ChartData[] => {
    return apiData.data
      .map((dayData: DailyTransactionData) => ({
        date: dayData.date,
        revenue: dayData.daily_revenue,
      }))
      .reverse(); // Reverse to show oldest first
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch revenue overview
        const revenueData = await adminApi.getTotalRevenue();
        setRevenueOverview({
          today: revenueData.today_total,
          thisMonth: revenueData.month_total,
          thisYear: revenueData.year_total,
        });

        // Fetch transactions (last 30 days)
        const transactionsData = await adminApi.getTransactionsByDay({
          days_back: 30,
        });
        const transformedTransactions =
          transformTransactionData(transactionsData);
        setTransactions(transformedTransactions);

        // Transform chart data
        const chartDataTransformed = transformChartData(transactionsData);
        setChartData(chartDataTransformed);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = transactions;

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter(
        (t) => t.paymentMethod === paymentMethodFilter
      );
    }

    if (packageFilter !== "all") {
      filtered = filtered.filter((t) => t.packageName === packageFilter);
    }

    if (dateRangeFilter) {
      // Simple date filtering - in real app, would be more sophisticated
      const filterDate = new Date(dateRangeFilter);
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= filterDate;
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [
    statusFilter,
    paymentMethodFilter,
    packageFilter,
    dateRangeFilter,
    transactions,
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  const exportToCSV = () => {
    const headers = [
      "Transaction ID",
      "User",
      "Package",
      "Amount",
      "Status",
      "Payment Method",
      "Date",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((t) =>
        [
          t.id,
          `"${t.userName}"`,
          `"${t.packageName}"`,
          t.amount,
          t.status,
          t.paymentMethod,
          `"${formatDate(t.createdAt)}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Simple chart component (in real app, would use a proper charting library)
  const SimpleChart = () => {
    const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

    const formatChartDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    return (
      <div className="h-80 p-4">
        <div className="h-64 flex items-end space-x-1 mb-2">
          {chartData.map((data, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center min-w-0"
            >
              <div
                className="w-full bg-blue-500 rounded-t-sm"
                style={{
                  height: `${(data.revenue / maxRevenue) * 200}px`,
                  opacity: 0.8,
                }}
                title={`${data.date}: ${formatCurrency(data.revenue)}`}
              />
            </div>
          ))}
        </div>
        <div className="flex space-x-1">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 text-center min-w-0">
              <span className="text-xs text-muted-foreground block truncate">
                {formatChartDate(data.date)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium">
                Total Revenue Today
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-xl font-bold animate-pulse">
                  Loading...
                </div>
              ) : (
                <div className="text-xl font-bold">
                  {formatCurrency(revenueOverview.today)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium">
                Total Revenue This Month
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-xl font-bold animate-pulse">
                  Loading...
                </div>
              ) : (
                <div className="text-xl font-bold">
                  {formatCurrency(revenueOverview.thisMonth)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium">
                Total Revenue This Year
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-xl font-bold animate-pulse">
                  Loading...
                </div>
              ) : (
                <div className="text-xl font-bold">
                  {formatCurrency(revenueOverview.thisYear)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">
                Revenue Over Time
              </CardTitle>
              <Select
                value={chartPackageFilter}
                onValueChange={setChartPackageFilter}
              >
                <SelectTrigger className="w-40 text-xs">
                  <SelectValue placeholder="Filter by package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packages</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-pulse text-xs">
                  Loading chart data...
                </div>
              </div>
            ) : (
              <SimpleChart />
            )}
          </CardContent>
        </Card>

        {/* Transactions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">
                Transactions
              </CardTitle>
              <Button size="sm" onClick={exportToCSV} className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Date Range
                </label>
                <Input
                  type="date"
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Payment Method
                </label>
                <Select
                  value={paymentMethodFilter}
                  onValueChange={setPaymentMethodFilter}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Package
                </label>
                <Select value={packageFilter} onValueChange={setPackageFilter}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All Packages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Packages</SelectItem>
                    <SelectItem value="Basic Monthly">Basic Monthly</SelectItem>
                    <SelectItem value="Pro Monthly">Pro Monthly</SelectItem>
                    <SelectItem value="Enterprise Monthly">
                      Enterprise Monthly
                    </SelectItem>
                    <SelectItem value="Enterprise Yearly">
                      Enterprise Yearly
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      Transaction ID
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      User
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      Package
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      Payment Method
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      Date/Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="animate-pulse">
                          Loading transactions...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : currentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => showTransactionDetails(transaction)}
                      >
                        <TableCell className="text-xs font-mono">
                          {transaction.id}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={transaction.userAvatar}
                                alt={transaction.userName}
                              />
                              <AvatarFallback className="text-xs">
                                {getInitials(transaction.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {transaction.userName}
                              </div>
                              <div className="text-muted-foreground text-[10px]">
                                {transaction.userEmail}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {transaction.packageName}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(transaction.status)}
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center space-x-1">
                            <CreditCard className="h-3 w-3" />
                            <span>
                              {getPaymentMethodDisplay(
                                transaction.paymentMethod
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTransactions.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Detail Sidebar */}
      <TransactionDetailSidebar
        isVisible={sidebarVisible}
        onClose={closeSidebar}
        transaction={selectedTransaction}
      />
    </>
  );
}
