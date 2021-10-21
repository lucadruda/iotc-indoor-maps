import { FontIcon, mergeStyleSets } from "@fluentui/react";
import React, { useRef, useState } from "react";
import { StepElem, useSteps } from "./hooks";
import Deploy from "./steps/Deploy";
import Upload from "./steps/Upload";
import DeploymentProvider from "./deploymentContext";
import Configure from "./steps/Configure";
import Central from "./steps/Central";
import Site from "./steps/Site";

const styles = {
  wizardBody: {
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: "5%",
    justifyContent: "space-between",
    width: "70%",
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
  const [current, next, previous] = useSteps(4);
  const [nextEnabled, setNextEnabled] = useState(false);
  const totalSteps = 5;

  const compRef = [
    useRef<StepElem>(null),
    useRef<StepElem>(null),
    useRef<StepElem>(null),
    useRef<StepElem>(null),
    useRef<StepElem>(null),
  ];

  const renderComponent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Deploy ref={compRef[0]} enableNext={() => setNextEnabled(true)} />
        );
      case 1:
        return (
          <Upload ref={compRef[1]} enableNext={() => setNextEnabled(true)} />
        );
      case 2:
        return (
          <Configure ref={compRef[2]} enableNext={() => setNextEnabled(true)} />
        );
      case 3:
        return (
          <Central ref={compRef[3]} enableNext={() => setNextEnabled(true)} />
        );
      case 4:
        return (
          <Site ref={compRef[4]} enableNext={() => setNextEnabled(true)} />
        );
      default:
        return null;
    }
  };

  return (
    <div className={classNames.wizardBody}>
      {renderComponent(current)}
      <div className={classNames.footer}>
        <div
          className={classNames.arrow}
          style={{
            ...(current === 0 ? { display: "none" } : {}),
            float: "left",
          }}
        >
          <FontIcon
            iconName="Back"
            onClick={previous}
            className={classNames.icon}
          />
          <p>Previous</p>
        </div>
        <div
          className={classNames.arrow}
          style={{
            ...(current === totalSteps - 1 || !nextEnabled
              ? { display: "none" }
              : {}),
            float: "right",
          }}
        >
          <p>Next</p>
          <FontIcon
            iconName="Forward"
            onClick={() => {
              compRef[current].current?.process();
              next();
              setNextEnabled(false);
            }}
            className={classNames.icon}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
