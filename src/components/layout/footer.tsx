import Link from 'next/link';
import { Coffee } from 'lucide-react';
import { APP_NAME, FOOTER_LINKS } from '@/lib/constants';

const footerSections = [
  { title: 'Marketplace', links: FOOTER_LINKS.marketplace },
  { title: 'Support', links: FOOTER_LINKS.support },
  { title: 'Légal', links: FOOTER_LINKS.legal },
  { title: 'Vendeurs', links: FOOTER_LINKS.vendor },
] as const;

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              Capsules de café artisanales conçues pour les esprits neuroatypiques.
              HPI, ADHD, Hypersensibles.
            </p>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
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
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.
          </p>
          <p className="text-sm text-gray-400">
            Fait avec ☕ pour les esprits extraordinaires
          </p>
        </div>
      </div>
    </footer>
  );
}
