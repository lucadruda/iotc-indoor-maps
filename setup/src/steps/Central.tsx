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
import { getCredentialForToken, StepElem, StepProps } from "../common";

const classNames = mergeStyleSets({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  listGrid: {
    width: "90%",
    height: 600,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
    overflowY: "auto",
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
  description: {
    margin: "5%",
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
        setApps(
          await listCentralApps(
            credentials,
            subscriptionId
          )
        );
      },
      [setApps]
    );

    useEffect(() => {
      if (apps && centralDetails) {
        setSelectedApp(
          apps.findIndex(
            (a) => a.subdomain === centralDetails.appUrl.split(".")[0]
          )
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
            // getCredentialForToken({
            //   token:
            //     "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCIsImtpZCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCJ9.eyJhdWQiOiJodHRwczovL2FwcHMuYXp1cmVpb3RjZW50cmFsLmNvbSIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0Ny8iLCJpYXQiOjE2MzU3ODIzMzgsIm5iZiI6MTYzNTc4MjMzOCwiZXhwIjoxNjM1Nzg2MjM4LCJhY3IiOiIxIiwiYWlvIjoiQVVRQXUvOFRBQUFBR3lORDNqaWFkcy9zL1puVVYyV0E1QXNLL0ZnaTZqalFMUFZ6M2lrZEZ3dXhGcnErYStDZGM4M1d2YndwUjlrTjN5THo1bmlJK2dSbldzaTZUSGJETVE9PSIsImFtciI6WyJyc2EiLCJtZmEiXSwiYXBwaWQiOiIwNGIwNzc5NS04ZGRiLTQ2MWEtYmJlZS0wMmY5ZTFiZjdiNDYiLCJhcHBpZGFjciI6IjAiLCJkZXZpY2VpZCI6ImE1MWYxNDNmLTkyMmUtNDkzZi1hMzQzLTcxMDUwNjdlYzExYSIsImZhbWlseV9uYW1lIjoiRHJ1ZGEiLCJnaXZlbl9uYW1lIjoiTHVjYSIsImlwYWRkciI6IjkzLjUxLjUxLjEzNSIsIm5hbWUiOiJMdWNhIERydWRhIiwib2lkIjoiMzgxMmM1ZTAtMGRkNi00NTYyLTlhZTYtZmQ4OTUxMjk4MTg0Iiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTIxMjc1MjExODQtMTYwNDAxMjkyMC0xODg3OTI3NTI3LTIxMDk1NTk4IiwicHVpZCI6IjEwMDMzRkZGOTdBMjE1NzkiLCJyaCI6IjAuQVJvQXY0ajVjdkdHcjBHUnF5MTgwQkhiUjVWM3NBVGJqUnBHdS00Qy1lR19lMFlhQUlrLiIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6Ik9tU19lU1g5UWhRU0JxbjFuX3BybzI3SHpBY014b2FFVWNwSnFwZEttQzAiLCJ0aWQiOiI3MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDciLCJ1bmlxdWVfbmFtZSI6Imx1ZHJ1ZGFAbWljcm9zb2Z0LmNvbSIsInVwbiI6Imx1ZHJ1ZGFAbWljcm9zb2Z0LmNvbSIsInV0aSI6IjZvUlZKZFVQekVPSlZRb2puNTlkQUEiLCJ2ZXIiOiIxLjAifQ.Ex_xF2Q4ao2lwDZviJVbHxDp1dwVRIV4F2kmtIogwq7wfqzTzSMAh5NntWW2YQhKJoE4euGZlW6UgkfB4tFmMdag_oZ4e_dEQslTKLEeP2yctn-3FF6-QFDsuDkw2aVLHn74QkObz1GmgfXxYU6UgjKUXXIPLi7-foLLFtQ6wUYLr0QSzbLTevBAAP_1jEE_oNt80XRMl_A3fYlP3HRe5jBOSzDZ1n0WlCowzHFUG5ovxft2jwCuPkTMGW9cVc0cO2juTg_JTXuAAj0wNZeoTlN7Yxd8WBmO4iA27WE57WcG60_N7ZCbDMLu2MknK21lHenYjje0gj0RBvott-HAcA",
            //   expiresOnTimestamp: 1635786280,
            // }),
            `${apps![selectedApp!].subdomain!}.azureiotcentral.com`
          );
          console.log(apiKey);
          if (apiKey) {
            store({
              centralDetails: {
                appUrl: `${apps![selectedApp!].subdomain!}.azureiotcentral.com`,
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
          <ProgressIndicator
            className="pageload"
            description="Loading IoT Central applications"
          />
        </div>
      );
    }
    return (
      <div className={classNames.container}>
        <h2>Select IoT Central application</h2>
        <div className={classNames.listGrid}>{apps.map(onRenderCell)}</div>
      </div>
    );
  })
);

export default Central;
