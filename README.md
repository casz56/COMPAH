# COMPAH — Compras Públicas de Alimentos del Huila v1.5

Prototipo funcional institucional para conectar productores locales, organizaciones ACFC, operadores, supervisores y entidades compradoras en el marco de la Ley 2046 de 2020.

## Novedades v1.5

- Pantalla de inicio tipo login antes de acceder al aplicativo.
- Mapa territorial del Huila ajustado con enfoque departamental, marcadores y polígono aproximado.
- Corrección de carga del mapa con `invalidateSize()` y `fitBounds()` para evitar desajustes visuales.
- Indicadores KPI más gráficos, dinámicos e interactivos.
- Panel de lectura ejecutiva al seleccionar cada KPI.
- Mejoras visuales en gráficas, barras de cumplimiento y distribución por línea agroalimentaria.

## Estructura

- `index.html`: estructura de la aplicación.
- `styles.css`: estilos institucionales y responsive.
- `app.js`: lógica de navegación, indicadores, mapa, reportes y validación.
- `data.js`: datos simulados de municipios, productores, productos, contratos y compras.
- `assets/`: logos institucionales.

## Uso

Abre `index.html` en el navegador o ejecuta con Live Server desde Visual Studio Code.

Datos de ingreso demo:

- Usuario: `admin.compah@huila.gov.co`
- Contraseña: `demo2026`
- Rol: cualquiera de los disponibles.

## Nota jurídica

El registro en COMPAH no constituye adjudicación, habilitación contractual ni obligación de compra. La plataforma es un instrumento de información, articulación, trazabilidad y seguimiento de compras públicas locales de alimentos. No reemplaza SECOP II ni los procedimientos de contratación pública.


## Versión 1.2
- Corrección definitiva del mapa Leaflet con CSS crítico embebido.
- Reconstrucción del mapa al entrar a la vista para evitar tiles dispersos.
- Ajuste de enfoque al Huila y marcadores estilo desarrollo Día E.
- Botones de mapa: Ajustar Huila y Ver oferta.


## Versión 1.5
Rediseño premium ejecutivo con predominio de blanco, tarjetas KPI sobrias, paneles institucionales limpios, mayor jerarquía visual y mapa conservado con lectura dinámica al pasar el cursor sobre marcadores.


## Versión 1.5

- Rediseño premium sobrio con predominio de blanco.
- Corrección de jerarquía tipográfica: menor uso de negrilla pesada, tamaños fluidos y valores KPI sin desbordamiento.
- KPIs minimalistas, ejecutivos y con auto scale para valores largos.
- Catálogo de productos más interactivo: tarjetas con métricas, panel de lectura por línea y botón para analizar el producto en el mapa.
- Menor carga cromática en layout, dashboard, tarjetas y gráficos.
