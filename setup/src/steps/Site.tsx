import { DefaultButton, mergeStyleSets, ProgressIndicator } from "@fluentui/react";
import React, { useCallback, useContext, useState } from "react";
import { createStaticApp } from "../api";
import { DeploymentContext } from "../deploymentContext";
import { StepElem, StepProps } from "../common";

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
    const [executing, setExecuting] = useState(false);
    const [text] = useState({
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
      siteUrl,
      store
    } = useContext(DeploymentContext);

    // const nextEnabled = useRef(false);

    const createSite = useCallback(
      async () => {
        store({ siteUrl: undefined })
        setExecuting(true);
        const siteUrl = await createStaticApp(
          managementCredentials!,
          subscriptionId!,
          resourceGroup!,
          {
            iotcApiKey: centralDetails?.apiKey,
            iotcAppUrl: centralDetails?.appUrl,
            mapSubscriptionKey,
            mapTilesetId: tileSetId,
            mapStatesetId: statesetId,
            mapLatitude: centerCoordinates
              ? `${centerCoordinates[0]}`
              : '',
            mapLongitude: centerCoordinates
              ? `${centerCoordinates[1]}`
              : '',
          }
        );
        if (siteUrl) {
          store({ siteUrl });
        }
      },
      [centralDetails, centerCoordinates, managementCredentials, subscriptionId, resourceGroup, mapSubscriptionKey, tileSetId, statesetId, setExecuting, store]
    );

    if (siteUrl) {
      return (
        <div className={classNames.container}>
          <h2>Congratulations!!</h2>
          <h4>Your website is available here:</h4>
          <a href={siteUrl}>{siteUrl}</a>
          <span>Would you like to publish your site again?</span>
          <span>Click on the "Re-Publish" button below if your previous attempts failed.</span>
          <DefaultButton className={classNames.button} text='Re-publish' onClick={async () => { await createSite(); }} />
        </div>
      );
    }
    else if (executing) {
      return (
        <div className={classNames.container}>
          <ProgressIndicator {...text} />
        </div>
      );
    }
    return (<div className={classNames.container}>
      <span>All required configuration steps are completed.</span>
      <span>Click on the "Publish" button below to start publishing the website which will serve your map.</span>
      <DefaultButton className={classNames.button} text='Publish' onClick={async () => { await createSite(); }} />
    </div>)
  })
);

export default Site;
