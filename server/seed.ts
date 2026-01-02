import { drizzle } from "drizzle-orm/mysql2";
import { products, categories } from "../drizzle/schema";

const initialCategories = [
  { name: "Colecionáveis", slug: "colecionaveis", description: "Figuras e itens colecionáveis impressos em 3D" },
  { name: "Utilitários", slug: "utilitarios", description: "Itens úteis para o dia a dia" },
  { name: "Decoração", slug: "decoracao", description: "Itens decorativos para sua casa" },
  { name: "Personalizados", slug: "personalizados", description: "Modelos personalizados sob demanda" },
];

const initialProducts = [
  {
    name: "Pop do IT - Pennywise",
    slug: "pop-it-pennywise",
    description: "Figura colecionável do Pennywise, o palhaço assustador do filme IT. Perfeito para fãs de horror e colecionadores de Funko Pop. Impressão em PLA com detalhes bem definidos e acabamento profissional.",
    price: "89.90",
    imageUrl: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=500",
    materialId: 11,
    stock: 50,
    isActive: true,
    isPopular: true,
  },
  {
    name: "Suporte para Lata com Capuz",
    slug: "suporte-lata-capuz",
    description: "Suporte criativo para latas de bebida com design de capuz. Mantém sua bebida estilosa e protegida. Impressão em PLA de alta qualidade.",
    price: "45.00",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
    materialId: 11,
    stock: 100,
    isActive: true,
    isPopular: true,
  },
  {
    name: "Baby Yoda - Grogu",
    slug: "baby-yoda-grogu",
    description: "Figura do adorável Grogu (Baby Yoda) da série The Mandalorian. Detalhes impressionantes e acabamento premium.",
    price: "79.90",
    imageUrl: "https://images.unsplash.com/photo-1584824388878-91b2fba4e5e9?w=500",
    materialId: 11,
    stock: 30,
    isActive: true,
    isPopular: true,
  },
  {
    name: "Vaso Geométrico Moderno",
    slug: "vaso-geometrico",
    description: "Vaso decorativo com design geométrico moderno. Perfeito para plantas pequenas ou suculentas. Disponível em várias cores.",
    price: "35.00",
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500",
    materialId: 11,
    stock: 80,
    isActive: true,
    isPopular: false,
  },
  {
    name: "Organizador de Mesa",
    slug: "organizador-mesa",
    description: "Organizador de mesa com compartimentos para canetas, clips e pequenos objetos. Design minimalista e funcional.",
    price: "55.00",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500",
    materialId: 11,
    stock: 60,
    isActive: true,
    isPopular: false,
  },
  {
    name: "Luminária Lua 3D",
    slug: "luminaria-lua-3d",
    description: "Luminária em formato de lua com textura realista. LED incluso com 3 intensidades de luz. Perfeita para decoração de quartos.",
    price: "120.00",
    imageUrl: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=500",
    materialId: 11,
    stock: 25,
    isActive: true,
    isPopular: true,
  },
  {
    name: "Chaveiro Personalizado",
    slug: "chaveiro-personalizado",
    description: "Chaveiro personalizado com seu nome ou frase. Escolha a cor e o texto. Impressão de alta qualidade.",
    price: "15.00",
    imageUrl: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=500",
    materialId: 11,
    stock: 200,
    isActive: true,
    isPopular: false,
  },
  {
    name: "Suporte para Headset",
    slug: "suporte-headset",
    description: "Suporte elegante para headset gamer. Design robusto e estável. Compatível com todos os tamanhos de headset.",
    price: "65.00",
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500",
    materialId: 11,
    stock: 45,
    isActive: true,
    isPopular: true,
  },
];

export async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    return;
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("Seeding categories...");
  for (const category of initialCategories) {
    try {
      await db.insert(categories).values(category);
      console.log(`  Created category: ${category.name}`);
    } catch (e: any) {
      if (e.code === 'ER_DUP_ENTRY') {
        console.log(`  Category already exists: ${category.name}`);
      } else {
        throw e;
      }
    }
  }

  console.log("Seeding products...");
  for (const product of initialProducts) {
    try {
      await db.insert(products).values(product);
      console.log(`  Created product: ${product.name}`);
    } catch (e: any) {
      if (e.code === 'ER_DUP_ENTRY') {
        console.log(`  Product already exists: ${product.name}`);
      } else {
        throw e;
      }
    }
  }

  console.log("Seed completed!");
}

// Run if called directly
seedDatabase().catch(console.error);
