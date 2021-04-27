# Azure IoT Central Device Sample for Java

## Prerequisites
1. Create an IoT Central application. [Learn more](https://docs.microsoft.com/en-us/azure/iot-central/core/quick-deploy-iot-central)
2. Create a device template. [Learn more](https://docs.microsoft.com/en-us/azure/iot-central/core/quick-create-simulated-device#create-a-device-template)
3. Get device connection details.
More information on connecting real devices can be forun [here.](https://docs.microsoft.com/en-us/azure/iot-central/core/tutorial-connect-device?pivots=programming-language-java)


## Setup
1. Install "Maven". Follow instruction at [https://maven.apache.org/install.html](https://maven.apache.org/install.html)
2. Setup sample: replace below values in App.java
```java
private static final String SCOPE_ID = "<Put your scope id here from IoT Central Administration -> Device connection>";
    private static final String ENROLLMENT_GROUP_SYMMETRIC_KEY = "<Put your group SAS primary key here from IoT Central Administration -> Device Connection -> SAS-IoT-Devices>";
    private static final String PROVISIONED_DEVICE_ID = "<Put device Id here>";
``` 
If using device specific key, set enrollment group to "null" and assign the key to "DEVICE_SYMMETRIC_KEY"

```java
 private static final String ENROLLMENT_GROUP_SYMMETRIC_KEY = null;
   private static final String DEVICE_SYMMETRIC_KEY = "<Put device key here>";
```

3. Download dependencies and build
```shell
mvn compile
```

## Run
Execute sample (press Q+enter to exit)
```shell
mvn exec:exec
```