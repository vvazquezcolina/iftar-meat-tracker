export interface Product {
  qr_id: string;
  tipo_carne: string;
  peso_kg: number;
  precio_kg: number;
  precio_total: number;
  estatus: 'Disponible' | 'Vendido';
  fecha_registro: string;
  hora_registro: string;
  registrado_por?: string;
  fecha_venta?: string;
  hora_venta?: string;
  vendido_por?: string;
  notas?: string;
}

export interface Price {
  tipo_carne: string;
  precio_por_kg: number;
}

export interface DashboardStats {
  total: number;
  disponibles: number;
  vendidos: number;
  productos: Product[];
}
