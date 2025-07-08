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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Star, DollarSign, CreditCard } from "lucide-react";
import {
  adminApi,
  type Package,
  type CreatePackageRequest,
  type UpdatePackageRequest,
} from "@/api/admin";

export function AdminPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    credit: 0,
  });

  const fetchPackages = async () => {
    try {
      const data = await adminApi.getPackages();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      credit: 0,
    });
  };

  const handleCreatePackage = async () => {
    if (!formData.name.trim() || formData.price <= 0 || formData.credit <= 0) {
      return;
    }

    setSubmitting(true);
    try {
      const packageData: CreatePackageRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        credit: formData.credit,
      };

      await adminApi.createPackage(packageData);
      await fetchPackages();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating package:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPackage = async () => {
    if (
      !editingPackage ||
      !formData.name.trim() ||
      formData.price <= 0 ||
      formData.credit <= 0
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const packageData: UpdatePackageRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        credit: formData.credit,
      };

      await adminApi.updatePackage(editingPackage.id, packageData);
      await fetchPackages();
      setIsEditDialogOpen(false);
      setEditingPackage(null);
      resetForm();
    } catch (error) {
      console.error("Error updating package:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePackage = async (packageToDelete: Package) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${packageToDelete.name.trim()}"? This action cannot be undone and may affect users who have purchased this package.`
    );

    if (!confirmed) return;

    try {
      await adminApi.deletePackage(packageToDelete.id);
      await fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  const openEditDialog = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      credit: pkg.credit,
    });
    setIsEditDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat("en-US").format(credits);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Manage credit packages and pricing
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs">
                <Plus className="h-3 w-3 mr-1" />
                New Package
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Package</DialogTitle>
                <DialogDescription>
                  Add a new credit package for users to purchase.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-xs">
                    Package Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Starter Pack"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-xs">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Package description..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="text-xs min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price" className="text-xs">
                      Price (USD)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="credit" className="text-xs">
                      Credits
                    </Label>
                    <Input
                      id="credit"
                      type="number"
                      min="0"
                      placeholder="1000"
                      value={formData.credit || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          credit: parseInt(e.target.value) || 0,
                        })
                      }
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePackage}
                  disabled={
                    submitting ||
                    !formData.name.trim() ||
                    formData.price <= 0 ||
                    formData.credit <= 0
                  }
                  className="text-xs"
                >
                  {submitting ? "Creating..." : "Create Package"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Packages Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Package
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Price
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Credits
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Value per Credit
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-xs text-muted-foreground"
                  >
                    No packages found. Create your first package to get started.
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow key={pkg.id} className="hover:bg-muted/50">
                    <TableCell className="text-xs">
                      <div>
                        <div className="font-medium flex items-center space-x-2">
                          <span>{pkg.name.trim()}</span>
                          {pkg.popular && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0.5"
                            >
                              <Star className="h-2.5 w-2.5 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-1">
                          {pkg.description.trim()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          {formatCurrency(pkg.price)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-3 w-3 text-muted-foreground" />
                        <span>{formatCredits(pkg.credit)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="text-muted-foreground">
                        ${((pkg.price / pkg.credit) * 1000).toFixed(3)}/1k
                        credits
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(pkg)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePackage(pkg)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Package Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update package details and pricing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-xs">
                Package Name
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Starter Pack"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="text-xs"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-xs">
                Description
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Package description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="text-xs min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price" className="text-xs">
                  Price (USD)
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-credit" className="text-xs">
                  Credits
                </Label>
                <Input
                  id="edit-credit"
                  type="number"
                  min="0"
                  placeholder="1000"
                  value={formData.credit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credit: parseInt(e.target.value) || 0,
                    })
                  }
                  className="text-xs"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingPackage(null);
                resetForm();
              }}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditPackage}
              disabled={
                submitting ||
                !formData.name.trim() ||
                formData.price <= 0 ||
                formData.credit <= 0
              }
              className="text-xs"
            >
              {submitting ? "Updating..." : "Update Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
