import Link from 'next/link';
import { Coffee, Instagram, Linkedin, Youtube } from 'lucide-react';
import { APP_NAME, FOOTER_LINKS } from '@/lib/constants';
import { isDemo } from '@/lib/demo';

const footerSections = [
  { title: 'Marketplace', links: FOOTER_LINKS.marketplace },
  { title: 'Support', links: FOOTER_LINKS.support },
  { title: 'Légal', links: FOOTER_LINKS.legal },
  { title: 'Vendeurs', links: FOOTER_LINKS.vendor },
] as const;

const SOCIAL_LINKS = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
] as const;

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Coffee className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Capsules de café artisanales conçues pour les esprits neuroatypiques.
              HPI, ADHD, Hypersensibles.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {isDemo
              ? `Démonstration technique · ${APP_NAME} est une marque fictive, aucune commande n'est livrée`
              : `© ${new Date().getFullYear()} ${APP_NAME}. Tous droits réservés.`}
          </p>
          <p className="text-sm text-muted-foreground">
            Nos cafés ne sont pas des produits de santé
          </p>
        </div>
      </div>
    </footer>
  );
}
