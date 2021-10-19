import { TextField } from "@fluentui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { DeploymentContext } from "../deploymentContext";
import { StepProps } from "../hooks";

const Deploy = React.memo<StepProps>(
  ({ visible, enableNext, submit, resetSubmit }) => {
    const { store, subscriptionId, tenantId, mapSubscriptionKey } =
      useContext(DeploymentContext);

    const [data, setData] = useState(
      // subscriptionId && tenantId && mapSubscriptionKey
      //   ?
      {
        subscriptionId: "7c989b7d-a7d5-4256-9f3f-809d6554cec8",
        tenantId: "72f988bf-86f1-41af-91ab-2d7cd011db47",
        mapSubscriptionKey: "fzIwvA-PX2RNMM0P_9SoCSZHvX3iFD2712Qemctrqwk",
      }
      // : { subscriptionId: "", tenantId: "", mapSubscriptionKey: "" }
    );
    const nextEnabled = useRef(false);

    useEffect(() => {
      if (submit) {
        resetSubmit();
        store(data);
      }
    }, [submit, resetSubmit, store, data]);

    useEffect(() => {
      if (
        data.subscriptionId &&
        data.tenantId &&
        data.mapSubscriptionKey &&
        !nextEnabled.current
      ) {
        enableNext();
        nextEnabled.current = true;
      }
    }, [data, enableNext]);

    if (!visible) {
      return null;
    }

    return (
      <div>
        <h2>Deploy Maps account to your Azure Subscription</h2>
        <p>
          Click on the button below to deploy the solution to your azure
          subscription.
        </p>
        <a
          href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Flucadruda%2Fubs-workshop%2Findoor_maps%2Fsetup%2Fazure%2Fazuredeploy.json%3Ftoken%3DAARKIISFGX2MRU7JK7VOZXTBNFEMQ"
          target="_blank"
        >
          <img src="https://aka.ms/deploytoazurebutton" />
        </a>
        <div></div>
        <div style={{ textAlign: "start" }}>
          <TextField
            label="Subscription Id"
            value={data.subscriptionId}
            onChange={(e, val) => {
              setData((current) => ({ ...current, subscriptionId: val! }));
            }}
          />
          <TextField
            label="Tenant Id"
            value={data.tenantId}
            onChange={(e, val) => {
              setData((current) => ({ ...current, tenantId: val! }));
            }}
          />
          <TextField
            label="Map Subscription Key"
            value={data.mapSubscriptionKey}
            onChange={(e, val) => {
              setData((current) => ({ ...current, mapSubscriptionKey: val! }));
            }}
          />
        </div>
      </div>
    );
  }
);
export default Deploy;
