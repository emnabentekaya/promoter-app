import { MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer style={{
            background: '#F0EBE0',
            color: '#000000',
            padding: '40px 32px 24px',
            marginTop: 60
        }}>
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 32,
                marginBottom: 32
            }}>
                {/* IDENTITÉ */}
                <div>
                    <p style={{
                        margin: 0,
                        fontSize: 10,
                        letterSpacing: '0.2em',
                        color: '#38a9b8',
                        textTransform: 'uppercase',
                        fontWeight: 600
                    }}>
                        Bigdatis
                    </p>
                    <h3 style={{
                        margin: '6px 0 12px',
                        fontSize: 22,
                        fontWeight: 500,
                        color: '#000000',
                        /*fontFamily: 'Fraunces, Georgia, serif'*/
                    }}>
                        Accompagnement immobilier
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#000000' }}>
                        Sélection architecte-curatée de biens immobiliers en Tunisie pour les Tunisiens résidant à l'étranger.
                    </p>
                </div>

                {/* CONTACT */}
                <div>
                    <h4 style={{
                        margin: '0 0 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#000000',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em'
                    }}>
                        Contact
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                        <a href="mailto:contact@bigdatis.tn" style={{ color: '#000000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Mail size={14} color="#38a9b8" /> contact@bigdatis.tn
                        </a>
                        <a href="tel:+21600000000" style={{ color: '#000000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Phone size={14} color="#38a9b8" /> +216 00 000 000
                        </a>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={14} color="#38a9b8" /> Tunis, Tunisie
            </span>
                    </div>
                </div>

                {/* LIENS */}
                <div>
                    <h4 style={{
                        margin: '0 0 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#000000',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em'
                    }}>
                        Liens utiles
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                        <a href="https://bigdatis.tn" target="_blank" rel="noreferrer" style={{ color: '#000000', textDecoration: 'none' }}>Site public</a>
                        <a href="#" style={{ color: '#000000', textDecoration: 'none' }}>Mentions légales</a>
                        <a href="#" style={{ color: '#000000', textDecoration: 'none' }}>Politique de confidentialité</a>
                    </div>
                </div>
            </div>

            {/* COPYRIGHT */}
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                paddingTop: 20,
                borderTop: '1px solid #3A332D',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                fontSize: 12,
                color: '#000000'
            }}>
                <span>© {year} Bigdatis. Tous droits réservés.</span>
                <span>Espace réservé aux architectes partenaires</span>
            </div>
        </footer>
    );
}