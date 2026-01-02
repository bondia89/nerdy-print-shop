import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  Zap, 
  Shield, 
  Truck, 
  Box, 
  QrCode, 
  Image, 
  ShoppingCart,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const { data: popularProducts, isLoading } = trpc.products.popular.useQuery();

  const features = [
    {
      icon: Zap,
      title: "Criação Rápida",
      description: "Modelos prontos para impressão em minutos"
    },
    {
      icon: Shield,
      title: "Qualidade Garantida",
      description: "Impressões em PLA de alta qualidade"
    },
    {
      icon: Truck,
      title: "Entrega Rápida",
      description: "Enviamos para todo o Brasil"
    }
  ];

  const tools = [
    {
      icon: QrCode,
      title: "QR Code 3D",
      description: "Crie QR codes em modelos 3D únicos para impressão",
      href: "/qrcode-3d",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Image,
      title: "Imagem para 3D",
      description: "Transforme suas imagens em modelos 3D personalizados",
      href: "/imagem-para-3d",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Transforme suas ideias em realidade
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Impressão 3D{" "}
              <span className="gradient-text">Personalizada</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              Descubra modelos 3D prontos para impressão, transforme suas imagens em 
              modelos personalizados e crie QR codes em 3D únicos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="glow-primary" asChild>
                <Link href="/catalogo">
                  <Box className="h-5 w-5 mr-2" />
                  Explorar Modelos
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/imagem-para-3d">
                  <Image className="h-5 w-5 mr-2" />
                  Imagem para 3D
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Por que escolher a NerdyPrint?</h2>
            <p className="text-muted-foreground">
              Tudo que você precisa para impressão 3D em um só lugar
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Modelos Populares</h2>
              <p className="text-muted-foreground">Os modelos mais populares da semana</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/catalogo">
                Ver Todos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularProducts?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Maker Tools Section */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ferramentas Maker</h2>
            <p className="text-muted-foreground">
              Crie modelos 3D personalizados com nossas ferramentas
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {tools.map((tool, index) => (
              <Link key={index} href={tool.href}>
                <Card className="group h-full bg-card border-border hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
                  <CardContent className="p-6 relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    <div className="relative">
                      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                        <tool.icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-muted-foreground">{tool.description}</p>
                      <div className="mt-4 flex items-center text-primary text-sm font-medium">
                        Começar
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 p-8 md:p-12">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para criar seu modelo 3D?
              </h2>
              <p className="text-muted-foreground mb-6">
                Explore nosso catálogo ou use nossas ferramentas para criar modelos personalizados.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="glow-primary" asChild>
                  <Link href="/catalogo">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Ver Catálogo
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="https://wa.me/5511953739362" target="_blank" rel="noopener noreferrer">
                    Falar no WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Product Card Component
function ProductCard({ product }: { product: any }) {
  const utils = trpc.useUtils();
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all">
      <Link href={`/produto/${product.slug}`}>
        <div className="aspect-square overflow-hidden bg-muted relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Box className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {product.isPopular && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              Popular
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-primary font-bold">
            R$ {parseFloat(product.price).toFixed(2)}
          </span>
          {product.isPopular && (
            <Badge variant="secondary" className="text-xs">Popular</Badge>
          )}
        </div>
        <Button 
          className="w-full mt-3 glow-primary"
          onClick={(e) => {
            e.preventDefault();
            addToCart.mutate({ productId: product.id });
          }}
          disabled={addToCart.isPending}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Comprar
        </Button>
      </CardContent>
    </Card>
  );
}
