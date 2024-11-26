let writeCharacteristic; 
let notifyCharacteristic; // 新增一個變量以保存通知的特徵值
let currentDevice;

const statusDisplay = document.getElementById('dataValue'); // 根據你的 HTML 元素 ID 來修改

function handleNotification(event) {
  let value = new Uint8Array(); // 清空 value

 value = new Uint8Array(event.target.value.buffer);
  console.log(value);  // 檢查從藍牙接收到的資料

  for (let i = 0; i < value.length; i++) 
  {
    console.log(`value[${i}] = ${value[i]}`);
  }
  const dataType = value[0]; // 第一個字節是數據類型






  switch (dataType) {
    case 0x01: // 溫度
      const tempValue = (value[1] | (value[2] << 8)) / 10;
      const humValue = (value[3] | (value[4] << 8)) / 10;
      console.log(`溫度數據: ${tempValue.toFixed(1)}°C`);
      console.log(`濕度數據: ${humValue.toFixed(1)}%`);
      statusDisplay.textContent = `目前溫度：${tempValue.toFixed(1)}°C，濕度：${humValue.toFixed(1)}%`;

    
    
      break;
    case 0x02: // 血氧

    const bldValue = (value[1] | (value[2] << 8));
    const hbrValue = (value[3] | (value[4] << 8));
    console.log(`血氧數據: ${bldValue}%`);
    console.log(`心率數據: ${hbrValue} BPM`);
    statusDisplay.textContent = `目前血氧：${bldValue}% ，心率：${hbrValue} BPM`;


      break;
    case 0x03: // 壓力
      const glvValue = value[1] | (value[2] << 8); // 合併低位和高位
      const relglv = glvValue / 10;
      console.log(`壓力數據: ${relglv} hpa`);
      statusDisplay.textContent = `目前壓力值：${relglv.toFixed(1)} hpa`; 

      break;
    case 0x04: // 光照值
      const dataValue = value[1] | (value[2] << 8); // 合併低位和高位
      const lightIntensity = dataValue / 10;


      console.log(`光照數據: ${lightIntensity} lux`);
      statusDisplay.textContent = `目前光照值：${lightIntensity.toFixed(1)} lux`; 
      break;
    default:
      statusDisplay.textContent = '未知數據類型';
  }
  console.log(message);
  sendLineNotify(message);
}


 document.getElementById('connectButton').addEventListener('click', async () => {
    try {
      console.log('請求藍牙設備...');
      
      // 搜索具體服務，這裡包括 Battery Service 
      const device = await navigator.bluetooth.requestDevice
      ({
        filters: [{ services: ['battery_service'] }],
        optionalServices: ['battery_service', '0000fff0-0000-1000-8000-00805f9b34fb']
      });   
      console.log('藍牙設備已找到: ', device.name);
      currentDevice = device; // 保存當前設備

      // 連接 GATT 服務
      const server = await device.gatt.connect();
      console.log('GATT 連接已建立');

      // 連接 0XFFF0 服務
      const unknownService = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
      console.log('0xFFF0 服務已找到');

      const notifyCharacteristic = await unknownService.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');
      notifyCharacteristic.addEventListener('characteristicvaluechanged', handleNotification);
      await notifyCharacteristic.startNotifications(); // 開始接收通知
      console.log('已啟用通知 0xFFF1');



      // 獲取特徵值 0xFFF2
      writeCharacteristic = await unknownService.getCharacteristic('0000fff2-0000-1000-8000-00805f9b34fb');
      console.log('獲取特偵值0xFFF2');




      // 獲取 Battery Service
      const batteryService = await server.getPrimaryService('battery_service');
      const batteryLevelCharacteristic = await batteryService.getCharacteristic('battery_level');
      


      document.querySelectorAll('.sendButton').forEach(button => {
        button.disabled = false; // 啟用所有發送按鈕
      });
      document.getElementById('disconnectButton').disabled = false; // 啟用斷開連接按鈕


      // 讀取電池電量
      const batteryLevel = await batteryLevelCharacteristic.readValue();
      console.log('電池電量: ', batteryLevel.getUint8(0), '%');

  
    } catch (error) {
      console.log('藍牙連接失敗: ', error);
    }
  });


// 將所有發送按鈕綁定到相同的事件處理器
document.querySelectorAll('.sendButton').forEach(button => {
  button.addEventListener('click', async (event) => {
    try {
      const message = event.target.getAttribute('data-message'); // 獲取按鈕上的消息
      const encoder = new TextEncoder(); // 使用 TextEncoder
      const data = encoder.encode(message); // 將消息編碼為 UTF-8 格式


      console.log(`即將發送的數據: ${JSON.stringify(data)}`); // 打印編碼的數據

      await writeCharacteristic.writeValue(data);

      console.log(`數據已寫入特徵值 0xFFF2: ${message}`);

    } catch (error) {
      console.log('發送數據失敗: ', error);
    }
  });
});


// 斷開連接按鈕事件處理器
document.getElementById('disconnectButton').addEventListener('click', async () => {
  try {
    if (currentDevice.gatt.connected) {
      await currentDevice.gatt.disconnect();
      console.log('藍牙設備已斷開連接');


      // 禁用所有發送按鈕
      document.querySelectorAll('.sendButton').forEach(button => {
        button.disabled = true; // 禁用發送按鈕
      });



      document.getElementById('disconnectButton').disabled = true; // 禁用斷開按鈕
    }
  } catch (error) {
    console.log('斷開連接失敗: ', error);
  }
});

document.querySelector('#measureOxygenButton').addEventListener('click', async () => {
  try {
    // 顯示「正在量測」的提示
    statusDisplay.textContent = "正在量測血氧與心率...";

    console.log('已發送血氧量測命令: 0x34');
  } catch (error) {
    console.error('量測命令發送失敗:', error);
    statusDisplay.textContent = "量測失敗，請重試";
  }
}); 



