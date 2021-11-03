import { DefaultButton, mergeStyleSets, ProgressIndicator } from "@fluentui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { createStaticApp, login } from "../api";
import { DeploymentContext } from "../deploymentContext";
import { SiteParameters, StepElem, StepProps } from "../common";

const classNames = mergeStyleSets({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  content: {
    width: "90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    margin: 20
  }
});

const Site = React.memo(
  React.forwardRef<StepElem, StepProps>(() => {
    const [siteUrl, setSiteUrl] = useState<string | null>(null);
    const [executing, setExecuting] = useState(false);
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

    if (siteUrl) {
      return (
        <div className={classNames.content}>
          <h2>Congratulations!!</h2>
          <h4>Your website is available here:</h4>
          <a href={siteUrl}>{siteUrl}</a>
        </div>
      );
    }
    else if (executing) {
      return (
        <div className={classNames.content}>
          <ProgressIndicator {...text} />
        </div>
      );
    }
    return (<div className={classNames.container}>
      <span>All required configuration steps are completed.</span>
      <span>Click on the "Publish" button below to start publishing the website which will serve your map.</span>
      <DefaultButton className={classNames.button} text='Publish' onClick={async () => {
        setExecuting(true);
        await createSite(managementCredentials, subscriptionId, resourceGroup);
      }} />
    </div>)
  })
);

export default Site;
