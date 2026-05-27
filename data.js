const COMPAH = {
  municipios: [
    { nombre: 'Neiva', region: 'Norte', lat: 2.9345, lng: -75.2809 },
    { nombre: 'Pitalito', region: 'Sur', lat: 1.8537, lng: -76.0514 },
    { nombre: 'Garzón', region: 'Centro', lat: 2.1959, lng: -75.6278 },
    { nombre: 'La Plata', region: 'Occidente', lat: 2.3934, lng: -75.8923 },
    { nombre: 'Campoalegre', region: 'Norte', lat: 2.6849, lng: -75.3231 },
    { nombre: 'Palermo', region: 'Norte', lat: 2.8917, lng: -75.4372 },
    { nombre: 'Rivera', region: 'Norte', lat: 2.7773, lng: -75.2564 },
    { nombre: 'Gigante', region: 'Centro', lat: 2.3867, lng: -75.5472 },
    { nombre: 'San Agustín', region: 'Sur', lat: 1.8797, lng: -76.2698 },
    { nombre: 'Isnos', region: 'Sur', lat: 1.9337, lng: -76.2155 },
    { nombre: 'Suaza', region: 'Sur', lat: 1.9758, lng: -75.7959 },
    { nombre: 'Timaná', region: 'Sur', lat: 1.9711, lng: -75.9326 },
    { nombre: 'Algeciras', region: 'Norte', lat: 2.5225, lng: -75.3148 },
    { nombre: 'Aipe', region: 'Norte', lat: 3.2223, lng: -75.2377 },
    { nombre: 'Tello', region: 'Norte', lat: 3.0669, lng: -75.1389 },
    { nombre: 'Baraya', region: 'Norte', lat: 3.1532, lng: -75.0544 },
    { nombre: 'Colombia', region: 'Norte', lat: 3.3767, lng: -74.8026 },
    { nombre: 'Villavieja', region: 'Norte', lat: 3.2201, lng: -75.2187 },
    { nombre: 'Yaguará', region: 'Centro', lat: 2.6633, lng: -75.5177 },
    { nombre: 'Tesalia', region: 'Occidente', lat: 2.4853, lng: -75.7309 },
    { nombre: 'Paicol', region: 'Occidente', lat: 2.4496, lng: -75.7736 },
    { nombre: 'Nátaga', region: 'Occidente', lat: 2.5432, lng: -75.8087 },
    { nombre: 'Íquira', region: 'Occidente', lat: 2.6486, lng: -75.6353 },
    { nombre: 'Teruel', region: 'Occidente', lat: 2.7411, lng: -75.5691 },
    { nombre: 'Santa María', region: 'Occidente', lat: 2.9372, lng: -75.5867 },
    { nombre: 'Oporapa', region: 'Sur', lat: 2.0261, lng: -75.9955 },
    { nombre: 'Saladoblanco', region: 'Sur', lat: 1.9927, lng: -76.0435 },
    { nombre: 'Elías', region: 'Sur', lat: 2.0134, lng: -75.9382 },
    { nombre: 'Tarqui', region: 'Centro', lat: 2.1128, lng: -75.8244 },
    { nombre: 'Agrado', region: 'Centro', lat: 2.2585, lng: -75.7713 },
    { nombre: 'Guadalupe', region: 'Sur', lat: 2.0246, lng: -75.7562 },
    { nombre: 'Acevedo', region: 'Sur', lat: 1.8054, lng: -75.8903 },
    { nombre: 'Altamira', region: 'Sur', lat: 2.0639, lng: -75.7876 },
    { nombre: 'Hobo', region: 'Centro', lat: 2.5828, lng: -75.4511 },
    { nombre: 'Palestina', region: 'Sur', lat: 1.7226, lng: -76.1274 },
    { nombre: 'La Argentina', region: 'Occidente', lat: 2.1978, lng: -75.9792 },
    { nombre: 'El Pital', region: 'Centro', lat: 2.2671, lng: -75.8041 }
  ],
  productos: [
    { nombre: 'Leche cruda refrigerada', categoria: 'Lácteos', unidad: 'litros', requisito: 'Buenas prácticas / cadena de frío', icono: '🥛' },
    { nombre: 'Queso campesino', categoria: 'Lácteos', unidad: 'kg', requisito: 'INVIMA cuando aplique', icono: '🧀' },
    { nombre: 'Carne bovina', categoria: 'Carnes', unidad: 'kg', requisito: 'Planta autorizada / INVIMA', icono: '🥩' },
    { nombre: 'Carne porcina', categoria: 'Carnes', unidad: 'kg', requisito: 'Planta autorizada / INVIMA', icono: '🥓' },
    { nombre: 'Pollo campesino', categoria: 'Carnes', unidad: 'kg', requisito: 'Cadena de frío', icono: '🍗' },
    { nombre: 'Tilapia', categoria: 'Piscícola', unidad: 'kg', requisito: 'ICA / cadena de frío', icono: '🐟' },
    { nombre: 'Huevos', categoria: 'Proteína', unidad: 'cubetas', requisito: 'Buenas prácticas', icono: '🥚' },
    { nombre: 'Cholupa', categoria: 'Pasifloras', unidad: 'kg', requisito: 'Calidad e inocuidad', icono: '🍈' },
    { nombre: 'Maracuyá', categoria: 'Pasifloras', unidad: 'kg', requisito: 'Calidad e inocuidad', icono: '🍈' },
    { nombre: 'Granadilla', categoria: 'Pasifloras', unidad: 'kg', requisito: 'Calidad e inocuidad', icono: '🍊' },
    { nombre: 'Café pergamino', categoria: 'Café y cacao', unidad: 'kg', requisito: 'Trazabilidad', icono: '☕' },
    { nombre: 'Cacao', categoria: 'Café y cacao', unidad: 'kg', requisito: 'Trazabilidad', icono: '🍫' },
    { nombre: 'Plátano', categoria: 'Frutas y tubérculos', unidad: 'kg', requisito: 'Calidad e inocuidad', icono: '🍌' },
    { nombre: 'Yuca', categoria: 'Frutas y tubérculos', unidad: 'kg', requisito: 'Calidad e inocuidad', icono: '🥔' },
    { nombre: 'Arroz', categoria: 'Cereales', unidad: 'kg', requisito: 'Ficha técnica', icono: '🌾' },
    { nombre: 'Maíz', categoria: 'Cereales', unidad: 'kg', requisito: 'Ficha técnica', icono: '🌽' },
    { nombre: 'Panela', categoria: 'Transformados', unidad: 'kg', requisito: 'Registro sanitario cuando aplique', icono: '🟫' },
    { nombre: 'Tomate', categoria: 'Verduras y hortalizas', unidad: 'kg', requisito: 'Calidad e inocuidad', icono: '🍅' },
    { nombre: 'Cebolla larga', categoria: 'Verduras y hortalizas', unidad: 'kg', requisito: 'Calidad e inocuidad', icono: '🧅' },
    { nombre: 'Aguacate', categoria: 'Frutas', unidad: 'kg', requisito: 'Calidad e inocuidad', icono: '🥑' }
  ]
};

const producerNames = [
  'Asociación AgroHuila Grande', 'Finca El Bambuco', 'Cooperativa Campo Vivo', 'Agropecuaria Los Guaduales',
  'Asociación Mujeres Rurales del Huila', 'Finca La Esperanza', 'Productores Unidos del Magdalena', 'Asociación Frutos del Sur',
  'Colectivo ACFC La Montaña', 'Finca El Cedral', 'Asociación Piscícola del Huila', 'AgroVerde Campesino'
];

COMPAH.productores = COMPAH.municipios.map((m, index) => {
  const p1 = COMPAH.productos[index % COMPAH.productos.length];
  const p2 = COMPAH.productos[(index + 7) % COMPAH.productos.length];
  const tipo = index % 4 === 0 ? 'Organización ACFC' : 'Productor individual';
  return {
    id: index + 1,
    nombre: `${producerNames[index % producerNames.length]} ${m.nombre}`,
    municipio: m.nombre,
    region: m.region,
    vereda: ['El Centro', 'La Esperanza', 'San Isidro', 'Alto Bonito', 'El Progreso'][index % 5],
    tipo,
    productos: [p1.nombre, p2.nombre],
    categoria: p1.categoria,
    capacidad: (350 + (index * 137)) % 2600 + 250,
    unidad: p1.unidad,
    estado: index % 6 === 0 ? 'Requiere subsanación' : 'Validado',
    lat: m.lat + ((index % 3) - 1) * 0.025,
    lng: m.lng + ((index % 4) - 1) * 0.025,
    mujeres: 35 + (index % 6) * 7,
    jovenes: 12 + (index % 5) * 5
  };
});

COMPAH.contratos = [
  { id: 1, nombre: 'PAE Huila 2026', entidad: 'Gobernación del Huila', operador: 'Operador Alimentario Surcolombiano', supervisor: 'Secretaría de Educación', valorTotal: 18500000000, valorAlimentos: 14200000000, comprasLocales: 5112000000, programa: 'PAE', municipio: 'Neiva' },
  { id: 2, nombre: 'Alimentación Hospitalaria Red ESE', entidad: 'ESE Departamental', operador: 'NutriHuila S.A.S.', supervisor: 'Secretaría de Salud', valorTotal: 5200000000, valorAlimentos: 3900000000, comprasLocales: 900000000, programa: 'Hospitales', municipio: 'Garzón' },
  { id: 3, nombre: 'Centros Vida Adulto Mayor', entidad: 'Gobernación del Huila', operador: 'Fundación Vida Rural', supervisor: 'Desarrollo Social', valorTotal: 2100000000, valorAlimentos: 1580000000, comprasLocales: 790000000, programa: 'Adulto mayor', municipio: 'Pitalito' },
  { id: 4, nombre: 'Primera Infancia Región Norte', entidad: 'Entidad territorial', operador: 'Alimentos del Alto Magdalena', supervisor: 'Supervisión Intersectorial', valorTotal: 3400000000, valorAlimentos: 2800000000, comprasLocales: 670000000, programa: 'Primera infancia', municipio: 'Campoalegre' },
  { id: 5, nombre: 'Programa Social Seguridad Alimentaria', entidad: 'Gobernación del Huila', operador: 'Unión Temporal Huila Alimenta', supervisor: 'Secretaría de Agricultura', valorTotal: 6100000000, valorAlimentos: 4700000000, comprasLocales: 1880000000, programa: 'Seguridad alimentaria', municipio: 'La Plata' }
];

COMPAH.compras = [
  { id: 1, fecha: '2026-02-15', contratoId: 1, productorId: 2, producto: 'Arroz', cantidad: 12000, unidad: 'kg', valor: 55200000, estado: 'Aprobado' },
  { id: 2, fecha: '2026-02-18', contratoId: 1, productorId: 8, producto: 'Cholupa', cantidad: 2500, unidad: 'kg', valor: 18750000, estado: 'Pendiente' },
  { id: 3, fecha: '2026-02-20', contratoId: 2, productorId: 3, producto: 'Tilapia', cantidad: 1800, unidad: 'kg', valor: 21600000, estado: 'Observado' },
  { id: 4, fecha: '2026-02-22', contratoId: 3, productorId: 9, producto: 'Huevos', cantidad: 900, unidad: 'cubetas', valor: 16200000, estado: 'Aprobado' },
  { id: 5, fecha: '2026-02-25', contratoId: 4, productorId: 15, producto: 'Plátano', cantidad: 3600, unidad: 'kg', valor: 10800000, estado: 'Pendiente' },
  { id: 6, fecha: '2026-03-01', contratoId: 5, productorId: 21, producto: 'Panela', cantidad: 4200, unidad: 'kg', valor: 25200000, estado: 'Pendiente' }
];
