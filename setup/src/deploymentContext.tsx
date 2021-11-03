// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { InteractiveBrowserCredential, TokenCredential } from "@azure/identity";
import React, { useCallback, useState } from "react";
import {
  DeploymentParameters,
  IoTCentralParameters,
  MapParameters,
  useStorage,
} from "./common";

type IDeploymentState = DeploymentParameters &
  MapParameters & {
    managementCredentials?: InteractiveBrowserCredential | TokenCredential;
    centralDetails?: IoTCentralParameters;
    siteUrl?: string
  };

export type IDeploymentContext = IDeploymentState & {
  store: (data: Partial<IDeploymentState>) => void;
};

const DeploymentContext = React.createContext({} as IDeploymentContext);
const { Provider } = DeploymentContext;

const DeploymentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { read, write } = useStorage();
  const [state, setState] = useState<IDeploymentState>(() => {
    const data = read("data");
    if (data) {
      console.log(data);
      return {
        ...JSON.parse(data),
        // managementCredentials: getCredentialForToken({
        //   token:
        //     "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCIsImtpZCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNjM1NzgyNDIzLCJuYmYiOjE2MzU3ODI0MjMsImV4cCI6MTYzNTc4NjMyMywiX2NsYWltX25hbWVzIjp7Imdyb3VwcyI6InNyYzEifSwiX2NsYWltX3NvdXJjZXMiOnsic3JjMSI6eyJlbmRwb2ludCI6Imh0dHBzOi8vZ3JhcGgud2luZG93cy5uZXQvNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3L3VzZXJzLzM4MTJjNWUwLTBkZDYtNDU2Mi05YWU2LWZkODk1MTI5ODE4NC9nZXRNZW1iZXJPYmplY3RzIn19LCJhY3IiOiIxIiwiYWlvIjoiQVVRQXUvOFRBQUFBZTFUNUhtLzQrU3pHSjdqcmgxdXIzeVFPRWo2TTRUYUMxd1lUYkRNM3c2cmZSQlo0Mit6aFoxcmZnYkFYeTFmTzJuQmhjNWFJLzBmZW9MQnpjRU5YeGc9PSIsImFtciI6WyJyc2EiLCJtZmEiXSwiYXBwaWQiOiIwNGIwNzc5NS04ZGRiLTQ2MWEtYmJlZS0wMmY5ZTFiZjdiNDYiLCJhcHBpZGFjciI6IjAiLCJkZXZpY2VpZCI6ImE1MWYxNDNmLTkyMmUtNDkzZi1hMzQzLTcxMDUwNjdlYzExYSIsImZhbWlseV9uYW1lIjoiRHJ1ZGEiLCJnaXZlbl9uYW1lIjoiTHVjYSIsImlwYWRkciI6IjkzLjUxLjUxLjEzNSIsIm5hbWUiOiJMdWNhIERydWRhIiwib2lkIjoiMzgxMmM1ZTAtMGRkNi00NTYyLTlhZTYtZmQ4OTUxMjk4MTg0Iiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTIxMjc1MjExODQtMTYwNDAxMjkyMC0xODg3OTI3NTI3LTIxMDk1NTk4IiwicHVpZCI6IjEwMDMzRkZGOTdBMjE1NzkiLCJyaCI6IjAuQVJvQXY0ajVjdkdHcjBHUnF5MTgwQkhiUjVWM3NBVGJqUnBHdS00Qy1lR19lMFlhQUlrLiIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6Im42SjdEd0QzWTZ6d19YU2Z4d1lNY0JCWFFqcTVfQ2JRbkR4anEtV2JBSVkiLCJ0aWQiOiI3MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDciLCJ1bmlxdWVfbmFtZSI6Imx1ZHJ1ZGFAbWljcm9zb2Z0LmNvbSIsInVwbiI6Imx1ZHJ1ZGFAbWljcm9zb2Z0LmNvbSIsInV0aSI6Ik9fdFhNRlduY1VlbEs1SlNXdnRvQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfdGNkdCI6MTI4OTI0MTU0N30.SaHQdeHS5_b83qUei6sHiGf8r4xgJaqVkaUZ1G9VsPZXI8NPjHUQLb3jUsHmcR9q0eOvITKLjMrBMoTBS38yl2ZnRmPnSiwIElCF16j7kTx4XcSijoW0rAJeY8oyjdGtered5Lhs9XhgaQFWJLkgLyCDSipKX-auyWyWI6QN55zq4AIDVhzCNoskS5Tyv1FqfhDcE0Je7ltRC5duYgDo4lFWlW7obWHio0f5oUMCXAEo1Z7be0rp9nc45hlPg5-MO4j4RdDMjDXAsZWX2_ZEPpIUfiQ7ww3R-kaXFzvzVfWkTMTIco4JQeEa0cUGejhy0A2eqESQ--2GNMMqwqwdNA",
        //   expiresOnTimestamp: 1637914552,
        // }),
      };
    }
    // return {
    //   managementCredentials: getCredentialForToken({
    //     token:
    //       "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCIsImtpZCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNjM1NzgyNDIzLCJuYmYiOjE2MzU3ODI0MjMsImV4cCI6MTYzNTc4NjMyMywiX2NsYWltX25hbWVzIjp7Imdyb3VwcyI6InNyYzEifSwiX2NsYWltX3NvdXJjZXMiOnsic3JjMSI6eyJlbmRwb2ludCI6Imh0dHBzOi8vZ3JhcGgud2luZG93cy5uZXQvNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3L3VzZXJzLzM4MTJjNWUwLTBkZDYtNDU2Mi05YWU2LWZkODk1MTI5ODE4NC9nZXRNZW1iZXJPYmplY3RzIn19LCJhY3IiOiIxIiwiYWlvIjoiQVVRQXUvOFRBQUFBZTFUNUhtLzQrU3pHSjdqcmgxdXIzeVFPRWo2TTRUYUMxd1lUYkRNM3c2cmZSQlo0Mit6aFoxcmZnYkFYeTFmTzJuQmhjNWFJLzBmZW9MQnpjRU5YeGc9PSIsImFtciI6WyJyc2EiLCJtZmEiXSwiYXBwaWQiOiIwNGIwNzc5NS04ZGRiLTQ2MWEtYmJlZS0wMmY5ZTFiZjdiNDYiLCJhcHBpZGFjciI6IjAiLCJkZXZpY2VpZCI6ImE1MWYxNDNmLTkyMmUtNDkzZi1hMzQzLTcxMDUwNjdlYzExYSIsImZhbWlseV9uYW1lIjoiRHJ1ZGEiLCJnaXZlbl9uYW1lIjoiTHVjYSIsImlwYWRkciI6IjkzLjUxLjUxLjEzNSIsIm5hbWUiOiJMdWNhIERydWRhIiwib2lkIjoiMzgxMmM1ZTAtMGRkNi00NTYyLTlhZTYtZmQ4OTUxMjk4MTg0Iiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTIxMjc1MjExODQtMTYwNDAxMjkyMC0xODg3OTI3NTI3LTIxMDk1NTk4IiwicHVpZCI6IjEwMDMzRkZGOTdBMjE1NzkiLCJyaCI6IjAuQVJvQXY0ajVjdkdHcjBHUnF5MTgwQkhiUjVWM3NBVGJqUnBHdS00Qy1lR19lMFlhQUlrLiIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6Im42SjdEd0QzWTZ6d19YU2Z4d1lNY0JCWFFqcTVfQ2JRbkR4anEtV2JBSVkiLCJ0aWQiOiI3MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDciLCJ1bmlxdWVfbmFtZSI6Imx1ZHJ1ZGFAbWljcm9zb2Z0LmNvbSIsInVwbiI6Imx1ZHJ1ZGFAbWljcm9zb2Z0LmNvbSIsInV0aSI6Ik9fdFhNRlduY1VlbEs1SlNXdnRvQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfdGNkdCI6MTI4OTI0MTU0N30.SaHQdeHS5_b83qUei6sHiGf8r4xgJaqVkaUZ1G9VsPZXI8NPjHUQLb3jUsHmcR9q0eOvITKLjMrBMoTBS38yl2ZnRmPnSiwIElCF16j7kTx4XcSijoW0rAJeY8oyjdGtered5Lhs9XhgaQFWJLkgLyCDSipKX-auyWyWI6QN55zq4AIDVhzCNoskS5Tyv1FqfhDcE0Je7ltRC5duYgDo4lFWlW7obWHio0f5oUMCXAEo1Z7be0rp9nc45hlPg5-MO4j4RdDMjDXAsZWX2_ZEPpIUfiQ7ww3R-kaXFzvzVfWkTMTIco4JQeEa0cUGejhy0A2eqESQ--2GNMMqwqwdNA",
    //     expiresOnTimestamp: 1637914552,
    //   }),
    //   mapSubscriptionKey: "aipGMyZjmHtjPnOTGTCbWQawlMoQ6MOwVLN2QFpa4fw",
    //   mapAccountName: "ubs-azure-maps",
    // };
    // return {};
  });
  // const authenticate = useCallback(
  //   async (tenantId) => {
  //     const client = await login(tenantId);
  //     setState((current) => ({ ...current, managementCredentials: client }));
  //   },
  //   [setState]
  // );

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

  // useEffect(() => {
  //   if ((state.tenantId, state.subscriptionId)) {
  //     authenticate(state.tenantId);
  //   }
  // }, [state.tenantId, state.subscriptionId, authenticate]);

  const value = { ...state, store };

  return <Provider value={value}>{children}</Provider>;
};

export { DeploymentProvider as default, DeploymentContext };
