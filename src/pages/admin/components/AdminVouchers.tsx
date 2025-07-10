import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus, Copy } from "lucide-react";
import {
  adminApi,
  type VoucherData,
  type VouchersResponse,
  type CreateVoucherRequest,
  type UpdateVoucherRequest,
} from "@/api/admin";

interface AdminVouchersProps {
  searchQuery: string;
}

export function AdminVouchers({}: AdminVouchersProps) {
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherData | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    credit: "",
    expired_at: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchVouchers = async (page = 1) => {
    try {
      setLoading(true);
      const response: VouchersResponse = await adminApi.getVouchers({
        page_number: page,
        page_size: pagination.pageSize,
      });

      setVouchers(response.data);
      setPagination({
        currentPage: response.page_number,
        totalPages: Math.ceil(response.total_count / response.page_size),
        totalItems: response.total_count,
        pageSize: response.page_size,
      });
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handlePageChange = (page: number) => {
    fetchVouchers(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleCreateVoucher = async () => {
    if (!formData.credit || !formData.expired_at) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setFormLoading(true);
      const voucherData: CreateVoucherRequest = {
        credit: parseInt(formData.credit),
        expired_at: new Date(formData.expired_at).toISOString(),
      };

      await adminApi.createVoucher(voucherData);
      setCreateDialogOpen(false);
      setFormData({ credit: "", expired_at: "" });
      fetchVouchers(pagination.currentPage);
    } catch (error) {
      console.error("Failed to create voucher:", error);
      alert("Failed to create voucher");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditVoucher = async () => {
    if (!selectedVoucher || !formData.credit || !formData.expired_at) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setFormLoading(true);
      const voucherData: UpdateVoucherRequest = {
        credit: parseInt(formData.credit),
        expired_at: new Date(formData.expired_at).toISOString(),
      };

      await adminApi.updateVoucher(selectedVoucher.id, voucherData);
      setEditDialogOpen(false);
      setSelectedVoucher(null);
      setFormData({ credit: "", expired_at: "" });
      fetchVouchers(pagination.currentPage);
    } catch (error) {
      console.error("Failed to update voucher:", error);
      alert("Failed to update voucher");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteVoucher = async (id: number, code: string) => {
    if (!confirm(`Are you sure you want to delete voucher ${code}?`)) return;

    try {
      setDeleteLoading(id);
      await adminApi.deleteVoucher(id);
      fetchVouchers(pagination.currentPage);
    } catch (error) {
      console.error("Failed to delete voucher:", error);
      alert("Failed to delete voucher");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const openEditDialog = (voucher: VoucherData) => {
    setSelectedVoucher(voucher);
    setFormData({
      credit: voucher.credit.toString(),
      expired_at: new Date(voucher.expired_at).toISOString().slice(0, 16),
    });
    setEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({ credit: "", expired_at: "" });
    setCreateDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xs text-muted-foreground">Loading vouchers...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Create Button */}
        <div className="flex justify-end">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Voucher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Voucher</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="credit">Credit Amount</Label>
                  <Input
                    id="credit"
                    type="number"
                    value={formData.credit}
                    onChange={(e) =>
                      setFormData({ ...formData, credit: e.target.value })
                    }
                    placeholder="Enter credit amount"
                  />
                </div>
                <div>
                  <Label htmlFor="expired_at">Expiry Date</Label>
                  <Input
                    id="expired_at"
                    type="datetime-local"
                    value={formData.expired_at}
                    onChange={(e) =>
                      setFormData({ ...formData, expired_at: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateVoucher} disabled={formLoading}>
                    {formLoading ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Vouchers Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Code
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Credit
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Expires At
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Created
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => (
                <TableRow key={voucher.id} className="hover:bg-muted/50">
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">
                        {voucher.code}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(voucher.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {voucher.credit.toLocaleString()} credits
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        isExpired(voucher.expired_at) ? "secondary" : "default"
                      }
                      className="text-xs"
                    >
                      {isExpired(voucher.expired_at) ? "Expired" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(voucher.expired_at)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(voucher.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(voucher)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteVoucher(voucher.id, voucher.code)
                        }
                        disabled={deleteLoading === voucher.id}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {vouchers.length === 0 && !loading && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No vouchers found.
            </div>
          )}

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Voucher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-credit">Credit Amount</Label>
              <Input
                id="edit-credit"
                type="number"
                value={formData.credit}
                onChange={(e) =>
                  setFormData({ ...formData, credit: e.target.value })
                }
                placeholder="Enter credit amount"
              />
            </div>
            <div>
              <Label htmlFor="edit-expired_at">Expiry Date</Label>
              <Input
                id="edit-expired_at"
                type="datetime-local"
                value={formData.expired_at}
                onChange={(e) =>
                  setFormData({ ...formData, expired_at: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditVoucher} disabled={formLoading}>
                {formLoading ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
