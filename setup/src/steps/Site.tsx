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

const DEPLOYMENT_VARIABLES: Partial<SiteParameters> = {
  mapSubscriptionKey: "aipGMyZjmHtjPnOTGTCbWQawlMoQ6MOwVLN2QFpa4fw",
  mapTilesetId: "0d76d5d2-36fc-1aaa-d511-0302eb3e4bc4",
  mapStatesetId: "9587d752-caad-37a2-bd2a-a4db8afc0e70",
  iotcApiKey:
    "SharedAccessSignature sr=3a5279fe-8817-4181-af6d-27323aa9e6d1&sig=RP1WYdta%2F8kFSHZ3pf7Cu2Gruoa07Gp2ye8rBwpYhmY%3D&skn=API&se=1665043186510",
  iotcSubdomain: "ubsmap",
};

const Site = React.memo(
  React.forwardRef<StepElem, StepProps>(() => {
    const [text, setText] = useState({
      label: "Creating web site",
      description: "This might take a while. Please don't close the page until creation is completed.",
    });
    const [siteUrl, setSiteUrl] = useState<string | null>(null);
    const { managementCredentials, subscriptionId, resourceGroup } =
      useContext(DeploymentContext);

    // const nextEnabled = useRef(false);

    const createSite = useCallback(async (managementCredentials, subscriptionId, resourceGroup) => {
      const credentials = await login('4ac2d501-d648-4bd0-8486-653a65f90fc7', '2efa8bb6-25bf-4895-ba64-33806dd00780');
      debugger;
      const creationResult = await createStaticApp(
        credentials,
        '2efa8bb6-25bf-4895-ba64-33806dd00780',
        'lucamaps',
        DEPLOYMENT_VARIABLES
      );
      if (creationResult) {
        setSiteUrl(creationResult);
      }
    }, []);

    useEffect(() => {
      // if (managementCredentials,subscriptionId) {

      createSite(managementCredentials, subscriptionId, resourceGroup);
      // }
    }, [createSite, managementCredentials, subscriptionId]);

    if (siteUrl) {
      return (
        <div className={classNames.content}>
          <h2>Congratulations!!</h2>
          <h4>Your website is available here:</h4>
          <a href={siteUrl}>{siteUrl}</a>
        </div>
      );
    }
    else {
      return (
        <div className={classNames.content}>
          <ProgressIndicator {...text} />
        </div>
      );
    }
  })
);

export default Site;
