module.exports.codeArduino = (
  backendUrl,
  deviceApiKey,
  datasetName
) => `#include <EdgeML.h>
  
// WiFi credentials
const char* ssid = "YOUR_SSID";
const char* password =  "YOUR_PASSWORD";

IncrementalRecorder *incRec;

void setup()
{
  // Connect to WiFi
  Serial.begin(115200);
  while(!Serial);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }

  Recorder *rec = new Recorder("${backendUrl}", "${deviceApiKey}");
  
  // This generates a dataset with the name DATASET_NAME. 
  // You now can add data to this dataset.
  incRec = rec->getIncrementalRecorder("${datasetName}");
  
  int sensorValue;

  // Record 1000 datapoints with a frequency of 10Hz.
  int iterDelay = 100;
  for (int i = 0; i < 1000; i++) {
    unsigned long startTime = millis();
    
    // Get the current value of the potentiometer.
    sensorValue = readSensor();
    
    // Add the obtained value to the dataset.
    incRec->addDataPoint("SENSOR_NAME", sensorValue);
    
    unsigned long endTime = millis();
    delay(iterDelay - (endTime - startTime));
  }

  // Needs to be called at the end of the data recording session.
  // Uploads all remaining datapoints to the server.
  // Not calling this may lead to data loss.
  incRec->onComplete();
}

void loop()
{
  // Don't need the loop in this example.
}`;

module.exports.codeNode = (
  backendUrl,
  deviceApiKey,
  datasetName,
  useServerTime,
  nodeTime
) => `const datasetCollector = require("explorer-node").datasetCollector;

// Generate collector function
try {
  const collector = await datasetCollector(
  (url = "${backendUrl}"),
  (key = "${deviceApiKey}"),
  (name = "${datasetName}"),
  (useDeviceTime = ${useServerTime})
  );
} catch (e) {
  // Error occurred, cannot use the collector as a function to upload
  console.log(e);
}

try {
  // time should be a unix timestamp
  collector.addDataPoint(${nodeTime}sensorName = "sensorName", value = 1.23);

  // Tells the library that all data has been recorded.
  // Uploads all remaining data points to the server
  await collector.onComplete();
} catch (e) {
  console.log(e);
}`;

module.exports.codeJs = (
  backendUrl,
  deviceApiKey,
  datasetName,
  useServerTime,
  nodeTime
) =>
  `<script src="https://unpkg.com/edge-ml"></script>
  
<script>
  // Generate collector function
  try {
    const collector = await datasetCollector(
    (url = "${backendUrl}"),
    (key = "${deviceApiKey}"),
    (name = "${datasetName}"),
    (useDeviceTime = ${useServerTime})
    );
  } catch (e) {
    // Error occurred, cannot use the collector as a function to upload
    console.log(e);
  }

  try {
    // time should be a unix timestamp
    collector.addDataPoint(${nodeTime}sensorName = "sensorName", value = 1.23);

    // Tells the library that all data has been recorded.
    // Uploads all remaining data points to the server
    await collector.onComplete();
  } catch (e) {
    // Error adding data points
    console.log(e);
  }
</script>`;

module.exports.codeJava = (
  backendUrl,
  deviceApiKey,
  datasetName,
  useServerTime,
  javaTime
) => `Recorder recorder = new Recorder("${backendUrl}", "${deviceApiKey}");
try {
  IncrementalRecorder incRecorder = recorder.getIncrementalDataset("${datasetName}", ${useServerTime}); // true to use deviceTime

  incRecorder.addDataPoint(${javaTime}"accX", 123);

  // Wait until all values have been send
  incRecorder.onComplete();
} catch (Exception e) {
    e.printStackTrace();
}`;
