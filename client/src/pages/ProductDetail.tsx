import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Box, ShoppingCart, ArrowLeft, Minus, Plus, Loader2, Heart, Star, ThumbsUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  
  const { data: product, isLoading } = trpc.products.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: productImages } = trpc.productImages.list.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product?.id }
  );

  const { data: reviews } = trpc.reviews.list.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product?.id }
  );

  const { data: ratingData } = trpc.reviews.rating.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product?.id }
  );

  const { data: isInWishlist } = trpc.wishlist.check.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product?.id && isAuthenticated }
  );

  const utils = trpc.useUtils();

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Produto adicionado ao carrinho!");
    },
    onError: () => {
      toast.error("Erro ao adicionar ao carrinho. Faça login primeiro.");
    },
  });

  const toggleWishlist = trpc.wishlist[isInWishlist ? 'remove' : 'add'].useMutation({
    onSuccess: () => {
      utils.wishlist.check.invalidate({ productId: product?.id || 0 });
      utils.wishlist.list.invalidate();
      toast.success(isInWishlist ? "Removido da lista de desejos" : "Adicionado à lista de desejos!");
    },
    onError: () => {
      toast.error("Faça login para usar a lista de desejos");
    },
  });

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      utils.reviews.list.invalidate({ productId: product?.id || 0 });
      utils.reviews.rating.invalidate({ productId: product?.id || 0 });
      setNewComment("");
      setNewRating(5);
      toast.success("Avaliação enviada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar avaliação");
    },
  });

  const toggleLike = trpc.reviews.toggleLike.useMutation({
    onSuccess: () => {
      utils.reviews.list.invalidate({ productId: product?.id || 0 });
    },
  });

  // Combine main image with gallery images
  const allImages = product ? [
    { id: 0, imageUrl: product.imageUrl, altText: product.name },
    ...(productImages || [])
  ].filter(img => img.imageUrl) : [];

  if (isLoading) {
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

  if (!product) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-16">
            <Box className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Produto não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O produto que você está procurando não existe ou foi removido.
            </p>
            <Button asChild>
              <Link href="/catalogo">Voltar ao Catálogo</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/catalogo">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-card border border-border">
              {allImages.length > 0 && allImages[selectedImageIndex]?.imageUrl ? (
                <img
                  src={allImages[selectedImageIndex].imageUrl}
                  alt={allImages[selectedImageIndex].altText || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Box className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              
              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
                    onClick={() => setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.imageUrl || ''}
                      alt={image.altText || `Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.isPopular && (
                    <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                  )}
                  {/* Rating Badge */}
                  {ratingData && ratingData.count > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">{ratingData.average.toFixed(1)}</span>
                      <span className="text-muted-foreground">({ratingData.count} avaliações)</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => product && toggleWishlist.mutate({ productId: product.id })}
                disabled={toggleWishlist.isPending}
                className={isInWishlist ? 'text-red-500' : ''}
              >
                <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <p className="text-2xl font-bold text-primary mb-6">
              R$ {parseFloat(product.price).toFixed(2)}
            </p>

            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Quantidade:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stock Info */}
            <p className="text-sm text-muted-foreground mb-6">
              {product.stock > 0 ? (
                <span className="text-green-500">✓ Em estoque ({product.stock} disponíveis)</span>
              ) : (
                <span className="text-red-500">✗ Fora de estoque</span>
              )}
            </p>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 glow-primary"
                onClick={() => addToCart.mutate({ productId: product.id, quantity })}
                disabled={addToCart.isPending || product.stock === 0}
              >
                {addToCart.isPending ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5 mr-2" />
                )}
                Adicionar ao Carrinho
              </Button>
            </div>

            {/* Product Details Card */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Detalhes do Produto</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">SKU</dt>
                    <dd>{product.slug}</dd>
                  </div>
                  {product.materialId && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Material</dt>
                      <dd>PLA (ID: {product.materialId})</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Disponibilidade</dt>
                    <dd>{product.isActive ? "Disponível" : "Indisponível"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Avaliações dos Clientes</h2>

          {/* Write Review Form */}
          {isAuthenticated && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Deixe sua avaliação</h3>
                
                {/* Star Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">Sua nota:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            star <= (hoverRating || newRating)
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  placeholder="Conte sua experiência com este produto..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-4"
                  rows={3}
                />

                <Button
                  onClick={() => createReview.mutate({
                    productId: product.id,
                    rating: newRating,
                    comment: newComment || undefined,
                  })}
                  disabled={createReview.isPending}
                >
                  {createReview.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Enviar Avaliação
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                      
                      {/* Like Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike.mutate({ reviewId: review.id })}
                        disabled={toggleLike.isPending || !isAuthenticated}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{review.likesCount}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Este produto ainda não tem avaliações. Seja o primeiro a avaliar!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
