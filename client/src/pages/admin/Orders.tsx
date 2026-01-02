import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Package, Loader2, ArrowLeft, ShieldAlert, Eye, MessageCircle, Trash2, RotateCcw, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  paid: { label: "Pago", variant: "default" },
  processing: { label: "Em Produção", variant: "default" },
  shipped: { label: "Enviado", variant: "default" },
  delivered: { label: "Entregue", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Pago" },
  { value: "processing", label: "Em Produção" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

export default function AdminOrders() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ativos");

  const { data: orders, isLoading: ordersLoading } = trpc.orders.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const utils = trpc.useUtils();

  const updateOrderStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.listAll.invalidate();
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const deleteOrder = trpc.orders.delete.useMutation({
    onSuccess: () => {
      utils.orders.listAll.invalidate();
      toast.success("Pedido excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir pedido");
    },
  });

  const restoreOrder = trpc.orders.restore.useMutation({
    onSuccess: () => {
      utils.orders.listAll.invalidate();
      toast.success("Pedido restaurado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao restaurar pedido");
    },
  });

  const generatePaymentLink = (order: any) => {
    if (order.paymentMethod === "pix") {
      // Copiar PIX para clipboard
      if (order.pixCode) {
        navigator.clipboard.writeText(order.pixCode);
        toast.success("Código PIX copiado!");
      }
    } else if (order.paymentMethod === "whatsapp") {
      // Gerar link WhatsApp
      const message = `Olá! Seu pedido #${order.id} está pronto. Total: R$ ${parseFloat(order.total).toFixed(2)}. Clique para confirmar.`;
      const whatsappLink = `https://wa.me/5511953739362?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, "_blank");
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este pedido?")) {
      await deleteOrder.mutateAsync({ id });
    }
  };

  const handleRestoreOrder = async (id: number) => {
    if (confirm("Tem certeza que deseja restaurar este pedido?")) {
      await restoreOrder.mutateAsync({ id });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
        <p className="text-gray-400 mb-6">Você não tem permissão para acessar esta página.</p>
        <Link href="/">
          <Button className="bg-yellow-400 text-black hover:bg-yellow-500">Voltar para Início</Button>
        </Link>
      </div>
    );
  }

  const activeOrders = orders?.filter(o => !o.isDeleted) || [];
  const deletedOrders = orders?.filter(o => o.isDeleted) || [];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/produtos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Pedidos</h1>
            <p className="text-gray-400">Visualize, atualize e gerencie pedidos dos clientes</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900">
            <TabsTrigger value="ativos" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Package className="h-4 w-4 mr-2" />
              Pedidos Ativos ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="excluidos" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Trash2 className="h-4 w-4 mr-2" />
              Pedidos Excluídos ({deletedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ativos" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                  </div>
                ) : activeOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-800">
                          <TableHead className="text-gray-300">Pedido</TableHead>
                          <TableHead className="text-gray-300">Cliente</TableHead>
                          <TableHead className="text-gray-300">Total</TableHead>
                          <TableHead className="text-gray-300">Pagamento</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeOrders.map((order) => (
                          <TableRow key={order.id} className="border-gray-800 hover:bg-gray-800">
                            <TableCell className="text-white font-medium">
                              #{order.id}
                              <div className="text-xs text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {order.customerName}
                              <div className="text-xs text-gray-500">{order.customerPhone}</div>
                            </TableCell>
                            <TableCell className="text-white font-semibold">
                              R$ {parseFloat(order.total).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                WHATSAPP
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) =>
                                  updateOrderStatus.mutateAsync({ id: order.id, status: value as any })
                                }
                              >
                                <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                  {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="text-white">
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setIsDetailsDialogOpen(true);
                                  }}
                                  className="text-blue-400 hover:text-blue-300"
                                  title="Ver detalhes"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => generatePaymentLink(order)}
                                  className="text-green-400 hover:text-green-300"
                                  title="Gerar link de pagamento"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-red-400 hover:text-red-300"
                                  title="Excluir pedido"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum pedido ativo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="excluidos" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                  </div>
                ) : deletedOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-800">
                          <TableHead className="text-gray-300">Pedido</TableHead>
                          <TableHead className="text-gray-300">Cliente</TableHead>
                          <TableHead className="text-gray-300">Total</TableHead>
                          <TableHead className="text-gray-300">Pagamento</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deletedOrders.map((order) => (
                          <TableRow key={order.id} className="border-gray-800 hover:bg-gray-800 opacity-60">
                            <TableCell className="text-white font-medium">
                              #{order.id}
                              <div className="text-xs text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {order.customerName}
                              <div className="text-xs text-gray-500">{order.customerPhone}</div>
                            </TableCell>
                            <TableCell className="text-white font-semibold">
                              R$ {parseFloat(order.total).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                WHATSAPP
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive">{statusMap[order.status]?.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRestoreOrder(order.id)}
                                  className="text-yellow-400 hover:text-yellow-300"
                                  title="Restaurar pedido"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Trash2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum pedido excluído</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Detalhes do Pedido */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Cliente</p>
                    <p className="text-white font-semibold">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Telefone</p>
                    <p className="text-white font-semibold">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-semibold">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Data</p>
                    <p className="text-white font-semibold">
                      {new Date(selectedOrder.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Endereço de Entrega</p>
                  <p className="text-white">{selectedOrder.shippingAddress || "Não informado"}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Notas</p>
                  <p className="text-white">{selectedOrder.notes || "Sem notas"}</p>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <p className="text-gray-400 text-sm mb-2">Total</p>
                  <p className="text-white text-2xl font-bold">R$ {parseFloat(selectedOrder.total).toFixed(2)}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
