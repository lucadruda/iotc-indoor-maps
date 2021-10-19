// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AzureMapsManagementClient } from "@azure/arm-maps";
import React, { useCallback, useState } from "react";
import { creator, login } from "./api";

type StateUpdater<T> = React.Dispatch<React.SetStateAction<T>>;

type IDeploymentState = {
  subscriptionId: string | null;
  tenantId: string | null;
  mapSubscriptionKey: string | null;
  drawingUUIDs: string[] | null;
  tileSetId: string | null;
  statesetId: string | null;
};

const initialState: IDeploymentState = {
  subscriptionId: null,
  tenantId: null,
  mapSubscriptionKey: null,
  drawingUUIDs: null,
  tileSetId: null,
  statesetId: null,
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
  const store = useCallback(
    (data: Partial<IDeploymentState>) => {
      setState((current) => ({ ...current, ...data }));
    },
    [setState]
  );

  const value = { ...state, store };

  return <Provider value={value}>{children}</Provider>;
};

export { DeploymentProvider as default, DeploymentContext };
