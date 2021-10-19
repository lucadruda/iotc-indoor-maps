import { mergeStyleSets, ProgressIndicator } from "@fluentui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  convertPackage,
  createOrUpdateDataSet,
  createStateset,
  createTileset,
} from "../api";
import { DeploymentContext } from "../deploymentContext";
import { StepProps } from "../hooks";

const classNames = mergeStyleSets({
  content: {
    width: "90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

const Configure = React.memo<StepProps>(({ visible }) => {
  const [text, setText] = useState({ label: "", description: "" });
  const { drawingUUIDs, mapSubscriptionKey, store } =
    useContext(DeploymentContext);

  const execute = useCallback(async () => {
    if (!drawingUUIDs) {
      return;
    }
    const convIds: string[] = [];
    for (const drawingUUID of drawingUUIDs) {
      setText({
        label: `Converting packages`,
        description: `Converting package ${drawingUUID}`,
      });
      const convId = await convertPackage(
        drawingUUID,
        "us",
        mapSubscriptionKey!
      );
      if (convId) {
        convIds.push(convId);
      }
    }

    let datasetId;
    for (const convId of convIds) {
      setText({
        label: `Creating data set`,
        description: datasetId ?? "This might take some time.",
      });
      datasetId = await createOrUpdateDataSet(
        convId,
        "us",
        mapSubscriptionKey!,
        datasetId
      );
    }
    setText({
      label: `Dataset created. Creating tileset ...`,
      description: datasetId ?? "",
    });
    if (datasetId) {
      const tileSetId = await createTileset(
        datasetId,
        "us",
        mapSubscriptionKey!
      );
      setText({
        label: `Tileset created. Creating stateset ...`,
        description: tileSetId ?? "",
      });
      if (tileSetId) {
        const statesetId = await createStateset(
          datasetId,
          "us",
          mapSubscriptionKey!
        );
        setText({
          label: `State set created.`,
          description: statesetId ?? "",
        });
        store({ tileSetId, statesetId });
      }
    }
  }, [drawingUUIDs, mapSubscriptionKey, setText, convertPackage]);

  useEffect(() => {
    execute();
  }, [execute]);

  if (!visible) {
    return null;
  }
  return (
    <div className={classNames.content}>
      <ProgressIndicator {...text} />
    </div>
  );
});

export default Configure;