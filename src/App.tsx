/*import React, { useState, useMemo, useEffect, useRef } from 'react';*/
/*import { Building2, Plus, ArrowLeft, MapPin, Layers, Globe, Image as ImageIcon, FileText, Edit2, Trash2, Home, Bath, Utensils, Wind, TreePine, DoorOpen, Save, X, Upload, Copy, Filter, Search, Download, Sparkles, Check, Sofa, Bed, Package, Users/!*, LogOut*!/ } from 'lucide-react';
import type { PropertyType, Status, Piece, Room, SalleDeBain, Kitchen, Apartment } from './models/apartment.ts';
import type { Building } from './models/building.ts';
import type { ClientCriteria } from './models/clientCriteria.ts';
import { loadBuildings, saveBuildings } from './services/buildingsService.ts';
import BuildingList from './components/buildingList.tsx';*/
/*import BuildingForm from './components/buildingForm.tsx';
import BuildingDetail from './components/buildingDetail.tsx';
import ApartmentForm from './components/apartmentForm.tsx';*/
//import generateSynthesisHTML from './components/generatePdf.tsx';
//import {emptyCriteria,emptyApartment} from './factory/factory.ts';
import BrowsePage from './components/pages/BrowsePage/BrowsePage.tsx';
import { Routes, Route/*, useNavigate */} from "react-router-dom";
import LoginPage from './components/pages/LoginPage/LoginPage.tsx';
import DashboardPage from "./components/pages/DashboardPage/DashboardPage.tsx";
import ClientsPageRoute from "./components/pages/ClientsPageRoute.tsx";
import './App.css';
import ProtectedRoute from "./components/ProtectedRoutes.tsx";
export default function ArchitectApp() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/catalog" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><ClientsPageRoute /></ProtectedRoute>} />
      <Route path="/*" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/>
    </Routes>
  );
}
