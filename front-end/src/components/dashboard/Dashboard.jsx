import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { api } from '../../lib/api';
import { 
  Activity, 
  FileText, 
  TrendingUp, 
  Users,
  Brain,
  Target,
  CheckCircle,
  AlertTriangle,
  Send,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const [formData, setFormData] = useState({
    edad: '',
    genero: '',
    ppertenencia: '',
    fuente: '',
    deptoresiden: '',
    muniresiden: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [causePredictions, setCausePredictions] = useState([]);
  const [loadingCauses, setLoadingCauses] = useState(false);

  // Estados para departamentos y municipios
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Función para obtener departamentos
  const fetchDepartamentos = async () => {
    setLoadingDepartamentos(true);
    try {
      const data = await api.getDepartamentos();
      
      if (data.success && data.data) {
        // Transformar la estructura para mantener compatibilidad
        const departamentosFormateados = data.data.map(dept => ({
          codigo: dept.id.toString(),
          nombre: dept.nombre
        }));
        setDepartamentos(departamentosFormateados);
      } else {
        throw new Error('Error al obtener departamentos');
      }
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
      setError('Error al cargar los departamentos');
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
        // Transformar la estructura para mantener compatibilidad
        const municipiosFormateados = data.data.map(muni => ({
          codigo: muni.id.toString(),
          nombre: muni.nombre
        }));
        setMunicipios(municipiosFormateados);
      } else {
        throw new Error('Error al obtener municipios');
      }
    } catch (error) {
      console.error('Error al cargar municipios:', error);
      setError('Error al cargar los municipios');
      setMunicipios([]);
    } finally {
      setLoadingMunicipios(false);
    }
  };

  // Cargar departamentos al iniciar el componente
  useEffect(() => {
    fetchDepartamentos();
  }, []);

  const gruposEtnicos = [
    { codigo: "1", nombre: "Maya" },
    { codigo: "2", nombre: "Garífuna" },
    { codigo: "3", nombre: "Xinka" },
    { codigo: "4", nombre: "Mestizo / Ladino" },
    { codigo: "5", nombre: "Otro" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      
      // Si cambia el departamento, resetear el municipio y cargar nuevos municipios
      if (name === 'deptoresiden') {
        newData.muniresiden = '';
        setMunicipios([]); // Limpiar municipios anteriores
        if (value) {
          fetchMunicipios(value); // Cargar municipios del departamento seleccionado
        }
      }
      
      return newData;
    });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.edad || parseInt(formData.edad) <= 0) {
      errors.push('La edad debe ser un número mayor a 0');
    }
    
    if (!formData.genero) {
      errors.push('Debe seleccionar el género');
    }
    
    if (!formData.ppertenencia) {
      errors.push('Debe seleccionar la pertenencia étnica');
    }
    
    if (!formData.fuente) {
      errors.push('Debe seleccionar la fuente');
    }
    
    if (!formData.deptoresiden) {
      errors.push('Debe seleccionar el departamento de residencia');
    }
    
    if (!formData.muniresiden) {
      errors.push('Debe seleccionar el municipio de residencia');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setLoading(true);
    setMessage('');
    setPredictions([]);
    setCausePredictions([]);
    setSelectedCategory(null);

    // Crear el JSON en el formato exacto requerido
    const jsonToSend = {
      edad: parseInt(formData.edad),
      genero: formData.genero,
      ppertenencia: formData.ppertenencia,
      fuente: formData.fuente,
      deptoresiden: formData.deptoresiden,
      muniresiden: formData.muniresiden
    };

    console.log('JSON a enviar:', jsonToSend);

    try {
      // Llamada a la API de predicción de categorías
      const data = await api.predict(jsonToSend);
      
      if (data.success && data.predictions && data.predictions.length > 0) {
        setPredictions(data.predictions);
        setMessage('Clasificación completada exitosamente');
        
        // Automáticamente seleccionar la primera categoría (más probable)
        const topCategory = data.predictions[0];
        setSelectedCategory(topCategory);
        
        // Obtener patologías específicas para la categoría más probable
        await fetchCausePredictions(jsonToSend, topCategory.categoria);
      } else {
        setError('No se pudieron obtener predicciones válidas');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`Error al conectar con el servidor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para normalizar nombres de categorías (remover tildes y caracteres especiales)
  const normalizeCategoryName = (categoryName) => {
    return categoryName
      .normalize('NFD') // Descomponer caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remover marcas diacríticas (tildes, acentos)
      .replace(/[^\w\s]/g, '') // Remover caracteres especiales excepto espacios y letras
      .trim();
  };

  const fetchCausePredictions = async (originalData, categoria) => {
    setLoadingCauses(true);
    
    try {
      const normalizedCategory = normalizeCategoryName(categoria);
      
      const dataWithCategory = {
        ...originalData,
        categoria: normalizedCategory
      };

      console.log('Categoría original:', categoria);
      console.log('Categoría normalizada:', normalizedCategory);

      const data = await api.predictCausas(dataWithCategory);
      
      if (data.success && data.predictions) {
        setCausePredictions(data.predictions);
      } else {
        setCausePredictions([]);
      }
    } catch (error) {
      console.error('Error al obtener causas:', error);
      setCausePredictions([]);
    } finally {
      setLoadingCauses(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    
    // Obtener patologías específicas para esta categoría
    const originalData = {
      edad: parseInt(formData.edad),
      genero: formData.genero,
      ppertenencia: formData.ppertenencia,
      fuente: formData.fuente,
      deptoresiden: formData.deptoresiden,
      muniresiden: formData.muniresiden
    };
    
    await fetchCausePredictions(originalData, category.categoria);
  };

  // Obtener municipios disponibles según el departamento seleccionado
  const getMunicipiosDisponibles = () => {
    return municipios;
  };

  // Datos dummy para estadísticas
  const stats = [
    {
      title: 'Casos Clasificados',
      value: '1,247',
      change: '+15%',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Precisión del Modelo',
      value: '94.2%',
      change: '+2.1%',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Patologías Detectadas',
      value: '23',
      change: '+3',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Médicos Activos',
      value: '89',
      change: '+7',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const recentClassifications = [
    {
      id: 'PAT-001',
      patientId: 'GT-2024-001',
      diagnosis: 'Diabetes Mellitus Tipo 2',
      confidence: '96.7%',
      status: 'confirmed',
      timestamp: '10:30 AM'
    },
    {
      id: 'PAT-002',
      patientId: 'GT-2024-002',
      diagnosis: 'Hipertensión Arterial',
      confidence: '92.4%',
      status: 'review',
      timestamp: '11:15 AM'
    },
    {
      id: 'PAT-003',
      patientId: 'GT-2024-003',
      diagnosis: 'Insuficiencia Renal',
      confidence: '88.9%',
      status: 'pending',
      timestamp: '12:00 PM'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'review':
        return 'En Revisión';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sistema de Clasificación de Patologías
        </h1>
        <p className="text-gray-600">
          Apoyo diagnóstico usando modelos entrenados con datos hospitalarios de Guatemala
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} este mes
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Formulario de Clasificación
            </CardTitle>
            <CardDescription>
              Ingrese los datos del paciente para obtener una clasificación diagnóstica
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                  {predictions.length > 0 && (
                    <span className="block mt-1 text-sm">
                      {predictions.length} categorías encontradas. La categoría "{selectedCategory?.categoria}" está seleccionada.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Edad y Género */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edad">Edad *</Label>
                  <Input
                    id="edad"
                    name="edad"
                    type="number"
                    min="1"
                    value={formData.edad}
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
                    value={formData.genero}
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
                  value={formData.ppertenencia}
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
                  value={formData.fuente}
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
                  <select
                    id="deptoresiden"
                    name="deptoresiden"
                    value={formData.deptoresiden}
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="muniresiden">Municipio de Residencia *</Label>
                  <select
                    id="muniresiden"
                    name="muniresiden"
                    value={formData.muniresiden}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                    disabled={!formData.deptoresiden || loadingMunicipios}
                  >
                    <option value="">
                      {loadingMunicipios 
                        ? 'Cargando municipios...' 
                        : !formData.deptoresiden 
                          ? 'Primero seleccione departamento'
                          : 'Seleccionar municipio'
                      }
                    </option>
                    {getMunicipiosDisponibles().map((muni) => (
                      <option key={muni.codigo} value={muni.codigo}>
                        {muni.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar para Clasificación
                    </>
                  )}
                </Button>
                
                {predictions.length > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setFormData({
                        edad: '',
                        genero: '',
                        ppertenencia: '',
                        fuente: '',
                        deptoresiden: '',
                        muniresiden: ''
                      });
                      setPredictions([]);
                      setCausePredictions([]);
                      setSelectedCategory(null);
                      setMessage('');
                      setError('');
                    }}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Nueva Clasificación
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Statistics and recent classifications */}
        <div className="space-y-6">
          {/* Predictions Results */}
          {predictions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Categorías CIE-10 Predichas
                </CardTitle>
                <CardDescription>
                  Categorías médicas con mayor probabilidad (click para ver patologías específicas)
                  {predictions.length > 3 && (
                    <span className="block text-xs text-blue-600 mt-1">
                      📋 {predictions.length} categorías • Desliza para ver todas
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {predictions.map((prediction, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        selectedCategory?.categoria === prediction.categoria 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCategoryClick(prediction)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{prediction.categoria}</p>
                          <p className="text-xs text-gray-600">{prediction.descripcion}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-600">
                            {typeof prediction.prob === 'number'
                                ? `${prediction.prob.toFixed(1)}%`
                                : '--'}
                          </span>
                          {index === 0 && (
                            <p className="text-xs text-green-600 font-medium">Más probable</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specific Pathologies */}
          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Patologías Específicas: {selectedCategory.categoria}
                </CardTitle>
                <CardDescription>
                  Códigos CIE-10 específicos para esta categoría
                  {causePredictions.length > 3 && (
                    <span className="block text-xs text-blue-600 mt-1">
                      🔬 {causePredictions.length} patologías • Desliza para ver todas
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCauses ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Cargando patologías...</span>
                  </div>
                ) : causePredictions.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {causePredictions.map((cause, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="bg-gray-100 text-gray-800 text-xs font-mono px-2 py-1 rounded">
                                {cause.caufin}
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                {cause.prob.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{cause.descripcion}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{width: `${Math.min(cause.prob * 5, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No se encontraron patologías específicas para esta categoría
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent classifications (only show when no predictions) */}
          {predictions.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Clasificaciones Recientes
                </CardTitle>
                <CardDescription>
                  Últimos diagnósticos procesados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentClassifications.map((classification) => (
                    <div key={classification.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {classification.patientId}
                        </span>
                        <span className="text-xs text-gray-500">
                          {classification.timestamp}
                        </span>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-800">
                          {classification.diagnosis}
                        </p>
                        <p className="text-xs text-gray-600">
                          Confianza: {classification.confidence}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(classification.status)}`}>
                        {getStatusText(classification.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Model performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Rendimiento del Modelo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Precisión General</span>
                  <span className="text-sm font-medium">94.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '94.2%'}}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sensibilidad</span>
                  <span className="text-sm font-medium">91.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '91.8%'}}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Especificidad</span>
                  <span className="text-sm font-medium">96.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '96.5%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 