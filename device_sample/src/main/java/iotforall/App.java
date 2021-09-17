package iotforall;

import com.google.gson.*;
import com.microsoft.azure.sdk.iot.device.*;
import com.microsoft.azure.sdk.iot.device.DeviceTwin.*;
import com.microsoft.azure.sdk.iot.device.transport.IotHubConnectionStatus;
import com.microsoft.azure.sdk.iot.device.transport.NoRetry;
import com.microsoft.azure.sdk.iot.provisioning.device.*;
import com.microsoft.azure.sdk.iot.provisioning.device.internal.exceptions.ProvisioningDeviceClientException;
import com.microsoft.azure.sdk.iot.provisioning.security.SecurityProviderSymmetricKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

public class App {

  public static final String ANSI_RESET = "\u001B[0m";
  public static final String ANSI_BLACK = "\u001B[30m";
  public static final String ANSI_RED = "\u001B[31m";
  public static final String ANSI_GREEN = "\u001B[32m";
  public static final String ANSI_YELLOW = "\u001B[33m";
  public static final String ANSI_BLUE = "\u001B[34m";
  public static final String ANSI_PURPLE = "\u001B[35m";
  public static final String ANSI_CYAN = "\u001B[36m";
  public static final String ANSI_WHITE = "\u001B[37m";
  // Device settings - FILL IN YOUR VALUES HERE
  private static final String SCOPE_ID = "0ne0029EF65";
  private static final String ENROLLMENT_GROUP_SYMMETRIC_KEY =
    "ZDQHUjpAJZAWs19GPef/MW/NZApOD9uatOXQDHX33O27bleg+NSfTrJn4Pf3ymsq+q+weWXRIDXZVMKfc+WGuA==";
  private static final String DEVICE_SYMMETRIC_KEY = null;

  // Optional device settings - CHANGE IF DESIRED/NECESSARY
  private static final String GLOBAL_ENDPOINT =
    "global.azure-devices-provisioning.net";
  private static final String PROVISIONED_DEVICE_ID = "dev01";
  private static final String MODEL_ID = "dtmi:Sample:Custom;2";

  // Use MQTT for the transport protocol
  private static final ProvisioningDeviceClientTransportProtocol PROVISIONING_DEVICE_CLIENT_TRANSPORT_PROTOCOL =
    ProvisioningDeviceClientTransportProtocol.MQTT;

  // test setting flags
  private static final boolean telemetrySendOn = true;
  private static final boolean reportedPropertySendOn = true;
  private static final boolean desiredPropertyReceiveOn = true;
  private static final boolean directMethodReceiveOn = true;
  private static final boolean c2dCommandReceiveOn = true;

  // global variables
  private static final int MAX_TIME_TO_WAIT_FOR_REGISTRATION = 10000; // in milliseconds
  private static DeviceClient deviceClient = null;
  private static boolean connected = false;
  private static boolean terminate = false;
  private static final AtomicBoolean Succeed = new AtomicBoolean(false);

  // Handle DPS provisioning status
  static class ProvisioningStatus {

    ProvisioningDeviceClientRegistrationResult provisioningDeviceClientRegistrationInfoClient = new ProvisioningDeviceClientRegistrationResult();
    Exception exception;
  }

  // Handle DPS registration responses
  static class ProvisioningDeviceClientRegistrationCallbackImpl
    implements ProvisioningDeviceClientRegistrationCallback {

    @Override
    public void run(
      ProvisioningDeviceClientRegistrationResult provisioningDeviceClientRegistrationResult,
      Exception exception,
      Object context
    ) {
      if (context instanceof ProvisioningStatus) {
        ProvisioningStatus status = (ProvisioningStatus) context;
        status.provisioningDeviceClientRegistrationInfoClient =
          provisioningDeviceClientRegistrationResult;
        status.exception = exception;
      } else {
        System.out.println("Received unknown context");
      }
    }
  }

  // Handle IoT Hub message sent status response
  private static class IotHubEventCallbackImpl implements IotHubEventCallback {

    @Override
    public void execute(
      IotHubStatusCode responseStatus,
      Object callbackContext
    ) {
      System.out.println(
        "Message received! Response status: " + responseStatus
      );
    }
  }

  // Handle any unprocessed device twin messages
  protected static class onProperty implements TwinPropertyCallBack {

    @Override
    public void TwinPropertyCallBack(Property property, Object context) {
      System.out.println(
        "onProperty callback for " +
        (property.getIsReported() ? "reported" : "desired") +
        " property " +
        property.getKey() +
        " to " +
        property.getValue() +
        ", Properties version:" +
        property.getVersion()
      );
    }
  }

  // Handle IoT Hub device twin status responses
  protected static class DeviceTwinStatusCallBack
    implements IotHubEventCallback {

    @Override
    public void execute(IotHubStatusCode status, Object context) {
      Succeed.set(
        (status == IotHubStatusCode.OK) || (status == IotHubStatusCode.OK_EMPTY)
      );
      System.out.println(
        "IoT Hub responded to device twin operation with status " +
        status.name()
      );
    }
  }

  // Handle fanSpeed desired method change
  protected static class onFanSpeedChange implements TwinPropertyCallBack {

    @Override
    @SuppressWarnings("serial")
    public void TwinPropertyCallBack(Property property, Object context) {
      System.out.println(
        ANSI_GREEN +
        "onFanSpeedChange change " +
        property.getKey() +
        " to " +
        property.getValue() +
        ", Properties version:" +
        property.getVersion() +
        ANSI_RESET
      );
      try {
        // acknowledge the direct method back to IoT Central
        @SuppressWarnings("unchecked")
        Map<String, Object> fanspeedAck = new Gson()
        .fromJson(
            "{\"value\":" +
            property.getValue() +
            ", \"ac\":200, \"ad\":\"completed\", \"av\":" +
            property.getVersion() +
            "}",
            Map.class
          );
        Set<Property> reportProperties = new HashSet<Property>() {
          {
            add(new Property("fanSpeed", fanspeedAck));
          }
        };
        deviceClient.sendReportedProperties(reportProperties);
      } catch (IOException e) {
        System.out.println(
          "Error sending desired property acknowledgement. Error: " +
          e.getMessage()
        );
      }
    }
  }

  // Handle Cloud to Device messages
  protected static class C2dMessageCallbackMqtt implements MessageCallback {

    public IotHubMessageResult execute(Message msg, Object context) {
      if (msg.getProperty("method-name").equals("setAlarm")) {
        System.out.println(
          ANSI_YELLOW +
          "Received C2D message setAlarm(" +
          new String(msg.getBytes(), Message.DEFAULT_IOTHUB_MESSAGE_CHARSET) +
          ")" +
          ANSI_RESET
        );
        return IotHubMessageResult.COMPLETE;
      } else {
        return IotHubMessageResult.REJECT;
      }
    }
  }

  // Handle IoT Hub direct method status responses
  protected static class DirectMethodStatusCallBack
    implements IotHubEventCallback {

    public void execute(IotHubStatusCode status, Object context) {
      System.out.println(
        "IoT Hub responded to device method operation with status " +
        status.name()
      );
    }
  }

  // Handle incoming direct method calls
  protected static class DirectMethodCallback implements DeviceMethodCallback {

    @Override
    public DeviceMethodData call(
      String methodName,
      Object methodData,
      Object context
    ) {
      DeviceMethodData deviceMethodData;
      int status;
      String response = "";
      if (methodName.equals("echo")) {
        String param = new String((byte[]) methodData);
        param = param.replace("\"", "");
        System.out.println(
          ANSI_BLUE +
          "Echo command received with parameter: " +
          param +
          ANSI_RESET
        );
        status = 200;
        response = param;
      } else {
        System.out.println(
          "Unknown command: " +
          methodName +
          " received with parameter: " +
          methodData
        );
        status = 404;
        response = "Error unknown command";
      }

      deviceMethodData = new DeviceMethodData(status, response);
      return deviceMethodData;
    }
  }

  // Handle connect and disconnect status changes
  protected static class ConnectionStatusChangeCallback
    implements IotHubConnectionStatusChangeCallback {

    @Override
    public void execute(
      IotHubConnectionStatus status,
      IotHubConnectionStatusChangeReason statusChangeReason,
      Throwable throwable,
      Object callbackContext
    ) {
      if (status == IotHubConnectionStatus.DISCONNECTED) {
        connected = false;
        try {
          if (!terminate) {
            System.out.println(
              "Disconnected from IoT Central - Reconnecting via DPS"
            );
            // reconnect to IoT Central via DPS
            connect();
          }
        } catch (Exception e) {
          System.out.println(
            "Error connecting to IoT Central.  Error: " + e.getMessage()
          );
        }
      } else if (status == IotHubConnectionStatus.DISCONNECTED_RETRYING) {
        connected = false;
      } else if (status == IotHubConnectionStatus.CONNECTED) {
        connected = true;
        System.out.println(
          "The connection was successfully established. Can send messages."
        );
      }
    }
  }

  // Send telemetry when called
  private static void sendTelemetry() {
    if (connected && !terminate) {
      String payload = String.format(
        "{\"temp\": %.2f, \"humidity\": %.2f,\"pressure\": %.2f}",
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100
      );
      Message messageToSendFromDeviceToHub = new Message(payload);
      System.out.println(String.format("Sending telemetry: %s", payload));
      deviceClient.sendEventAsync(
        messageToSendFromDeviceToHub,
        new IotHubEventCallbackImpl(),
        null
      );
    }
  }

  // Send reported property when called
  @SuppressWarnings("serial")
  private static void sendReportedProperty() {
    if (connected && !terminate) {
      try {
        double batteryValue = Math.round((Math.random() * 100) * 100.0) / 100.0;
        System.out.println(
          ANSI_PURPLE +
          String.format(
            "Sending battery reported property: %.2f",
            batteryValue
          ) +
          ANSI_RESET
        );
        Set<Property> reportProperties = new HashSet<Property>() {
          {
            add(new Property("battery", batteryValue));
          }
        };
        deviceClient.sendReportedProperties(reportProperties);
      } catch (Exception e) {
        System.out.println(
          "Error sending reported property. Error: " + e.getMessage()
        );
      }
    }
  }

  // Connect to IoT Hub via Device Provisioning Service (DPS)
  private static void connect() throws Exception {
    SecurityProviderSymmetricKey deviceSymmetricKey;
    byte[] derivedSymmetricKey;

    if (
      DEVICE_SYMMETRIC_KEY == null && ENROLLMENT_GROUP_SYMMETRIC_KEY != null
    ) {
      // derive the device key using the group symmetric key and the device identity
      derivedSymmetricKey =
        SecurityProviderSymmetricKey.ComputeDerivedSymmetricKey(
          ENROLLMENT_GROUP_SYMMETRIC_KEY.getBytes(StandardCharsets.UTF_8),
          PROVISIONED_DEVICE_ID
        );
    } else {
      derivedSymmetricKey =
        DEVICE_SYMMETRIC_KEY.getBytes(StandardCharsets.UTF_8);
    }
    deviceSymmetricKey =
      new SecurityProviderSymmetricKey(
        derivedSymmetricKey,
        PROVISIONED_DEVICE_ID
      );

    ProvisioningDeviceClient provisioningDeviceClient = null;

    try {
      // provision via Device Provisioning Service so we can obtain the IoT Hub hostname
      ProvisioningStatus provisioningStatus = new ProvisioningStatus();

      provisioningDeviceClient =
        ProvisioningDeviceClient.create(
          GLOBAL_ENDPOINT,
          SCOPE_ID,
          PROVISIONING_DEVICE_CLIENT_TRANSPORT_PROTOCOL,
          deviceSymmetricKey
        );

      AdditionalData registrationPayload = new AdditionalData();
      registrationPayload.setProvisioningPayload(
        "{\"iotcModelId\":\"" + MODEL_ID + "\"}"
      );
      provisioningDeviceClient.registerDevice(
        new ProvisioningDeviceClientRegistrationCallbackImpl(),
        provisioningStatus,
        registrationPayload
      );
      while (
        provisioningStatus.provisioningDeviceClientRegistrationInfoClient.getProvisioningDeviceClientStatus() !=
        ProvisioningDeviceClientStatus.PROVISIONING_DEVICE_STATUS_ASSIGNED
      ) {
        if (
          provisioningStatus.provisioningDeviceClientRegistrationInfoClient.getProvisioningDeviceClientStatus() ==
          ProvisioningDeviceClientStatus.PROVISIONING_DEVICE_STATUS_ERROR ||
          provisioningStatus.provisioningDeviceClientRegistrationInfoClient.getProvisioningDeviceClientStatus() ==
          ProvisioningDeviceClientStatus.PROVISIONING_DEVICE_STATUS_DISABLED ||
          provisioningStatus.provisioningDeviceClientRegistrationInfoClient.getProvisioningDeviceClientStatus() ==
          ProvisioningDeviceClientStatus.PROVISIONING_DEVICE_STATUS_FAILED
        ) {
          provisioningStatus.exception.printStackTrace();
          System.out.println("Registration error, bailing out");
          break;
        }
        System.out.println("Waiting for Provisioning Service to register");
        Thread.sleep(MAX_TIME_TO_WAIT_FOR_REGISTRATION);
      }

      if (
        provisioningStatus.provisioningDeviceClientRegistrationInfoClient.getProvisioningDeviceClientStatus() ==
        ProvisioningDeviceClientStatus.PROVISIONING_DEVICE_STATUS_ASSIGNED
      ) {
        System.out.println(
          "IotHUb Uri : " +
          provisioningStatus.provisioningDeviceClientRegistrationInfoClient.getIothubUri()
        );
        System.out.println(
          "Device ID : " +
          provisioningStatus.provisioningDeviceClientRegistrationInfoClient.getDeviceId()
        );

        // connect to iothub
        String iotHubUri = provisioningStatus.provisioningDeviceClientRegistrationInfoClient.getIothubUri();
        String deviceId = provisioningStatus.provisioningDeviceClientRegistrationInfoClient.getDeviceId();
        try {
          // create the device client for connecting to IoT Hub
          deviceClient =
            DeviceClient.createFromSecurityProvider(
              iotHubUri,
              deviceId,
              deviceSymmetricKey,
              IotHubClientProtocol.MQTT
            );

          // must use no retry policy so we can handle the disconnect and connect via DPS
          deviceClient.setRetryPolicy(new NoRetry());

          deviceClient.registerConnectionStatusChangeCallback(
            new ConnectionStatusChangeCallback(),
            new Object()
          );

          if (c2dCommandReceiveOn) {
            // subscribe to cloud to device messages
            C2dMessageCallbackMqtt c2dMessageCallback = new C2dMessageCallbackMqtt();
            deviceClient.setMessageCallback(c2dMessageCallback, new Object());
          }

          // connect to IoT Hub
          deviceClient.open();

          deviceClient.startDeviceTwin(
            new DeviceTwinStatusCallBack(),
            null,
            new onProperty(),
            null
          );
          if (desiredPropertyReceiveOn) {
            // subscribe to fanSpeed desired property
            Map<Property, Pair<TwinPropertyCallBack, Object>> desiredProperties = new HashMap<Property, Pair<TwinPropertyCallBack, Object>>() {
              {
                put(
                  new Property("fanSpeed", null),
                  new Pair<TwinPropertyCallBack, Object>(
                    new onFanSpeedChange(),
                    null
                  )
                );
              }
            };
            deviceClient.subscribeToTwinDesiredProperties(desiredProperties);
          }

          if (directMethodReceiveOn) {
            // direct method subscription
            deviceClient.subscribeToDeviceMethod(
              new DirectMethodCallback(),
              null,
              new DirectMethodStatusCallBack(),
              null
            );
          }
        } catch (IOException e) {
          System.out.println(
            "Device client threw an exception: " + e.getMessage()
          );
          if (deviceClient != null) {
            deviceClient.closeNow();
          }
        }
      }
    } catch (ProvisioningDeviceClientException | InterruptedException e) {
      System.out.println(
        "Provisioning Device Client threw an exception" + e.getMessage()
      );
      if (provisioningDeviceClient != null) {
        provisioningDeviceClient.closeNow();
      }
    }
  }

  // main function to start the code running
  public static void main(String[] args) throws Exception {
    // connect to Iot Central
    connect();

    ScheduledExecutorService executorService;
    executorService = Executors.newSingleThreadScheduledExecutor();

    // schedule telemetry to be sent every 5 seconds
    if (telemetrySendOn) {
      executorService.scheduleAtFixedRate(
        App::sendTelemetry,
        0,
        5,
        TimeUnit.SECONDS
      );
    }

    // schedule reported property to be sent every 10 seconds
    if (reportedPropertySendOn) {
      executorService.scheduleAtFixedRate(
        App::sendReportedProperty,
        10,
        5,
        TimeUnit.SECONDS
      );
    }

    // wait for Q/q to be pressed to exit
    System.out.println("*** Press q/Q <enter> to cleanup and exit ***");
    int inChar;
    do {
      inChar = System.in.read();
    } while (inChar != 81 && inChar != 113);

    System.out.println("Shutting down and cleaning up ...");
    terminate = true;
    // kill all the scheduled tasks
    executorService.shutdownNow();

    // close the connection to IoT Central
    deviceClient.closeNow();

    System.out.println("Exiting ...");
    System.exit(0);
  }
}
