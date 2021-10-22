import { IotCentralModels } from "@azure/arm-iotcentral";
import { Icon, mergeStyleSets, ProgressIndicator } from "@fluentui/react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createCentralApiToken, listCentralApps } from "../api";
import { DeploymentContext } from "../deploymentContext";
import { StepElem, StepProps } from "../common";

const classNames = mergeStyleSets({
  listGrid: {
    width: "90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  listGridItem: {
    padding: 5,
    width: 200,
    height: 180,
    alignItems: "center",
    textAlign: "center",
    display: "inline-flex",
    justifyContent: "center",
    border: "1px solid black",
  },
  clickable: {
    backgroundColor: "#f3f2f1",
    "&:hover": {
      backgroundColor: "#FFFFFF",
      cursor: "pointer",
    },
  },
  button: {
    display: "flex",
    flexDirection: "column",
  },
});

const Central = React.memo(
  React.forwardRef<StepElem, StepProps>(({ enableNext }, ref) => {
    const [apps, setApps] = useState<IotCentralModels.App[] | null>(null);
    const [selectedApp, setSelectedApp] = useState<number | null>(null);
    const { managementCredentials, subscriptionId, centralDetails, store } =
      useContext(DeploymentContext);

    const nextEnabled = useRef(false);

    const loadApps = useCallback(
      async (credentials, subscriptionId) => {
        setApps(await listCentralApps(credentials, subscriptionId));
      },
      [setApps]
    );

    useEffect(() => {
      if (apps && centralDetails) {
        setSelectedApp(
          apps.findIndex((a) => a.subdomain === centralDetails.appSubdomain)
        );
      }
    }, [apps, centralDetails]);

    useEffect(() => {
      if (managementCredentials) {
        loadApps(managementCredentials, subscriptionId);
      }
    }, [loadApps, managementCredentials, subscriptionId]);

    useEffect(() => {
      if (selectedApp !== null && !nextEnabled.current) {
        enableNext();
        nextEnabled.current = true;
      }
    }, [selectedApp, enableNext]);

    useImperativeHandle(
      ref,
      () => ({
        process: async () => {
          const apiKey = await createCentralApiToken(
            managementCredentials!,
            apps![selectedApp!].subdomain!
          );
          if (apiKey) {
            store({
              centralDetails: {
                appSubdomain: apps![selectedApp!].subdomain!,
                apiKey,
              },
            });
          }
        },
      }),
      [managementCredentials, apps, selectedApp, store]
    );

    const onRenderCell = React.useCallback(
      (item: IotCentralModels.App | null, index) => {
        return (
          <div
            key={`central-app-${index}`}
            className={`${classNames.listGridItem} ${
              selectedApp !== index ? classNames.clickable : ""
            }`}
            onClick={() => {
              setSelectedApp(index);
            }}
          >
            <div>
              <h2>{item?.displayName}</h2>
              <p>{`https://${item?.subdomain}.azureiotcentral.com`}</p>
              {selectedApp === index && <Icon iconName="CheckMark" />}
            </div>
          </div>
        );
      },
      [setSelectedApp, selectedApp]
    );
    if (!apps) {
      return (
        <div className={"centered"}>
          <ProgressIndicator className="pageload" />
        </div>
      );
    }
    return <div className={classNames.listGrid}>{apps.map(onRenderCell)}</div>;
  })
);

export default Central;
