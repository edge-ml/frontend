import React, { useState } from "react";
import { Button, TextInput } from "@mantine/core";
import Select from "react-select";
import { platforms } from "./platforms";
import { Line } from "./components/Line";

export const ExportDetailView = ({
  model,
  onClickViewModelDetails,
  onClickDownloadModel,
  platformName,
  platformContents,
  onPlatform,
}) => {
  const nPlatforms = model.platforms
    .map((v) => platforms.find((p) => p.value === v))
    .filter((v) => v);
  const nPlatform = nPlatforms.find((p) => p.value === platformName);
  const Code = nPlatform ? nPlatform.prism : null;

  return (
    <div>
      <Line>
        <Button onClick={onClickViewModelDetails} style={{ float: "right" }}>
          See Model Details
        </Button>
        <b>Model name: </b>
        <span>{model.name}</span>
      </Line>
      <Line>
        <b>Available on platforms: </b>
        <ul style={{ margin: 0 }}>
          {nPlatforms.map((p) => (
            <li key={p.value}>
              <span>{p.label}</span>
            </li>
          ))}
        </ul>
      </Line>

      {nPlatform ? (
        <>
          <hr />
          <Line>
            <h5>Export model</h5>
          </Line>
          <Line>
            <div style={{ float: "right", display: "flex" }}>
              <span style={{ minWidth: "200px" }}>
                <Select
                  value={nPlatform}
                  onChange={(x) => onPlatform(x.value)}
                  options={nPlatforms}
                />
              </span>
              <Button
                onClick={onClickDownloadModel}
                style={{ marginLeft: "1rem" }}
              >
                Download model
              </Button>
            </div>
            <b>Platform: </b>
          </Line>
          <Line>
            <b>Code: </b>
            <Code code={platformContents} />
          </Line>
        </>
      ) : null}
    </div>
  );
};
