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
    const [siteUrl, setSiteUrl] = useState<string | null>(null);
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
      centerCoordinates,
    } = useContext(DeploymentContext);

    // const nextEnabled = useRef(false);

    const createSite = useCallback(
      async (managementCredentials, subscriptionId, resourceGroup) => {
        setSiteUrl(
          await createStaticApp(
            managementCredentials,
            subscriptionId,
            resourceGroup,
            {
              iotcApiKey: centralDetails?.apiKey,
              iotcAppUrl: centralDetails?.appUrl,
              mapSubscriptionKey,
              mapTilesetId: tileSetId,
              mapStatesetId: statesetId,
              mapLatitude: centerCoordinates
                ? `${centerCoordinates[0]}`
                : undefined,
              mapLongitude: centerCoordinates
                ? `${centerCoordinates[1]}`
                : undefined,
            }
          )
        );
      },
      [centralDetails, mapSubscriptionKey, tileSetId, statesetId]
    );

    useEffect(() => {
      // if (managementCredentials,subscriptionId) {
      if (centralDetails) {
        createSite(managementCredentials, subscriptionId, resourceGroup);
      }
      // }
    }, [centralDetails, createSite, managementCredentials, subscriptionId]);

    if (siteUrl) {
      return (
        <div className={classNames.content}>
          <h2>Congratulations!!</h2>
          <h4>Your website is available here:</h4>
          <a href={siteUrl}>{siteUrl}</a>
        </div>
      );
    } else {
      return (
        <div className={classNames.content}>
          <ProgressIndicator {...text} />
        </div>
      );
    }
  })
);

export default Site;
