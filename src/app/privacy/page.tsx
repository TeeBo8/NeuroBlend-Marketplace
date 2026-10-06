import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';
import { PageHero } from '@/components/layout/page-hero';
import { DemoNotice } from '@/components/demo/demo-notice';
import { siteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité de NeuroBlend. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Politique de confidentialité">
        Dernière mise à jour : 7 février 2026
      </PageHero>
      <DemoNotice />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl rich-text">
          <h2>1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données personnelles collectées sur
            le site {APP_NAME} est la société {APP_NAME}, accessible à
            l&apos;adresse{' '}
            <a href={siteUrl}>{new URL(siteUrl).host}</a>
            .
          </p>

          <h2>2. Données collectées</h2>
          <p>Nous collectons les données suivantes :</p>
          <ul>
            <li>
              <strong>Données d&apos;identification :</strong> nom, prénom,
              adresse email, mot de passe (hashé)
            </li>
            <li>
              <strong>Données de commande :</strong> adresse de livraison,
              historique d&apos;achats
            </li>
            <li>
              <strong>Données de paiement :</strong> traitées directement par
              Stripe (nous ne stockons aucune donnée bancaire)
            </li>
            <li>
              <strong>Données de navigation :</strong> cookies techniques
              nécessaires au fonctionnement du site
            </li>
          </ul>

          <h2>3. Finalités du traitement</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>La création et la gestion de votre compte</li>
            <li>Le traitement de vos commandes et abonnements</li>
            <li>La communication relative à vos commandes (emails transactionnels)</li>
            <li>L&apos;amélioration de nos services et de votre expérience utilisateur</li>
          </ul>

          <h2>4. Base légale</h2>
          <p>
            Le traitement de vos données repose sur : l&apos;exécution du contrat
            (commandes), votre consentement (cookies non essentiels),
            et notre intérêt légitime (amélioration du service, sécurité).
          </p>

          <h2>5. Partage des données</h2>
          <p>
            Vos données peuvent être partagées avec les prestataires suivants,
            strictement dans le cadre des finalités décrites :
          </p>
          <ul>
            <li>
              <strong>Stripe :</strong> traitement des paiements
            </li>
            <li>
              <strong>Neon (PostgreSQL) :</strong> hébergement de la base de données
            </li>
            <li>
              <strong>Vercel :</strong> hébergement du site
            </li>
            <li>
              <strong>Resend :</strong> envoi d&apos;emails transactionnels
            </li>
          </ul>
          <p>
            Nous ne vendons jamais vos données personnelles à des tiers.
          </p>

          <h2>6. Durée de conservation</h2>
          <p>
            Vos données sont conservées pendant la durée de votre compte actif,
            puis 3 ans après votre dernière activité. Les données de facturation
            sont conservées 10 ans conformément aux obligations légales.
          </p>

          <h2>7. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul>
            <li>Droit d&apos;accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement (&laquo;&nbsp;droit à l&apos;oubli&nbsp;&raquo;)</li>
            <li>Droit à la portabilité</li>
            <li>Droit d&apos;opposition</li>
            <li>Droit à la limitation du traitement</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:contact@neuroblend.fr">contact@neuroblend.fr</a> ou
            via notre <a href="/contact">page de contact</a>.
          </p>

          <h2>8. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles
            appropriées pour protéger vos données : chiffrement HTTPS,
            mots de passe hashés, accès restreint aux données, hébergement
            sécurisé.
          </p>

          <h2>9. Cookies</h2>
          <p>
            Pour en savoir plus sur notre utilisation des cookies, consultez
            notre <a href="/cookies">Politique Cookies</a>.
          </p>

          <h2>10. Contact</h2>
          <p>
            Pour toute question relative à cette politique, contactez-nous à{' '}
            <a href="mailto:contact@neuroblend.fr">contact@neuroblend.fr</a>.
          </p>
          <p>
            Vous pouvez également adresser une réclamation à la CNIL :{' '}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.cnil.fr
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
