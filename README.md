iframeCross
===========

iframe 跨域双向通行

## API说明
  - send(target,method,data) 发送消息
  	1. target  iframe(iframe.contentWindow)或parent
  	2. method 消息名称
  	3. data 消息传递的参数，为对象，值里面可以有一维数组，所以传递值只是字面量型，布尔型会被转换为整形，详细见数据传输说明
  - recive(method,handler) 接受消息
    1. method 消息名称
    2. handler 消息处理函数

## 事件
  - __recive 事件，在所有recive响应的时候触发
  - __send 事件，在所有send响应的时候触发

## 数据传输说明
  - 数据格式定义为 纯对象 {}
  - 消息名称不允许为 __send,__recive (系统采用了)
  - 对象里面不允许的键：__method__（系统采用了）
  - 数据对象里面可以有一位数组，当数组长度小于等于1的时候会自动转换为普通变量
  - 数据对象为布尔的时候，将自动转换为数字（1，0）