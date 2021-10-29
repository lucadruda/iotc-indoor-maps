import { TextField } from "@fluentui/react";
import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { DeploymentContext } from "../deploymentContext";
import { DeploymentParameters, MapParameters, StepElem, StepProps } from "../common";

const Deploy = React.memo(
  React.forwardRef<StepElem, StepProps>(({ enableNext }, ref) => {
    const { store } = useContext(DeploymentContext);

    const [data, setData] = useState<DeploymentParameters & MapParameters>(
      // subscriptionId && tenantId && mapSubscriptionKey
      //   ?
     {}
      // : { subscriptionId: "", tenantId: "", mapSubscriptionKey: "" }
    );

    useImperativeHandle(
      ref,
      () => ({
        process: () => {
          store(data);
        },
      }),
      [store, data]
    );
    const nextEnabled = useRef(false);

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

    return (
      <div>
        <h2>1. Deploy Maps account to your Azure Subscription</h2>
        <p>
          Click on the button below to deploy the solution to your azure
          subscription.
        </p>
        <a
          href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Flucadruda%2Fubs-workshop%2Findoor_maps%2Fsetup%2Fazure%2Fazuredeploy.json%3Ftoken%3DAARKIISFGX2MRU7JK7VOZXTBNFEMQ"
          target="_blank"
          rel="noreferrer"
        >
          <img src="https://aka.ms/deploytoazurebutton" alt="Deploy to Azure" />
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
            label="Resource Group Name"
            value={data.resourceGroup}
            onChange={(e, val) => {
              setData((current) => ({ ...current, resourceGroup: val! }));
            }}
          />
          <TextField
            label="Map Subscription Key"
            value={data.mapSubscriptionKey}
            onChange={(e, val) => {
              setData((current) => ({
                ...current,
                mapSubscriptionKey: val!,
              }));
            }}
          />
        </div>
      </div>
    );
  })
);
export default Deploy;
