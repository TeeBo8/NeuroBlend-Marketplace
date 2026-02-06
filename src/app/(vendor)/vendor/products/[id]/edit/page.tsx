import type { Metadata } from 'next';
import { EditProductContent } from './edit-product-content';

export const metadata: Metadata = {
  title: 'Modifier le produit',
  description: 'Modifiez votre produit sur NeuroBlend',
};

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <EditProductContent paramsPromise={params} />;
}
