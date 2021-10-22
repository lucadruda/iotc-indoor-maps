// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { InteractiveBrowserCredential } from "@azure/identity";
import React, { useCallback, useEffect, useState } from "react";
import { login } from "./api";
import { DeploymentParameters, IoTCentralParameters, MapParameters, useStorage } from "./common";

type IDeploymentState = DeploymentParameters & MapParameters & {
  managementCredentials?: InteractiveBrowserCredential;
  centralDetails?: IoTCentralParameters;
};

const initialState: IDeploymentState = {};

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
