import { mergeStyleSets, ProgressIndicator } from "@fluentui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { createStaticApp } from "../api";
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

const DEPLOYMENT_VARIABLES = {
  REACT_APP_MAP_SUBSCRIPTION_KEY: "aipGMyZjmHtjPnOTGTCbWQawlMoQ6MOwVLN2QFpa4fw",
  REACT_APP_MAP_TILESET_ID: "0d76d5d2-36fc-1aaa-d511-0302eb3e4bc4",
  REACT_APP_MAP_STATESET_ID: "9587d752-caad-37a2-bd2a-a4db8afc0e70",
  REACT_APP_IOTC_API_KEY:
    "SharedAccessSignature sr=3a5279fe-8817-4181-af6d-27323aa9e6d1&sig=RP1WYdta%2F8kFSHZ3pf7Cu2Gruoa07Gp2ye8rBwpYhmY%3D&skn=API&se=1665043186510",
  REACT_APP_IOTC_APP_SUBDOMAIN: "ubsmap",
};

const Site = React.memo(
  React.forwardRef<StepElem, StepProps>(() => {
    const [text, setText] = useState({
      label: "Creating web site",
      description: "",
    });
    const { managementCredentials, subscriptionId, resourceGroup } =
      useContext(DeploymentContext);

    // const nextEnabled = useRef(false);

    const createSite = useCallback(async (credentials, subscriptionId, resourceGroup) => {
      await createStaticApp(
        credentials,
        subscriptionId,
        resourceGroup,
        DEPLOYMENT_VARIABLES
      );
    }, []);

    useEffect(() => {
      if (managementCredentials && subscriptionId) {
        createSite(managementCredentials, subscriptionId, resourceGroup);
      }
    }, [createSite, managementCredentials, subscriptionId]);

    return (
      <div className={classNames.content}>
        <ProgressIndicator {...text} />
      </div>
    );
  })
);

export default Site;
