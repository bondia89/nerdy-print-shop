import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Package, Plus, Pencil, Trash2, Loader2, ArrowLeft, ShieldAlert, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminProducts() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("produtos");
  
  const [productFormData, setProductFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    imageUrl: "",
    categoryId: "",
    stock: 0,
    isActive: true,
    isPopular: false,
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
  });

  const { data: products, isLoading: productsLoading } = trpc.products.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const utils = trpc.useUtils();

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.listAll.invalidate();
      toast.success("Produto criado com sucesso!");
      resetProductForm();
      setIsProductDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar produto");
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.listAll.invalidate();
      toast.success("Produto atualizado com sucesso!");
      resetProductForm();
      setIsProductDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar produto");
    },
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.listAll.invalidate();
      toast.success("Produto excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir produto");
    },
  });

  const createCategory = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Categoria criada com sucesso!");
      resetCategoryForm();
      setIsCategoryDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar categoria");
    },
  });

  const resetProductForm = () => {
    setProductFormData({
      name: "",
      slug: "",
      description: "",
      price: "",
      imageUrl: "",
      categoryId: "",
      stock: 0,
      isActive: true,
      isPopular: false,
    });
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
    });
    setEditingCategory(null);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      imageUrl: product.imageUrl || "",
      categoryId: product.categoryId?.toString() || "",
      stock: product.stock || 0,
      isActive: product.isActive,
      isPopular: product.isPopular,
    });
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productFormData.name || !productFormData.slug || !productFormData.price) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const payload = {
      ...productFormData,
      categoryId: productFormData.categoryId ? parseInt(productFormData.categoryId) : undefined,
      price: productFormData.price,
      stock: parseInt(productFormData.stock.toString()),
    };

    if (editingProduct) {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        ...payload,
      });
    } else {
      await createProduct.mutateAsync(payload);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name || !categoryFormData.slug) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    await createCategory.mutateAsync(categoryFormData);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      await deleteProduct.mutateAsync({ id });
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

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Sem categoria";
    return categories?.find(c => c.id === categoryId)?.name || "Desconhecida";
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/catalogo">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
              <p className="text-gray-400">Adicione, edite ou remova produtos do catálogo</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/pedidos">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">Pedidos</Button>
            </Link>
            <Link href="/admin/cupons">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">Cupons</Button>
            </Link>
            <Link href="/admin/permissoes">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">Permissões</Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900">
            <TabsTrigger value="produtos" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="categorias" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Tag className="h-4 w-4 mr-2" />
              Categorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-yellow-400 text-black hover:bg-yellow-500"
                    onClick={() => {
                      resetProductForm();
                      setIsProductDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      {editingProduct ? "Editar Produto" : "Novo Produto"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Nome *</Label>
                      <Input
                        value={productFormData.name}
                        onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Nome do produto"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Slug *</Label>
                      <Input
                        value={productFormData.slug}
                        onChange={(e) => setProductFormData({ ...productFormData, slug: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="produto-slug"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Categoria</Label>
                      <Select value={productFormData.categoryId} onValueChange={(value) => setProductFormData({ ...productFormData, categoryId: value })}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()} className="text-white">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Descrição</Label>
                      <Textarea
                        value={productFormData.description}
                        onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Descrição do produto"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Preço *</Label>
                        <Input
                          value={productFormData.price}
                          onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Estoque</Label>
                        <Input
                          value={productFormData.stock}
                          onChange={(e) => setProductFormData({ ...productFormData, stock: parseInt(e.target.value) || 0 })}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="0"
                          type="number"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-300">URL da Imagem</Label>
                      <Input
                        value={productFormData.imageUrl}
                        onChange={(e) => setProductFormData({ ...productFormData, imageUrl: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="/imagem.png"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Ativo</Label>
                      <Switch
                        checked={productFormData.isActive}
                        onCheckedChange={(checked) => setProductFormData({ ...productFormData, isActive: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Popular</Label>
                      <Switch
                        checked={productFormData.isPopular}
                        onCheckedChange={(checked) => setProductFormData({ ...productFormData, isPopular: checked })}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleSaveProduct}
                        disabled={createProduct.isPending || updateProduct.isPending}
                        className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                      >
                        {createProduct.isPending || updateProduct.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          "Salvar"
                        )}
                      </Button>
                      <Button
                        onClick={() => setIsProductDialogOpen(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Produtos ({products?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                  </div>
                ) : products && products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-800">
                          <TableHead className="text-gray-300">Produto</TableHead>
                          <TableHead className="text-gray-300">Categoria</TableHead>
                          <TableHead className="text-gray-300">Preço</TableHead>
                          <TableHead className="text-gray-300">Estoque</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id} className="border-gray-800 hover:bg-gray-800">
                            <TableCell className="text-white font-medium">{product.name}</TableCell>
                            <TableCell className="text-gray-300">{getCategoryName(product.categoryId)}</TableCell>
                            <TableCell className="text-white">R$ {parseFloat(product.price).toFixed(2)}</TableCell>
                            <TableCell className="text-white">{product.stock}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {product.isActive && <Badge className="bg-green-600">Ativo</Badge>}
                                {product.isPopular && <Badge className="bg-yellow-600">Popular</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-400 hover:text-red-300"
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
                    <p>Nenhum produto cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorias" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-yellow-400 text-black hover:bg-yellow-500"
                    onClick={() => {
                      resetCategoryForm();
                      setIsCategoryDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Nova Categoria</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Nome *</Label>
                      <Input
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Nome da categoria"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Slug *</Label>
                      <Input
                        value={categoryFormData.slug}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="categoria-slug"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Descrição</Label>
                      <Textarea
                        value={categoryFormData.description}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Descrição da categoria"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">URL da Imagem</Label>
                      <Input
                        value={categoryFormData.imageUrl}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, imageUrl: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="/imagem.png"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleSaveCategory}
                        disabled={createCategory.isPending}
                        className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                      >
                        {createCategory.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          "Criar Categoria"
                        )}
                      </Button>
                      <Button
                        onClick={() => setIsCategoryDialogOpen(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Categorias ({categories?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                  </div>
                ) : categories && categories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <Card key={category.id} className="bg-gray-800 border-gray-700">
                        <CardContent className="pt-6">
                          <h3 className="text-white font-semibold mb-2">{category.name}</h3>
                          <p className="text-gray-400 text-sm mb-2">{category.description}</p>
                          <p className="text-gray-500 text-xs">Slug: {category.slug}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma categoria cadastrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
