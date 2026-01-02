import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Wishlist() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: wishlistItems, isLoading } = trpc.wishlist.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const removeFromWishlist = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.list.invalidate();
      toast.success("Removido da lista de desejos");
    },
  });

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Produto adicionado ao carrinho!");
    },
    onError: () => {
      toast.error("Erro ao adicionar ao carrinho");
    },
  });

  if (loading) {
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

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Faça login para ver sua lista de desejos</h3>
            <p className="text-muted-foreground mb-6">
              Salve seus produtos favoritos para comprar depois.
            </p>
            <Button asChild>
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/catalogo">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Catálogo
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold">Lista de Desejos</h1>
            <p className="text-muted-foreground">
              {wishlistItems?.length || 0} {wishlistItems?.length === 1 ? 'produto salvo' : 'produtos salvos'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : wishlistItems && wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="relative aspect-square bg-card">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromWishlist.mutate({ productId: item.productId })}
                    disabled={removeFromWishlist.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <Link href={`/produto/${item.product.slug}`}>
                    <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-primary mb-4">
                    R$ {parseFloat(item.product.price).toFixed(2)}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => addToCart.mutate({ productId: item.productId, quantity: 1 })}
                      disabled={addToCart.isPending || item.product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {item.product.stock === 0 ? 'Sem estoque' : 'Comprar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sua lista de desejos está vazia</h3>
              <p className="text-muted-foreground mb-6">
                Explore nosso catálogo e salve seus produtos favoritos clicando no ícone de coração.
              </p>
              <Button asChild>
                <Link href="/catalogo">Explorar Catálogo</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
