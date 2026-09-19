import React, { useEffect, useRef, useState } from "react";
import { TextInput } from "@mantine/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSlidersH,
  faTags,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import "./MetadataPanel.css";

const toRows = (metaData) =>
  Object.keys(metaData ?? {}).map((key) => ({ key, data: metaData[key] }));

const serializeRows = (rows) =>
  rows.map((row) => `${JSON.stringify(row.key)}=${JSON.stringify(row.data)}`).join("|");

const toObject = (rows) => {
  const result = {};
  rows.forEach((row) => {
    const key = row.key?.trim();
    if (key) result[key] = row.data;
  });
  return result;
};

const CustomMetadataPanel = ({ metaData, onUpdateMetaData }) => {
  const [rows, setRows] = useState(() => toRows(metaData));
  const focusedInputs = useRef(0);

  // Accept outside updates (e.g. after a save has been persisted), but
  // never while the user is editing — otherwise a background refresh
  // would wipe out in-progress changes.
  useEffect(() => {
    if (focusedInputs.current > 0) return;
    const nextRows = toRows(metaData);
    setRows((prevRows) =>
      serializeRows(prevRows) === serializeRows(nextRows) ? prevRows : nextRows
    );
  }, [metaData]);

  const commit = (nextRows) => onUpdateMetaData({ metaData: toObject(nextRows) });

  // Commits happen on blur / delete / add — never on keystrokes.
  const onEditKey = (idx, key) =>
    setRows(rows.map((row, i) => (i === idx ? { ...row, key } : row)));

  const onEditValue = (idx, data) =>
    setRows(rows.map((row, i) => (i === idx ? { ...row, data } : row)));

  const onCommitRow = () => {
    if (focusedInputs.current > 0) return;
    commit(rows);
  };

  const onDeleteRow = (idx) => {
    const nextRows = rows.filter((_, i) => i !== idx);
    setRows(nextRows);
    commit(nextRows);
  };

  const onAddRow = () => setRows([...rows, { key: "", data: "" }]);

  const seenKeys = new Set();
  const duplicateKeys = new Set();
  rows.forEach(({ key }) => {
    const normalized = key?.trim().toLowerCase();
    if (!normalized) return;
    if (seenKeys.has(normalized)) duplicateKeys.add(normalized);
    else seenKeys.add(normalized);
  });

  const count = Object.keys(metaData ?? {}).length;

  return (
    <div className="metadata-section">
      <div className="metadata-section-header">
        <h4 className="metadata-section-title">
          <FontAwesomeIcon
            className="metadata-section-icon"
            icon={faSlidersH}
          />
          Custom Metadata
          {count > 0 && (
            <span className="metadata-count-badge">{count}</span>
          )}
        </h4>
      </div>
      {rows.length ? (
        <div className="custom-metadata-list">
          {rows.map((row, idx) => {
            const isDuplicate =
              row.key?.trim() !== "" &&
              duplicateKeys.has(row.key.trim().toLowerCase());
            return (
              <div
                className={`customMetaDataItem${
                  isDuplicate ? " customMetaDataItem--invalid" : ""
                }`}
                key={idx}
              >
                <button
                  className="customMetaDataDelete"
                  onClick={() => onDeleteRow(idx)}
                  title="Remove this entry"
                >
                  <FontAwesomeIcon icon={faXmark} size="xs" />
                </button>
                <TextInput
                  className="customMetaDataInput customMetaDataInput--key"
                  size="xs"
                  variant="unstyled"
                  value={row.key ?? ""}
                  onChange={(e) => onEditKey(idx, e.target.value)}
                  onFocus={() => focusedInputs.current++}
                  onBlur={() => {
                    focusedInputs.current--;
                    onCommitRow();
                  }}
                  placeholder="Key"
                />
                <span className="customMetaDataSeparator">=</span>
                <TextInput
                  className="customMetaDataInput"
                  size="xs"
                  variant="unstyled"
                  value={row.data ?? ""}
                  onChange={(e) => onEditValue(idx, e.target.value)}
                  onFocus={() => focusedInputs.current++}
                  onBlur={() => {
                    focusedInputs.current--;
                    onCommitRow();
                  }}
                  placeholder="Value"
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="custom-metadata-empty">
          <FontAwesomeIcon icon={faTags} />
          <span>No custom metadata yet</span>
          <span style={{ fontSize: "0.78rem" }}>
            Use “Add field” below to create your own key/value pairs.
          </span>
        </div>
      )}
      <div className="custom-metadata-add">
        <button className="customMetadataAddButton" onClick={onAddRow}>
          <FontAwesomeIcon icon={faPlus} size="xs" />
          Add field
        </button>
      </div>
    </div>
  );
};

export default CustomMetadataPanel;
