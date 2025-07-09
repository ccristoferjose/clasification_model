import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  BarChart3, 
  Map, 
  TrendingUp, 
  Users,
  Activity,
  MapPin,
  Target,
  Brain,
  AlertTriangle,
  Construction
} from 'lucide-react';

const Statistics = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Datos de ejemplo para categorías más comunes
  const topCategories = [
    { categoria: 'Sistema nervioso', casos: 1247, porcentaje: 23.5, color: 'bg-blue-500' },
    { categoria: 'Sistema digestivo', casos: 1098, porcentaje: 20.7, color: 'bg-green-500' },
    { categoria: 'Sistema respiratorio', casos: 892, porcentaje: 16.8, color: 'bg-yellow-500' },
    { categoria: 'Sistema circulatorio', casos: 756, porcentaje: 14.2, color: 'bg-red-500' },
    { categoria: 'Sistema musculoesquelético', casos: 623, porcentaje: 11.7, color: 'bg-purple-500' },
    { categoria: 'Infecciosas y parasitarias', casos: 487, porcentaje: 9.2, color: 'bg-orange-500' },
    { categoria: 'Ojo y sus anexos', casos: 234, porcentaje: 4.4, color: 'bg-pink-500' }
  ];

  // Datos de ejemplo para casos por departamento
  const departmentData = [
    { codigo: '1', nombre: 'Guatemala', casos: 3456, porcentaje: 42.3, coords: { x: 250, y: 180 } },
    { codigo: '9', nombre: 'Quetzaltenango', casos: 892, porcentaje: 10.9, coords: { x: 120, y: 200 } },
    { codigo: '16', nombre: 'Alta Verapaz', casos: 567, porcentaje: 6.9, coords: { x: 280, y: 120 } },
    { codigo: '13', nombre: 'Huehuetenango', casos: 445, porcentaje: 5.4, coords: { x: 80, y: 120 } },
    { codigo: '12', nombre: 'San Marcos', casos: 387, porcentaje: 4.7, coords: { x: 90, y: 220 } },
    { codigo: '5', nombre: 'Escuintla', casos: 334, porcentaje: 4.1, coords: { x: 220, y: 240 } },
    { codigo: '10', nombre: 'Suchitepéquez', casos: 298, porcentaje: 3.6, coords: { x: 150, y: 230 } },
    { codigo: '17', nombre: 'Petén', casos: 256, porcentaje: 3.1, coords: { x: 300, y: 60 } },
    { codigo: '19', nombre: 'Zacapa', casos: 234, porcentaje: 2.9, coords: { x: 380, y: 160 } },
    { codigo: '3', nombre: 'Sacatepéquez', casos: 212, porcentaje: 2.6, coords: { x: 230, y: 190 } }
  ];

  // Estadísticas generales
  const generalStats = [
    {
      title: 'Total de Casos',
      value: '8,165',
      change: '+12.4%',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Departamentos Activos',
      value: '22',
      change: '+2',
      icon: Map,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Precisión Promedio',
      value: '94.2%',
      change: '+1.8%',
      icon: Target,
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

  const getCircleSize = (casos) => {
    const minSize = 8;
    const maxSize = 40;
    const maxCasos = Math.max(...departmentData.map(d => d.casos));
    return minSize + (casos / maxCasos) * (maxSize - minSize);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Estadísticas del Sistema
        </h1>
        <p className="text-gray-600">
          Análisis de casos y distribución geográfica en Guatemala
        </p>
      </div>

      {/* Construction Warning */}
      <Card className="mb-8 border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                <Construction className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-800">
                  Página en Construcción
                </h3>
              </div>
              <div className="text-orange-700 space-y-2">
                <p className="font-medium">
                  ⚠️ Esta página está actualmente en desarrollo y contiene datos de ejemplo únicamente.
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Los datos mostrados son <strong>ficticios</strong> y no representan información real</li>
                  <li>• Las estadísticas son generadas automáticamente para fines de demostración</li>
                  <li>• <strong>NO</strong> utilice esta información para tomar decisiones médicas</li>
                  <li>• La funcionalidad completa estará disponible en futuras versiones</li>
                </ul>
                <p className="text-sm font-medium mt-3">
                  Para consultas médicas reales, utilice las funciones de clasificación y gestión de pacientes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {generalStats.map((stat) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Categorías más Frecuentes
            </CardTitle>
            <CardDescription>
              Distribución de casos por categoría CIE-10
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {category.categoria}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {category.casos.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({category.porcentaje}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${category.color} h-2 rounded-full transition-all duration-500`}
                      style={{width: `${category.porcentaje * 4}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Guatemala Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Map className="h-5 w-5 mr-2" />
              Mapa de Casos por Departamento
            </CardTitle>
            <CardDescription>
              Distribución geográfica de patologías detectadas
              {selectedDepartment && (
                <span className="block text-blue-600 font-medium mt-1">
                  {selectedDepartment.nombre}: {selectedDepartment.casos.toLocaleString()} casos ({selectedDepartment.porcentaje}%)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Simplified Guatemala Map SVG */}
              <svg 
                viewBox="0 0 400 300" 
                className="w-full h-80 border border-gray-200 rounded-lg bg-gradient-to-br from-green-50 to-blue-50"
              >
                {/* Guatemala outline (simplified) */}
                <path 
                  d="M 50 80 L 120 60 L 200 70 L 320 80 L 380 100 L 390 180 L 350 220 L 300 260 L 200 270 L 150 250 L 100 230 L 60 200 L 40 150 Z" 
                  fill="#e5f3ff" 
                  stroke="#3b82f6" 
                  strokeWidth="2"
                />
                
                {/* Department circles */}
                {departmentData.map((dept, index) => (
                  <g key={dept.codigo}>
                    <circle
                      cx={dept.coords.x}
                      cy={dept.coords.y}
                      r={getCircleSize(dept.casos)}
                      fill="#3b82f6"
                      fillOpacity="0.7"
                      stroke="#1e40af"
                      strokeWidth="2"
                      className="cursor-pointer hover:fill-opacity-90 transition-all"
                      onMouseEnter={() => setSelectedDepartment(dept)}
                      onMouseLeave={() => setSelectedDepartment(null)}
                    />
                    <text
                      x={dept.coords.x}
                      y={dept.coords.y + 4}
                      textAnchor="middle"
                      className="text-xs font-bold fill-white pointer-events-none"
                    >
                      {dept.casos > 500 ? dept.casos : ''}
                    </text>
                  </g>
                ))}
                
                {/* Legend */}
                <g transform="translate(10, 250)">
                  <text x="0" y="15" className="text-xs font-medium fill-gray-600">Casos:</text>
                  <circle cx="50" cy="10" r="6" fill="#3b82f6" fillOpacity="0.7" />
                  <text x="60" y="14" className="text-xs fill-gray-600">100-500</text>
                  <circle cx="110" cy="10" r="12" fill="#3b82f6" fillOpacity="0.7" />
                  <text x="125" y="14" className="text-xs fill-gray-600">500-1000</text>
                  <circle cx="190" cy="10" r="18" fill="#3b82f6" fillOpacity="0.7" />
                  <text x="212" y="14" className="text-xs fill-gray-600">1000+</text>
                </g>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Ranking Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Ranking de Departamentos
          </CardTitle>
          <CardDescription>
            Departamentos ordenados por número de casos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Departamento</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Casos</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Porcentaje</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept, index) => (
                  <tr key={dept.codigo} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">#{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="font-medium text-gray-900">{dept.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-gray-900">
                        {dept.casos.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-600">{dept.porcentaje}%</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-600 text-sm">
                        +{Math.floor(Math.random() * 15 + 5)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics; 