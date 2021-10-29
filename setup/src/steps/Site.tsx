import { mergeStyleSets, ProgressIndicator } from "@fluentui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { createStaticApp, login } from "../api";
import { DeploymentContext } from "../deploymentContext";
import { SiteParameters, StepElem, StepProps } from "../common";

const classNames = mergeStyleSets({
  content: {
    width: "90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

const Site = React.memo(
  React.forwardRef<StepElem, StepProps>(() => {
    const [text, setText] = useState({
      label: "Creating web site",
      description:
        "This might take a while. Please don't close the page until creation is completed.",
    });
    const {
      managementCredentials,
      subscriptionId,
      resourceGroup,
      mapSubscriptionKey,
      tileSetId,
      statesetId,
      centralDetails,
    } = useContext(DeploymentContext);

    // const nextEnabled = useRef(false);

    const createSite = useCallback(
      async (managementCredentials, subscriptionId, resourceGroup) => {
        await createStaticApp(
          managementCredentials,
          subscriptionId,
          resourceGroup,
          {
            iotcApiKey: centralDetails?.apiKey,
            iotcSubdomain: centralDetails?.appSubdomain,
            mapSubscriptionKey,
            mapTilesetId: tileSetId,
            mapStatesetId: statesetId,
          }
        );
      },
      [centralDetails, mapSubscriptionKey, tileSetId, statesetId]
    );

    useEffect(() => {
      // if (managementCredentials,subscriptionId) {

      createSite(managementCredentials, subscriptionId, resourceGroup);
      // }
    }, [createSite, managementCredentials, subscriptionId]);

    return (
      <div className={classNames.content}>
        <ProgressIndicator {...text} />
      </div>
    );
  })
);

export default Site;
