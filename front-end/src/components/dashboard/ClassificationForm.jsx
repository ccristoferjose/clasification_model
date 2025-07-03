import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Activity, 
  FileText, 
  Brain,
  CheckCircle,
  AlertTriangle,
  Send,
  Plus
} from 'lucide-react';
import { api } from '../../lib/api';

const ClassificationForm = ({ patient = null, onResults = null, onAddPathology = null }) => {
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

  const gruposEtnicos = [
    { codigo: "1", nombre: "Maya" },
    { codigo: "2", nombre: "Garífuna" },
    { codigo: "3", nombre: "Xinka" },
    { codigo: "4", nombre: "Mestizo / Ladino" },
    { codigo: "5", nombre: "Otro" }
  ];

  // Función para obtener departamentos
  const fetchDepartamentos = async () => {
    setLoadingDepartamentos(true);
    try {
      const data = await api.getDepartamentos();
      
      if (data.success && data.data) {
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

  // Pre-llenar datos del paciente cuando se proporciona
  useEffect(() => {
    if (patient) {
      setFormData({
        edad: patient.edad?.toString() || '',
        genero: patient.genero || '',
        ppertenencia: patient.ppertenencia || '',
        fuente: patient.fuente || '',
        deptoresiden: patient.deptoresiden || '',
        muniresiden: patient.muniresiden || ''
      });

      // Si hay departamento, cargar municipios
      if (patient.deptoresiden) {
        fetchMunicipios(patient.deptoresiden);
      }
    }
  }, [patient]);

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
        setMunicipios([]);
        if (value) {
          fetchMunicipios(value);
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
    setMessage('');
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }
    
    setLoading(true);
    
    try {
      const data = await api.predict(formData);
      
      if (data.predictions && data.predictions.length > 0) {
        // Validar y limpiar las predicciones antes de usarlas
        const validatedPredictions = data.predictions.map(prediction => ({
          ...prediction,
          probabilidad: prediction.probabilidad || 0 // Asegurar que siempre haya un valor
        }));
        
        // Debug: log para verificar el formato de los datos
        console.log('Predicciones recibidas de la API:', validatedPredictions);
        
        setPredictions(validatedPredictions);
        setMessage(`Clasificación completada exitosamente. Se encontraron ${validatedPredictions.length} posibles categorías.`);
        
        // Si hay callback para resultados, llamarlo
        if (onResults) {
          onResults({
            formData,
            predictions: validatedPredictions,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setError('No se pudieron obtener predicciones del modelo');
      }
    } catch (error) {
      console.error('Error en la clasificación:', error);
      setError(`Error al procesar la clasificación: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const normalizeCategoryName = (categoryName) => {
    return categoryName
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n');
  };

  const fetchCausePredictions = async (originalData, categoria) => {
    setLoadingCauses(true);
    setCausePredictions([]);
    
    try {
      const normalizedCategory = normalizeCategoryName(categoria);
      const data = await api.predictCausas({
        ...originalData,
        categoria: normalizedCategory
      });
      
      if (data.predictions && data.predictions.length > 0) {
        // Validar y limpiar las predicciones de causas antes de usarlas
        const validatedCauses = data.predictions.map(cause => ({
          ...cause,
          probabilidad: cause.probabilidad || 0 // Asegurar que siempre haya un valor
        }));
        
        // Debug: log para verificar el formato de los datos de causas
        console.log('Causas específicas recibidas de la API:', validatedCauses);
        
        setCausePredictions(validatedCauses);
      } else {
        setCausePredictions([]);
      }
    } catch (error) {
      console.error('Error al obtener causas específicas:', error);
      setCausePredictions([]);
    } finally {
      setLoadingCauses(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    
    const originalData = {
      edad: parseInt(formData.edad),
      genero: parseInt(formData.genero),
      ppertenencia: parseInt(formData.ppertenencia),
      fuente: formData.fuente,
      deptoresiden: parseInt(formData.deptoresiden),
      muniresiden: parseInt(formData.muniresiden)
    };
    
    await fetchCausePredictions(originalData, category.categoria);
  };

  const getMunicipiosDisponibles = () => {
    return municipios;
  };

  // Función helper para formatear probabilidades de manera segura
  const formatProbability = (prediction) => {
    // La API devuelve el campo como 'prob', no 'probabilidad'
    const probability = prediction?.prob || prediction?.probabilidad || 0;
    
    // Convertir a número si es string
    const numProbability = typeof probability === 'string' ? parseFloat(probability) : probability;
    
    // Verificar si es un número válido
    if (isNaN(numProbability) || numProbability === null || numProbability === undefined) {
      return '0.0';
    }
    
    // La API ya devuelve valores en porcentaje (31.06, 24.55, etc.)
    return numProbability.toFixed(1);
  };

  // Función helper para obtener el valor numérico de probabilidad para barras de progreso
  const getProbabilityValue = (prediction) => {
    // La API devuelve el campo como 'prob', no 'probabilidad'
    const probability = prediction?.prob || prediction?.probabilidad || 0;
    
    const numProbability = typeof probability === 'string' ? parseFloat(probability) : probability;
    
    if (isNaN(numProbability) || numProbability === null || numProbability === undefined) {
      return 0;
    }
    
    // La API ya devuelve valores en porcentaje, solo limitamos a 100% máximo
    return Math.min(numProbability, 100);
  };

  const clearForm = () => {
    if (!patient) {
      setFormData({
        edad: '',
        genero: '',
        ppertenencia: '',
        fuente: '',
        deptoresiden: '',
        muniresiden: ''
      });
    }
    setPredictions([]);
    setCausePredictions([]);
    setSelectedCategory(null);
    setMessage('');
    setError('');
    setMunicipios([]);
  };

  const handleAddPathologyFromPrediction = (cause) => {
    if (onAddPathology && patient) {
      const pathologyData = {
        codigo: cause.caufin,
        nombre: cause.descripcion,
        probabilidad: formatProbability(cause),
        probabilidadNumerica: cause.prob,
        categoria: selectedCategory.categoria,
        estado: 'pendiente', // Estados: pendiente, confirmada, descartada
        fechaAgregada: new Date().toISOString().split('T')[0],
        origen: 'clasificacion_ia', // Origen: clasificacion_ia, manual
        notas: `Sugerida por IA con ${formatProbability(cause)}% de probabilidad`,
        datosClasificacion: {
          formData,
          categoria: selectedCategory,
          timestamp: new Date().toISOString()
        }
      };
      
      onAddPathology(pathologyData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Información del paciente si está disponible */}
      {patient && (
        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Clasificando para el paciente: <strong>{patient.nombre}</strong> (DPI: {patient.dpi})
          </AlertDescription>
        </Alert>
      )}

      {/* Form section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Formulario de Clasificación
          </CardTitle>
          <CardDescription>
            {patient 
              ? 'Los datos del paciente se han cargado automáticamente. Verifique y complete la información faltante.'
              : 'Ingrese los datos del paciente para obtener una clasificación diagnóstica'
            }
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
                    {predictions.length} categorías encontradas. {selectedCategory && `La categoría "${selectedCategory?.categoria}" está seleccionada.`}
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
                  onClick={clearForm}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  {patient ? 'Nueva Clasificación' : 'Limpiar Formulario'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

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
                      <h3 className="font-semibold text-gray-900">{prediction.categoria}</h3>
                      <p className="text-sm text-gray-600">Probabilidad: {formatProbability(prediction)}%</p>
                    </div>
                    <div className="text-right">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${getProbabilityValue(prediction)}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cause-specific predictions */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Patologías Específicas: {selectedCategory.categoria}
            </CardTitle>
            <CardDescription>
              Posibles diagnósticos específicos dentro de esta categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCauses ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Obteniendo patologías específicas...</span>
              </div>
            ) : causePredictions.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {causePredictions.map((cause, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="bg-blue-100 text-blue-800 text-xs font-mono px-2 py-1 rounded">
                            {cause.caufin}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            {formatProbability(cause)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{cause.descripcion}</p>
                      </div>
                      {patient && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="ml-2 text-xs"
                          onClick={() => handleAddPathologyFromPrediction(cause)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Agregar
                        </Button>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${getProbabilityValue(cause)}%`}}
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
    </div>
  );
};

export default ClassificationForm; 