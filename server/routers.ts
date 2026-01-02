import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// Admin procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // Categories
  categories: router({
    list: publicProcedure.query(async () => {
      return db.getAllCategories();
    }),
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCategory(input);
        return { success: true };
      }),
  }),

  // Products
  products: router({
    list: publicProcedure.query(async () => {
      return db.getAllProducts();
    }),
    listAll: adminProcedure.query(async () => {
      return db.getAllProducts(false);
    }),
    popular: publicProcedure.query(async () => {
      return db.getPopularProducts();
    }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProductById(input.id);
      }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getProductBySlug(input.slug);
      }),
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        price: z.string(),
        imageUrl: z.string().optional(),
        categoryId: z.number().optional(),
        materialId: z.number().optional(),
        stock: z.number().default(0),
        isActive: z.boolean().default(true),
        isPopular: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        await db.createProduct(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        imageUrl: z.string().optional(),
        categoryId: z.number().optional(),
        materialId: z.number().optional(),
        stock: z.number().optional(),
        isActive: z.boolean().optional(),
        isPopular: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // Cart
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getCartItemsWithProducts(ctx.user.id);
    }),
    add: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addToCart(ctx.user.id, input.productId, input.quantity);
        return { success: true };
      }),
    updateQuantity: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        quantity: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateCartItemQuantity(ctx.user.id, input.itemId, input.quantity);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFromCart(ctx.user.id, input.itemId);
        return { success: true };
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // Orders
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrdersByUser(ctx.user.id);
    }),
    listAll: adminProcedure.query(async () => {
      return db.getAllOrders();
    }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Pedido não encontrado' });
        }
        // Check if user owns the order or is admin
        if (order.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),
    create: protectedProcedure
      .input(z.object({
        paymentMethod: z.enum(['whatsapp']),
        customerName: z.string(),
        customerEmail: z.string().email(),
        customerPhone: z.string(),
        shippingAddress: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get cart items
        const cartItems = await db.getCartItemsWithProducts(ctx.user.id);
        if (cartItems.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Carrinho vazio' });
        }

        // Calculate total
        const total = cartItems.reduce((sum, item) => {
          const price = parseFloat(item.product?.price || '0');
          return sum + (price * item.quantity);
        }, 0);

        

        // Create order
        const orderId = await db.createOrder({
          userId: ctx.user.id,
          status: 'pending',
          total: total.toFixed(2),
          paymentMethod: input.paymentMethod,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          shippingAddress: input.shippingAddress,
          notes: input.notes,
        });

        if (!orderId) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao criar pedido' });
        }

        // Create order items
        const orderItems = cartItems.map(item => ({
          orderId,
          productId: item.productId,
          productName: item.product?.name || '',
          productPrice: item.product?.price || '0',
          quantity: item.quantity,
        }));
        await db.createOrderItems(orderItems);

        // Clear cart
        await db.clearCart(ctx.user.id);

        // Generate WhatsApp message if needed
        let whatsappUrl: string | undefined;
        if (input.paymentMethod === 'whatsapp') {
          const itemsList = cartItems.map(item => 
            `• ${item.quantity}x ${item.product?.name} - R$ ${(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)}`
          ).join('\n');
          
          const message = encodeURIComponent(
            `🛒 *Novo Pedido NerdyPrint #${orderId}*\n\n` +
            `*Cliente:* ${input.customerName}\n` +
            `*Email:* ${input.customerEmail}\n` +
            `*Telefone:* ${input.customerPhone}\n\n` +
            `*Endereço de Entrega:*\n${input.shippingAddress}\n\n` +
            `*Itens do Pedido:*\n${itemsList}\n\n` +
            `*Total:* R$ ${total.toFixed(2)}\n\n` +
            (input.notes ? `*Observações:* ${input.notes}` : '')
          );
          whatsappUrl = `https://wa.me/5511953739362?text=${message}`;
        }

        return { 
          success: true, 
          orderId, 
          whatsappUrl,
          total: total.toFixed(2),
        };
      }),
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteOrder(input.id);
        return { success: true };
      }),
    restore: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.restoreOrder(input.id);
        return { success: true };
      })
  }),

  // Generated Models (QR Code 3D, Image to 3D)
  models: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getGeneratedModelsByUser(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        type: z.enum(['qrcode', 'image_to_3d']),
        inputData: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const modelId = await db.createGeneratedModel({
          userId: ctx.user.id,
          type: input.type,
          inputData: input.inputData,
          status: 'pending',
        });
        return { success: true, modelId };
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'processing', 'completed', 'failed']),
        outputUrl: z.string().optional(),
        previewUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateGeneratedModel(id, data);
        return { success: true };
      }),
  }),

  // Product Images (Gallery)
  productImages: router({
    list: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return db.getProductImages(input.productId);
      }),
    add: adminProcedure
      .input(z.object({
        productId: z.number(),
        imageUrl: z.string(),
        altText: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.addProductImage(input);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductImage(input.id);
        return { success: true };
      }),
  }),

  // Reviews
  reviews: router({
    list: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return db.getProductReviews(input.productId);
      }),
    rating: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return db.getProductAverageRating(input.productId);
      }),
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getUserReviewForProduct(ctx.user.id, input.productId);
        if (existing) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Você já avaliou este produto' });
        }
        await db.createReview({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    toggleLike: protectedProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const liked = await db.toggleReviewLike(input.reviewId, ctx.user.id);
        return { success: true, liked };
      }),
    hasLiked: protectedProcedure
      .input(z.object({ reviewId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.hasUserLikedReview(input.reviewId, ctx.user.id);
      }),
  }),

  // Wishlist
  wishlist: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getWishlistWithProducts(ctx.user.id);
    }),
    add: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.addToWishlist(ctx.user.id, input.productId);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFromWishlist(ctx.user.id, input.productId);
        return { success: true };
      }),
    check: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.isInWishlist(ctx.user.id, input.productId);
      }),
  }),

  // Coupons
  coupons: router({
    list: adminProcedure.query(async () => {
      return db.getAllCoupons();
    }),
    validate: publicProcedure
      .input(z.object({ code: z.string(), orderTotal: z.number() }))
      .query(async ({ input }) => {
        return db.validateCoupon(input.code, input.orderTotal);
      }),
    create: adminProcedure
      .input(z.object({
        code: z.string(),
        discountPercent: z.string(),
        maxUses: z.number().optional(),
        minOrderValue: z.string().optional(),
        startsAt: z.date().optional(),
        expiresAt: z.date().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        await db.createCoupon(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        discountPercent: z.string().optional(),
        maxUses: z.number().optional(),
        minOrderValue: z.string().optional(),
        startsAt: z.date().optional(),
        expiresAt: z.date().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCoupon(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCoupon(input.id);
        return { success: true };
      }),
    usageHistory: adminProcedure
      .input(z.object({ couponId: z.number() }))
      .query(async ({ input }) => {
        return db.getCouponUsageHistory(input.couponId);
      }),
  }),

  // Permissions (only owner can manage)
  permissions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.email !== 'mateinorolamento89@gmail.com') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas o proprietário pode gerenciar permissões' });
      }
      return db.getAllPermissions();
    }),
    create: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        canManageProducts: z.boolean().default(false),
        canManageOrders: z.boolean().default(false),
        canManageCoupons: z.boolean().default(false),
        canManageCategories: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.email !== 'mateinorolamento89@gmail.com') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas o proprietário pode gerenciar permissões' });
        }
        await db.createPermission({
          ...input,
          userId: 0, // Will be updated when user logs in
          grantedBy: ctx.user.id,
        });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        canManageProducts: z.boolean().optional(),
        canManageOrders: z.boolean().optional(),
        canManageCoupons: z.boolean().optional(),
        canManageCategories: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.email !== 'mateinorolamento89@gmail.com') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas o proprietário pode gerenciar permissões' });
        }
        const { id, ...data } = input;
        await db.updatePermission(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.email !== 'mateinorolamento89@gmail.com') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas o proprietário pode gerenciar permissões' });
        }
        await db.deletePermission(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
