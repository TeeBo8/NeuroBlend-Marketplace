import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/server/auth/config';
import { headers } from 'next/headers';
import { isDemo } from '@/lib/demo';

const f = createUploadthing();

export const uploadRouter = {
  productImage: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      if (isDemo) {
        throw new UploadThingError('Envoi désactivé dans la démonstration');
      }

      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        throw new UploadThingError('Non autorisé');
      }

      // L'upload sert aux photos de produits : réservé aux vendeurs et aux admins.
      const { role } = session.user as { role?: string };
      if (role !== 'vendor' && role !== 'admin') {
        throw new UploadThingError('Réservé aux vendeurs');
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
