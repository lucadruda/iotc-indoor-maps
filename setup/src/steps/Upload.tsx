import {
  DefaultButton,
  Icon,
  List,
  mergeStyleSets,
  ProgressIndicator,
} from "@fluentui/react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { uploadPackage } from "../api";
import { DeploymentContext } from "../deploymentContext";
import { formatBytes, StepProps } from "../hooks";

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

type UploadData = {
  progress: number;
  name: string;
  size: string;
  uuid?: string;
};

const Upload = React.memo<StepProps>(
  ({ visible, enableNext, submit, resetSubmit }) => {
    const [items, setItems] = useState<(UploadData | null)[]>([null]);
    const { mapSubscriptionKey, store } = useContext(DeploymentContext);

    const nextEnabled = useRef(false);

    const uploadFn = useCallback(
      (acceptedFiles) => {
        acceptedFiles.forEach((file: File) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const drawingUUid = await uploadPackage(
              reader.result,
              "us",
              mapSubscriptionKey!,
              (progress) => {
                setItems((current) =>
                  current.map((i) => {
                    if (i?.name === file.name) {
                      return { ...i, progress };
                    }
                    return i;
                  })
                );
              }
            );
            if (drawingUUid) {
              setItems((current) =>
                current.map((i) => {
                  if (i?.name === file.name) {
                    return { ...i, uuid: drawingUUid };
                  }
                  return i;
                })
              );
            }
          };

          reader.readAsArrayBuffer(file);
          setItems((current) => [
            { name: file.name, size: formatBytes(file.size), progress: 0 },
            ...current,
          ]);
        });
      },
      [setItems, mapSubscriptionKey]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: uploadFn,
      maxFiles: 1,
      accept: ".zip",
    });

    useEffect(() => {
      if (submit) {
        resetSubmit();
        store({
          drawingUUIDs: items
            .filter((i) => i?.uuid)
            .map((i) => i?.uuid) as string[],
        });
      }
    }, [submit, resetSubmit, store, items]);

    useEffect(() => {
      if (items.length > 1 && !nextEnabled.current) {
        enableNext();
        nextEnabled.current = true;
      }
    }, [items, enableNext]);

    const onRenderCell = React.useCallback(
      (item: UploadData | null, index) => {
        return (
          <div
            key={`upload-b-${index}`}
            className={`${classNames.listGridItem} ${
              item === null ? classNames.clickable : ""
            }`}
          >
            {item === null ? (
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div className={classNames.button}>
                  <Icon iconName="AddIn" />
                  <h3>Add a drawing</h3>
                </div>
              </div>
            ) : (
              <div>
                <h2>{item.name}</h2>
                <ProgressIndicator
                  label={
                    item.progress < 1
                      ? "Uploading package..."
                      : "Package ready."
                  }
                  description={item.uuid ?? ""}
                  percentComplete={item.progress}
                  progressHidden={item.progress === 1}
                />
                <h3>{item.size}</h3>
              </div>
            )}
          </div>
        );
      },
      [getInputProps, getRootProps]
    );

    if (!visible) {
      return null;
    }
    if (!mapSubscriptionKey) {
      return <div>loading</div>;
    }
    return <div className={classNames.listGrid}>{items.map(onRenderCell)}</div>;
  }
);

export default Upload;
