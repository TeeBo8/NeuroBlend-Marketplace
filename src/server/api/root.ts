import { createTRPCRouter, createCallerFactory } from './trpc';
import { productRouter } from './routers/product';
import { vendorRouter } from './routers/vendor';
import { orderRouter } from './routers/order';
import { userRouter } from './routers/user';
import { paymentRouter } from './routers/payment';
import { adminRouter } from './routers/admin';
import { reviewRouter } from './routers/review';
import { subscriptionRouter } from './routers/subscription';

export const appRouter = createTRPCRouter({
  product: productRouter,
  vendor: vendorRouter,
  order: orderRouter,
  user: userRouter,
  payment: paymentRouter,
  admin: adminRouter,
  review: reviewRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
