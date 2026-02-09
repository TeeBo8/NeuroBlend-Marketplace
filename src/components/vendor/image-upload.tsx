'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadDropzone } from '@/lib/uploadthing';
import { toast } from 'sonner';

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
};

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  if (value) {
    return (
      <div className="space-y-3">
        <div className="relative w-40 h-40 rounded-lg overflow-hidden bg-muted border">
          <Image
            src={value}
            alt="Image produit"
            fill
            className="object-cover"
            sizes="160px"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-7 w-7"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint="productImage"
      onClientUploadComplete={(res) => {
        if (res?.[0]) {
          onChange(res[0].ufsUrl);
          toast.success('Image uploadée');
        }
      }}
      onUploadError={(error) => {
        toast.error(`Erreur: ${error.message}`);
      }}
      appearance={{
        container:
          'border-2 border-dashed border rounded-lg bg-muted/50 hover:bg-accent transition-colors cursor-pointer ut-uploading:border-primary/60',
        label: 'text-muted-foreground hover:text-primary',
        allowedContent: 'text-muted-foreground text-xs',
        button:
          'bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2 rounded-md ut-uploading:bg-primary/60',
      }}
      content={{
        label: 'Glissez une image ou cliquez pour parcourir',
        allowedContent: 'Images (JPG, PNG, WebP) - Max 4MB',
      }}
    />
  );
}
