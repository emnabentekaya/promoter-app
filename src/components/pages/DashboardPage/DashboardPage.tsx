
import BuildingList from "../../buildingList.tsx";
import {emptyCriteria} from "../../../factory/factory.ts";
import BuildingForm from "../../buildingForm.tsx";
import BuildingDetail from "../../buildingDetail.tsx";
import ApartmentForm from "../../apartmentForm.tsx";
import {useEffect, useRef, useState} from "react";
import type {ClientCriteria} from "../../../models/clientCriteria.ts";
import {useNavigate, useLocation} from "react-router-dom";
import type {Building} from "../../../models/building.ts";
import {loadBuildings, saveBuildings} from "../../../services/buildingsService.ts";
import type {Apartment} from "../../../models/apartment.ts";
import SelectionCriteria from "../../SelectionCriteria.tsx";
import SelectionResults from "../../SelectionResult.tsx";
import {NavBar} from "../../NavBarComponent/NavBarComponent.tsx";
import {addBuilding, destroyBuilding,updateBuilding} from "../../../api/buildingApi.ts";
//import {build} from "vite";

export default function DashboardPage(){
    type View = 'list' | 'building-form' | 'building-detail' | 'apartment-form' | 'selection-criteria' | 'selection-results' | 'clients';
    const location = useLocation();
    const navState = location.state as { buildingId?: string; apartmentId?: string } | null;
    const [view, setView] = useState<View>(navState?.buildingId ? 'apartment-form' : 'list');
    const [activeBuildingId, setActiveBuildingId] = useState<string | null>(navState?.buildingId ?? null);
    const [editingApartmentId, setEditingApartmentId] = useState<string | null>(navState?.apartmentId ?? null);
    const [criteria, setCriteria] = useState<ClientCriteria>(emptyCriteria());

    /*const saveBuilding = (b: Building) => {
        setBuildings(prev => {
            const exists = prev.find(p => p.id === b.id);
            if (exists) return prev.map(p => p.id === b.id ? b : p);
            return [...prev, b];
        });
        setActiveBuildingId(b.id);
        setView('building-detail');
        // Save individual building to backend
        saveBuildings(b);
    };*/
    // const refreshBuildings = async () => {
    //     const buildings = await loadBuildings();
    //     setBuildings(buildings);
    //  };
    const saveBuilding = async (building: Building) => {
        //console.log(addBuilding(building));
        return addBuilding(building);

        //await refreshBuildings();
    };

    const deleteBuilding = async (id: string) => {
        if (!confirm('Supprimer ce projet ?')) return;
        await destroyBuilding(id);
        //setBuildings(prev => prev.filter(b => b.id !== id));
        setView('list');
    };
    // const deleteBuilding = (id: string) => {
    //     if (confirm('Supprimer ce projet ?')){
    //         await destroyBuilding(id);
    //         //setBuildings(prev => prev.filter(b => b.id !== id));
    //         setView('list');}
    //
    // };


    // const autoSaveBuilding = (b: Building) => {
    //     setBuildings(prev => prev.map(p => p.id === b.id ? b : p));
    //     // Auto-save individual building to backend
    //     saveBuildings(b);
    // };
    const autoSaveBuilding = async (b: Building) => {
        if (b.id)
        {
            return await updateBuilding(b);}
        else
        {
            return await addBuilding(b);
        }
    }
    const [buildings, setBuildings] = useState<Building[]>([]);
    //const buildingsReady = useRef(false);
    const activeBuilding = buildings.find(b => b.id === activeBuildingId);
    // useEffect(() => {
    //     loadBuildings().then(data => {
    //         setBuildings(data);
    //         buildingsReady.current = true;
    //     });
    // }, []);

    // Individual buildings are saved via saveBuilding and autoSaveBuilding handlers
    // No need to save entire buildings array
    const saveBuildingHandler = async (building: Building) => {
        const saved = await saveBuilding(building);

        setBuildings(prev => {
            const exists = prev.some(b => b.id === saved.id);

            if (exists) {
                return prev.map(b => b.id === saved.id ? saved : b);
            }

            return [...prev, saved];
        });

        setActiveBuildingId(saved.id);
        setView('building-detail');
    };


    const saveApartment = (apt: Apartment, replicateFloors: number[] = []) => {
        if (!activeBuilding) return;
        const updatedApts = [...activeBuilding.apartments];
        const idx = updatedApts.findIndex(a => a.id === apt.id);
        if (idx >= 0) updatedApts[idx] = apt;
        else updatedApts.push(apt);
        replicateFloors.forEach(floor => {
            if (floor !== apt.floor) {
                updatedApts.push({
                    ...apt, id: 'a' + Math.random().toString(36).slice(2, 9),
                    floor, reference: apt.reference.replace(/\d+/, String(floor))
                });
            }
        });
        setBuildings(prev => prev.map(b => b.id === activeBuilding.id ? { ...b, apartments: updatedApts } : b));
        setView('building-detail');
        setEditingApartmentId(null);
    };

    const autoSaveApartment = (apt: Apartment) => {
        if (!activeBuilding) return;
        setBuildings(prev => prev.map(b =>
            b.id === activeBuilding.id
                ? { ...b, apartments: b.apartments.map(a => a.id === apt.id ? apt : a) }
                : b
        ));
    };

    const deleteApartment = (aptId: string) => {
        if (!activeBuilding) return;
        if (!confirm('Supprimer ce bien ?')) return;
        setBuildings(prev => prev.map(b => b.id === activeBuilding.id
            ? { ...b, apartments: b.apartments.filter(a => a.id !== aptId) } : b
        ));
    };

    const navigate = useNavigate();
    // Clear router state so a page refresh doesn't re-open the form
    useEffect(() => {
        if (navState?.buildingId) navigate(location.pathname, { replace: true, state: null });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    //const [buildings, setBuildings] = useState<Building[]>([]);
    //const [criteria, setCriteria] = useState<ClientCriteria>(emptyCriteria());
    const [activeView, setActiveView] = useState('catalog');
    const handleConsultBuildings = () => {
        setActiveView('buildings');
    };

    const handleBrowseCatalog = () => {
        setActiveView('catalog');
    };

    const handleConsultClients = () => {
        setActiveView('clients');
    };

    useEffect(() => {
        loadBuildings().then(setBuildings);
    }, []);


    return(
        <>
        <NavBar onConsultBuildings={handleConsultBuildings} onBrowseCatalog={handleBrowseCatalog}
                onConsultClients={handleConsultClients} activeView={activeView}></NavBar>
<div style={{ minHeight: '100vh', background: '#FAF8F3', fontFamily: '"Inter", system-ui, sans-serif', color: '#1F1B17' }}>

    {/* <div style={{
        position: 'fixed', top: 14, right: 18, zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {user && (
          <span style={{ fontSize: 13, color: '#6B6358', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </span>
        )}
        <button
          onClick={() => logout()}
          title="Se déconnecter"
          style={{display: 'inline-flex', alignItems: 'center', gap: 6,background: 'white', color: '#1F1B17',
            border: '1px solid #D9CFC0', borderRadius: 8,
            padding: '7px 12px', fontSize: 13, fontWeight: 500,cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </div> */}
    {view === 'list' && (
        <BuildingList buildings={buildings}
                      onAdd={() => { setActiveBuildingId(null); setView('building-form'); }}
                      onSelect={(id) => { setActiveBuildingId(id); setView('building-detail'); }}
                      onStartSelection={() => { setCriteria(emptyCriteria()); setView('selection-criteria'); }}
                      onBrowseCatalog={() => navigate('/catalog')}
                      onGoToClients={() => setView('clients')} />
    )}
    {/* {view === 'clients' && (
        <ClientsPage buildings={buildings} onBack={() => setView('list')} />
      )} */}
    {view === 'building-form' && (
        <BuildingForm initial={activeBuilding} onSave={saveBuildingHandler}
            //{async (building) => {
            // const savedBuilding = await saveBuilding(building);
            // console.log(savedBuilding.id);
            // setActiveBuildingId(savedBuilding.id);
            // console.log("switching view now");
            // setView('building-detail');
            // console.log("render view =", view);
            // }}



                      onCancel={() => setView(activeBuildingId ? 'building-detail' : 'list')}
                      onAutoSave={activeBuildingId ? autoSaveBuilding : undefined} />
    )}
    {view === 'building-detail' && activeBuilding && (
        <BuildingDetail building={activeBuilding}
                        onBack={() => setView('list')} onEdit={() => setView('building-form')}
                        onDelete={() => deleteBuilding(activeBuilding.id)}
                        onAddApartment={() => { setEditingApartmentId(null); setView('apartment-form'); }}
                        onEditApartment={(id) => { setEditingApartmentId(id); setView('apartment-form'); }}
                        onDeleteApartment={deleteApartment} />
    )}
    {view === 'apartment-form' && activeBuilding && (
        <ApartmentForm building={activeBuilding}
                       initial={activeBuilding.apartments.find(a => a.id === editingApartmentId)}
                       onSave={saveApartment} onCancel={() => setView('building-detail')}
                       onAutoSave={editingApartmentId ? autoSaveApartment : undefined} />
    )}
    {view === 'selection-criteria' && (
        <SelectionCriteria buildings={buildings} criteria={criteria} setCriteria={setCriteria}
                           onSubmit={() => setView('selection-results')} onCancel={() => setView('list')} />
    )}
    {view === 'selection-results' && (
        <SelectionResults buildings={buildings} criteria={criteria} onBack={() => setView('selection-criteria')} />
    )}
</div>
        </>)}