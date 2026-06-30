export interface NavBarProps {
    onConsultBuildings : () => void;
    onBrowseCatalog : () => void;
    onConsultClients : () => void;
    onStartSelection : () => void;
    activeView ?: 'buildings' | 'catalog' | 'clients';
}