import { mergeStyleSets, ProgressIndicator } from "@fluentui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  convertPackage,
  createOrUpdateDataSet,
  createStateset,
  createTileset,
} from "../api";
import { DeploymentContext } from "../deploymentContext";
import { StepElem, StepProps } from "../common";

const classNames = mergeStyleSets({
  content: {
    width: "90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

const Configure = React.memo(
  React.forwardRef<StepElem, StepProps>(({ enableNext }, ref) => {
    const [text, setText] = useState({ label: "", description: "" });
    const { drawingUUIDs, mapSubscriptionKey, statesetId, store } =
      useContext(DeploymentContext);

    const execute = useCallback(async () => {
      if (!drawingUUIDs) {
        return;
      }
      const convIds: string[] = [];
      if (statesetId) {
        setText({
          label: `State set created.`,
          description: statesetId ?? "",
        });
        enableNext();
        return;
      }
      for (const drawingUUID of drawingUUIDs) {
        setText({
          label: `Converting packages. Please wait...`,
          description: `Converting package ${drawingUUID}`,
        });
        const convId = await convertPackage(
          drawingUUID?.uuid!,
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
          enableNext();
        }
      }
    }, [drawingUUIDs, mapSubscriptionKey, setText, store]);

    useEffect(() => {
      execute();
    }, [execute]);

    return (
      <div className={classNames.content}>
        <ProgressIndicator
          {...text}
          percentComplete={statesetId ? 1 : undefined}
        />
      </div>
    );
  })
);

export default Configure;
