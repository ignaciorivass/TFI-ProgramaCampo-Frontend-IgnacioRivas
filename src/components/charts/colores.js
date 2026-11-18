// Paleta categórica validada (separación para daltonismo y contraste), en orden fijo.
export const COLORES = ['#008300', '#2a78d6', '#eb6834', '#6250d6', '#eda100'];
export const COLOR_OTROS = '#8a8a85'; // para agrupar "Otros" cuando hay más de 5 categorías
export const COLOR_EJES = '#a6b2a7';
export const COLOR_GRILLA = '#344237';

// Si hay más de 5 categorías, las menores se agrupan en "Otros" (nunca se inventan más colores).
export const agruparEnOtros = (datos, max = 5) => {
  if (datos.length <= max) return datos;
  const principales = datos.slice(0, max - 1);
  const resto = datos.slice(max - 1).reduce((acc, d) => acc + d.cantidad, 0);
  return [...principales, { nombre: 'Otros', cantidad: resto }];
};
