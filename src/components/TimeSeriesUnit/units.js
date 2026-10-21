// Helpers around the unit catalog served by the ml service (/ml/units).
// A time-series has `quantity` (catalog id, custom label, or empty when
// unknown) and `unit` (catalog unit id, or any label).

export const findQuantity = (catalog, quantityId) =>
  quantityId
    ? catalog?.quantities.find((q) => q.id === quantityId) ?? null
    : null;

export const findUnit = (quantity, unitId) =>
  quantity?.units.find((u) => u.id === unitId || u.aliases.includes(unitId)) ??
  null;

// Text for a badge, plus whether edge-ml can convert this series.
export const describeUnit = (catalog, quantityId, unit) => {
  const quantity = findQuantity(catalog, quantityId);
  const known = findUnit(quantity, unit);
  if (known) {
    return { text: known.label, quantity: quantity.label, convertible: true };
  }
  return {
    text: unit || "",
    quantity: quantity ? quantity.label : quantityId || "",
    convertible: false,
  };
};
