import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Search, Plus, Eye, Edit, ArrowLeft, User, Phone, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import PatientProfile from './PatientProfile';
import { api } from '../../lib/api';

// Funciones de localStorage
const STORAGE_KEYS = {
  PATIENTS: 'medical_classification_patients',
  PATIENT_COUNTER: 'medical_classification_patient_counter',
  DEPARTAMENTOS: 'medical_classification_departamentos',
  DEPARTAMENTOS_TIMESTAMP: 'medical_classification_departamentos_timestamp'
};

// Duración del cache de departamentos (24 horas)
const DEPARTAMENTOS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en millisegundos

const getStoredPatients = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading patients from localStorage:', error);
    return [];
  }
};

const savePatients = (patients) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  } catch (error) {
    console.error('Error saving patients to localStorage:', error);
  }
};

const getStoredDepartamentos = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DEPARTAMENTOS);
    const timestamp = localStorage.getItem(STORAGE_KEYS.DEPARTAMENTOS_TIMESTAMP);
    
    if (!stored || !timestamp) {
      return null;
    }
    
    const now = Date.now();
    const cacheTime = parseInt(timestamp);
    
    // Verificar si el cache está expirado
    if (now - cacheTime > DEPARTAMENTOS_CACHE_DURATION) {
      console.log('Cache de departamentos expirado, necesita actualización');
      return null;
    }
    
    const departamentos = JSON.parse(stored);
    console.log('Departamentos cargados desde localStorage:', departamentos.length);
    return departamentos;
  } catch (error) {
    console.error('Error loading departamentos from localStorage:', error);
    return null;
  }
};

const saveDepartamentos = (departamentos) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DEPARTAMENTOS, JSON.stringify(departamentos));
    localStorage.setItem(STORAGE_KEYS.DEPARTAMENTOS_TIMESTAMP, Date.now().toString());
    console.log('Departamentos guardados en localStorage:', departamentos.length);
  } catch (error) {
    console.error('Error saving departamentos to localStorage:', error);
  }
};

const clearDepartamentosCache = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.DEPARTAMENTOS);
    localStorage.removeItem(STORAGE_KEYS.DEPARTAMENTOS_TIMESTAMP);
    console.log('Cache de departamentos limpiado');
  } catch (error) {
    console.error('Error clearing departamentos cache:', error);
  }
};

const getNextPatientId = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PATIENT_COUNTER);
    const currentId = stored ? parseInt(stored) : 0;
    const nextId = currentId + 1;
    localStorage.setItem(STORAGE_KEYS.PATIENT_COUNTER, nextId.toString());
    return nextId;
  } catch (error) {
    console.error('Error generating patient ID:', error);
    return Date.now(); // Fallback to timestamp
  }
};

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [patients, setPatients] = useState([]);
  
  // Estados para el formulario de nuevo paciente
  const [newPatientForm, setNewPatientForm] = useState({
    nombre: '',
    edad: '',
    genero: '',
    ppertenencia: '',
    fuente: '',
    deptoresiden: '',
    muniresiden: '',
    telefono: '',
    dpi: '',
    notas: ''
  });

  // Estados para departamentos y municipios
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [departamentosError, setDepartamentosError] = useState(null);
  const [departamentosInitialized, setDepartamentosInitialized] = useState(false);

  // Estados para los diálogos
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Función de debug global
  React.useEffect(() => {
    window.debugDepartamentos = () => {
      console.log('=== DEBUG DEPARTAMENTOS ===');
      console.log('Departamentos en estado:', departamentos);
      console.log('Cantidad de departamentos:', departamentos.length);
      console.log('Loading departamentos:', loadingDepartamentos);
      console.log('Departamentos inicializados:', departamentosInitialized);
      console.log('Error de departamentos:', departamentosError);
      console.log('Cache localStorage:');
      console.log('- Stored:', localStorage.getItem(STORAGE_KEYS.DEPARTAMENTOS));
      console.log('- Timestamp:', localStorage.getItem(STORAGE_KEYS.DEPARTAMENTOS_TIMESTAMP));
      const cached = getStoredDepartamentos();
      console.log('- Cached válido:', cached);
      console.log('Show create form:', showCreateForm);
      console.log('Env mode:', import.meta.env.MODE);
      console.log('API Base URL:', import.meta.env.PROD ? 'https://api.gtmedclassifiergt.com' : 'proxy');
    };
    
    console.log('🔧 Debug disponible: ejecuta debugDepartamentos() en la consola para ver el estado');
    
    return () => {
      delete window.debugDepartamentos;
    };
  }, [departamentos, loadingDepartamentos, departamentosInitialized, departamentosError, showCreateForm]);

  // Cargar pacientes del localStorage al iniciar
  useEffect(() => {
    const storedPatients = getStoredPatients();
    setPatients(storedPatients);
    
    const cachedDepartamentos = getStoredDepartamentos();
    if (cachedDepartamentos) {
      setDepartamentos(cachedDepartamentos);
      setDepartamentosInitialized(true);
      console.log('Departamentos cargados desde cache:', cachedDepartamentos.length);
    } else {
      console.log('No hay departamentos en cache, cargando desde API...');
      fetchDepartamentos();
    }
  }, []);

  // Efecto adicional para verificar departamentos cuando se muestra el formulario
  useEffect(() => {
    if (showCreateForm && departamentos.length === 0 && !loadingDepartamentos && !departamentosInitialized) {
      console.log('Formulario visible pero sin departamentos, recargando...');
      fetchDepartamentos();
    }
  }, [showCreateForm, departamentos.length, loadingDepartamentos, departamentosInitialized]);

  // Efecto para intentar recargar departamentos si fallan después de un tiempo
  useEffect(() => {
    if (departamentosError && !loadingDepartamentos && departamentos.length === 0) {
      console.log('Error detectado y sin departamentos, reintentando en 3 segundos...');
      const timeout = setTimeout(() => {
        if (departamentos.length === 0 && !loadingDepartamentos) {
          console.log('Reintento automático de carga de departamentos...');
          fetchDepartamentos();
        }
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [departamentosError, loadingDepartamentos, departamentos.length]);

  // Función para verificar conectividad de la API
  const checkApiConnectivity = async () => {
    try {
      console.log('Verificando conectividad de API...');
      const response = await fetch(`${import.meta.env.PROD ? 'https://api.gtmedclassifiergt.com' : ''}/api/departamentos`, {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Estado de conectividad:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.error('Error de conectividad:', error);
      return false;
    }
  };

  // Función para obtener departamentos
  const fetchDepartamentos = async (retry = 0) => {
    setLoadingDepartamentos(true);
    setDepartamentosError(null);
    
    console.log('Iniciando carga de departamentos...', { 
      retry, 
      timestamp: new Date().toISOString(),
      currentDepartamentos: departamentos.length,
      showCreateForm,
      env: import.meta.env.MODE,
      initialized: departamentosInitialized
    });

    // Verificar conectividad antes de hacer la petición principal
    if (retry === 0) {
      const isConnected = await checkApiConnectivity();
      if (!isConnected) {
        console.warn('API no responde, pero continuando con la petición...');
      }
    }
    
    try {
      const data = await api.getDepartamentos();
      console.log('Respuesta de departamentos:', data);
      
      if (data.success && data.data) {
        const departamentosFormateados = data.data.map(dept => ({
          codigo: dept.id.toString(),
          nombre: dept.nombre
        }));
        setDepartamentos(departamentosFormateados);
        saveDepartamentos(departamentosFormateados); // Guardar en localStorage
        setDepartamentosInitialized(true);
        console.log('Departamentos cargados exitosamente:', departamentosFormateados.length);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
      setDepartamentosError(error.message);
      
      // Retry automático hasta 2 intentos
      if (retry < 2) {
        console.log(`Reintentando carga de departamentos (intento ${retry + 1}/2)...`);
        setTimeout(() => {
          fetchDepartamentos(retry + 1);
        }, 1000 * (retry + 1)); // Delay incremental: 1s, 2s
        return;
      }
      
      // Fallback con departamentos básicos después de agotar reintentos
      console.log('Usando departamentos de fallback...');
      const fallbackDepartamentos = [
        { codigo: '1', nombre: 'Guatemala' },
        { codigo: '9', nombre: 'Quetzaltenango' },
        { codigo: '18', nombre: 'Izabal' }
      ];
      setDepartamentos(fallbackDepartamentos);
      setDepartamentosInitialized(true);
      saveDepartamentos(fallbackDepartamentos); // Guardar fallback también
    } finally {
      setLoadingDepartamentos(false);
    }
  };

  // Función para obtener municipios por departamento
  const fetchMunicipios = async (departamentoId) => {
    setLoadingMunicipios(true);
    try {
      const data = await api.getMunicipios(departamentoId);
      
      if (data.success && data.data) {
        const municipiosFormateados = data.data.map(muni => ({
          codigo: muni.id.toString(),
          nombre: muni.nombre
        }));
        setMunicipios(municipiosFormateados);
      }
    } catch (error) {
      console.error('Error al cargar municipios:', error);
      setMunicipios([]);
    } finally {
      setLoadingMunicipios(false);
    }
  };

  const gruposEtnicos = [
    { codigo: "1", nombre: "Maya" },
    { codigo: "2", nombre: "Garífuna" },
    { codigo: "3", nombre: "Xinka" },
    { codigo: "4", nombre: "Mestizo / Ladino" },
    { codigo: "5", nombre: "Otro" }
  ];

  const getGenderText = (genero) => {
    return genero === '1' ? 'Hombre' : 'Mujer';
  };

  const getEthnicityText = (ppertenencia) => {
    const ethnicities = {
      '1': 'Maya',
      '2': 'Garífuna', 
      '3': 'Xinka',
      '4': 'Mestizo/Ladino',
      '5': 'Otro'
    };
    return ethnicities[ppertenencia] || 'No especificado';
  };

  const getDepartmentText = (deptoresiden) => {
    const dept = departamentos.find(d => d.codigo === deptoresiden);
    return dept ? dept.nombre : 'No especificado';
  };

  // Cache para almacenar los nombres de municipios ya consultados
  const [municipiosCache, setMunicipiosCache] = useState({});

  const getMunicipalityText = (muniresiden, deptoresiden) => {
    if (!muniresiden) return 'No especificado';
    
    // Verificar si ya tenemos el nombre en el cache
    const cacheKey = `${deptoresiden}-${muniresiden}`;
    if (municipiosCache[cacheKey]) {
      return municipiosCache[cacheKey];
    }
    
    // Si tenemos municipios cargados en estado, buscar ahí
    const muni = municipios.find(m => m.codigo === muniresiden);
    if (muni) {
      // Guardar en cache
      setMunicipiosCache(prev => ({
        ...prev,
        [cacheKey]: muni.nombre
      }));
      return muni.nombre;
    }
    
    // Si no tenemos el nombre, intentar cargarlo
    if (deptoresiden && !municipiosCache[cacheKey]) {
      // Cargar municipios para este departamento en segundo plano
      loadMunicipioName(deptoresiden, muniresiden, cacheKey);
    }
    
    return municipiosCache[cacheKey] || `Municipio ${muniresiden}`;
  };

  const loadMunicipioName = async (deptoresiden, muniresiden, cacheKey) => {
    try {
      const data = await api.getMunicipios(deptoresiden);
      
      if (data.success && data.data) {
        const municipioEncontrado = data.data.find(m => m.id.toString() === muniresiden);
        if (municipioEncontrado) {
          setMunicipiosCache(prev => ({
            ...prev,
            [cacheKey]: municipioEncontrado.nombre
          }));
        }
      }
    } catch (error) {
      console.error('Error al cargar nombre del municipio:', error);
    }
  };

  const updatePatients = (updatedPatients) => {
    setPatients(updatedPatients);
    savePatients(updatedPatients);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setNewPatientForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // Si cambia el departamento, resetear municipio y cargar nuevos municipios
      if (name === 'deptoresiden') {
        newForm.muniresiden = '';
        setMunicipios([]);
        if (value) {
          fetchMunicipios(value);
        }
      }
      
      return newForm;
    });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!newPatientForm.nombre.trim()) {
      errors.push('El nombre es obligatorio');
    }
    
    if (!newPatientForm.edad || parseInt(newPatientForm.edad) <= 0) {
      errors.push('La edad debe ser un número mayor a 0');
    }
    
    if (!newPatientForm.genero) {
      errors.push('Debe seleccionar el género');
    }
    
    if (!newPatientForm.ppertenencia) {
      errors.push('Debe seleccionar la pertenencia étnica');
    }
    
    if (!newPatientForm.fuente) {
      errors.push('Debe seleccionar la fuente');
    }
    
    if (!newPatientForm.deptoresiden) {
      errors.push('Debe seleccionar el departamento de residencia');
    }
    
    if (!newPatientForm.muniresiden) {
      errors.push('Debe seleccionar el municipio de residencia');
    }
    
    if (!newPatientForm.dpi.trim()) {
      errors.push('El DPI es obligatorio');
    }
    
    return errors;
  };

  const handleCreatePatient = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setErrorMessage(errors.join('\n'));
      setShowErrorDialog(true);
      return;
    }

    const newPatient = {
      id: getNextPatientId(),
      ...newPatientForm,
      edad: parseInt(newPatientForm.edad),
      fechaRegistro: new Date().toISOString().split('T')[0],
      ultimaVisita: new Date().toISOString().split('T')[0],
      ultimaClasificacion: null,
      estado: 'activo',
      patologias: [], // Array vacío para nuevas patologías
      clasificaciones: [] // Array vacío para nuevas clasificaciones
    };

    const updatedPatients = [...patients, newPatient];
    updatePatients(updatedPatients);
    
    // Limpiar formulario
    setNewPatientForm({
      nombre: '',
      edad: '',
      genero: '',
      ppertenencia: '',
      fuente: '',
      deptoresiden: '',
      muniresiden: '',
      telefono: '',
      dpi: '',
      notas: ''
    });
    
    setShowCreateForm(false);
    setSuccessMessage(`Paciente "${newPatient.nombre}" creado exitosamente`);
    setShowSuccessDialog(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.dpi.includes(searchTerm)
  );

  if (selectedPatient) {
    return (
      <PatientProfile 
        patient={selectedPatient} 
        onBack={() => setSelectedPatient(null)}
        onUpdate={(updatedPatient) => {
          const updatedPatients = patients.map(p => p.id === updatedPatient.id ? updatedPatient : p);
          updatePatients(updatedPatients);
          setSelectedPatient(updatedPatient);
        }}
      />
    );
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nuevo Paciente</h1>
            <p className="text-gray-600">Registre los datos del nuevo paciente</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información del Paciente
              </div>
              {departamentosError && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchDepartamentos()}
                  className="text-blue-600"
                >
                  🔄 Recargar Departamentos
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Complete todos los campos obligatorios para registrar al paciente
              {departamentos.length > 0 && (
                <span className="text-green-600 text-sm ml-2">
                  ✓ {departamentos.length} departamentos disponibles
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={newPatientForm.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre completo del paciente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dpi">DPI *</Label>
                <Input
                  id="dpi"
                  name="dpi"
                  value={newPatientForm.dpi}
                  onChange={handleInputChange}
                  placeholder="Documento Personal de Identificación"
                  required
                />
              </div>
            </div>

            {/* Edad y Género */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edad">Edad *</Label>
                <Input
                  id="edad"
                  name="edad"
                  type="number"
                  min="1"
                  value={newPatientForm.edad}
                  onChange={handleInputChange}
                  placeholder="Edad en años"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genero">Género *</Label>
                <select
                  id="genero"
                  name="genero"
                  value={newPatientForm.genero}
                  onChange={handleInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="">Seleccionar género</option>
                  <option value="1">Hombre</option>
                  <option value="2">Mujer</option>
                </select>
              </div>
            </div>

            {/* Pertenencia étnica */}
            <div className="space-y-2">
              <Label htmlFor="ppertenencia">Pertenencia Étnica *</Label>
              <select
                id="ppertenencia"
                name="ppertenencia"
                value={newPatientForm.ppertenencia}
                onChange={handleInputChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                <option value="">Seleccionar pertenencia étnica</option>
                {gruposEtnicos.map((grupo) => (
                  <option key={grupo.codigo} value={grupo.codigo}>
                    {grupo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuente */}
            <div className="space-y-2">
              <Label htmlFor="fuente">Fuente *</Label>
              <select
                id="fuente"
                name="fuente"
                value={newPatientForm.fuente}
                onChange={handleInputChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                <option value="">Seleccionar fuente</option>
                <option value="interna">Interna</option>
                <option value="externa">Externa</option>
              </select>
            </div>

            {/* Departamento y Municipio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deptoresiden">Departamento de Residencia *</Label>
                {departamentosError && (
                  <div className="text-sm text-red-600 mb-2">
                    ⚠️ Error cargando departamentos: {departamentosError}
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => fetchDepartamentos()} 
                      className="ml-2 h-auto p-0 text-blue-600"
                    >
                      Reintentar
                    </Button>
                  </div>
                )}
                <select
                  id="deptoresiden"
                  name="deptoresiden"
                  value={newPatientForm.deptoresiden}
                  onChange={handleInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                  disabled={loadingDepartamentos}
                >
                  <option value="">
                    {loadingDepartamentos ? 'Cargando departamentos...' : 'Seleccionar departamento'}
                  </option>
                  {departamentos.map((depto) => (
                    <option key={depto.codigo} value={depto.codigo}>
                      {depto.nombre}
                    </option>
                  ))}
                </select>
                {loadingDepartamentos && (
                  <div className="text-sm text-gray-500">
                    🔄 Cargando departamentos...
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="muniresiden">Municipio de Residencia *</Label>
                <select
                  id="muniresiden"
                  name="muniresiden"
                  value={newPatientForm.muniresiden}
                  onChange={handleInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                  disabled={!newPatientForm.deptoresiden || loadingMunicipios}
                >
                  <option value="">
                    {loadingMunicipios 
                      ? 'Cargando municipios...' 
                      : !newPatientForm.deptoresiden 
                        ? 'Primero seleccione departamento'
                        : 'Seleccionar municipio'
                    }
                  </option>
                  {municipios.map((muni) => (
                    <option key={muni.codigo} value={muni.codigo}>
                      {muni.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                value={newPatientForm.telefono}
                onChange={handleInputChange}
                placeholder="+502 1234-5678"
              />
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                id="notas"
                name="notas"
                value={newPatientForm.notas}
                onChange={handleInputChange}
                placeholder="Observaciones médicas o información adicional relevante..."
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleCreatePatient} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Crear Paciente
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Función para forzar recarga de departamentos (limpia cache)
  const forceReloadDepartamentos = () => {
    clearDepartamentosCache();
    setDepartamentos([]);
    setDepartamentosInitialized(false);
    setDepartamentosError(null);
    fetchDepartamentos();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600 mt-1">
            Administre los perfiles de sus pacientes • {patients.length} pacientes registrados
            {!departamentosInitialized && loadingDepartamentos && (
              <span className="text-blue-600 ml-2">• Cargando departamentos...</span>
            )}
            {departamentosInitialized && departamentos.length > 0 && (
              <span className="text-green-600 ml-2">• {departamentos.length} departamentos disponibles</span>
            )}
            {departamentosError && (
              <span className="text-red-600 ml-2">• Error: {departamentosError}</span>
            )}
          </p>
        </div>
        <Button 
          onClick={() => {
            if (!departamentosInitialized && departamentos.length === 0 && !loadingDepartamentos) {
              console.log('Forzando carga de departamentos desde botón Nuevo Paciente...');
              fetchDepartamentos();
            }
            setShowCreateForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={loadingDepartamentos && !departamentosInitialized}
        >
          <Plus className="h-4 w-4 mr-2" />
          {loadingDepartamentos && !departamentosInitialized ? 'Cargando...' : 'Nuevo Paciente'}
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o DPI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {(departamentosError || (!departamentosInitialized && departamentos.length === 0)) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchDepartamentos()}
                disabled={loadingDepartamentos}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                🔄 {loadingDepartamentos ? 'Cargando...' : 'Cargar Departamentos'}
              </Button>
            )}
            {departamentosInitialized && departamentos.length > 0 && departamentosError && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={forceReloadDepartamentos}
                disabled={loadingDepartamentos}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                🔄 Recargar Cache
              </Button>
            )}
          </div>
          {departamentosError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">
                <strong>Problema con departamentos:</strong> {departamentosError}
                <br />
                <span className="text-red-600">Esto puede afectar la creación de nuevos pacientes.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de pacientes */}
      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{patient.nombre}</h3>
                    <Badge variant={patient.estado === 'activo' ? 'default' : 'secondary'}>
                      {patient.estado}
                    </Badge>
                    {patient.patologias && patient.patologias.length > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {patient.patologias.length} patología{patient.patologias.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Edad:</span> {patient.edad} años
                    </div>
                    <div>
                      <span className="font-medium">Género:</span> {getGenderText(patient.genero)}
                    </div>
                    <div>
                      <span className="font-medium">Etnia:</span> {getEthnicityText(patient.ppertenencia)}
                    </div>
                    <div>
                      <span className="font-medium">Departamento:</span> {getDepartmentText(patient.deptoresiden)}
                    </div>
                    <div>
                      <span className="font-medium">Municipio:</span> {getMunicipalityText(patient.muniresiden, patient.deptoresiden)}
                    </div>
                    <div>
                      <span className="font-medium">DPI:</span> {patient.dpi}
                    </div>
                    {patient.telefono && (
                      <div>
                        <span className="font-medium">Teléfono:</span> {patient.telefono}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Registrado:</span> {patient.fechaRegistro}
                    </div>
                    <div>
                      <span className="font-medium">Clasificaciones:</span> {patient.clasificaciones?.length || 0}
                    </div>
                    {patient.ultimaClasificacion && (
                      <div>
                        <span className="font-medium">Última clasificación:</span> {patient.ultimaClasificacion}
                      </div>
                    )}
                  </div>

                  {patient.notas && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-700">Notas:</span>
                      <p className="text-sm text-gray-600 mt-1">{patient.notas}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Perfil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && patients.length > 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No se encontraron pacientes que coincidan con la búsqueda.</p>
          </CardContent>
        </Card>
      )}

      {patients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pacientes registrados</h3>
            <p className="text-gray-500 mb-4">Comience creando su primer paciente</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Paciente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de éxito */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              ¡Éxito!
            </DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de error */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error en el formulario
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-1">
                {errorMessage.split('\n').map((error, index) => (
                  <div key={index} className="text-sm">• {error}</div>
                ))}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>
              Revisar formulario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientManagement; 