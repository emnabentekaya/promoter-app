import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadBuildings } from '../../services/buildingsService';
import type { Building } from '../../models/building';
import ClientsPage from './ClientsPage';
import { NavBar } from '../NavBarComponent/NavBarComponent';

export default function ClientsPageRoute() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadBuildings().then(setBuildings);
    const reload = () => loadBuildings().then(setBuildings);
    const id = setInterval(reload, 30_000);
    window.addEventListener('focus', reload);
    return () => { clearInterval(id); window.removeEventListener('focus', reload); };
  }, []);

  return (
    <>
      <NavBar
        onConsultBuildings={() => navigate('/')}
        onBrowseCatalog={() => navigate('/catalog')}
        onConsultClients={() => {}}
        onStartSelection={() => navigate('/')}
        activeView="clients"
      />
      <div style={{ minHeight: '100vh', background: '#FAF8F3', fontFamily: '"Inter", system-ui, sans-serif', color: '#1F1B17' }}>
        <ClientsPage
          buildings={buildings}
          onBack={() => navigate('/')}
          onOpenApartment={(bId, aId) => navigate('/', { state: { buildingId: bId, apartmentId: aId } })}
        />
      </div>
    </>
  );
}
