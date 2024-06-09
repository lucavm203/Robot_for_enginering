#include <Wire.h>
#include <I2Cdev.h>
#include <MPU6050.h>
#include <RF24.h>
#include <Arduino.h>
#include <SPI.h>

// NRF24 Configuration
#define RF24_PAYLOAD_SIZE 32
#define AAAD_ARO 3
#define AAAD_MODULE 1

RF24 radio(1, 10);
const uint8_t rf24_channel[] = { 1, 26, 51, 76, 101 };
const uint64_t addresses[] = { 0x4141414430LL, 0x4141414431LL, 0x4141414432LL, 0x4141414433LL, 0x4141414434LL };
uint8_t txData[RF24_PAYLOAD_SIZE];
uint8_t rxData[RF24_PAYLOAD_SIZE];

// Timing configuration
unsigned long previousMillis = 0;
unsigned long currentMillis;
unsigned long sampleTime = 3000;  // milliseconds of on-time
unsigned long previousMillies2 = 0;

// MPU6050 Configuration
MPU6050 mpu;
int16_t ax, ay, az;
int16_t gx, gy, gz;

struct MyData {
  int16_t angleX;
  int16_t angleY;
  int16_t angleZ;
  int16_t posX;
  int16_t posY;
};

MyData data;

int16_t ax_offset = 0;
int16_t ay_offset = 0;
int16_t az_offset = 0;

float angleX = 0.0, angleY = 0.0, angleZ = 0.0;
float accelAngleX = 0.0, accelAngleY = 0.0;
float gyroAngleX = 0.0, gyroAngleY = 0.0;

float alpha = 0.98;  // Complementary filter coefficient

// Maximum speed in PWM and corresponding speed in meters per second
#define MAX_SPEED_PWM 255
#define MAX_SPEED_MPS 0.25

// DC Motor Pins
#define r_en_1 2
#define r_en_2 4

#define l_en_2 7
#define l_en_1 8

#define pwm_r_1 5
#define pwm_r_2 9

#define pwm_l_1 6
#define pwm_l_2 3

int actie = 0;
int speedPWM = 0;  // Current speed in PWM

void printHex2(unsigned v) {
  Serial.print("0123456789ABCDEF"[v >> 4]);
  Serial.print("0123456789ABCDEF"[v & 0xF]);
}

void calibrateMPU() {
  const int numSamples = 100;
  int32_t ax_sum = 0, ay_sum = 0, az_sum = 0;

  for (int i = 0; i < numSamples; ++i) {
    mpu.getAcceleration(&ax, &ay, &az);
    ax_sum += ax;
    ay_sum += ay;
    az_sum += az;
    delay(20);
  }

  ax_offset = ax_sum / numSamples;
  ay_offset = ay_sum / numSamples;
  az_offset = az_sum / numSamples;
}

void setupMotorPins() {
  pinMode(r_en_1, OUTPUT);
  pinMode(l_en_1, OUTPUT);
  pinMode(pwm_r_1, OUTPUT);
  pinMode(pwm_l_1, OUTPUT);
  pinMode(r_en_2, OUTPUT);
  pinMode(l_en_2, OUTPUT);
  pinMode(pwm_r_2, OUTPUT);
  pinMode(pwm_l_2, OUTPUT);
}

void setup() {
  Serial.begin(38400);
  Serial.println("nRF24 Application ARO" + String(AAAD_ARO) + ", Module" + String(AAAD_MODULE) + " Started!\n");

  // Initialize motor pins
  setupMotorPins();

  // Initialize MPU6050
  Wire.begin();
  mpu.initialize();
  Serial.println("Calibrating MPU6050...");
  calibrateMPU();
  Serial.println("Calibration complete!");

  // Initialize Radio
  radio.begin();
  radio.setPALevel(RF24_PA_MIN);
  radio.setDataRate(RF24_1MBPS);
  radio.setChannel(rf24_channel[AAAD_ARO]);
  radio.setPayloadSize(RF24_PAYLOAD_SIZE);
  radio.openWritingPipe(addresses[AAAD_MODULE]);
  radio.openReadingPipe(1, addresses[AAAD_MODULE]);
  radio.startListening();
}

void loop() {
  currentMillis = millis();
  float deltaTime = (currentMillis - previousMillis) / 1000.0;  // Convert to seconds
  previousMillis = currentMillis;

  gyroAccel(deltaTime);
  // Serial.println(angleX);
  // Serial.println(angleY);
  // Serial.println(angleZ);
  receiveData();
  executeAction(deltaTime);
  if (currentMillis - previousMillies2 >= sampleTime) {
    sendData();
    previousMillies2 = currentMillis;
  }
}

void gyroAccel(float deltaTime) {
  float sumAx = 0, sumAy = 0, sumAz = 0;
  float sumGx = 0, sumGy = 0, sumGz = 0;

  // Take 100 samples and average them
  for (int i = 0; i < 100; i++) {
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    sumAx += ax;
    sumAy += ay;
    sumAz += az;
    sumGx += gx;
    sumGy += gy;
    sumGz += gz;
    delay(1); // Small delay to allow for sensor reading
  }

  ax = sumAx / 100;
  ay = sumAy / 100;
  az = sumAz / 100;
  gx = sumGx / 100;
  gy = sumGy / 100;
  gz = sumGz / 100;

  // Calculate accelerometer angles
  accelAngleX = atan2(ay, az) * 180 / PI;
  accelAngleY = atan2(ax, az) * 180 / PI;

  // Integrate gyroscope data to get angles
  gyroAngleX += gx * deltaTime / 131.0;
  gyroAngleY += gy * deltaTime / 131.0;
  angleZ += gz * deltaTime / 131.0;

  // Complementary filter to combine accelerometer and gyroscope data
  angleX = alpha * gyroAngleX + (1 - alpha) * accelAngleX;
  angleY = alpha * gyroAngleY + (1 - alpha) * accelAngleY;

  // Ensure the angles are within the -90 to +90 range
  angleX = constrain(angleX, -90, 90);
  angleY = constrain(angleY, -90, 90);
  angleZ = constrain(angleZ, -90, 90);

  // Encode data for transmission
  data.angleX = (int16_t)(angleX * 10);
  data.angleY = (int16_t)(angleY * 10);
  data.angleZ = (int16_t)(angleZ * 10);
}

// Function to determine action based on received data
void ActieBepalen() {
  if (rxData[2] == 'w') {  //Forward
    actie = 1;
  } else if (rxData[2] == 's') {  //Backward
    Serial.println("w");
    actie = 2;
  } else if (rxData[2] == 'a') {  // Linksom
    actie = 3;
  } else if (rxData[2] == 'd') {  // Rechtsom
    actie = 4;
  } else if (rxData[2] == 'k') {  // Stop
    actie = 5;
  } else if (rxData[2] == 'q') {  // Zwak links
    actie = 6;
  } else if (rxData[2] == 'e') {  // Zwak rechts
    actie = 7;
  }
}

// Function to execute action based on actie value
void executeAction(float deltaTime) {
  switch (actie) {
    case 1:
      Vooruit();
      updatePosition(deltaTime, 1, 0);
      break;
    case 2:
      Achteruit();
      updatePosition(deltaTime, -1, 0);
      break;
    case 3:
      Linksom();
      updatePosition(deltaTime, 0, -1);
      break;
    case 4:
      Rechtsom();
      updatePosition(deltaTime, 0, 1);
      break;
    case 5: Stop(); break;
    case 6:
      ZwakLinks();
      updatePosition(deltaTime, 0.5, 0.5);
      break;
    case 7:
      ZwakRechts();
      updatePosition(deltaTime, 0.5, -0.5);
      break;
    case 8: EmergencyStop(); break;
    default: Stop(); break;
  }
}

// Function to update position based on speed and direction
void updatePosition(float deltaTime, float forwardDirection, float turnDirection) {
  float distance = speedPWM / (float)MAX_SPEED_PWM * MAX_SPEED_MPS * deltaTime;
  data.posX += distance * cos(angleZ * PI / 180.0) * forwardDirection;
  data.posY += distance * sin(angleZ * PI / 180.0) * forwardDirection;
  angleZ += turnDirection * deltaTime * 10.0;  // Simplified turning model
}

// Movement functions
void Vooruit() {
  speedPWM = 255;
  digitalWrite(r_en_1, HIGH);
  digitalWrite(l_en_1, HIGH);
  digitalWrite(r_en_2, HIGH);
  digitalWrite(l_en_2, HIGH);
  analogWrite(pwm_r_1, 0);
  analogWrite(pwm_l_1, 255);
  analogWrite(pwm_r_2, 255);
  analogWrite(pwm_l_2, 0);
}

void Achteruit() {
  speedPWM = 255;
  digitalWrite(r_en_1, HIGH);
  digitalWrite(l_en_1, HIGH);
  digitalWrite(r_en_2, HIGH);
  digitalWrite(l_en_2, HIGH);
  analogWrite(pwm_r_1, 255);
  analogWrite(pwm_l_1, 0);
  analogWrite(pwm_r_2, 0);
  analogWrite(pwm_l_2, 255);
}

void Rechtsom() {
  speedPWM = 255;
  digitalWrite(r_en_1, HIGH);
  digitalWrite(l_en_1, HIGH);
  digitalWrite(r_en_2, HIGH);
  digitalWrite(l_en_2, HIGH);
  analogWrite(pwm_r_1, 255);
  analogWrite(pwm_l_1, 255);
  analogWrite(pwm_r_2, 0);
  analogWrite(pwm_l_2, 0);
}

void Linksom() {
  speedPWM = 255;
  digitalWrite(r_en_1, HIGH);
  digitalWrite(l_en_1, HIGH);
  digitalWrite(r_en_2, HIGH);
  digitalWrite(l_en_2, HIGH);
  analogWrite(pwm_r_1, 0);
  analogWrite(pwm_l_1, 0);
  analogWrite(pwm_r_2, 255);
  analogWrite(pwm_l_2, 255);
}

void ZwakRechts() {
  speedPWM = 128;  // Half speed
  digitalWrite(r_en_1, HIGH);
  digitalWrite(l_en_1, HIGH);
  digitalWrite(r_en_2, HIGH);
  digitalWrite(l_en_2, HIGH);
  analogWrite(pwm_r_1, 0);
  analogWrite(pwm_l_1, 255);
  analogWrite(pwm_r_2, 128);
  analogWrite(pwm_l_2, 0);
}

void ZwakLinks() {
  speedPWM = 128;  // Half speed
  digitalWrite(r_en_1, HIGH);
  digitalWrite(l_en_1, HIGH);
  digitalWrite(r_en_2, HIGH);
  digitalWrite(l_en_2, HIGH);
  analogWrite(pwm_r_1, 0);
  analogWrite(pwm_l_1, 128);
  analogWrite(pwm_r_2, 255);
  analogWrite(pwm_l_2, 0);
}

void Stop() {
  speedPWM = 0;
  digitalWrite(r_en_1, LOW);
  digitalWrite(l_en_1, LOW);
  digitalWrite(r_en_2, LOW);
  digitalWrite(l_en_2, LOW);
  analogWrite(pwm_r_1, 0);
  analogWrite(pwm_l_1, 0);
  analogWrite(pwm_r_2, 0);
  analogWrite(pwm_l_2, 0);
}

void EmergencyStop() {
  speedPWM = 0;
  digitalWrite(r_en_1, LOW);
  digitalWrite(l_en_1, LOW);
  digitalWrite(r_en_2, LOW);
  digitalWrite(l_en_2, LOW);
  analogWrite(pwm_r_1, 0);
  analogWrite(pwm_l_1, 0);
  analogWrite(pwm_r_2, 0);
  analogWrite(pwm_l_2, 0);
}

// Function to send data
void sendData() {
  uint8_t cursor = 0;
  Serial.print(data.angleX);
  txData[cursor++] = data.angleX >> 8;
  txData[cursor++] = data.angleX;
  txData[cursor++] = data.angleY >> 8;
  txData[cursor++] = data.angleY;
  txData[cursor++] = data.angleZ >> 8;
  txData[cursor++] = data.angleZ;
  txData[cursor++] = data.posX >> 8;
  txData[cursor++] = data.posX;
  txData[cursor++] = data.posY >> 8;
  txData[cursor++] = data.posY;
  while (cursor < RF24_PAYLOAD_SIZE) {
    txData[cursor++] = 0;
  }
  Serial.println("TxData: ");
  for(size_t i=0; i<cursor; i++){
    if(i !=0) Serial.print(" ");
    printHex2(txData[i]);
  }
  Serial.println(F("Now Sending"));
  radio.stopListening();
  radio.write(&txData, sizeof(txData));
  Serial.println(F("Now Listing"));
  radio.startListening();


}

// Function to receive data
void receiveData() {
  if (radio.available()) {
    while (radio.available()) {
      radio.read(&rxData, sizeof(rxData));
    }
    ActieBepalen();
    sendData();  // Acknowledge received command
  }
}

// Function to calculate angles from MPU6050 data
// void gyroAccel(float deltaTime) {
//   mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

//   // Calculate accelerometer angles
//   accelAngleX = atan2(ay, az) * 180 / PI;
//   accelAngleY = atan2(ax, az) * 180 / PI;

//   // Integrate gyroscope data to get angles
//   gyroAngleX += gx * deltaTime / 131.0;
//   gyroAngleY += gy * deltaTime / 131.0;
//   angleZ += gz * deltaTime / 131.0;

//   // Complementary filter to combine accelerometer and gyroscope data
//   angleX = alpha * gyroAngleX + (1 - alpha) * accelAngleX;
//   angleY = alpha * gyroAngleY + (1 - alpha) * accelAngleY;

//   // Encode data for transmission
//   data.angleX = (int16_t)((angleX + 90) * 10);
//   data.angleY = (int16_t)((angleY + 90) * 10);
//   data.angleZ = (int16_t)((angleZ + 90) * 10);
// }
