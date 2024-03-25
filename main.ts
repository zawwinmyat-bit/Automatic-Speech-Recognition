/**
* SU-03T speech recognition chip building block
*/

//% weight=0 color=#439409 icon="\uf130" block="SU-03T ASR"
namespace su03t {
    let voice_tx = SerialPin.P1
    let voice_rx = SerialPin.P2
    let receivedBuff=pins.createBuffer(4)
    let sendBuff=pins.createBuffer(7)
    let mySU03Tevent: Action = null
    let firstCommandCode=0
    let secondCommandCode=0
 
    export enum voiceCommand {
         //% block="wake word"
         command00 = 0x00,
         //% block="Turn on the light"
         command01 = 0x01,
         //% block="Turn off the light"
         command02 = 0x02,
         //% block="Open relay"
         command03 = 0x03,
         //% block="Close relay"
         command04 = 0x04,
         //% block="Turn on the switch"
         command05 = 0x05,
         //% block="Close switch"
         command06 = 0x06,
         //% block="Brighter"
         command07 = 0x07,
         //% block="Darker"
         command08 = 0x08,
         //% block="Start function"
         command2D = 0x2D,
         //% block="Turn off function"
         command2E = 0x2E,
         //% block="open"
         command2F = 0x2F,
         //% block="Close"
         command30 = 0x30,
         //% block="forward"
         command0B = 0x0B,
         //% block="Back"
         command0C = 0x0C,
         //% block="Turn left"
         command0D = 0x0D,
         //% block="Turn right"
         command0E = 0x0E,
         //% block="Stop"
         command0F = 0x0F,
         //% block="Open camera"
         command10 = 0x10,
         //% block="Close camera"
         command11 = 0x11,
         //% block="Hurry up"
         command12 = 0x12,
         //% block="Slower"
         command13 = 0x13,
         //% block="Play music"
         command15 = 0x15,
         //% block="Pause playback"
         command16 = 0x16,
         //% block="Stop playing"
         command17 = 0x17,
         //% block="Previous song"
         command18 = 0x18,
         //% block="Next song"
         command19 = 0x19,
         //% block="First song"
         command1A = 0x1A,
         //% block="Last song"
         command1B = 0x1B,
         //% block="red"
         command1F = 0x1F,
         //% block="green"
         command20 = 0x20,
         //% block="blue"
         command21 = 0x21,
         //% block="yellow"
         command22 = 0x22,
         //% block="cyan"
         command23 = 0x23,
         //% block="Magenta"
         command24 = 0x24,
         //% block="purple"
         command27 = 0x27,
         //% block="white"
         command25 = 0x25,
         //% block="black"
         command26 = 0x26,
         //% block="Temperature"
         command29 = 0x29,
         //% block="Humidity"
         command2A = 0x2A,
         //% block="brightness"
         command2B = 0x2B,
         //% block="distance"
         command2C = 0x2C,
         //% block="Display image"
         command33 = 0x33,
         //% block="Next picture"
         command34 = 0x34,
         //% block="Previous picture"
         command35 = 0x35,
         //% block="Clear screen"
         command36 = 0x36
    }
    export enum numberCommand {
         //% block="Temperature"
         command02 = 0x02,
         //% block="Humidity"
         command03 = 0x03,
         //% block="brightness"
         command04 = 0x04,
         //% block="distance"
         command05 = 0x05
    }
    export enum floatCommand {
        //% block="integer"
        command06 = 0x06,
        //% block="decimal"
        command07 = 0x07
    }
    export enum systemCommand {
         //% block="Wake up"
         command01 = 1,
         //% block="Enter sleep"
         command14 = 14,
         //% block="mute"
         command08 = 8,
         //% block="Unmute"
         command09 = 9,
         //% block="maximum volume"
         command10 = 10,
         //% block="minimum volume"
         command11 = 11,
         //% block="Louder"
         command12 = 12,
         //% block="Lower your voice"
         command13 = 13
    }
    export enum preCommand {
        //% block="Welcome"
         command15 = 15,
         //% block="Someone has invaded"
         command16 = 16,
         //% block="Great job, keep up the good work"
         command17 = 17,
         //% block="Time's up, it's time to get up"
         command18 = 18,
         //% block="The temperature is too high"
         command19 = 19,
         //% block="The temperature is too low"
         command20 = 20,
         //% block="The light is too bright"
         command21 = 21,
         //% block="The light is too dark"
         command22 = 22,
         //% block="I love you"
         command23 = 23,
         //% block="Happy birthday to you"
         command24 = 24,
         //% block="This information is not normal"
         command25 = 25,
         //% block="The speed is too slow, please speed up"
         command26 = 26,
         //% block="The speed is too fast, please pay attention to safety"
         command27 = 27,
         //% block="There is an obstacle ahead"
         command28 = 28,
         //% block="Mirror, Mirror, who is the most beautiful person in the world"
         command29 = 29,
         //% block="Smoke exceeds standard"
         command30 = 30,
         //% block="Gas exceeds standard"
         command31 = 31,
         //% block="Human body sensor detection trigger"
         command32 = 32,
         //% block="Please pay attention to safety and do not run in the corridor"
         command33 = 33
    }
    //% blockId="su03t_setSerial" block="SU-03T initial|B6 connect to %pinTX|B7 connect to %pinRX"
    //% weight=100 blockGap=20 pinTX.defl=SerialPin.P1 pinRX.defl=SerialPin.P2
    export function su03tSetSerial(pinTX: SerialPin, pinRX: SerialPin): void {
        serial.setRxBufferSize(4)
        serial.setTxBufferSize(7)
        voice_tx = pinTX;
        voice_rx = pinRX;
        serial.redirect(
            voice_tx,
            voice_rx,
            BaudRate.BaudRate115200
        )
        basic.pause(100)
    }
    //% weight=90
    //% blockId="su03t_recognize" block="when SU-03T recognizes voice command"
    export function su03tEvent(tempAct: Action) {
        mySU03Tevent=tempAct;
    }
    basic.forever(() => {
        receivedBuff = serial.readBuffer(4)
        firstCommandCode = receivedBuff.getNumber(NumberFormat.UInt8LE, 1)
        secondCommandCode = receivedBuff.getNumber(NumberFormat.UInt8LE, 2)
        if (mySU03Tevent != null) {
          mySU03Tevent();
        }
    })
    //% weight=80
    //% blockId="su03tCommandList" block="recognizes %myCommand ?"
    export function su03tCommandList(myCommand: voiceCommand): boolean {
        let tempA = myCommand;
        return (firstCommandCode==0 && tempA == secondCommandCode )
    }

    //% weight=70
    //% blockId="su03tSpeakSomething" block="SU-03T read aloud %myCommand|integer %myNum"
    export function su03tSpeakSomething(myCommand: numberCommand, myNum: number) {
        sendBuff.setNumber(NumberFormat.UInt8LE,0,0xAA);
        sendBuff.setNumber(NumberFormat.UInt8LE, 1, myCommand);
        sendBuff.setNumber(NumberFormat.Int32LE, 2, myNum);
        sendBuff.setNumber(NumberFormat.UInt8LE, 6, 0xFF);
        serial.writeBuffer(sendBuff)
    }
    //% weight=60
    //% blockId="su03tSpeakFloat" block="SU-03T read aloud %myCommand|number %myNum"
    export function su03tSpeakFloat(myCommand: floatCommand, myNum: number) {
        if (myCommand==0x06){
          sendBuff.setNumber(NumberFormat.UInt8LE, 0, 0xAA);
          sendBuff.setNumber(NumberFormat.UInt8LE, 1, myCommand);
          sendBuff.setNumber(NumberFormat.Int32LE, 2, myNum);
          sendBuff.setNumber(NumberFormat.UInt8LE, 6, 0xFF);
          serial.writeBuffer(sendBuff)
        } else if (myCommand==0x07){
            let tempBuff=pins.createBuffer(11)
            tempBuff.setNumber(NumberFormat.UInt8LE, 0, 0xAA);
            tempBuff.setNumber(NumberFormat.UInt8LE, 1, myCommand);
            tempBuff.setNumber(NumberFormat.Float64LE,2,myNum)
            tempBuff.setNumber(NumberFormat.UInt8LE, 10, 0xFF);
            serial.writeBuffer(tempBuff)
        } 
    }
    //% weight=50
    //% blockId="su03tSystemCommand" block="SU-03T excute system command %myCommand"
    export function su03tSystemCommand(myCommand: systemCommand) {
        sendBuff.setNumber(NumberFormat.UInt8LE, 0, 0xAA);
        sendBuff.setNumber(NumberFormat.UInt8LE, 1, myCommand);
        sendBuff.setNumber(NumberFormat.Int32LE, 2, 0);
        sendBuff.setNumber(NumberFormat.UInt8LE, 6, 0xFF);
        serial.writeBuffer(sendBuff)
    }

    //% weight=40
    //% blockId="su03tPreCommand" block="SU-03T read aloud %myCommand"
    export function su03tPreCommand(myCommand: preCommand) {
        let myTempBuff=pins.createBuffer(3)
        myTempBuff.setNumber(NumberFormat.UInt8LE, 0, 0xAA);
        myTempBuff.setNumber(NumberFormat.UInt8LE, 1, myCommand);
        myTempBuff.setNumber(NumberFormat.UInt8LE, 2, 0xFF);
        serial.writeBuffer(myTempBuff)
    }

}
