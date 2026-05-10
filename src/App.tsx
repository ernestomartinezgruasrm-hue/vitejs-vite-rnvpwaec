import { useState, useMemo, useEffect } from 'react';
import {
  Truck, Calculator, FileText, Map, Settings, AlertTriangle,
  Download, Plus, Trash2, ChevronRight, Activity, Layers, Ruler,
  Building2, Cable, TreePine, Mountain, Gauge, Target, ShieldCheck,
  Printer, Check, Award, Info
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DATOS OEM OFICIALES — Grove GMK6300L
// Fuente: Manitowoc GMK6300L Product Guide, septiembre 2013
// Tablas según EN 13000:2010-10 · Estabilizadores 8.5 m · 360° · pluma sola
// ═══════════════════════════════════════════════════════════════════════════
const GMK6300L_BOOMS = [15.58, 20.93, 26.24, 31.52, 36.81, 42.09, 47.53, 52.87, 58.41, 63.85, 69.32, 74.77, 80.00];

// Cada fila: [radio, capacidad@boom1, capacidad@boom2, ...]
// null = configuración no permitida
const GMK6300L_CHARTS = {
  '92.5': [
    [3, 190, 152, null, null, null, null, null, null, null, null, null, null, null],
    [4, 165, 152, 138, null, null, null, null, null, null, null, null, null, null],
    [5, 144, 140, 132, 104, null, null, null, null, null, null, null, null, null],
    [6, 127, 126, 118, 104, 80.5, null, null, null, null, null, null, null, null],
    [7, 113, 112, 108, 104, 80.5, 63, null, null, null, null, null, null, null],
    [8, 102, 102, 99, 95, 80.5, 63, 50, null, null, null, null, null, null],
    [9, 91.5, 92, 90, 88, 80, 63, 50, 38, null, null, null, null, null],
    [10, 82, 82.5, 82.5, 81.5, 75.5, 63, 50, 38, 29, null, null, null, null],
    [11, 73.5, 74, 74, 73, 71.5, 61.5, 50, 38, 29, 22.5, null, null, null],
    [12, 62, 67, 66.5, 66, 67, 58.5, 48.5, 38, 29, 22.5, 17.6, null, null],
    [13, null, 61, 60.5, 60, 61, 55.5, 47, 38, 29, 22.5, 17.6, 14.3, null],
    [14, null, 56.5, 55.5, 54.5, 55.5, 53, 45.5, 37.5, 29, 22.5, 17.6, 14.3, 12],
    [15, null, 52, 51.5, 50.5, 51, 50.5, 44, 35.5, 29, 22.5, 17.6, 14.3, 12],
    [16, null, 48, 48.5, 47.5, 47, 48, 42.5, 33.5, 29, 22.5, 17.6, 14.3, 12],
    [18, null, null, 41.5, 41, 40, 41.5, 39, 30.5, 28, 22.5, 17.6, 14.3, 12],
    [20, null, null, 36, 35.5, 35, 36, 36, 27, 25.5, 22.5, 17.6, 14.3, 12],
    [22, null, null, 31, 31.5, 32, 31.5, 32.5, 24.5, 23, 21.5, 17.6, 14.3, 12],
    [24, null, null, null, 28, 29, 28, 29, 22.5, 21, 20, 17.6, 14.3, 12],
    [26, null, null, null, 26, 25.5, 25, 26, 20, 19, 18.2, 16.9, 14.3, 12],
    [28, null, null, null, 19.4, 23, 23.5, 23.5, 18, 17, 16.5, 15.8, 14.3, 12],
    [30, null, null, null, null, 21, 22, 21, 17, 15.6, 15.1, 14.7, 13.8, 12],
    [32, null, null, null, null, 18.6, 19.8, 18.8, 16.2, 14.2, 13.8, 13.6, 13, 12],
    [34, null, null, null, null, null, 17.9, 16.9, 15.5, 13.1, 12.7, 12.6, 12.2, 11.7],
    [36, null, null, null, null, null, 16.2, 15.2, 14.8, 11.9, 11.6, 11.5, 11.5, 11.1],
    [38, null, null, null, null, null, 12.9, 13.7, 14.3, 11, 10.7, 10.6, 10.7, 10.5],
    [40, null, null, null, null, null, null, 12.7, 13.3, 10.1, 9.8, 9.7, 9.9, 9.5],
    [42, null, null, null, null, null, null, 12.4, 12.1, 9, 8.7, 8.7, 8.9, 8.6],
    [44, null, null, null, null, null, null, null, 11.1, 7.9, 7.9, 8.1, 7.8, 8.1],
    [46, null, null, null, null, null, null, null, 10.1, 7.3, 7.6, 7.7, 7.2, 7.6],
    [48, null, null, null, null, null, null, null, 8.4, 6.7, 7.2, 7.3, 6.7, 7],
    [50, null, null, null, null, null, null, null, null, 6.3, 6.9, 6.9, 6.3, 6.5],
    [52, null, null, null, null, null, null, null, null, 6, 6.6, 6.6, 5.9, 6],
    [54, null, null, null, null, null, null, null, null, 5.7, 6.3, 6.3, 5.5, 5.5],
    [56, null, null, null, null, null, null, null, null, null, 6.1, 6, 5.2, 5.1],
    [58, null, null, null, null, null, null, null, null, null, 5.9, 5.7, 4.9, 4.7],
    [60, null, null, null, null, null, null, null, null, null, null, 5.4, 4.6, 4.4],
    [62, null, null, null, null, null, null, null, null, null, null, 5.2, 4.3, 4],
    [64, null, null, null, null, null, null, null, null, null, null, 4.1, 4.1, 3.7],
    [66, null, null, null, null, null, null, null, null, null, null, null, 3.8, 3.4],
    [68, null, null, null, null, null, null, null, null, null, null, null, 3.6, 3],
    [70, null, null, null, null, null, null, null, null, null, null, null, 1.9, 2.6],
  ],
  '54.5': [
    [3, 188, 152, null, null, null, null, null, null, null, null, null, null, null],
    [4, 160, 152, 138, null, null, null, null, null, null, null, null, null, null],
    [5, 139, 139, 132, 104, null, null, null, null, null, null, null, null, null],
    [6, 121, 121, 118, 104, 80.5, null, null, null, null, null, null, null, null],
    [7, 104, 104, 104, 103, 80.5, 63, null, null, null, null, null, null, null],
    [8, 89.5, 90, 89.5, 88.5, 80.5, 63, 50, null, null, null, null, null, null],
    [9, 77.5, 79.5, 78, 77, 75.5, 63, 50, 38, null, null, null, null, null],
    [10, 68, 69.5, 70, 69.5, 66, 63, 50, 38, 29, null, null, null, null],
    [11, 60, 61.5, 62, 61.5, 59.5, 57, 50, 38, 29, 22.5, null, null, null],
    [12, 54, 55.5, 55.5, 55.5, 55, 51, 48.5, 38, 29, 22.5, 17.6, null, null],
    [13, null, 50, 50.5, 50, 49.5, 46, 46, 38, 29, 22.5, 17.6, 14.3, null],
    [14, null, 46, 45.5, 46, 45, 41.5, 42, 37.5, 29, 22.5, 17.6, 14.3, 12],
    [15, null, 41, 40.5, 42, 41, 39.5, 38, 35.5, 29, 22.5, 17.6, 14.3, 12],
    [16, null, 36.5, 36.5, 38, 37.5, 37.5, 35, 32.5, 29, 22.5, 17.6, 14.3, 12],
    [18, null, null, 31, 31, 31, 32, 30, 27.5, 26.5, 22.5, 17.6, 14.3, 12],
    [20, null, null, 26, 26, 27.5, 27, 25.5, 24, 23, 22, 17.6, 14.3, 12],
    [22, null, null, 22, 22.5, 23.5, 23, 22, 21.5, 19.7, 19.2, 17.6, 14.3, 12],
    [24, null, null, null, 20.5, 20.5, 19.7, 18.7, 19.7, 17, 16.6, 16.8, 14.3, 12],
    [26, null, null, null, 18, 17.8, 17.1, 17.6, 17.1, 14.8, 14.5, 14.6, 14.3, 12],
    [28, null, null, null, 15.8, 15.6, 15.2, 16, 14.9, 12.8, 13.2, 13.6, 13.7, 12],
    [30, null, null, null, null, 13.8, 14.5, 14.1, 13, 11.6, 12.4, 12.8, 12.9, 11.9],
    [32, null, null, null, null, 12.4, 13.2, 12.5, 11.4, 10.8, 11.6, 12.1, 11.7, 10.5],
    [34, null, null, null, null, null, 11.8, 11.1, 10.1, 10.2, 10.8, 10.8, 10.4, 9.3],
    [36, null, null, null, null, null, 10.5, 9.9, 8.8, 9.6, 10.1, 9.8, 9.2, 8.2],
    [38, null, null, null, null, null, 9.5, 8.8, 7.8, 8.5, 9.3, 8.6, 8.2, 7.3],
    [40, null, null, null, null, null, null, 7.8, 6.8, 8.1, 8.4, 7.8, 7.2, 6.4],
    [42, null, null, null, null, null, null, 7, 6, 7.6, 7.5, 6.9, 6.3, 5.6],
    [44, null, null, null, null, null, null, null, 5.2, 6.8, 6.7, 6.1, 5.6, 4.8],
    [46, null, null, null, null, null, null, null, 4.5, 6.3, 6, 5.4, 4.9, 4.1],
    [48, null, null, null, null, null, null, null, 3.9, 5.7, 5.4, 4.8, 4.2, 3.5],
    [50, null, null, null, null, null, null, null, null, 5.1, 4.8, 4.2, 3.6, 2.9],
    [52, null, null, null, null, null, null, null, null, 4.6, 4.2, 3.7, 3.1, 2.3],
    [54, null, null, null, null, null, null, null, null, 4.1, 3.7, 3.2, 2.6, 1.7],
    [56, null, null, null, null, null, null, null, null, null, 3.3, 2.7, 2.1, 1.2],
    [58, null, null, null, null, null, null, null, null, null, 2.9, 2.3, 1.6, null],
    [60, null, null, null, null, null, null, null, null, null, null, 1.8, null, null],
    [62, null, null, null, null, null, null, null, null, null, null, 1.4, null, null],
  ],
  '35.5': [
    [3, 185, 152, null, null, null, null, null, null, null, null, null, null, null],
    [4, 158, 152, 138, null, null, null, null, null, null, null, null, null, null],
    [5, 135, 134, 132, 104, null, null, null, null, null, null, null, null, null],
    [6, 112, 112, 112, 104, 80.5, null, null, null, null, null, null, null, null],
    [7, 94.5, 95, 94.5, 85.5, 80.5, 63, null, null, null, null, null, null, null],
    [8, 79.5, 80.5, 80.5, 74.5, 71.5, 63, 50, null, null, null, null, null, null],
    [9, 68.5, 70, 68.5, 64, 61.5, 56.5, 50, 38, null, null, null, null, null],
    [10, 60, 61.5, 59, 57.5, 53.5, 49.5, 48.5, 38, 29, null, null, null, null],
    [11, 50.5, 53.5, 51.5, 50.5, 47, 46.5, 43, 38, 29, 22.5, null, null, null],
    [12, 43, 46, 45.5, 45, 42, 42, 38.5, 35.5, 29, 22.5, 17.6, null, null],
    [13, null, 40, 41, 40, 40, 37.5, 34.5, 32, 29, 22.5, 17.6, 14.3, null],
    [14, null, 35, 36, 36, 36.5, 34, 31.5, 29, 27.5, 22.5, 17.6, 14.3, 12],
    [15, null, 31, 32, 32, 33, 31, 28.5, 27.5, 25, 22.5, 17.6, 14.3, 12],
    [16, null, 27.5, 28.5, 30, 30, 28.5, 26, 26.5, 22.5, 22, 17.6, 14.3, 12],
    [18, null, null, 24.5, 25, 25, 24, 23, 22, 18.8, 18.7, 17.6, 14.3, 12],
    [20, null, null, 20.5, 21, 20.5, 20, 21, 19, 16.6, 17.3, 17.2, 14.3, 12],
    [22, null, null, 17.1, 17.6, 17.4, 18.5, 17.8, 16.3, 15.4, 16.2, 16, 14.3, 12],
    [24, null, null, null, 15, 15.5, 15.9, 15.2, 14, 14.2, 14.7, 14, 12.8, 11.5],
    [26, null, null, null, 13, 14, 13.7, 13, 12, 13.3, 13.3, 12.2, 11.1, 9.9],
    [28, null, null, null, 12, 12.2, 11.9, 11.2, 10.1, 12.1, 11.7, 10.6, 9.6, 8.4],
    [30, null, null, null, null, 10.7, 10.9, 9.7, 8.6, 10.6, 10.3, 9.3, 8.3, 7.2],
    [32, null, null, null, null, 9.3, 9.8, 8.4, 7.3, 9.2, 8.9, 8.1, 7.2, 6],
    [34, null, null, null, null, null, 8.7, 7.9, 6.1, 8.1, 7.8, 7.1, 6.1, 5.1],
    [36, null, null, null, null, null, 7.7, 7.3, 5.1, 7, 6.7, 6.1, 5.2, 4.2],
    [38, null, null, null, null, null, 6.8, 6.7, 4.1, 6.1, 5.8, 5.3, 4.4, 3.4],
    [40, null, null, null, null, null, null, 5.9, 3.3, 5.4, 5.1, 4.4, 3.7, 2.7],
    [42, null, null, null, null, null, null, 5.2, 2.6, 4.6, 4.3, 3.7, 3, 2],
    [44, null, null, null, null, null, null, null, 1.9, 4, 3.7, 3, 2.3, 1.5],
    [46, null, null, null, null, null, null, null, 1.3, 3.4, 3, 2.4, 1.7, null],
    [48, null, null, null, null, null, null, null, null, 2.8, 2.5, 1.8, null, null],
    [50, null, null, null, null, null, null, null, null, 2.3, 1.9, 1.3, null, null],
    [52, null, null, null, null, null, null, null, null, 1.9, 1.5, null, null, null],
    [54, null, null, null, null, null, null, null, null, 1.5, null, null, null, null],
  ],
  '21.2': [
    [3, 183, 152, null, null, null, null, null, null, null, null, null, null, null],
    [4, 154, 152, 138, null, null, null, null, null, null, null, null, null, null],
    [5, 127, 127, 121, 104, null, null, null, null, null, null, null, null, null],
    [6, 104, 104, 94.5, 83.5, 78.5, null, null, null, null, null, null, null, null],
    [7, 85.5, 82.5, 77.5, 74, 67.5, 61, null, null, null, null, null, null, null],
    [8, 72, 70, 64, 61.5, 56.5, 53.5, 50, null, null, null, null, null, null],
    [9, 57.5, 58.5, 55.5, 52, 49, 47.5, 43.5, 38, null, null, null, null, null],
    [10, 46.5, 49.5, 48, 45, 44.5, 41.5, 38, 34.5, 29, null, null, null, null],
    [11, 38.5, 42, 41.5, 41, 39.5, 36.5, 33.5, 32, 28.5, 22.5, null, null, null],
    [12, 32, 35.5, 36.5, 37, 35, 32.5, 30, 29.5, 25, 22.5, 17.6, null, null],
    [13, null, 30.5, 33, 33, 31, 29, 28.5, 26.5, 22, 21.5, 17.6, 14.3, null],
    [14, null, 26.5, 29, 29.5, 28, 25.5, 26, 23.5, 21.5, 21.5, 17.6, 14.3, 12],
    [15, null, 24, 26, 26.5, 25, 24.5, 23.5, 21, 20.5, 20.5, 16.7, 14.3, 12],
    [16, null, 21, 23, 23.5, 22.5, 23, 21.5, 19.1, 19.6, 19.7, 16.5, 14.3, 12],
    [18, null, null, 18.2, 18.8, 18.6, 19.4, 17.7, 15.7, 17.6, 16.6, 15.3, 14, 12],
    [20, null, null, 14.7, 15.8, 15, 16.2, 14.9, 13, 14.9, 14.1, 12.9, 11.6, 10.3],
    [22, null, null, 12, 13.6, 13.1, 14.4, 13.3, 10.8, 12.7, 12, 10.8, 9.7, 8.4],
    [24, null, null, null, 11.4, 13.2, 12.1, 12.1, 8.9, 10.9, 10.2, 9.1, 8.1, 6.9],
    [26, null, null, null, 9.6, 11.8, 10.3, 10.3, 7.4, 9.4, 8.7, 7.7, 6.7, 5.5],
    [28, null, null, null, 8.1, 10, 8.8, 8.8, 6, 8.1, 7.4, 6.5, 5.5, 4.4],
    [30, null, null, null, null, 8.5, 7.5, 7.5, 4.7, 6.9, 6.3, 5.4, 4.5, 3.4],
    [32, null, null, null, null, 7.2, 6.4, 6.4, 3.6, 5.8, 5.4, 4.5, 3.5, 2.4],
    [34, null, null, null, null, 6.1, 5.5, 5.4, 2.6, 4.8, 4.5, 3.6, 2.7, 1.6],
    [36, null, null, null, null, null, 4.7, 4.6, 1.8, 4, 3.6, 2.9, 2, null],
    [38, null, null, null, null, null, 3.9, 3.8, null, 3.2, 2.9, 2.2, 1.3, null],
    [40, null, null, null, null, null, null, 3.1, null, 2.5, 2.2, 1.5, null, null],
    [42, null, null, null, null, null, null, 2.5, null, 1.9, 1.6, null, null, null],
    [44, null, null, null, null, null, null, null, null, 1.4, null, null, null, null],
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// FLOTA RM
// ═══════════════════════════════════════════════════════════════════════════
const RM_FLEET = [
  {
    id: 'gmk6300l', brand: 'Grove', model: 'GMK6300L', capacity: 300,
    type: 'Todo Terreno', boomMax: 80.0, boomMin: 15.58,
    boomAngleMin: -1.5, boomAngleMax: 83,
    pivotHeight: 3.0, pivotToCenter: 1.95, tailSwing: 5.5,
    outriggerSpan: 8.5, outriggerPad: 0.3848,
    counterweights: [
      { v: '92.5', label: '92.5 t (máx · opcional)' },
      { v: '54.5', label: '54.5 t (estándar)' },
      { v: '35.5', label: '35.5 t (intermedio)' },
      { v: '21.2', label: '21.2 t (ligero)' },
    ],
    hookBlocks: [
      { cap: 200, weight: 2400, label: '200 t · 9 poleas' },
      { cap: 160, weight: 1750, label: '160 t · 7 poleas' },
      { cap: 125, weight: 1650, label: '125 t · 5 poleas' },
      { cap: 80, weight: 950, label: '80 t · 3 poleas' },
      { cap: 32, weight: 600, label: '32 t · 1 polea' },
      { cap: 12, weight: 300, label: '12 t · hook ball' },
    ],
    chartType: 'official',
    chartTables: GMK6300L_CHARTS,
    booms: GMK6300L_BOOMS,
    source: 'Manitowoc Product Guide v201309 · EN 13000:2010-10',
  },
  { id: 'gmk5150l', brand: 'Grove', model: 'GMK5150L', capacity: 150, type: 'Todo Terreno',
    boomMax: 60, boomMin: 13.0, boomAngleMin: -1, boomAngleMax: 82,
    pivotHeight: 2.6, pivotToCenter: 1.7, tailSwing: 3.6,
    outriggerSpan: 7.4, outriggerPad: 0.28,
    chartType: 'estimated',
    chartCurve: [[3,150],[5,118],[8,82],[12,52],[16,36],[20,26],[25,18],[30,13],[40,7],[50,4]],
    hookBlocks: [{ cap: 80, weight: 800, label: '80 t' }, { cap: 32, weight: 500, label: '32 t' }] },
  { id: 'rt890e', brand: 'Grove', model: 'RT890E', capacity: 80, type: 'Todo Terreno',
    boomMax: 43, boomMin: 11.7, boomAngleMin: -3, boomAngleMax: 78,
    pivotHeight: 2.3, pivotToCenter: 1.4, tailSwing: 3.0,
    outriggerSpan: 6.4, outriggerPad: 0.18,
    chartType: 'estimated',
    chartCurve: [[3,80],[5,58],[8,38],[12,24],[16,16],[20,11],[25,7],[30,5],[40,2.5]],
    hookBlocks: [{ cap: 50, weight: 600, label: '50 t' }, { cap: 16, weight: 350, label: '16 t' }] },
  { id: 'tms9000', brand: 'Grove', model: 'TMS9000-2', capacity: 100, type: 'Montada en Camión',
    boomMax: 47, boomMin: 11.6, boomAngleMin: -2, boomAngleMax: 80,
    pivotHeight: 2.4, pivotToCenter: 1.5, tailSwing: 3.2,
    outriggerSpan: 6.7, outriggerPad: 0.20,
    chartType: 'estimated',
    chartCurve: [[3,100],[5,72],[8,46],[12,29],[16,20],[20,14],[25,9],[30,6.5],[40,3.5]],
    hookBlocks: [{ cap: 50, weight: 700, label: '50 t' }, { cap: 16, weight: 350, label: '16 t' }] },
  { id: 'tms800e', brand: 'Grove', model: 'TMS800E', capacity: 70, type: 'Montada en Camión',
    boomMax: 38, boomMin: 11.0, boomAngleMin: -2, boomAngleMax: 78,
    pivotHeight: 2.3, pivotToCenter: 1.4, tailSwing: 2.9,
    outriggerSpan: 6.4, outriggerPad: 0.18,
    chartType: 'estimated',
    chartCurve: [[3,70],[5,52],[8,32],[12,20],[16,13],[20,9],[25,5.5],[30,3.5]],
    hookBlocks: [{ cap: 35, weight: 500, label: '35 t' }, { cap: 12, weight: 300, label: '12 t' }] },
  { id: 'tms540', brand: 'Grove', model: 'TMS540', capacity: 35, type: 'Montada en Camión',
    boomMax: 32, boomMin: 10.0, boomAngleMin: -1, boomAngleMax: 78,
    pivotHeight: 2.1, pivotToCenter: 1.3, tailSwing: 2.6,
    outriggerSpan: 5.5, outriggerPad: 0.15,
    chartType: 'estimated',
    chartCurve: [[3,35],[5,24],[8,15],[12,9],[16,6],[20,4],[25,2.5],[30,1.5]],
    hookBlocks: [{ cap: 16, weight: 350, label: '16 t' }, { cap: 8, weight: 200, label: '8 t' }] },
  { id: 'titan40', brand: 'Titan', model: 'Hidráulica 40T', capacity: 40, type: 'Montada en Camión',
    boomMax: 30, boomMin: 9.5, boomAngleMin: 0, boomAngleMax: 78,
    pivotHeight: 2.0, pivotToCenter: 1.3, tailSwing: 2.5,
    outriggerSpan: 5.8, outriggerPad: 0.16,
    chartType: 'estimated',
    chartCurve: [[3,40],[5,28],[8,18],[12,11],[16,7.5],[20,5],[25,3],[30,2]],
    hookBlocks: [{ cap: 20, weight: 400, label: '20 t' }, { cap: 8, weight: 200, label: '8 t' }] },
  { id: 'terex22', brand: 'Terex', model: 'BT4792 22T', capacity: 22, type: 'Camión con Pluma',
    boomMax: 28, boomMin: 8.5, boomAngleMin: 0, boomAngleMax: 78,
    pivotHeight: 1.9, pivotToCenter: 1.2, tailSwing: 2.3,
    outriggerSpan: 5.3, outriggerPad: 0.14,
    chartType: 'estimated',
    chartCurve: [[3,22],[5,15],[8,9],[12,5.5],[16,3.5],[20,2.3],[25,1.4]],
    hookBlocks: [{ cap: 12, weight: 280, label: '12 t' }, { cap: 5, weight: 150, label: '5 t' }] },
  { id: 'titan10', brand: 'Titan', model: 'Hidráulica 10T', capacity: 10, type: 'Camión con Pluma',
    boomMax: 18, boomMin: 6.0, boomAngleMin: 0, boomAngleMax: 75,
    pivotHeight: 1.7, pivotToCenter: 1.0, tailSwing: 2.0,
    outriggerSpan: 4.5, outriggerPad: 0.12,
    chartType: 'estimated',
    chartCurve: [[3,10],[5,7],[8,4],[12,2.2],[16,1.3]],
    hookBlocks: [{ cap: 5, weight: 150, label: '5 t' }, { cap: 2, weight: 80, label: '2 t' }] },
];

const OBSTACLE_TYPES = [
  { id: 'edificio', label: 'Edificio', icon: Building2, color: '#52525b' },
  { id: 'linea', label: 'Línea eléctrica', icon: Cable, color: '#facc15' },
  { id: 'arbol', label: 'Árbol', icon: TreePine, color: '#65a30d' },
  { id: 'estructura', label: 'Estructura', icon: Mountain, color: '#71717a' },
];
const SECTORES = ['Minería', 'Manufactura/Maquila', 'Construcción', 'Mantenimiento Industrial', 'Energía Eólica', 'Agroindustria'];

// ═══════════════════════════════════════════════════════════════════════════
// LÓGICA DE LOOKUP DE TABLAS DE CARGA
// ═══════════════════════════════════════════════════════════════════════════

const lookupOfficialChart = (crane: any, counterweight: string, boomLength: number, radius: number) => {
  const table = crane.chartTables[counterweight];
  if (!table) return { wll: 0, status: 'no-cw' };

  const booms = crane.booms;
  let bIdx = -1;
  if (boomLength <= booms[0]) bIdx = 0;
  else if (boomLength >= booms[booms.length - 1]) bIdx = booms.length - 2;
  else {
    for (let i = 0; i < booms.length - 1; i++) {
      if (boomLength >= booms[i] && boomLength <= booms[i + 1]) { bIdx = i; break; }
    }
  }
  if (bIdx === -1) return { wll: 0, status: 'out-of-boom' };

  let rIdx = -1;
  if (radius < table[0][0]) return { wll: 0, status: 'radius-too-small' };
  if (radius > table[table.length - 1][0]) return { wll: 0, status: 'radius-too-large' };
  for (let i = 0; i < table.length - 1; i++) {
    if (radius >= table[i][0] && radius <= table[i + 1][0]) { rIdx = i; break; }
  }
  if (rIdx === -1) rIdx = table.length - 2;

  const r1 = table[rIdx][0];
  const r2 = table[rIdx + 1][0];
  const c11 = table[rIdx][bIdx + 1];
  const c12 = table[rIdx][bIdx + 2];
  const c21 = table[rIdx + 1][bIdx + 1];
  const c22 = table[rIdx + 1][bIdx + 2];

  if (c11 === null || c12 === null || c21 === null || c22 === null) {
    return { wll: 0, status: 'not-in-table' };
  }

  const tB = booms[bIdx + 1] === booms[bIdx] ? 0 : (boomLength - booms[bIdx]) / (booms[bIdx + 1] - booms[bIdx]);
  const tR = (radius - r1) / (r2 - r1);
  const c1 = c11 + (c12 - c11) * tB;
  const c2 = c21 + (c22 - c21) * tB;
  const wll = c1 + (c2 - c1) * tR;
  return { wll: wll * 1000, status: 'ok' };
};

const lookupCurve = (crane: any, radius: number) => {
  const chart = crane.chartCurve;
  if (radius <= chart[0][0]) return { wll: chart[0][1] * 1000, status: 'ok' };
  if (radius >= chart[chart.length - 1][0]) return { wll: 0, status: 'radius-too-large' };
  for (let i = 0; i < chart.length - 1; i++) {
    const [r1, c1] = chart[i], [r2, c2] = chart[i + 1];
    if (radius >= r1 && radius <= r2) {
      const t = (radius - r1) / (r2 - r1);
      return { wll: (c1 + (c2 - c1) * t) * 1000, status: 'ok' };
    }
  }
  return { wll: 0, status: 'unknown' };
};

const STATUS_LABELS: Record<string, string> = {
  'ok': 'Configuración válida',
  'no-cw': 'Contrapeso no válido',
  'out-of-boom': 'Pluma fuera de rango',
  'radius-too-small': 'Radio menor al mínimo del gráfico',
  'radius-too-large': 'Radio excede el alcance',
  'not-in-table': 'Combinación no permitida en la tabla',
  'unknown': 'Configuración desconocida',
};

const fmt = (n: number, d = 2) => {
  if (!isFinite(n) || isNaN(n)) return '—';
  return Number(n).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function RMLiftPlanner() {
  useEffect(() => {
    const id = 'rm-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap';
    document.head.appendChild(link);
  }, []);

  const [tab, setTab] = useState('configurador');
  const [craneId, setCraneId] = useState('gmk6300l');
  const crane = useMemo(() => RM_FLEET.find(c => c.id === craneId)!, [craneId]);

  const [boomLength, setBoomLength] = useState(35);
  const [boomAngle, setBoomAngle] = useState(60);
  const [counterweight, setCounterweight] = useState('54.5');
  const [hookBlockIdx, setHookBlockIdx] = useState(0);

  const [loadWeight, setLoadWeight] = useState(8000);
  const [rigging, setRigging] = useState(350);
  const [extraWeight, setExtraWeight] = useState(0);
  const [derate, setDerate] = useState(85);

  const [obstacles, setObstacles] = useState([
    { id: 1, type: 'edificio', x: 22, height: 14, width: 8, label: 'Nave principal' },
    { id: 2, type: 'linea', x: 38, height: 18, width: 0.3, label: 'Línea 13.8 kV' },
  ]);
  const [obstacleType, setObstacleType] = useState('edificio');

  const [outriggerForce, setOutriggerForce] = useState(380);
  const [padArea, setPadArea] = useState(crane.outriggerPad || 0.38);

  const [project, setProject] = useState({
    folio: 'RM-LP-2026-00X', nombre: 'Maniobra de izaje',
    cliente: '', contacto: '', direccion: '',
    sector: 'Minería', fecha: new Date().toISOString().slice(0, 10),
    operador: '', aparejador: '', dificultad: 'MEDIO',
  });

  useEffect(() => {
    if (boomLength > crane.boomMax) setBoomLength(crane.boomMax);
    if (boomLength < crane.boomMin) setBoomLength(crane.boomMin);
    if (hookBlockIdx >= (crane.hookBlocks?.length || 1)) setHookBlockIdx(0);
    setPadArea(crane.outriggerPad || 0.38);
    if (crane.chartType === 'official' && !(crane as any).chartTables[counterweight]) {
      setCounterweight((crane as any).counterweights[1].v);
    }
  }, [craneId]); // eslint-disable-line

  const hookBlock = crane.hookBlocks?.[hookBlockIdx] || { cap: 0, weight: 450, label: '—' };

  const angleRad = (boomAngle * Math.PI) / 180;
  const reach = crane.pivotToCenter + boomLength * Math.cos(angleRad);
  const hookHeight = crane.pivotHeight + boomLength * Math.sin(angleRad) - 1.2;
  const totalLoad = loadWeight + rigging + hookBlock.weight + extraWeight;

  const wllResult = useMemo(() => {
    if (crane.chartType === 'official') {
      return lookupOfficialChart(crane, counterweight, boomLength, reach);
    }
    return lookupCurve(crane, reach);
  }, [crane, counterweight, boomLength, reach]);

  const wllAtRadius = wllResult.wll;
  const chartPercent = wllAtRadius > 0 ? (totalLoad / wllAtRadius) * 100 : Infinity;
  const maxAllowed = wllAtRadius * (derate / 100);
  const minWLLRequired = totalLoad / (derate / 100) / 1000;

  const safetyState = useMemo(() => {
    if (wllResult.status !== 'ok') return { level: 'invalid', label: STATUS_LABELS[wllResult.status].toUpperCase(), color: '#dc2626' };
    if (chartPercent > 100) return { level: 'critico', label: 'NO IZAR · EXCEDE 100%', color: '#dc2626' };
    if (chartPercent > derate) return { level: 'alto', label: 'EXCEDE DÉRATEO', color: '#f97316' };
    if (chartPercent > derate * 0.85) return { level: 'medio', label: 'PRECAUCIÓN', color: '#eab308' };
    return { level: 'seguro', label: 'DENTRO DE RANGO', color: '#84cc16' };
  }, [chartPercent, derate, wllResult]);

  const pressureKPA = padArea > 0 ? outriggerForce / padArea : 0;
  const pressureTm2 = pressureKPA / 9.80665;
  const pressurePSI = pressureKPA / 6.89476;
  const pressureKipFt2 = pressureKPA / 47.8803;

  const addObstacle = () => {
    const id = (obstacles[obstacles.length - 1]?.id || 0) + 1;
    setObstacles([...obstacles, { id, type: obstacleType,
      x: 15 + Math.random() * 30, height: obstacleType === 'linea' ? 12 : 8,
      width: obstacleType === 'linea' ? 0.3 : 5,
      label: OBSTACLE_TYPES.find(o => o.id === obstacleType)?.label || '' }]);
  };
  const removeObstacle = (id: number) => setObstacles(obstacles.filter(o => o.id !== id));
  const updateObstacle = (id: number, field: string, value: any) => setObstacles(obstacles.map(o => o.id === id ? { ...o, [field]: value } : o));
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen w-full" style={{ background: '#0a0a0b', fontFamily: '"Barlow Condensed", system-ui, sans-serif', color: '#e4e4e7' }}>
      <style>{`
        @media print { .no-print { display: none !important; } body { background: white !important; color: black !important; } }
        .display-font { font-family: "Bebas Neue", sans-serif; letter-spacing: 0.02em; }
        .mono { font-family: "JetBrains Mono", monospace; }
        input[type="range"]::-webkit-slider-thumb { appearance: none; width: 18px; height: 18px; background: #84cc16; border-radius: 50%; cursor: pointer; border: 2px solid #0a0a0b; }
        input[type="range"]::-moz-range-thumb { width: 18px; height: 18px; background: #84cc16; border-radius: 50%; cursor: pointer; border: 2px solid #0a0a0b; }
        input[type="range"] { background: #27272a; height: 4px; border-radius: 2px; }
      `}</style>

      {/* HEADER */}
      <header className="no-print border-b border-zinc-800 sticky top-0 z-20" style={{ background: 'rgba(10,10,11,0.95)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: '#84cc16', clipPath: 'polygon(20% 0, 100% 0, 80% 100%, 0 100%)' }}>
              <Truck className="w-5 h-5 text-zinc-950" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="display-font text-2xl leading-none text-white">RM LIFT PLAN<sup className="text-xs text-lime-400">™</sup></h1>
                <span className="text-[9px] mono px-1.5 py-0.5 bg-lime-500/20 text-lime-400 border border-lime-500/30">v2.0</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-0.5">Grúas & Rigging RM · Por Encima de Todo</p>
            </div>
          </div>
          <button onClick={handlePrint} className="hidden sm:flex items-center gap-2 px-4 py-2 border border-zinc-700 hover:border-lime-500 hover:text-lime-400 transition-colors text-sm uppercase tracking-wider">
            <Printer className="w-4 h-4" /> Exportar
          </button>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {[
            { id: 'configurador', label: 'Configurador', icon: Settings },
            { id: 'visualizador', label: 'Visualizador', icon: Map },
            { id: 'calculadora', label: 'Calculadora', icon: Calculator },
            { id: 'plan', label: 'Plan', icon: FileText },
            { id: 'directorio', label: 'Directorio', icon: Layers },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${tab === t.id ? 'border-lime-500 text-lime-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* CONFIGURADOR */}
        {tab === 'configurador' && (
          <div className="grid lg:grid-cols-3 gap-4">
            <section className="lg:col-span-2 border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-lime-400" />
                <h2 className="display-font text-2xl text-white">Selecciona la Grúa</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {RM_FLEET.map(c => (
                  <button key={c.id} onClick={() => setCraneId(c.id)}
                    className={`text-left p-4 border transition-all ${craneId === c.id ? 'border-lime-500 bg-lime-500/5' : 'border-zinc-800 hover:border-zinc-600'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-zinc-500">{c.brand}</div>
                        <div className="display-font text-xl text-white">{c.model}</div>
                      </div>
                      <div className="text-right">
                        <div className="display-font text-3xl text-lime-400 leading-none">{c.capacity}</div>
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500">toneladas</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800">
                      <span className="text-xs text-zinc-400 flex-1">{c.type} · pluma {c.boomMin}–{c.boomMax}m</span>
                      {c.chartType === 'official' ? (
                        <span className="flex items-center gap-1 text-[9px] mono px-1.5 py-0.5 bg-lime-500/20 text-lime-400 border border-lime-500/30">
                          <Award className="w-2.5 h-2.5" /> OEM
                        </span>
                      ) : (
                        <span className="text-[9px] mono px-1.5 py-0.5 bg-zinc-800 text-zinc-500">EST</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {crane.source && (
                <div className="mt-4 p-3 bg-lime-500/5 border-l-2 border-lime-500 text-xs text-zinc-300">
                  <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-lime-400 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-lime-400">Datos OEM:</strong> {crane.source}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="w-5 h-5 text-lime-400" />
                <h2 className="display-font text-2xl text-white">Geometría</h2>
              </div>

              <div className="space-y-5">
                <Field label="Largo de pluma" value={`${boomLength.toFixed(2)} m`}>
                  <input type="range" min={crane.boomMin} max={crane.boomMax} step="0.01" value={boomLength} onChange={e => setBoomLength(+e.target.value)} className="w-full appearance-none" />
                  <div className="flex justify-between text-[10px] mono text-zinc-500 mt-1">
                    <span>{crane.boomMin}m</span><span>{crane.boomMax}m</span>
                  </div>
                </Field>

                <Field label="Ángulo de pluma" value={`${boomAngle}°`}>
                  <input type="range" min={Math.max(crane.boomAngleMin || 20, 0)} max={crane.boomAngleMax || 83} step="1" value={boomAngle} onChange={e => setBoomAngle(+e.target.value)} className="w-full appearance-none" />
                  <div className="flex justify-between text-[10px] mono text-zinc-500 mt-1">
                    <span>{Math.max(crane.boomAngleMin || 20, 0)}°</span><span>{crane.boomAngleMax || 83}°</span>
                  </div>
                </Field>

                {crane.chartType === 'official' && (
                  <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1">Contrapeso</label>
                    <select value={counterweight} onChange={e => setCounterweight(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 focus:border-lime-500 focus:outline-none">
                      {(crane as any).counterweights.map((cw: any) => <option key={cw.v} value={cw.v}>{cw.label}</option>)}
                    </select>
                  </div>
                )}

                {crane.hookBlocks && (
                  <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1">Bloque de gancho</label>
                    <select value={hookBlockIdx} onChange={e => setHookBlockIdx(+e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 focus:border-lime-500 focus:outline-none">
                      {crane.hookBlocks.map((hb, i) => <option key={i} value={i}>{hb.label} ({hb.weight} kg)</option>)}
                    </select>
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs">
                  <Spec label="Altura del pivote" value={`${crane.pivotHeight} m`} />
                  <Spec label="Pivote al centro de giro" value={`${crane.pivotToCenter} m`} />
                  <Spec label="Tail-swing" value={`${crane.tailSwing} m`} />
                  <Spec label="Span estabilizadores" value={`${crane.outriggerSpan} m`} />
                  <Spec label="Pad estabilizador" value={`${crane.outriggerPad} m²`} />
                </div>

                <div className="bg-zinc-900 p-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Resultado actual</div>
                  <div className="grid grid-cols-2 gap-3">
                    <ReadOut label="Radio" value={`${fmt(reach, 2)} m`} accent />
                    <ReadOut label="Altura gancho" value={`${fmt(hookHeight, 2)} m`} accent />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VISUALIZADOR */}
        {tab === 'visualizador' && (
          <div className="grid lg:grid-cols-3 gap-4">
            <section className="lg:col-span-2 border border-zinc-800 p-3 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-lime-400" />
                  <h2 className="display-font text-2xl text-white">Gráfico de Alcance 2D</h2>
                </div>
                <div className="flex items-center gap-2 text-xs mono">
                  <span className="px-2 py-1 bg-zinc-900">{crane.brand} {crane.model}{crane.chartType === 'official' && ` · ${counterweight}t cw`}</span>
                </div>
              </div>
              <CraneSVG crane={crane} boomLength={boomLength} boomAngle={boomAngle} obstacles={obstacles} reach={reach} hookHeight={hookHeight} safety={safetyState} counterweight={counterweight} />
            </section>

            <section className="border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-lime-400" />
                <h2 className="display-font text-2xl text-white">Obstáculos</h2>
              </div>
              <div className="flex gap-2 mb-4">
                <select value={obstacleType} onChange={e => setObstacleType(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm">
                  {OBSTACLE_TYPES.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <button onClick={addObstacle} className="px-3 py-2 bg-lime-500 text-zinc-950 hover:bg-lime-400 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {obstacles.map(o => {
                  const def = OBSTACLE_TYPES.find(x => x.id === o.type);
                  return (
                    <div key={o.id} className="border border-zinc-800 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {def?.icon && <def.icon className="w-4 h-4" style={{ color: def.color }} />}
                          <input value={o.label} onChange={e => updateObstacle(o.id, 'label', e.target.value)} className="bg-transparent text-sm outline-none border-b border-transparent focus:border-zinc-700" />
                        </div>
                        <button onClick={() => removeObstacle(o.id)} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <NumField label="X(m)" value={o.x} onChange={(v: number) => updateObstacle(o.id, 'x', v)} />
                        <NumField label="Alt(m)" value={o.height} onChange={(v: number) => updateObstacle(o.id, 'height', v)} />
                        <NumField label="An(m)" value={o.width} onChange={(v: number) => updateObstacle(o.id, 'width', v)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* CALCULADORA */}
        {tab === 'calculadora' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <section className="border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-lime-400" />
                <h2 className="display-font text-2xl text-white">Capacidad y % del Gráfico</h2>
              </div>

              <div className="space-y-3 mb-5">
                <NumInput label="Carga neta" unit="kg" value={loadWeight} onChange={setLoadWeight} />
                <NumInput label="Aparejos / eslingas" unit="kg" value={rigging} onChange={setRigging} />
                <div>
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1">Bloque del gancho (auto del modelo)</label>
                  <div className="flex bg-zinc-900 border border-zinc-800 px-3 py-2">
                    <span className="flex-1 text-sm">{hookBlock.label}</span>
                    <span className="mono text-lime-400">{hookBlock.weight} kg</span>
                  </div>
                </div>
                <NumInput label="Pesos adicionales" unit="kg" value={extraWeight} onChange={setExtraWeight} />
                <NumInput label="Dérateo de seguridad" unit="%" value={derate} onChange={setDerate} />
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-3">
                <Stat label="Carga total" value={`${fmt(totalLoad, 0)} kg`} />
                <Stat label="Radio de operación" value={`${fmt(reach, 2)} m`} />
                <Stat label="WLL en este radio" value={wllAtRadius > 0 ? `${fmt(wllAtRadius, 0)} kg` : '— sin tabla'} />
                <Stat label="Carga máx. permitida (con dérateo)" value={wllAtRadius > 0 ? `${fmt(maxAllowed, 0)} kg` : '—'} />
                <Stat label="WLL mínimo requerido" value={`${fmt(minWLLRequired, 1)} ton`} />

                <div className="mt-4 p-4" style={{ background: `${safetyState.color}15`, borderLeft: `3px solid ${safetyState.color}` }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-400">% del Gráfico</div>
                      <div className="display-font text-4xl" style={{ color: safetyState.color }}>
                        {wllResult.status === 'ok' ? (isFinite(chartPercent) ? `${fmt(chartPercent, 1)}%` : '∞') : '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      {safetyState.level === 'seguro' ? <ShieldCheck className="w-6 h-6 inline" style={{ color: safetyState.color }} /> : <AlertTriangle className="w-6 h-6 inline" style={{ color: safetyState.color }} />}
                      <div className="display-font text-sm mt-1 leading-tight" style={{ color: safetyState.color }}>{safetyState.label}</div>
                    </div>
                  </div>
                  {wllResult.status === 'ok' && (
                    <div className="mt-3 h-2 bg-zinc-900 overflow-hidden">
                      <div className="h-full transition-all" style={{ width: `${Math.min(chartPercent, 100)}%`, background: safetyState.color }} />
                    </div>
                  )}
                </div>

                {crane.chartType === 'official' && (
                  <div className="mt-3 text-[10px] mono text-zinc-500 uppercase tracking-widest">
                    Lookup oficial · {crane.model} · cw {counterweight}t · pluma {fmt(boomLength, 2)}m · radio {fmt(reach, 2)}m
                  </div>
                )}
              </div>
            </section>

            <section className="border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5 text-lime-400" />
                <h2 className="display-font text-2xl text-white">Presión sobre el Suelo</h2>
              </div>
              <p className="text-xs text-zinc-500 mb-4">
                Cálculo de carga puntual (Point Load) por estabilizador. Pad default cargado desde el modelo seleccionado.
              </p>
              <div className="space-y-3 mb-5">
                <NumInput label="Fuerza por estabilizador" unit="kN" value={outriggerForce} onChange={setOutriggerForce} />
                <NumInput label="Área de almohadilla (pad)" unit="m²" value={padArea} onChange={setPadArea} step="0.01" />
              </div>
              <div className="border-t border-zinc-800 pt-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Resultados — todas las unidades</div>
                <div className="grid grid-cols-2 gap-3">
                  <UnitCard label="kPA" value={fmt(pressureKPA, 1)} />
                  <UnitCard label="T/m²" value={fmt(pressureTm2, 2)} />
                  <UnitCard label="PSI" value={fmt(pressurePSI, 2)} />
                  <UnitCard label="Kips/ft²" value={fmt(pressureKipFt2, 3)} />
                </div>
                <div className="mt-5 p-3 bg-amber-500/5 border-l-2 border-amber-500 text-xs text-zinc-300">
                  <strong className="text-amber-400">Recomendación RM:</strong> en terrenos no compactados &gt; 25 T/m² requiere validación de ingeniero estructural y posible uso de placas de distribución.
                </div>
              </div>
            </section>
          </div>
        )}

        {/* PLAN DE ELEVACIÓN */}
        {tab === 'plan' && (
          <div className="space-y-4">
            <section className="border border-zinc-800 p-5 no-print">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-lime-400" />
                  <h2 className="display-font text-2xl text-white">Datos del Proyecto</h2>
                </div>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-zinc-950 hover:bg-lime-400 text-sm uppercase tracking-wider">
                  <Download className="w-4 h-4" /> Generar PDF
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <TextInput label="Folio" value={project.folio} onChange={(v: string) => setProject({ ...project, folio: v })} />
                <TextInput label="Nombre del proyecto" value={project.nombre} onChange={(v: string) => setProject({ ...project, nombre: v })} />
                <TextInput label="Fecha" type="date" value={project.fecha} onChange={(v: string) => setProject({ ...project, fecha: v })} />
                <TextInput label="Cliente" value={project.cliente} onChange={(v: string) => setProject({ ...project, cliente: v })} />
                <TextInput label="Contacto" value={project.contacto} onChange={(v: string) => setProject({ ...project, contacto: v })} />
                <TextInput label="Dirección de obra" value={project.direccion} onChange={(v: string) => setProject({ ...project, direccion: v })} />
                <SelectInput label="Sector" value={project.sector} onChange={(v: string) => setProject({ ...project, sector: v })} options={SECTORES} />
                <TextInput label="Operador" value={project.operador} onChange={(v: string) => setProject({ ...project, operador: v })} />
                <TextInput label="Aparejador" value={project.aparejador} onChange={(v: string) => setProject({ ...project, aparejador: v })} />
                <SelectInput label="Nivel de dificultad" value={project.dificultad} onChange={(v: string) => setProject({ ...project, dificultad: v })} options={['REGULAR', 'MEDIO', 'ALTO']} />
              </div>
            </section>

            <section className="border border-zinc-800 bg-white text-zinc-900 p-6 sm:p-10 print:border-0">
              <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-4 mb-6">
                <div>
                  <div className="display-font text-4xl">RM LIFT PLAN<sup className="text-base">™</sup></div>
                  <div className="text-xs uppercase tracking-widest text-zinc-600 mt-1">Plan Maestro de Izaje · Metodología Propietaria</div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold mono">{project.folio}</div>
                  <div className="text-zinc-600">{project.fecha}</div>
                  <div className="mt-2 inline-block px-3 py-1 bg-zinc-900 text-white text-[10px] uppercase tracking-widest">Dificultad: {project.dificultad}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
                <PrintRow label="Cliente" value={project.cliente || '—'} />
                <PrintRow label="Sector" value={project.sector} />
                <PrintRow label="Contacto" value={project.contacto || '—'} />
                <PrintRow label="Proyecto" value={project.nombre} />
                <PrintRow label="Dirección" value={project.direccion || '—'} colSpan />
                <PrintRow label="Operador" value={project.operador || '—'} />
                <PrintRow label="Aparejador" value={project.aparejador || '—'} />
              </div>

              <h3 className="display-font text-2xl border-b border-zinc-300 pb-2 mb-3">Equipo Asignado</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6">
                <PrintRow label="Marca / Modelo" value={`${crane.brand} ${crane.model}`} />
                <PrintRow label="Capacidad nominal" value={`${crane.capacity} ton`} />
                <PrintRow label="Tipo" value={crane.type} />
                <PrintRow label="Rango de pluma" value={`${crane.boomMin} – ${crane.boomMax} m`} />
                {crane.chartType === 'official' && <PrintRow label="Contrapeso" value={`${counterweight} t`} />}
                <PrintRow label="Bloque de gancho" value={hookBlock.label} />
              </div>

              <h3 className="display-font text-2xl border-b border-zinc-300 pb-2 mb-3">Configuración de Izaje</h3>
              <div className="grid grid-cols-3 gap-3 text-sm mb-6">
                <PrintCard label="Largo de pluma" value={`${fmt(boomLength, 2)} m`} />
                <PrintCard label="Ángulo de pluma" value={`${boomAngle}°`} />
                <PrintCard label="Radio de operación" value={`${fmt(reach, 2)} m`} />
                <PrintCard label="Altura de gancho" value={`${fmt(hookHeight, 2)} m`} />
                <PrintCard label="Carga total" value={`${fmt(totalLoad, 0)} kg`} />
                <PrintCard label="WLL en radio" value={wllAtRadius > 0 ? `${fmt(wllAtRadius, 0)} kg` : '—'} />
              </div>

              <h3 className="display-font text-2xl border-b border-zinc-300 pb-2 mb-3">Análisis de Seguridad</h3>
              <div className="grid grid-cols-3 gap-3 text-sm mb-6">
                <PrintCard label="% del gráfico" value={wllResult.status === 'ok' && isFinite(chartPercent) ? `${fmt(chartPercent, 1)}%` : '—'} highlight={safetyState.color} />
                <PrintCard label="Dérateo aplicado" value={`${derate}%`} />
                <PrintCard label="Estado" value={safetyState.label} highlight={safetyState.color} />
                <PrintCard label="Carga máx. permitida" value={wllAtRadius > 0 ? `${fmt(maxAllowed, 0)} kg` : '—'} />
                <PrintCard label="WLL mínimo requerido" value={`${fmt(minWLLRequired, 1)} ton`} />
                <PrintCard label="Presión sobre suelo" value={`${fmt(pressureTm2, 2)} T/m²`} />
              </div>

              <h3 className="display-font text-2xl border-b border-zinc-300 pb-2 mb-3">Croquis de Maniobra</h3>
              <div className="bg-zinc-50 p-3 mb-6">
                <CraneSVG crane={crane} boomLength={boomLength} boomAngle={boomAngle} obstacles={obstacles} reach={reach} hookHeight={hookHeight} safety={safetyState} counterweight={counterweight} printMode />
              </div>

              <h3 className="display-font text-2xl border-b border-zinc-300 pb-2 mb-3">Desglose de Carga</h3>
              <table className="w-full text-sm mb-6">
                <thead><tr className="border-b border-zinc-300 text-left"><th className="py-2 font-semibold">Concepto</th><th className="py-2 font-semibold text-right">Peso (kg)</th></tr></thead>
                <tbody>
                  <tr className="border-b border-zinc-100"><td className="py-2">Carga neta</td><td className="py-2 text-right mono">{fmt(loadWeight, 0)}</td></tr>
                  <tr className="border-b border-zinc-100"><td className="py-2">Aparejos / eslingas</td><td className="py-2 text-right mono">{fmt(rigging, 0)}</td></tr>
                  <tr className="border-b border-zinc-100"><td className="py-2">Bloque del gancho ({hookBlock.label})</td><td className="py-2 text-right mono">{fmt(hookBlock.weight, 0)}</td></tr>
                  <tr className="border-b border-zinc-100"><td className="py-2">Pesos adicionales</td><td className="py-2 text-right mono">{fmt(extraWeight, 0)}</td></tr>
                  <tr className="border-t-2 border-zinc-900 font-bold"><td className="py-2">CARGA TOTAL</td><td className="py-2 text-right mono">{fmt(totalLoad, 0)}</td></tr>
                </tbody>
              </table>

              <div className="grid grid-cols-3 gap-6 mt-12 text-xs">
                {['Operador certificado', 'Aparejador / Rigger', 'Supervisor RM'].map(role => (
                  <div key={role}>
                    <div className="border-b border-zinc-900 h-12"></div>
                    <div className="mt-1 uppercase tracking-widest font-semibold">{role}</div>
                  </div>
                ))}
              </div>

              {crane.source && (
                <div className="mt-8 pt-3 border-t border-zinc-200 text-[10px] text-zinc-600">
                  <strong>Fuente de datos:</strong> {crane.source}
                </div>
              )}
              <div className="mt-3 text-[10px] text-zinc-600 uppercase tracking-widest text-center">
                AG Industrial RM S de R.L. de C.V. · Chihuahua, México · Cobertura nacional · 7 estados Corredor Norte–Pacífico
                <br />RM Lift Plan™ es metodología propietaria de Grúas & Rigging RM
              </div>
            </section>
          </div>
        )}

        {/* DIRECTORIO */}
        {tab === 'directorio' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <section className="border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-lime-400" />
                <h2 className="display-font text-2xl text-white">Flota RM</h2>
              </div>
              <div className="space-y-2">
                {RM_FLEET.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border border-zinc-800 hover:border-zinc-600 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider text-zinc-500">{c.brand}</span>
                        {c.chartType === 'official' && <span className="text-[9px] mono px-1 py-0.5 bg-lime-500/20 text-lime-400">OEM</span>}
                      </div>
                      <div className="text-white font-semibold">{c.model}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{c.type} · pluma {c.boomMin}–{c.boomMax}m</div>
                    </div>
                    <div className="text-right">
                      <div className="display-font text-3xl text-lime-400 leading-none">{c.capacity}</div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500">ton</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="border border-zinc-800 p-5">
                <h2 className="display-font text-2xl text-white mb-4">Sectores Objetivo</h2>
                <div className="grid grid-cols-2 gap-2">
                  {SECTORES.map(s => (
                    <div key={s} className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800">
                      <Check className="w-4 h-4 text-lime-400" /><span className="text-sm">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-zinc-800 p-5">
                <h2 className="display-font text-2xl text-white mb-4">Equipo Comercial</h2>
                <div className="space-y-3 text-sm">
                  <ContactCard name="Ing. Iván Ramos" role="Director / Owner" />
                  <ContactCard name="Ernesto Martínez" role="Desarrollo Comercial & Marketing" />
                  <ContactCard name="Jacobo Cantú" role="Ventas" />
                  <ContactCard name="Leo Cera" role="Ventas" />
                </div>
              </div>
              <div className="border border-zinc-800 p-5 bg-lime-500/5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-lime-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="display-font text-xl text-white">RM Lift Plan™</h3>
                    <p className="text-xs text-zinc-300 mt-2">Metodología propietaria de Grúas & Rigging RM. Levantamiento en sitio, ingeniería de detalle con geometría real, lookup directo en tablas EN 13000 oficiales, presión sobre suelo, y entrega como PDF personalizado. Único en el mercado mexicano de grúas.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="no-print border-t border-zinc-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-600 flex flex-col sm:flex-row justify-between gap-2">
          <div>RM Lift Plan™ v2.0 · Lookup oficial EN 13000 para GMK6300L</div>
          <div>Grúas & Rigging RM · Chihuahua, México</div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SVG VISUALIZADOR
// ═══════════════════════════════════════════════════════════════════════════
function CraneSVG({ crane, boomLength, boomAngle, obstacles, reach, hookHeight, safety, counterweight, printMode = false }: any) {
  const W = 800, H = 480, SCALE = 8;
  const groundY = H - 80, cabX = 200;
  const angleRad = (boomAngle * Math.PI) / 180;
  const pivotX = cabX + crane.pivotToCenter * SCALE;
  const pivotY = groundY - crane.pivotHeight * SCALE;
  const tipX = pivotX + boomLength * SCALE * Math.cos(angleRad);
  const tipY = pivotY - boomLength * SCALE * Math.sin(angleRad);
  const stroke = printMode ? '#1f2937' : '#a1a1aa';
  const accent = safety?.color || '#84cc16';
  const bg = printMode ? '#fafafa' : '#0f0f10';
  const grid = printMode ? '#e5e7eb' : '#27272a';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ background: bg }}>
      <defs>
        <pattern id="grid" width={SCALE * 5} height={SCALE * 5} patternUnits="userSpaceOnUse">
          <path d={`M ${SCALE * 5} 0 L 0 0 0 ${SCALE * 5}`} fill="none" stroke={grid} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={W} height={groundY} fill="url(#grid)" />
      <line x1="0" y1={groundY} x2={W} y2={groundY} stroke={stroke} strokeWidth="2" />

      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70].map(m => {
        const x = cabX + m * SCALE;
        if (x > W - 10) return null;
        return (
          <g key={m}>
            <line x1={x} y1={groundY} x2={x} y2={groundY + 6} stroke={stroke} strokeWidth="1" />
            <text x={x} y={groundY + 18} fontSize="9" fill={stroke} textAnchor="middle" fontFamily="monospace">{m}m</text>
          </g>
        );
      })}

      {obstacles.map((o: any) => {
        const def = OBSTACLE_TYPES.find((x: any) => x.id === o.type);
        const ox = cabX + o.x * SCALE, oh = o.height * SCALE, ow = (o.width || 1) * SCALE;
        if (o.type === 'linea') {
          return (
            <g key={o.id}>
              <circle cx={ox} cy={groundY - oh} r="4" fill={def?.color} />
              <line x1={ox} y1={groundY - oh} x2={ox} y2={groundY} stroke={def?.color} strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
              <line x1={ox - 60} y1={groundY - oh} x2={ox + 60} y2={groundY - oh} stroke={def?.color} strokeWidth="1" />
              <text x={ox} y={groundY - oh - 8} fontSize="9" fill={def?.color} textAnchor="middle" fontFamily="monospace">⚡ {o.label} {o.height}m</text>
            </g>
          );
        }
        if (o.type === 'arbol') {
          return (
            <g key={o.id}>
              <rect x={ox - 2} y={groundY - oh / 3} width="4" height={oh / 3} fill="#78350f" />
              <circle cx={ox} cy={groundY - oh + oh / 4} r={oh / 3} fill={def?.color} opacity="0.7" />
              <text x={ox} y={groundY - oh - 4} fontSize="8" fill={stroke} textAnchor="middle">{o.label}</text>
            </g>
          );
        }
        return (
          <g key={o.id}>
            <rect x={ox - ow / 2} y={groundY - oh} width={ow} height={oh} fill={def?.color} stroke={stroke} strokeWidth="1" />
            <text x={ox} y={groundY - oh - 4} fontSize="9" fill={stroke} textAnchor="middle" fontFamily="monospace">{o.label} ({o.height}m)</text>
          </g>
        );
      })}

      {/* Chasis */}
      <g>
        <rect x={cabX - 70} y={groundY - 24} width="140" height="14" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
        <rect x={cabX - 95} y={groundY - 36} width="28" height="26" fill="#52525b" stroke={stroke} strokeWidth="1" />
        <rect x={cabX - 90} y={groundY - 32} width="18" height="10" fill="#84cc16" opacity="0.4" />
        {[-75, -50, 30, 50, 70].map(dx => (
          <circle key={dx} cx={cabX + dx} cy={groundY - 6} r="6" fill="#18181b" stroke={stroke} strokeWidth="1" />
        ))}
        <line x1={cabX - 60} y1={groundY - 10} x2={cabX - 90} y2={groundY} stroke={stroke} strokeWidth="2" />
        <line x1={cabX + 60} y1={groundY - 10} x2={cabX + 90} y2={groundY} stroke={stroke} strokeWidth="2" />
        <rect x={cabX - 95} y={groundY - 2} width="10" height="4" fill="#18181b" />
        <rect x={cabX + 85} y={groundY - 2} width="10" height="4" fill="#18181b" />

        {crane.chartType === 'official' && (
          <g>
            <rect x={cabX - 110} y={groundY - 30} width="22" height="20" fill="#18181b" stroke={accent} strokeWidth="1.5" />
            <text x={cabX - 99} y={groundY - 16} fontSize="7" fill={accent} textAnchor="middle" fontFamily="monospace" fontWeight="bold">{counterweight}t</text>
          </g>
        )}

        <rect x={cabX - 12} y={groundY - 28} width="24" height="6" fill={accent} />
        <text x={cabX} y={groundY + 35} fontSize="8" fill={stroke} textAnchor="middle" fontFamily="monospace">RM</text>
      </g>

      {/* Pluma */}
      <g>
        <line x1={pivotX + 1} y1={pivotY + 1} x2={tipX + 1} y2={tipY + 1} stroke="rgba(0,0,0,0.4)" strokeWidth="10" strokeLinecap="round" />
        <line x1={pivotX} y1={pivotY} x2={tipX} y2={tipY} stroke={accent} strokeWidth="9" strokeLinecap="round" />
        <line x1={pivotX} y1={pivotY} x2={tipX} y2={tipY} stroke="#18181b" strokeWidth="1" strokeDasharray="6,4" />
        <circle cx={pivotX} cy={pivotY} r="5" fill="#18181b" stroke={accent} strokeWidth="2" />
        <line x1={tipX} y1={tipY} x2={tipX} y2={groundY - 1.2 * SCALE} stroke={stroke} strokeWidth="1" strokeDasharray="3,2" />
        <rect x={tipX - 6} y={groundY - 1.2 * SCALE} width="12" height="10" fill="#18181b" stroke={accent} strokeWidth="1.5" />
        <text x={tipX} y={groundY - 1.2 * SCALE - 6} fontSize="9" fill={accent} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
          {fmt(reach, 1)}m / {fmt(hookHeight, 1)}m
        </text>
      </g>

      <line x1={cabX} y1={groundY - 2} x2={cabX + reach * SCALE} y2={groundY - 2} stroke={accent} strokeWidth="2" strokeDasharray="4,3" opacity="0.7" />
      <text x={pivotX + 25} y={pivotY - 8} fontSize="11" fill={accent} fontFamily="monospace" fontWeight="bold">{boomAngle}°</text>

      <text x={W - 12} y={20} fontSize="11" fill={printMode ? '#71717a' : '#52525b'} textAnchor="end" fontFamily="monospace">RM LIFT PLAN™ v2</text>
      <text x={12} y={20} fontSize="9" fill={printMode ? '#71717a' : '#52525b'} fontFamily="monospace">{crane.brand} {crane.model} · {crane.capacity}T{crane.chartType === 'official' && ` · cw ${counterweight}t`}</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTES
// ═══════════════════════════════════════════════════════════════════════════
const Field = ({ label, value, children }: any) => (
  <div>
    <div className="flex justify-between text-xs uppercase tracking-wider text-zinc-400 mb-2"><span>{label}</span><span className="mono text-lime-400">{value}</span></div>
    {children}
  </div>
);
const Spec = ({ label, value }: any) => <div className="flex justify-between text-zinc-400"><span>{label}</span><span className="mono text-zinc-200">{value}</span></div>;
const ReadOut = ({ label, value, accent }: any) => (
  <div>
    <div className="text-[9px] uppercase tracking-widest text-zinc-500">{label}</div>
    <div className={`display-font text-2xl ${accent ? 'text-lime-400' : 'text-white'}`}>{value}</div>
  </div>
);
const NumInput = ({ label, unit, value, onChange, step = '1' }: any) => (
  <div>
    <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1">{label}</label>
    <div className="flex">
      <input type="number" step={step} value={value} onChange={e => onChange(+e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 mono focus:border-lime-500 focus:outline-none" />
      <span className="bg-zinc-800 border border-zinc-800 border-l-0 px-3 py-2 text-xs uppercase tracking-wider text-zinc-400 flex items-center">{unit}</span>
    </div>
  </div>
);
const NumField = ({ label, value, onChange }: any) => (
  <div>
    <div className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</div>
    <input type="number" value={value} onChange={e => onChange(+e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-2 py-1 mono text-xs focus:border-lime-500 focus:outline-none" />
  </div>
);
const TextInput = ({ label, value, onChange, type = 'text' }: any) => (
  <div>
    <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 focus:border-lime-500 focus:outline-none" />
  </div>
);
const SelectInput = ({ label, value, onChange, options }: any) => (
  <div>
    <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 focus:border-lime-500 focus:outline-none">
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
const Stat = ({ label, value }: any) => <div className="flex justify-between items-center text-sm"><span className="text-zinc-400">{label}</span><span className="mono text-white font-semibold">{value}</span></div>;
const UnitCard = ({ label, value }: any) => (
  <div className="bg-zinc-900 p-3 text-center">
    <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
    <div className="display-font text-2xl text-lime-400 mt-1">{value}</div>
  </div>
);
const PrintRow = ({ label, value, colSpan }: any) => (
  <div className={colSpan ? 'col-span-2' : ''}>
    <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
    <div className="font-semibold">{value}</div>
  </div>
);
const PrintCard = ({ label, value, highlight }: any) => (
  <div className="border border-zinc-300 p-2" style={highlight ? { borderColor: highlight, borderWidth: '2px' } : {}}>
    <div className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</div>
    <div className="font-bold mono text-base" style={highlight ? { color: highlight } : {}}>{value}</div>
  </div>
);
const ContactCard = ({ name, role }: any) => (
  <div className="flex items-center justify-between p-3 border border-zinc-800">
    <div><div className="text-white">{name}</div><div className="text-xs text-zinc-500">{role}</div></div>
    <ChevronRight className="w-4 h-4 text-zinc-600" />
  </div>
);
