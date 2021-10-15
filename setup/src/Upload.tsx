import React, { useState } from "react";
import { DefaultButton, Icon, List, mergeStyleSets } from "@fluentui/react";

const classNames = mergeStyleSets({
  listGrid: {},
  listGridItem: {
    width: "15%",
    height: "13%",
    padding: 5,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    border: "1px solid black",
  },
});

type UploadData = {
  id: string;
  name: string;
  size: number;
};

type UplaodProps = {
  onClickUpload: (...args: any) => UploadData | Promise<UploadData>;
};

const Upload = React.memo<UplaodProps>(({ onClickUpload }) => {
  const [items, setItems] = useState([null]);
  const onRenderCell = React.useCallback(
    (item, index) => {
      return (
        <DefaultButton
          className={classNames.listGridItem}
          onClick={onClickUpload}
        >
          {item === null && (
            <>
              <Icon iconName="AddIn" />
              <p>Add a drawing</p>
            </>
          )}
        </DefaultButton>
      );
    },
    [onClickUpload]
  );

  return (
    <List
      className={classNames.listGrid}
      items={items}
      onRenderCell={onRenderCell}
    />
  );
});

export default Upload;
