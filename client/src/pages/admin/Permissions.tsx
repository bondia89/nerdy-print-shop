import Layout from "@/components/Layout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Plus, Loader2, Shield, Trash2, Edit, Users, ShoppingBag, Package, Ticket, ClipboardList } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const OWNER_EMAIL = "mateinorolamento89@gmail.com";

const PERMISSION_OPTIONS = [
  { key: "canManageProducts", label: "Gerenciar Produtos", icon: Package, description: "Criar, editar e excluir produtos" },
  { key: "canManageOrders", label: "Gerenciar Pedidos", icon: ClipboardList, description: "Ver e atualizar status de pedidos" },
  { key: "canManageCoupons", label: "Gerenciar Cupons", icon: Ticket, description: "Criar e editar cupons de desconto" },
  { key: "canManageCategories", label: "Gerenciar Categorias", icon: ShoppingBag, description: "Criar e editar categorias" },
] as const;

type PermissionKey = typeof PERMISSION_OPTIONS[number]["key"];

export default function AdminPermissions() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [newEmail, setNewEmail] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Record<PermissionKey, boolean>>({
    canManageProducts: false,
    canManageOrders: false,
    canManageCoupons: false,
    canManageCategories: false,
  });

  const { data: permissions, isLoading, refetch } = trpc.permissions.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.email === OWNER_EMAIL,
  });

  const createPermission = trpc.permissions.create.useMutation({
    onSuccess: () => {
      toast.success("Permissão adicionada com sucesso!");
      setShowAddDialog(false);
      setNewEmail("");
      setSelectedPermissions({
        canManageProducts: false,
        canManageOrders: false,
        canManageCoupons: false,
        canManageCategories: false,
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar permissão");
    },
  });

  const updatePermission = trpc.permissions.update.useMutation({
    onSuccess: () => {
      toast.success("Permissão atualizada com sucesso!");
      setEditingPermission(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar permissão");
    },
  });

  const deletePermission = trpc.permissions.delete.useMutation({
    onSuccess: () => {
      toast.success("Permissão removida com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover permissão");
    },
  });

  const handleAddPermission = () => {
    if (!newEmail.trim()) {
      toast.error("Digite um email");
      return;
    }
    createPermission.mutate({
      email: newEmail.toLowerCase(),
      ...selectedPermissions,
    });
  };

  const handleUpdatePermission = () => {
    if (!editingPermission) return;
    updatePermission.mutate({
      id: editingPermission.id,
      ...selectedPermissions,
    });
  };

  const handleDeletePermission = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta permissão?")) {
      deletePermission.mutate({ id });
    }
  };

  const openEditDialog = (permission: any) => {
    setEditingPermission(permission);
    setSelectedPermissions({
      canManageProducts: permission.canManageProducts,
      canManageOrders: permission.canManageOrders,
      canManageCoupons: permission.canManageCoupons,
      canManageCategories: permission.canManageCategories,
    });
  };

  // Check if user is the owner
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

  if (!isAuthenticated || user?.email !== OWNER_EMAIL) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-16">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground mb-6">
              Apenas o proprietário ({OWNER_EMAIL}) pode gerenciar permissões.
            </p>
            <Button asChild>
              <Link href="/admin/produtos">Voltar ao Painel</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

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
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Gerenciar Permissões
            </h1>
            <p className="text-muted-foreground mt-1">
              Controle quem pode acessar o painel administrativo
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="glow-primary">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários com Acesso
            </CardTitle>
            <CardDescription>
              Lista de usuários com permissões administrativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!permissions || permissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum usuário com permissões adicionais.</p>
                <p className="text-sm">Você é o único administrador.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {permission.canManageProducts && (
                            <Badge variant="outline" className="text-xs">
                              <Package className="h-3 w-3 mr-1" />
                              Produtos
                            </Badge>
                          )}
                          {permission.canManageOrders && (
                            <Badge variant="outline" className="text-xs">
                              <ClipboardList className="h-3 w-3 mr-1" />
                              Pedidos
                            </Badge>
                          )}
                          {permission.canManageCoupons && (
                            <Badge variant="outline" className="text-xs">
                              <Ticket className="h-3 w-3 mr-1" />
                              Cupons
                            </Badge>
                          )}
                          {permission.canManageCategories && (
                            <Badge variant="outline" className="text-xs">
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              Categorias
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(permission.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(permission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-400"
                            onClick={() => handleDeletePermission(permission.id)}
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

        {/* Add Permission Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Usuário</DialogTitle>
              <DialogDescription>
                Adicione um email e selecione as permissões que o usuário terá.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email do Usuário</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="usuario@email.com"
                />
              </div>
              <div className="space-y-3">
                <Label>Permissões</Label>
                {PERMISSION_OPTIONS.map((option) => (
                  <div
                    key={option.key}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={option.key}
                      checked={selectedPermissions[option.key]}
                      onCheckedChange={(checked) =>
                        setSelectedPermissions((prev) => ({
                          ...prev,
                          [option.key]: checked === true,
                        }))
                      }
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={option.key}
                        className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <option.icon className="h-4 w-4 text-primary" />
                        {option.label}
                      </label>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPermission} disabled={createPermission.isPending}>
                {createPermission.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Permission Dialog */}
        <Dialog open={!!editingPermission} onOpenChange={() => setEditingPermission(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Permissões</DialogTitle>
              <DialogDescription>
                Editando permissões de {editingPermission?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {PERMISSION_OPTIONS.map((option) => (
                <div
                  key={option.key}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`edit-${option.key}`}
                    checked={selectedPermissions[option.key]}
                    onCheckedChange={(checked) =>
                      setSelectedPermissions((prev) => ({
                        ...prev,
                        [option.key]: checked === true,
                      }))
                    }
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`edit-${option.key}`}
                      className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <option.icon className="h-4 w-4 text-primary" />
                      {option.label}
                    </label>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPermission(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdatePermission} disabled={updatePermission.isPending}>
                {updatePermission.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
