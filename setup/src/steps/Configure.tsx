import { DefaultButton, mergeStyleSets, ProgressIndicator } from "@fluentui/react";
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  button: {
    margin: 20
  }
});

const Configure = React.memo(
  React.forwardRef<StepElem, StepProps>(({ enableNext }, ref) => {
    const [text, setText] = useState({ label: "", description: "" });
    const [executing, setExecuting] = useState(false);
    const { drawingUUIDs, mapSubscriptionKey, mapAccountName, statesetId, store } =
      useContext(DeploymentContext);

    const execute = useCallback(async () => {
      if (!drawingUUIDs) {
        return;
      }
      const convIds: string[] = [];
      setExecuting(true);
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
    }, [drawingUUIDs, mapSubscriptionKey, setText, store, setExecuting, enableNext]);

    useEffect(() => {
      if (statesetId) {
        enableNext();
      }
    }, [statesetId, enableNext]);

    if (statesetId) {
      // configuration has ended.
      return (<div className={classNames.container}>
        <span>You already have configure your map account <mark>{mapAccountName}</mark>.</span>
        <span>Click on the "Restart" button if you want to start another conversion, otherwise click "Next" to continue the setup.</span>
        <DefaultButton className={classNames.button} text='Restart' onClick={execute} />
      </div>)
    }
    else if (executing) {
      return (
        <div className={classNames.container}>
          <ProgressIndicator
            {...text}
            percentComplete={statesetId ? 1 : undefined}
          />
        </div>
      );
    }
    return (<div className={classNames.container}>
      <h4>You have uploaded {drawingUUIDs?.length} drawings.</h4>
      <span>The packages now need to be converted and assign to a dataset. <br />Click on the <mark>"Start"</mark> button below to start the process.</span>
      <span>This may take several minutes. Please do not close this page until all required steps are completed.</span>
      <DefaultButton className={classNames.button} text='Start' onClick={execute} />
    </div>)
  })
);

export default Configure;
