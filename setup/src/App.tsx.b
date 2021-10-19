import { List, mergeStyleSets } from "@fluentui/react";
import React from "react";

const classNames = mergeStyleSets({
  listGrid: {
    width: "90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  listGridItem: {
    padding: 5,
    width: 200,
    height: 180,
    // float: "left",
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

const App = React.memo(() => {
  const items = [{ name: "pippo" }, { name: "pluto" }];

  const onRenderCell = React.useCallback((item, index) => {
    return (
      <div
        className={`${classNames.listGridItem} ${
          item === null ? classNames.clickable : ""
        }`}
      >
        <h2>{item.name}</h2>
      </div>
    );
  }, []);

  return <div id="griglia">{items.map(onRenderCell)}</div>;
  //   return (
  //     <List
  //       className={classNames.listGrid}
  //       items={items}
  //       onRenderCell={onRenderCell}
  //     />
  //   );
});

export default App;
