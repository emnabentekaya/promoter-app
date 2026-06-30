import type { ClientCriteria } from '../models/clientCriteria.ts';
import type { MatchedApartment } from '../services/matchAppartmentService.ts';
import { propertyLabel, formatPrice, formatFloor, hasParentalSuite, hasTerrace, hasFunctionalTerrace } from '../utils/helpers.ts';

function generateSynthesisHTML(criteria: ClientCriteria, matches: MatchedApartment[]): string {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const aptsHtml = matches.map(m => {
    const pricePerM2 = m.apartment.price && m.apartment.surface ? Math.round(parseInt(m.apartment.price) / parseInt(m.apartment.surface)) : 0;
    const roomsList = m.apartment.rooms.map(r => `${r.name || (r.isSuite ? 'Suite' : 'Chambre')}${r.surface ? ` (${r.surface}m²)` : ''}${r.orientation ? ` · ${r.orientation}` : ''}`).join(' · ');
    return `<div class="apt-card">
      <div class="apt-header">
        <div>
          <span class="type-tag ${m.apartment.propertyType}">${propertyLabel(m.apartment.propertyType)}</span>
          <span class="apt-typo">${m.apartment.typology} · ${m.building.city}</span>
          <h2 class="serif apt-title">${m.building.name} — Réf. ${m.apartment.reference}</h2>
          <div class="apt-meta">${m.building.neighborhood} · ${formatFloor(m.apartment)} · Livraison ${m.building.handoverDate ? new Date(m.building.handoverDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—'}</div>
        </div>
        <div style="text-align:right;">
          <div class="apt-price">${formatPrice(m.apartment.price)}</div>
          <div class="apt-price-sub">${m.apartment.surface} m² · ${pricePerM2.toLocaleString('fr-FR')} TND/m²</div>
          ${m.happiness > 0 ? `<div class="happiness">${m.happiness}/100</div>` : ''}
        </div>
      </div>
      <div class="apt-feats">
        ${hasParentalSuite(m.apartment) ? '<div class="apt-feat">✓ <strong>Suite parentale</strong></div>' : ''}
        ${hasTerrace(m.apartment) ? `<div class="apt-feat">✓ <strong>Terrasse</strong>${hasFunctionalTerrace(m.apartment) ? ' (fonctionnelle)' : ''}</div>` : ''}
        ${m.apartment.hasGarden ? '<div class="apt-feat">✓ <strong>Jardin</strong></div>' : ''}
        ${m.apartment.hasCellier ? '<div class="apt-feat">✓ <strong>Cellier</strong></div>' : ''}
        ${m.apartment.dayNightSeparation ? '<div class="apt-feat">✓ <strong>Sép. jour/nuit</strong></div>' : ''}
        <div class="apt-feat"><strong>Cuisine</strong> ${m.apartment.kitchen.kitchenType}</div>
        <div class="apt-feat"><strong>Entrée</strong> ${m.apartment.entranceType}</div>
        <div class="apt-feat"><strong>Promoteur</strong> ${m.building.developer}</div>
      </div>
      ${roomsList ? `<div class="rooms-detail"><strong>Composition :</strong> ${roomsList}</div>` : ''}
      ${m.apartment.freeNote ? `<div class="apt-note">« ${m.apartment.freeNote} »</div>` : ''}
      ${m.reasons.length > 0 ? `<div style="margin-top:10px;">${m.reasons.map(r => `<span class="pill">${r}</span>`).join('')}</div>` : ''}
    </div>`;
  }).join('');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Synthèse - ${criteria.clientName || 'Client'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; color: #1F1B17; margin: 0; line-height: 1.5; font-size: 12pt; }
  .serif { font-family: 'Playfair Display', Georgia, serif; }
  .cover { padding: 40px 0; border-bottom: 1px solid #E8DFD0; margin-bottom: 30px; }
  .cover-label { font-size: 10pt; letter-spacing: 0.2em; color: #38a9b8; text-transform: uppercase; font-weight: 600; }
  .cover-title { font-size: 36pt; margin: 12px 0 8px; font-weight: 500; line-height: 1.1; }
  .cover-meta { color: #413e39; font-size: 11pt; }
  .section-label { font-size: 9pt; letter-spacing: 0.15em; color: #38a9b8; text-transform: uppercase; font-weight: 600; margin: 24px 0 12px; }
  .apt-card { border: 1px solid #E8DFD0; border-radius: 10px; padding: 20px; margin-bottom: 16px; page-break-inside: avoid; }
  .apt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #E8DFD0; gap: 16px; }
  .apt-title { font-size: 18pt; font-weight: 500; margin: 6px 0 0; }
  .apt-typo { font-size: 9pt; letter-spacing: 0.1em; color: #38a9b8; text-transform: uppercase; font-weight: 600; }
  .apt-meta { margin-top: 6px; font-size: 10pt; color: #6B6358; }
  .apt-price { font-size: 16pt; font-weight: 600; }
  .apt-price-sub { font-size: 9pt; color: #6B6358; }
  .happiness { font-size: 11pt; color: #38a9b8; font-weight: 600; margin-top: 6px; }
  .apt-feats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 16px; font-size: 10pt; margin-bottom: 10px; }
  .apt-feat { color: #6B6358; }
  .apt-feat strong { color: #1F1B17; font-weight: 500; }
  .apt-note { background: #FAF8F3; padding: 10px 12px; border-left: 3px solid #38a9b8; border-radius: 4px; font-size: 10pt; font-style: italic; margin-top: 8px; }
  .rooms-detail { font-size: 10pt; color: #6B6358; margin-top: 8px; }
  .rooms-detail strong { color: #1F1B17; }
  .pill { display: inline-block; padding: 2px 8px; background: #FAF8F3; color: #38a9b8; border-radius: 10px; font-size: 9pt; margin: 2px; }
  .type-tag { display: inline-block; padding: 3px 9px; border-radius: 6px; font-size: 9pt; font-weight: 600; text-transform: uppercase; margin-right: 8px; }
  .type-tag.appartement { background: #EDE6D6; color: #6B5634; }
  .type-tag.duplex { background: #D8DCE5; color: #2D3E5C; }
  .type-tag.triplex { background: #E5D8E0; color: #5C2D4E; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8DFD0; font-size: 9pt; color: #6B6358; text-align: center; }
  .footer-brand { font-size: 11pt; color: #38a9b8; font-weight: 600; margin-bottom: 4px; }
  @media print { .no-print { display: none; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
  <div class="no-print" style="position:fixed;top:16px;right:16px;z-index:99;">
    <button onclick="window.print()" style="background:#38a9b8;color:white;border:none;padding:12px 20px;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;font-weight:500;">📄 Télécharger / Imprimer PDF</button>
  </div>
  <div class="cover">
    <div class="cover-label">Synthèse de sélection immobilière</div>
    <h1 class="serif cover-title">${criteria.clientName ? `Pour ${criteria.clientName}` : 'Votre sélection'}</h1>
    <p class="cover-meta">Établie le ${today} · ${matches.length} bien${matches.length > 1 ? 's' : ''}</p>
  </div>
  <div class="section-label">Notre sélection</div>
  ${aptsHtml}
  <div class="footer">
    <div>Chaque bien a été visité par notre architecte. Document confidentiel.</div>
    <div style="margin-top:8px;">Généré le ${today}</div>
  </div>
</body></html>`;
}
export default generateSynthesisHTML;