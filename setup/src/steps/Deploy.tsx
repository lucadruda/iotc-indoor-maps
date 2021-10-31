import { mergeStyleSets, TextField } from "@fluentui/react";
import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { DeploymentContext } from "../deploymentContext";
import { DeploymentParameters, MapParameters, StepElem, StepProps } from "../common";
import { getMapData, login } from "../api";
import DeploymentImage from '../media/deployment.png';
import Outputs from '../media/outputs.png';

const classNames = mergeStyleSets({
  imageContainer:{
    display:'flex'
  }
  images: {
    width: '40%',
    display: 'block'
  }
});

const Deploy = React.memo(
  React.forwardRef<StepElem, StepProps>(({ enableNext }, ref) => {
    const { store, tenantId, subscriptionId, mapAccountName } = useContext(DeploymentContext);

    const [data, setData] = useState<DeploymentParameters & MapParameters>({ tenantId, subscriptionId, mapAccountName });

    useImperativeHandle(
      ref,
      () => ({
        process: async () => {
          const creds = await login(data.tenantId!);
          const mapData = await getMapData(creds, data.subscriptionId!, data.mapAccountName!);
          if (mapData) {
            store({ ...data, mapSubscriptionKey: mapData.mapSubscriptionKey });
          }
        },
      }),
      [store, data]
    );
    const nextEnabled = useRef(false);

    useEffect(() => {
      if (
        data.subscriptionId &&
        data.tenantId &&
        data.mapAccountName &&
        !nextEnabled.current
      ) {
        enableNext();
        nextEnabled.current = true;
      }
    }, [data, enableNext]);

    return (
      <div>
        <h2>Deploy Maps account to your Azure Subscription</h2>
        <h4>Follow these steps to deploy an Azure Maps account.</h4>
        <p>
          1. Click on the "Deploy" button to deploy the solution to your azure
          subscription.
        </p>
        <p>
          2. Once deployment gets completed head over the "outputs" section and copy the values into the form below.
        </p>
        <div>
          <img className={classNames.images} src={DeploymentImage} alt='deployment' />
          <img className={classNames.images} src={Outputs} alt='outputs' />
        </div>
        <a
          href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Flucadruda%2Fiotc-indoor-maps%2Findoor_maps%2Fsetup%2Fsrc%2Fazure%2Fazuredeploy.json"
          target="_blank"
          rel="noreferrer"
        >
          <img src="https://aka.ms/deploytoazurebutton" alt="Deploy to Azure" />
        </a>
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
          {/* <TextField
            label="Resource Group Name"
            value={data.resourceGroup}
            onChange={(e, val) => {
              setData((current) => ({ ...current, resourceGroup: val! }));
            }}
          /> */}
          <TextField
            label="Map Account Name"
            value={data.mapAccountName}
            onChange={(e, val) => {
              setData((current) => ({
                ...current,
                mapAccountName: val!,
              }));
            }}
          />
        </div>
      </div>
    );
  })
);
export default Deploy;
