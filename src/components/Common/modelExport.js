// Deployment/export capability of a TRAINED model, derived from the formats the
// ml service persisted on it at train time (the same field the Download modal
// uses). Kept in one place so the model row badge, Download and Deploy actions
// all agree.

// null/undefined formats => legacy model trained before the backend computed
// them; fall back to C (matches DownloadModal). An explicit [] means the model
// is server-only (nothing to download).
export const modelFormats = (model) =>
  model && model.formats == null ? ["C"] : (model && model.formats) || [];

export const canDownload = (model) => modelFormats(model).length > 0;
export const canDeployEmbedded = (model) => modelFormats(model).includes("C");

// Short human label of where the trained model can run.
export const deploymentLabel = (model) => {
  const f = modelFormats(model);
  const parts = [];
  if (f.includes("EXECUTORCH")) parts.push("Mobile · ExecuTorch");
  if (f.includes("C")) parts.push("Embedded · C");
  if (!parts.length) return "Server-only";
  return parts.join(" · ");
};
