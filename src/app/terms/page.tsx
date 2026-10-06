import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';
import { PageHero } from '@/components/layout/page-hero';
import { DemoNotice } from '@/components/demo/demo-notice';

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description:
    'Conditions générales de vente de NeuroBlend. Informations sur les commandes, paiements, livraisons et responsabilités.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="Conditions générales de vente">
        Dernière mise à jour : 7 février 2026
      </PageHero>
      <DemoNotice />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl rich-text">
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les
            relations contractuelles entre {APP_NAME}, plateforme de marketplace
            de capsules de café artisanales, et tout utilisateur effectuant un
            achat sur le site.
          </p>
          <p>
            {APP_NAME} agit en tant qu&apos;intermédiaire entre les acheteurs et
            les torréfacteurs vendeurs. Chaque vente est conclue directement
            entre l&apos;acheteur et le vendeur concerné.
          </p>

          <h2>2. Produits</h2>
          <p>
            Les produits proposés sur {APP_NAME} sont des capsules de café
            artisanales créées par des torréfacteurs indépendants. Chaque
            vendeur est responsable de la description, de la qualité et de la
            conformité de ses produits.
          </p>
          <p>
            Les photos et descriptions des produits sont fournies à titre
            indicatif. Des variations mineures peuvent exister.
          </p>

          <h2>3. Prix</h2>
          <p>
            Les prix sont indiqués en euros TTC (toutes taxes comprises). Les
            frais de livraison sont indiqués séparément avant la validation de
            la commande. {APP_NAME} se réserve le droit de modifier ses prix à
            tout moment, sans effet sur les commandes déjà validées.
          </p>

          <h2>4. Commande</h2>
          <p>
            Le processus de commande comprend les étapes suivantes :
          </p>
          <ol>
            <li>Sélection des produits et ajout au panier</li>
            <li>Vérification du panier et saisie de l&apos;adresse de livraison</li>
            <li>Choix du mode de livraison</li>
            <li>Paiement sécurisé via Stripe</li>
            <li>Confirmation de commande par email</li>
          </ol>
          <p>
            La validation de la commande vaut acceptation des présentes CGV.
          </p>

          <h2>5. Paiement</h2>
          <p>
            Le paiement est effectué en ligne via la plateforme sécurisée
            Stripe. Les moyens de paiement acceptés incluent les cartes
            bancaires (Visa, Mastercard). {APP_NAME} ne stocke aucune donnée
            bancaire.
          </p>

          <h2>6. Commission</h2>
          <p>
            {APP_NAME} prélève une commission de 15% sur chaque vente réalisée
            via la plateforme. Cette commission est déduite automatiquement du
            montant reversé au vendeur.
          </p>

          <h2>7. Livraison</h2>
          <p>
            Les délais de livraison sont indiqués sur la page{' '}
            <a href="/shipping">Livraison</a> et sont donnés à titre indicatif.
            {APP_NAME} ne saurait être tenu responsable des retards
            imputables au transporteur.
          </p>

          <h2>8. Droit de rétractation</h2>
          <p>
            Conformément à l&apos;article L221-18 du Code de la consommation,
            vous disposez d&apos;un délai de 14 jours à compter de la réception
            de votre commande pour exercer votre droit de rétractation, sans
            avoir à motiver votre décision.
          </p>
          <p>
            Ce droit ne s&apos;applique pas aux produits descellés après
            livraison et ne pouvant être renvoyés pour des raisons d&apos;hygiène
            (capsules ouvertes).
          </p>

          <h2>9. Responsabilité</h2>
          <p>
            En tant que place de marché, {APP_NAME} met en relation les
            acheteurs et les vendeurs. La responsabilité de la conformité des
            produits incombe au vendeur. {APP_NAME} s&apos;engage à retirer tout
            produit signalé comme non conforme après vérification.
          </p>

          <h2>10. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments du site {APP_NAME} (textes, images, logo,
            design) sont protégés par le droit de la propriété intellectuelle.
            Toute reproduction est interdite sans autorisation.
          </p>

          <h2>11. Droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige,
            les tribunaux compétents seront ceux du ressort du siège social de{' '}
            {APP_NAME}, sauf disposition légale impérative contraire.
          </p>

          <h2>12. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGV, contactez-nous à{' '}
            <a href="mailto:contact@neuroblend.example">contact@neuroblend.example</a> ou
            via notre <a href="/contact">page de contact</a>.
          </p>
        </div>
      </section>
    </>
  );
}
