import { FontIcon, mergeStyleSets } from "@fluentui/react";
import React, { useState } from "react";
import { useSteps, useSubmit } from "./hooks";
import Deploy from "./steps/Deploy";
import Upload from "./steps/Upload";
import DeploymentProvider from "./deploymentContext";
import Configure from "./steps/Configure";

const styles = {
  wizardBody: {
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: "5%",
    display: "flex",
    justifyContent: "space-evenly",
    width: "100%",
  },
  arrow: {
    alignItems: "center",
    display: "flex",
    width: 100,
    justifyContent: "space-evenly",
  },
  icon: {
    cursor: "pointer",
  },
};

const classNames = mergeStyleSets(styles);

const App = React.memo(() => {
  return (
    <DeploymentProvider>
      <Wizard />
    </DeploymentProvider>
  );
});

export function Wizard() {
  const [current, next, previous] = useSteps(0);
  const [nextEnabled, setNextEnabled] = useState(false);
  const submit = useSubmit(false);
  const totalSteps = 3;

  return (
    <div className={classNames.wizardBody}>
      <Deploy
        visible={current === 0}
        enableNext={() => setNextEnabled(true)}
        submit={submit.submitting && current === 1}
        resetSubmit={submit.reset}
      />
      <Upload
        visible={current === 1}
        enableNext={() => setNextEnabled(true)}
        submit={submit.submitting && current === 2}
        resetSubmit={submit.reset}
      />
       <Configure
        visible={current === 2}
        enableNext={() => setNextEnabled(true)}
        submit={submit.submitting && current === 3}
        resetSubmit={submit.reset}
      />
      <div className={classNames.footer}>
        <div
          className={classNames.arrow}
          style={{
            display: current === 0 ? "none" : "flex",
          }}
        >
          <p>Previous</p>
          <FontIcon
            iconName="Back"
            onClick={previous}
            className={classNames.icon}
          />
        </div>
        <div
          className={classNames.arrow}
          style={{
            display:
              current === totalSteps - 1 || !nextEnabled ? "none" : "flex",
          }}
        >
          <p>Next</p>
          <FontIcon
            iconName="Forward"
            onClick={() => {
              next();
              submit.set();
            }}
            className={classNames.icon}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
