import {Building2, LogOut, Search, Users} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type {NavBarProps} from "../../models/NavBarProps.ts";
import {authService} from "../../services/authService.ts";

import './NavBarComponent.css';
//import type {BuildingListProps} from "../../models/buildingListProp.ts";

export function NavBar({ activeView}: NavBarProps) {
    const navBtnStyle = (isActive: boolean): React.CSSProperties => ({
        background: isActive ? '#1F1B17' : 'transparent',
        color: isActive ? 'white' : '#1F1B17',
        border: 'none',
        padding: '10px 18px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'inherit',
        transition: 'all 0.15s'
    });
    const navigate = useNavigate();
    /*const handleLogout = async () => {
        await authService.logout(); // remove token + call backend
        navigate('/login');         // redirect user
    };*/

    return (
        <nav>
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
                flexWrap: 'wrap'
            }}>
                {/* LOGO + IDENTITÉ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #38a9b8 0%, #2d8a98 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Building2 size={22} color="white" strokeWidth={1.8} />
                    </div>
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

                    </div>
                    <p className="nav-title" style={{
                        margin: 20,
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#1F1B17',
                    }}>
                        Espace architecte
                    </p>
                </div>


                {/* BOUTONS */}
                <div  style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {/*<button className="btn-secondary nav-btn" onClick={onStartSelection}><Sparkles size={16} /> Sélection client</button>*/}
                    <button className="nav-btn"
                        style={navBtnStyle(activeView === 'buildings')}
                        onClick={() => navigate('/')}

                        /*onClick={onConsultBuildings}
                        onMouseEnter={e => { if (activeView !== 'buildings') e.currentTarget.style.background = '#F0EBE0'; }}
                        onMouseLeave={e => { if (activeView !== 'buildings') e.currentTarget.style.background = 'transparent'; }}*/

                    >
                        <Building2 size={16} /> Consulter Projets
                    </button>
                    <button className="nav-btn"
                        style={navBtnStyle(activeView === 'catalog')}
                        onClick={() => navigate('/catalog')}
                        /*onClick={onBrowseCatalog}
                        onMouseEnter={e => { if (activeView !== 'catalog') e.currentTarget.style.background = '#F0EBE0'; }}
                        onMouseLeave={e => { if (activeView !== 'catalog') e.currentTarget.style.background = 'transparent'; }}*/
                    >
                        <Search size={16} /> Explorer le catalogue
                    </button>
                    <button className="nav-btn"
                        style={navBtnStyle(activeView === 'clients')}
                        onClick={() => navigate('/clients')}
                        /*onClick={onConsultClients}
                        onMouseEnter={e => { if (activeView !== 'clients') e.currentTarget.style.background = '#F0EBE0'; }}
                        onMouseLeave={e => { if (activeView !== 'clients') e.currentTarget.style.background = 'transparent'; }}*/
                    >
                        <Users size={16} /> Consulter clients
                    </button>
                    <button className="logout-btn" onClick={() => {authService.logout();navigate('/login');}} title="Se déconnecter">
                        <LogOut size={14} /> Déconnexion
                    </button>
                </div>
            </div>
        </nav>
    );
}
export default NavBar;