import { createTRPCRouter, createCallerFactory } from './trpc';
import { productRouter } from './routers/product';
import { vendorRouter } from './routers/vendor';
import { orderRouter } from './routers/order';
import { userRouter } from './routers/user';
import { paymentRouter } from './routers/payment';
import { adminRouter } from './routers/admin';

export const appRouter = createTRPCRouter({
  product: productRouter,
  vendor: vendorRouter,
  order: orderRouter,
  user: userRouter,
  payment: paymentRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
