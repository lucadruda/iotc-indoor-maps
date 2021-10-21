// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { InteractiveBrowserCredential } from "@azure/identity";
import React, { useCallback, useEffect, useState } from "react";
import { login } from "./api";
import { useStorage } from "./hooks";

type IDeploymentState = {
  subscriptionId: string | null;
  tenantId: string | null;
  mapSubscriptionKey: string | null;
  drawingUUIDs: string[] | null;
  tileSetId: string | null;
  statesetId: string | null;
  managementCredentials: InteractiveBrowserCredential | null;
  centralDetails: { appSubdomain: string; apiKey: string } | null;
};

const initialState: IDeploymentState = {
  subscriptionId: "2efa8bb6-25bf-4895-ba64-33806dd00780",
  tenantId: "4ac2d501-d648-4bd0-8486-653a65f90fc7",
  mapSubscriptionKey: null,
  drawingUUIDs: null,
  tileSetId: null,
  statesetId: null,
  managementCredentials: null,
  centralDetails: null,
};

export type IDeploymentContext = IDeploymentState & {
  store: (data: Partial<IDeploymentState>) => void;
};

const DeploymentContext = React.createContext({} as IDeploymentContext);
const { Provider } = DeploymentContext;

const DeploymentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<IDeploymentState>(initialState);
  const { read, write } = useStorage();
  const authenticate = useCallback(
    async (tenantId, subscriptionId) => {
      const client = await login(tenantId, subscriptionId);
      setState((current) => ({ ...current, managementCredentials: client }));
    },
    [setState]
  );

  const store = useCallback(
    (data: Partial<IDeploymentState>) => {
      setState((current) => {
        const res = { ...current, ...data };
        const { managementCredentials, ...toWrite } = res;
        write("data", JSON.stringify(toWrite));
        return res;
      });
    },
    [setState, write]
  );

  /** Recover from storage */
  useEffect(() => {
    const data = read("data");
    if (data) {
      setState((current) => ({ ...current, ...JSON.parse(data) }));
    }
  }, [read]);

  useEffect(() => {
    if ((state.tenantId, state.subscriptionId)) {
      authenticate(state.tenantId, state.subscriptionId);
    }
  }, [state.tenantId, state.subscriptionId, authenticate]);

  const value = { ...state, store };

  return <Provider value={value}>{children}</Provider>;
};

export { DeploymentProvider as default, DeploymentContext };
