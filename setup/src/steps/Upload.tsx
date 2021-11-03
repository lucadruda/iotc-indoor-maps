import {
  Icon,
  mergeStyleSets,
  ProgressIndicator,
  TextField,
} from "@fluentui/react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { uploadPackage } from "../api";
import { DeploymentContext } from "../deploymentContext";
import { DrawingUploadData, formatBytes, StepElem, StepProps } from "../common";

const classNames = mergeStyleSets({
  listGrid: {
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
  coordinates: {
    marginTop: 90,
  },
  coordinatesForm: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 40,
  },
  description: {
    margin: "5%",
  },
});

const Upload = React.memo(
  React.forwardRef<StepElem, StepProps>(({ enableNext }, ref) => {
    const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
    const { mapSubscriptionKey, mapAccountName, store, drawingUUIDs } =
      useContext(DeploymentContext);

    const [items, setItems] = useState<(DrawingUploadData | null)[]>([
      ...(drawingUUIDs ?? []),
      null,
    ]);

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

    const { getRootProps, getInputProps } = useDropzone({
      onDrop: uploadFn,
      maxFiles: 1,
      accept: ".zip",
    });

    useImperativeHandle(
      ref,
      () => ({
        process: () => {
          store({
            drawingUUIDs: items.filter(
              (i) => i !== null && i.uuid
            ) as DrawingUploadData[],
            ...(coordinates[0] !== 0 && coordinates[1] !== 0
              ? { centerCoordinates: coordinates }
              : {}),
          });
        },
      }),
      [store, items, coordinates]
    );

    useEffect(() => {
      if (items.length > 1 && !nextEnabled.current) {
        enableNext();
        nextEnabled.current = true;
      }
    }, [items, enableNext]);

    const onRenderCell = React.useCallback(
      (item: DrawingUploadData | null, index) => {
        return (
          <div
            key={`upload-b-${index}`}
            className={`${classNames.listGridItem} ${item === null ? classNames.clickable : ""
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

    if (!mapSubscriptionKey) {
      return (
        <div className={"centered"}>
          <ProgressIndicator
            className="pageload"
            description="Loading map details..."
          />
        </div>
      );
    }
    return (
      <div>
        <h2>Upload building drawings</h2>
        <div>
          <h3 style={{ display: "inline" }}>Map account </h3>
          <h4 style={{ display: "inline" }}> "{mapAccountName}" </h4>
          <h3 style={{ display: "inline" }}>found.</h3>
        </div>
        <div className={classNames.description}>
          <p>
            Upload your drawings in zip format.
            <br />
            For drawing package requirements, follow details{" "}
            <a href="https://docs.microsoft.com/en-us/azure/azure-maps/drawing-requirements">
              here
            </a>
          </p>
        </div>
        <div className={classNames.listGrid}>{items.map(onRenderCell)}</div>
        <div className={classNames.coordinates}>
          <p>
            Optionally provide center coordinates to automatically zoom to
            specific location at map loading.
          </p>
          <div className={classNames.coordinatesForm}>
            <TextField
              type="number"
              label="Latitude"
              value={coordinates[0].toString()}
              onChange={(e, val) => {
                setCoordinates((current) => {
                  return [parseFloat(val!), current[1]];
                });
              }}
            />
            <TextField
              type="number"
              label="Longitude"
              value={coordinates[1].toString()}
              onChange={(e, val) => {
                setCoordinates((current) => {
                  return [current[0], parseFloat(val!)];
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  })
);

export default Upload;
