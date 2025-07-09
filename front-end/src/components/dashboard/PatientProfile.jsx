import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { ArrowLeft, User, Calendar, MapPin, Phone, FileText, Plus, X, Activity, AlertCircle, Brain, CheckCircle, Clock, XCircle, Send } from 'lucide-react';
import ClassificationForm from './ClassificationForm';

const PatientProfile = ({ patient, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [newPathology, setNewPathology] = useState('');
  const [pathologyProbability, setPathologyProbability] = useState('');
  const [pathologyNotes, setPathologyNotes] = useState('');
  const [editingPatient, setEditingPatient] = useState(patient);
  const [classificationHistory, setClassificationHistory] = useState(patient.clasificaciones || []);
  
  // Estados para los diálogos
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showRetrainingDialog, setShowRetrainingDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [retrainingMessage, setRetrainingMessage] = useState('');

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
    const departments = {
      '1': 'Guatemala', '2': 'El Progreso', '3': 'Sacatepéquez', '4': 'Chimaltenango',
      '5': 'Escuintla', '6': 'Santa Rosa', '7': 'Sololá', '8': 'Totonicapán',
      '9': 'Quetzaltenango', '10': 'Suchitepéquez', '11': 'Retalhuleu', '12': 'San Marcos',
      '13': 'Huehuetenango', '14': 'Quiché', '15': 'Baja Verapaz', '16': 'Alta Verapaz',
      '17': 'Petén', '18': 'Izabal', '19': 'Zacapa', '20': 'Chiquimula',
      '21': 'Jalapa', '22': 'Jutiapa', '23': 'Extranjero', '99': 'Ignorado'
    };
    return departments[deptoresiden] || 'No especificado';
  };

  const getMunicipalityText = (muniresiden) => {
    // Por ahora devuelve el código, pero esto podría mejorarse con una consulta API
    // similar a la implementada en PatientManagement
    return muniresiden || 'No especificado';
  };

  const commonPathologies = [
    'Hipertensión arterial',
    'Diabetes mellitus tipo 2',
    'Gastritis',
    'Infección respiratoria aguda',
    'Diarrea y gastroenteritis',
    'Cefalea',
    'Artritis',
    'Anemia',
    'Infección del tracto urinario',
    'Dermatitis',
    'Asma bronquial',
    'Depresión',
    'Obesidad',
    'Osteoporosis',
    'Conjuntivitis'
  ];

  const handleAddPathology = () => {
    if (newPathology.trim()) {
      const pathologyData = {
        codigo: null, // No tenemos código CIE-10 para patologías manuales
        nombre: newPathology,
        probabilidad: pathologyProbability || 'Media',
        probabilidadNumerica: null,
        categoria: 'Manual',
        estado: 'pendiente',
        fechaAgregada: new Date().toISOString().split('T')[0],
        origen: 'manual',
        notas: pathologyNotes || 'Agregada manualmente por el médico',
        datosClasificacion: null
      };

      const newPatient = {
        ...editingPatient,
        patologias: [...(editingPatient.patologias || []), pathologyData]
      };
      setEditingPatient(newPatient);
      onUpdate(newPatient);
      setNewPathology('');
      setPathologyProbability('');
      setPathologyNotes('');
    }
  };

  const handleRemovePathology = (index) => {
    const newPatient = {
      ...editingPatient,
      patologias: editingPatient.patologias.filter((_, i) => i !== index)
    };
    setEditingPatient(newPatient);
    onUpdate(newPatient);
  };

  const handleClassificationResults = (results) => {
    // Agregar los resultados al historial de clasificaciones
    const newClassification = {
      id: Date.now(), // ID único temporal
      ...results,
      fechaClasificacion: new Date().toISOString().split('T')[0]
    };
    
    const updatedClassifications = [newClassification, ...classificationHistory];
    setClassificationHistory(updatedClassifications);
    
    // Actualizar el paciente con el historial de clasificaciones
    const updatedPatient = {
      ...editingPatient,
      clasificaciones: updatedClassifications,
      ultimaClasificacion: new Date().toISOString().split('T')[0]
    };
    
    setEditingPatient(updatedPatient);
    onUpdate(updatedPatient);
  };

  const handleAddPathologyFromClassification = (pathologyData) => {
    const newPatient = {
      ...editingPatient,
      patologias: [...(editingPatient.patologias || []), pathologyData]
    };
    setEditingPatient(newPatient);
    onUpdate(newPatient);
    
    // Mostrar mensaje de confirmación
    setSuccessMessage(`Patología "${pathologyData.nombre}" agregada como pendiente de verificación`);
    setShowSuccessDialog(true);
  };

  const handleConfirmPathology = (index) => {
    const updatedPatient = {
      ...editingPatient,
      patologias: editingPatient.patologias.map((pat, i) => 
        i === index 
          ? { 
              ...pat, 
              estado: 'confirmada', 
              fechaConfirmacion: new Date().toISOString().split('T')[0],
              confirmadoPor: 'Dr. Usuario' // En una implementación real, esto vendría del usuario autenticado
            }
          : pat
      )
    };
    setEditingPatient(updatedPatient);
    onUpdate(updatedPatient);
  };

  const handleDiscardPathology = (index) => {
    const updatedPatient = {
      ...editingPatient,
      patologias: editingPatient.patologias.map((pat, i) => 
        i === index 
          ? { 
              ...pat, 
              estado: 'descartada', 
              fechaDescarte: new Date().toISOString().split('T')[0],
              descartadoPor: 'Dr. Usuario'
            }
          : pat
      )
    };
    setEditingPatient(updatedPatient);
    onUpdate(updatedPatient);
  };

  const handleSendForRetraining = (pathology) => {
    // En una implementación real, esto enviaría los datos al servidor para reentrenamiento
    console.log('Enviando datos para reentrenamiento:', {
      patologia: pathology,
      paciente: editingPatient,
      datosClasificacion: pathology.datosClasificacion
    });
    
    setRetrainingMessage(`Los datos de "${pathology.nombre}" han sido enviados para el reentrenamiento del modelo. ¡Gracias por contribuir a mejorar el sistema!`);
    setShowRetrainingDialog(true);
  };

  // Función helper para formatear probabilidades de manera segura
  const formatProbability = (prediction) => {
    // La API devuelve el campo como 'prob', no 'probabilidad'
    const probability = prediction?.prob || prediction?.probabilidad || prediction || 0;
    
    // Convertir a número si es string
    const numProbability = typeof probability === 'string' ? parseFloat(probability) : probability;
    
    // Verificar si es un número válido
    if (isNaN(numProbability) || numProbability === null || numProbability === undefined) {
      return '0.0';
    }
    
    // La API ya devuelve valores en porcentaje (31.06, 24.55, etc.)
    return numProbability.toFixed(1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{editingPatient.nombre}</h1>
          <p className="text-gray-600">Perfil del Paciente</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'perfil'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Información del Paciente
          </button>
          <button
            onClick={() => setActiveTab('clasificacion')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'clasificacion'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Brain className="h-4 w-4 inline mr-2" />
            Clasificación Diagnóstica
          </button>
          <button
            onClick={() => setActiveTab('patologias')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'patologias'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Gestión de Patologías
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'perfil' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre Completo</Label>
                  <p className="font-medium">{editingPatient.nombre}</p>
                </div>
                <div>
                  <Label>DPI</Label>
                  <p className="font-medium">{editingPatient.dpi}</p>
                </div>
                <div>
                  <Label>Edad</Label>
                  <p className="font-medium">{editingPatient.edad} años</p>
                </div>
                <div>
                  <Label>Género</Label>
                  <p className="font-medium">{getGenderText(editingPatient.genero)}</p>
                </div>
                <div>
                  <Label>Pertenencia Étnica</Label>
                  <p className="font-medium">{getEthnicityText(editingPatient.ppertenencia)}</p>
                </div>
                <div>
                  <Label>Fuente</Label>
                  <p className="font-medium capitalize">{editingPatient.fuente}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contacto y Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Teléfono</Label>
                <p className="font-medium">{editingPatient.telefono}</p>
              </div>
              <div>
                <Label>Departamento de Residencia</Label>
                <p className="font-medium">{getDepartmentText(editingPatient.deptoresiden)}</p>
              </div>
              <div>
                <Label>Municipio de Residencia</Label>
                <p className="font-medium">{getMunicipalityText(editingPatient.muniresiden)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Información Médica */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información Médica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Fecha de Registro</Label>
                  <p className="font-medium">{editingPatient.fechaRegistro}</p>
                </div>
                <div>
                  <Label>Última Visita</Label>
                  <p className="font-medium">{editingPatient.ultimaVisita}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge variant={editingPatient.estado === 'activo' ? 'default' : 'secondary'}>
                    {editingPatient.estado}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'clasificacion' && (
        <div className="space-y-6">
          <ClassificationForm 
            patient={editingPatient} 
            onResults={handleClassificationResults}
            onAddPathology={handleAddPathologyFromClassification}
          />
          
          {/* Historial de Clasificaciones */}
          {classificationHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Historial de Clasificaciones
                </CardTitle>
                <CardDescription>
                  Registro de clasificaciones previas realizadas para este paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {classificationHistory.map((classification, index) => (
                    <div key={classification.id || index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Clasificación del {classification.fechaClasificacion}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {classification.predictions?.length || 0} categorías encontradas
                          </p>
                        </div>
                        <Badge variant="outline">
                          {new Date(classification.timestamp).toLocaleTimeString()}
                        </Badge>
                      </div>
                      
                      {classification.predictions && classification.predictions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Resultados principales:</p>
                          {classification.predictions.slice(0, 3).map((pred, predIndex) => (
                            <div key={predIndex} className="flex justify-between items-center text-sm">
                              <span className="text-gray-900">{pred.categoria}</span>
                              <span className="text-blue-600 font-medium">
                                {formatProbability(pred)}%
                              </span>
                            </div>
                          ))}
                          {classification.predictions.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{classification.predictions.length - 3} categorías más
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'patologias' && (
        <div className="space-y-6">
          {/* Nota sobre el flujo de trabajo */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Brain className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  <p className="text-blue-800 font-medium">
                    Flujo de trabajo clínico
                  </p>
                  <div className="text-blue-700 text-sm space-y-1">
                    <p>1. <strong>Clasificación IA:</strong> Use la pestaña "Clasificación Diagnóstica" para obtener predicciones</p>
                    <p>2. <strong>Agregar patología:</strong> Haga clic en "Agregar" junto a las predicciones relevantes</p>
                    <p>3. <strong>Verificación:</strong> Confirme o descarte patologías después de estudios clínicos</p>
                    <p>4. <strong>Contribución:</strong> Envíe casos confirmados para mejorar el modelo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agregar Nueva Patología */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nueva Patología</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pathology">Patología</Label>
                  <Select onValueChange={setNewPathology}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar patología" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonPathologies.map((pathology) => (
                        <SelectItem key={pathology} value={pathology}>
                          {pathology}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="probability">Probabilidad</Label>
                  <Select onValueChange={setPathologyProbability}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar probabilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta (&gt;70%)</SelectItem>
                      <SelectItem value="Media">Media (40-70%)</SelectItem>
                      <SelectItem value="Baja">Baja (&lt;40%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddPathology} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  placeholder="Observaciones del médico..."
                  value={pathologyNotes}
                  onChange={(e) => setPathologyNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Patologías */}
          <Card>
            <CardHeader>
              <CardTitle>Patologías Diagnosticadas</CardTitle>
              <CardDescription>
                Gestión del estado de patologías: pendientes, confirmadas y descartadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingPatient.patologias && editingPatient.patologias.length > 0 ? (
                <div className="space-y-4">
                  {editingPatient.patologias.map((patologia, index) => {
                    const isLegacyFormat = typeof patologia === 'string' || !patologia.estado;
                    const pathologyName = isLegacyFormat ? 
                      (typeof patologia === 'string' ? patologia : patologia.nombre) : 
                      patologia.nombre;
                    
                    return (
                      <div key={index} className={`border rounded-lg p-4 ${
                        !isLegacyFormat && patologia.estado === 'confirmada' ? 'border-green-200 bg-green-50' :
                        !isLegacyFormat && patologia.estado === 'descartada' ? 'border-red-200 bg-red-50' :
                        !isLegacyFormat && patologia.estado === 'pendiente' ? 'border-yellow-200 bg-yellow-50' :
                        'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Header con nombre y códigos */}
                            <div className="flex items-center gap-2 mb-2">
                              {!isLegacyFormat && patologia.codigo && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-mono px-2 py-1 rounded">
                                  {patologia.codigo}
                                </span>
                              )}
                              <h4 className="font-medium text-gray-900">{pathologyName}</h4>
                              
                              {/* Estado */}
                              {!isLegacyFormat && patologia.estado && (
                                <Badge variant={
                                  patologia.estado === 'confirmada' ? 'default' :
                                  patologia.estado === 'pendiente' ? 'secondary' : 'destructive'
                                } className={
                                  patologia.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                                  patologia.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {patologia.estado === 'confirmada' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {patologia.estado === 'pendiente' && <Clock className="h-3 w-3 mr-1" />}
                                  {patologia.estado === 'descartada' && <XCircle className="h-3 w-3 mr-1" />}
                                  {patologia.estado.charAt(0).toUpperCase() + patologia.estado.slice(1)}
                                </Badge>
                              )}

                              {/* Probabilidad */}
                              {patologia.probabilidad && (
                                <Badge variant={
                                  patologia.probabilidad === 'Alta' ? 'destructive' :
                                  patologia.probabilidad === 'Media' ? 'default' : 'secondary'
                                }>
                                  {!isLegacyFormat && patologia.probabilidadNumerica ? 
                                    `${patologia.probabilidadNumerica.toFixed(1)}%` :
                                    patologia.probabilidad
                                  }
                                </Badge>
                              )}

                              {/* Origen */}
                              {!isLegacyFormat && patologia.origen && (
                                <Badge variant="outline" className="text-xs">
                                  {patologia.origen === 'clasificacion_ia' ? '🤖 IA' : '👨‍⚕️ Manual'}
                                </Badge>
                              )}
                            </div>

                            {/* Categoría */}
                            {!isLegacyFormat && patologia.categoria && patologia.categoria !== 'Manual' && (
                              <p className="text-xs text-blue-600 mb-1">
                                Categoría: {patologia.categoria}
                              </p>
                            )}

                            {/* Notas */}
                            {patologia.notas && (
                              <p className="text-sm text-gray-600 mb-2">{patologia.notas}</p>
                            )}

                            {/* Fechas */}
                            <div className="text-xs text-gray-400 space-y-1">
                              {patologia.fechaAgregada && (
                                <p>Agregada: {patologia.fechaAgregada}</p>
                              )}
                              {patologia.fechaConfirmacion && (
                                <p>Confirmada: {patologia.fechaConfirmacion} por {patologia.confirmadoPor}</p>
                              )}
                              {patologia.fechaDescarte && (
                                <p>Descartada: {patologia.fechaDescarte} por {patologia.descartadoPor}</p>
                              )}
                              {/* Legacy support */}
                              {patologia.fechaDiagnostico && (
                                <p>Diagnosticada: {patologia.fechaDiagnostico}</p>
                              )}
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex gap-2 ml-4">
                            {!isLegacyFormat && patologia.estado === 'pendiente' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleConfirmPathology(index)}
                                  className="text-green-600 hover:text-green-700 border-green-200"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirmar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDiscardPathology(index)}
                                  className="text-red-600 hover:text-red-700 border-red-200"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Descartar
                                </Button>
                              </>
                            )}

                            {!isLegacyFormat && patologia.estado === 'confirmada' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendForRetraining(patologia)}
                                className="text-blue-600 hover:text-blue-700 border-blue-200"
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Enviar para Reentrenamiento
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemovePathology(index)}
                              className="text-gray-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay patologías diagnosticadas aún</p>
                  <p className="text-sm">Utilice el formulario superior o la clasificación IA para agregar diagnósticos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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

      {/* Diálogo de reentrenamiento */}
      <Dialog open={showRetrainingDialog} onOpenChange={setShowRetrainingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Brain className="h-5 w-5" />
              Datos Enviados para Reentrenamiento
            </DialogTitle>
            <DialogDescription>
              {retrainingMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowRetrainingDialog(false)}>
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientProfile; 