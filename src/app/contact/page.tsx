import type { Metadata } from 'next';
import { Mail, MessageCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez l\u2019équipe NeuroBlend. Une question, une suggestion ou un partenariat ? Nous sommes à votre écoute.',
};

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    description: 'contact@neuroblend.fr',
    detail: 'Réponse sous 24-48h',
  },
  {
    icon: MessageCircle,
    title: 'Chat',
    description: 'Chatbot disponible 24/7',
    detail: 'Cliquez sur la bulle en bas à droite',
  },
  {
    icon: Clock,
    title: 'Horaires',
    description: 'Lun-Ven, 9h-18h',
    detail: 'Heure de Paris (CET)',
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-indigo-800 text-primary-foreground">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Une question, une idée, un partenariat ? Nous sommes à votre écoute.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {contactInfo.map((info) => (
              <Card key={info.title}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {info.title}
                  </h3>
                  <p className="text-primary font-medium text-sm mb-1">
                    {info.description}
                  </p>
                  <p className="text-xs text-muted-foreground">{info.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Envoyez-nous un message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
