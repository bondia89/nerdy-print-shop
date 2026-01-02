import Layout from "@/components/Layout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Plus, Loader2, Ticket, Trash2, Edit, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminCoupons() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "",
    maxUses: "",
    expiresAt: "",
  });

  const { data: coupons, isLoading, refetch } = trpc.coupons.list.useQuery();

  const createCoupon = trpc.coupons.create.useMutation({
    onSuccess: () => {
      toast.success("Cupom criado com sucesso!");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar cupom");
    },
  });

  const updateCoupon = trpc.coupons.update.useMutation({
    onSuccess: () => {
      toast.success("Cupom atualizado com sucesso!");
      setIsEditOpen(false);
      setEditingCoupon(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar cupom");
    },
  });

  const deleteCoupon = trpc.coupons.delete.useMutation({
    onSuccess: () => {
      toast.success("Cupom excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir cupom");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      discountPercent: "",
      maxUses: "",
      expiresAt: "",
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountPercent) {
      toast.error("Preencha código e porcentagem de desconto");
      return;
    }
    createCoupon.mutate({
      code: formData.code.toUpperCase(),
      discountPercent: formData.discountPercent,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    updateCoupon.mutate({
      id: editingCoupon.id,
      code: formData.code.toUpperCase(),
      discountPercent: formData.discountPercent,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      isActive: editingCoupon.isActive,
    });
  };

  const openEditDialog = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountPercent: coupon.discountPercent.toString(),
      maxUses: coupon.maxUses?.toString() || "",
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "",
    });
    setIsEditOpen(true);
  };

  const toggleCouponStatus = (coupon: any) => {
    updateCoupon.mutate({
      id: coupon.id,
      isActive: !coupon.isActive,
    });
  };

  const isCouponExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isCouponMaxedOut = (coupon: any) => {
    if (!coupon.maxUses) return false;
    return coupon.currentUses >= coupon.maxUses;
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-16">
            <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground mb-6">
              Você não tem permissão para acessar esta página.
            </p>
            <Button asChild>
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const activeCoupons = coupons?.filter((c) => c.isActive) || [];
  const inactiveCoupons = coupons?.filter((c) => !c.isActive) || [];

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" asChild>
            <Link href="/admin/produtos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/catalogo">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Ver Catálogo
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Cupons</h1>
            <p className="text-muted-foreground">
              Crie e gerencie cupons de desconto para campanhas promocionais
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Novo Cupom
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Novo Cupom</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Código do Cupom *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: DESCONTO10"
                    className="bg-gray-800 border-gray-700 text-white uppercase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Porcentagem de Desconto (%) *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    placeholder="Ex: 10"
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Limite de Usos (opcional)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Ex: 4 (deixe vazio para ilimitado)"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Data de Expiração (opcional)</Label>
                  <Input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                    disabled={createCoupon.isPending}
                  >
                    {createCoupon.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Criar Cupom"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Cupom</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Código do Cupom *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: DESCONTO10"
                  className="bg-gray-800 border-gray-700 text-white uppercase"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Porcentagem de Desconto (%) *</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  placeholder="Ex: 10"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Limite de Usos (opcional)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="Ex: 4 (deixe vazio para ilimitado)"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Data de Expiração (opcional)</Label>
                <Input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingCoupon(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={updateCoupon.isPending}
                >
                  {updateCoupon.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="active" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
              Cupons Ativos ({activeCoupons.length})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-gray-600">
              Cupons Inativos ({inactiveCoupons.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                {activeCoupons.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Nenhum cupom ativo</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="text-gray-400">Código</TableHead>
                        <TableHead className="text-gray-400">Desconto</TableHead>
                        <TableHead className="text-gray-400">Usos</TableHead>
                        <TableHead className="text-gray-400">Validade</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeCoupons.map((coupon) => (
                        <TableRow key={coupon.id} className="border-gray-800 hover:bg-gray-800/50">
                          <TableCell className="font-mono font-bold text-yellow-500">
                            {coupon.code}
                          </TableCell>
                          <TableCell className="text-white font-semibold">
                            {coupon.discountPercent}%
                          </TableCell>
                          <TableCell className="text-white">
                            {coupon.currentUses} / {coupon.maxUses || "∞"}
                          </TableCell>
                          <TableCell className="text-white">
                            {coupon.expiresAt
                              ? new Date(coupon.expiresAt).toLocaleDateString("pt-BR")
                              : "Sem limite"}
                          </TableCell>
                          <TableCell>
                            {isCouponExpired(coupon.expiresAt) ? (
                              <Badge variant="destructive">Expirado</Badge>
                            ) : isCouponMaxedOut(coupon) ? (
                              <Badge variant="secondary">Esgotado</Badge>
                            ) : (
                              <Badge className="bg-green-500">Válido</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEditDialog(coupon)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleCouponStatus(coupon)}
                                className="text-gray-400 hover:text-yellow-500"
                              >
                                <Ticket className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm("Tem certeza que deseja excluir este cupom?")) {
                                    deleteCoupon.mutate({ id: coupon.id });
                                  }
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                {inactiveCoupons.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Nenhum cupom inativo</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="text-gray-400">Código</TableHead>
                        <TableHead className="text-gray-400">Desconto</TableHead>
                        <TableHead className="text-gray-400">Usos</TableHead>
                        <TableHead className="text-gray-400">Validade</TableHead>
                        <TableHead className="text-gray-400 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inactiveCoupons.map((coupon) => (
                        <TableRow key={coupon.id} className="border-gray-800 hover:bg-gray-800/50 opacity-60">
                          <TableCell className="font-mono font-bold text-gray-400">
                            {coupon.code}
                          </TableCell>
                          <TableCell className="text-gray-400 font-semibold">
                            {coupon.discountPercent}%
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {coupon.currentUses} / {coupon.maxUses || "∞"}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {coupon.expiresAt
                              ? new Date(coupon.expiresAt).toLocaleDateString("pt-BR")
                              : "Sem limite"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleCouponStatus(coupon)}
                                className="text-gray-400 hover:text-green-500"
                              >
                                <Ticket className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm("Tem certeza que deseja excluir este cupom?")) {
                                    deleteCoupon.mutate({ id: coupon.id });
                                  }
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="bg-gray-900 border-gray-800 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Ticket className="h-5 w-5 text-yellow-500" />
              Como funcionam os cupons
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400 space-y-2">
            <p>• Os clientes podem aplicar o código do cupom no checkout para receber o desconto.</p>
            <p>• O desconto é calculado sobre o valor total do pedido.</p>
            <p>• No WhatsApp, será exibido o valor original, o cupom usado e o valor final com desconto.</p>
            <p>• Cupons com limite de usos serão automaticamente desativados quando atingirem o limite.</p>
            <p>• Cupons expirados não podem mais ser utilizados.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
