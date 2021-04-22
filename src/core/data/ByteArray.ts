import { ThrowError } from "../debug/ThrowError";
import { Int64 } from "./Int64";

export class ByteArray {

    /**
     * @private
     */
    protected bufferExtSize = 256;//Buffer expansion size

    protected data: DataView;

    protected _bytes: Uint8Array;

    protected _position: number;

    /**
     * 
     * 已经使用的字节偏移量
     */
    protected write_position: number;

    endian: BytesEdian;

    constructor(buffer?: ArrayBuffer | Uint8Array, bufferExtSize?: number) {
        if (bufferExtSize == undefined || bufferExtSize < 0) {
            bufferExtSize = 256;
        }
        this.bufferExtSize = bufferExtSize;
        let bytes: Uint8Array, wpos = 0;
        if (buffer) {//有数据，则可写字节数从字节尾开始
            let uint8: Uint8Array;
            if (buffer instanceof Uint8Array) {
                uint8 = buffer;
                wpos = buffer.length;
            } else {
                wpos = buffer.byteLength;
                uint8 = new Uint8Array(buffer);
            }
            if (bufferExtSize) {//如果设置 bufferExtSize
                let multi = (wpos / bufferExtSize | 0) + 1;
                bytes = new Uint8Array(multi * bufferExtSize);
                bytes.set(uint8);
            } else {
                bytes = uint8;
            }
        } else {
            bytes = new Uint8Array(bufferExtSize);
        }
        this.write_position = wpos;
        this._position = 0;
        this._bytes = bytes;
        this.data = new DataView(bytes.buffer);
    }


    /**
     * 可读的剩余字节数
     */
    get readAvailable() {
        return this.write_position - this._position;
    }

    /**
     * 从 `0` 到`write_position`的副本
     */
    get buffer() {
        return this.data.buffer.slice(0, this.write_position);
    }

    /**
     * 获取原始的`buffer`
     */
    get rawBuffer() {
        return this.data.buffer;
    }

    set buffer(value: ArrayBuffer) {
        let wpos = value.byteLength;
        let uint8 = new Uint8Array(value);
        let bufferExtSize = this.bufferExtSize;
        let multi = (wpos / bufferExtSize | 0) + 1;
        let bytes = new Uint8Array(multi * bufferExtSize);
        bytes.set(uint8);
        this.write_position = wpos;
        this._bytes = bytes;
        this.data = new DataView(bytes.buffer);
    }

    get bytes() {
        return this._bytes;
    }

    /**
     * @private
     */
    get bufferOffset(): number {
        return this.data.byteOffset;
    }

    /**
     * 将文件指针的当前位置（以字节为单位）移动或返回到 ByteArray 对象中。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
     */
    get position() {
        return this._position;
    }

    set position(value: number) {
        this._position = value;
        if (value > this.write_position) {
            this.write_position = value;
        }
    }

    /**
     * ByteArray 对象的长度（以字节为单位）。
     * 如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧。
     * 如果将长度设置为小于当前长度的值，将会截断该字节数组。
     */
    get length() {
        return this.write_position;
    }

    set length(value: number) {
        this.write_position = value;
        if (this.data.byteLength > value) {
            this._position = value;
        }
        this._validateBuffer(value);
    }

    protected _validateBuffer(value: number) {
        if (this.data.byteLength < value) {
            let be = this.bufferExtSize;
            let nLen = ((value / be >> 0) + 1) * be;
            let tmp: Uint8Array = new Uint8Array(nLen);
            tmp.set(this._bytes);
            this._bytes = tmp;
            this.data = new DataView(tmp.buffer);
        }
    }

    /**
     * 可从字节数组的当前位置到数组末尾读取的数据的字节数。
     * 每次访问 ByteArray 对象时，将 bytesAvailable 属性与读取方法结合使用，以确保读取有效的数据。
     */
    get bytesAvailable() {
        return this.data.byteLength - this._position;
    }

    /**
     * 清除字节数组的内容，并将 length 和 position 属性重置为 0。
     */
    clear() {
        this._bytes = new Uint8Array(this.bufferExtSize);
        this.data = new DataView(this._bytes.buffer);
        this._position = 0;
        this.write_position = 0;
    }

    /**
     * 从字节流中读取布尔值。读取单个字节，如果字节非零，则返回 true，否则返回 false
     * @return 如果字节不为零，则返回 true，否则返回 false
     */
    readBoolean() {
        if (this.validate(BytesSize.SizeOfBoolean)) return !!this._bytes[this.position++];
    }

    /**
     * 从字节流中读取带符号的字节
     * @return 介于 -128 和 127 之间的整数
     */
    readByte() {
        if (this.validate(BytesSize.SizeOfInt8)) return this.data.getInt8(this.position++);
    }

    /**
     * 从字节流中读取 length 参数指定的数据字节数。从 offset 指定的位置开始，将字节读入 bytes 参数指定的 ByteArray 对象中，并将字节写入目标 ByteArray 中
     * @param bytes 要将数据读入的 ByteArray 对象
     * @param offset bytes 中的偏移（位置），应从该位置写入读取的数据
     * @param length 要读取的字节数。默认值 0 导致读取所有可用的数据
     */
    readBytes(bytes: ByteArray, offset: number = 0, length: number = 0): void {
        if (!bytes) {//由于bytes不返回，所以new新的无意义
            return;
        }
        let pos = this._position;
        let available = this.write_position - pos;
        if (available < 0) {
            DEBUG && ThrowError(`bytes数据长度不匹配`);
            return;
        }
        if (length == 0) {
            length = available;
        }
        else if (length > available) {
            DEBUG && ThrowError(`bytes数据长度不匹配`);
            return;
        }
        bytes.validateBuffer(offset + length);
        bytes._bytes.set(this._bytes.subarray(pos, pos + length), offset);
        this.position += length;
    }


    /**
     * 从字节流中读取一个 IEEE 754 双精度（64 位）浮点数
     * @return 双精度（64 位）浮点数
     */
    readDouble() {
        if (this.validate(BytesSize.SizeOfFloat64)) {
            let value = this.data.getFloat64(this._position, this.endian == BytesEdian.Little);
            this.position += BytesSize.SizeOfFloat64;
            return value;
        }
    }

    /**
     * 从字节流中读取一个 IEEE 754 单精度（32 位）浮点数
     * @return 单精度（32 位）浮点数
     */
    readFloat() {
        if (this.validate(BytesSize.SizeOfFloat32)) {
            let value = this.data.getFloat32(this._position, this.endian == BytesEdian.Little);
            this.position += BytesSize.SizeOfFloat32;
            return value;
        }
    }

    /**
     * 从字节流中读取一个带符号的 32 位整数
     * @return 介于 -2147483648 和 2147483647 之间的 32 位带符号整数
     */
    readInt(): number {
        if (this.validate(BytesSize.SizeOfInt32)) {
            let value = this.data.getInt32(this._position, this.endian == BytesEdian.Little);
            this.position += BytesSize.SizeOfInt32;
            return value;
        }
    }

    /**
     * 从字节流中读取一个带符号的 16 位整数
     * @return 介于 -32768 和 32767 之间的 16 位带符号整数
     */
    readShort(): number {
        if (this.validate(BytesSize.SizeOfInt16)) {
            let value = this.data.getInt16(this._position, this.endian == BytesEdian.Little);
            this.position += BytesSize.SizeOfInt16;
            return value;
        }
    }

    /**
     * 从字节流中读取无符号的字节
     * @return 介于 0 和 255 之间的无符号整数
     */
    readUnsignedByte(): number {
        if (this.validate(BytesSize.SizeOfUint8)) return this._bytes[this.position++];
    }

    /**
     * 从字节流中读取一个无符号的 32 位整数
     * @return 介于 0 和 4294967295 之间的 32 位无符号整数
     */
    readUnsignedInt(): number {
        if (this.validate(BytesSize.SizeOfUint32)) {
            let value = this.data.getUint32(this._position, this.endian == BytesEdian.Little);
            this.position += BytesSize.SizeOfUint32;
            return value;
        }
    }

    /**
     * 从字节流中读取一个无符号的 16 位整数
     * @return 介于 0 和 65535 之间的 16 位无符号整数
     */
    readUnsignedShort(): number {
        if (this.validate(BytesSize.SizeOfUint16)) {
            let value = this.data.getUint16(this._position, this.endian == BytesEdian.Little);
            this.position += BytesSize.SizeOfUint16;
            return value;
        }
    }

    /**
     * 从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是无符号的短整型（以字节表示长度）
     * @return UTF-8 编码的字符串
     */
    readUTF(): string {
        let length = this.readUnsignedShort();
        if (length > 0) {
            return this.readUTFBytes(length);
        } else {
            return "";
        }
    }

    /**
     * 从字节流中读取一个由 length 参数指定的 UTF-8 字节序列，并返回一个字符串
     * @param length 指明 UTF-8 字节长度的无符号短整型数
     * @return 由指定长度的 UTF-8 字节组成的字符串
     */
    readUTFBytes(length: number): string {
        if (!this.validate(length)) {
            return;
        }
        let data = this.data;
        let bytes = new Uint8Array(data.buffer, data.byteOffset + this._position, length);
        this.position += length;
        return this.decodeUTF8(bytes);
    }

    /**
     * 写入布尔值。根据 value 参数写入单个字节。如果为 true，则写入 1，如果为 false，则写入 0
     * @param value 确定写入哪个字节的布尔值。如果该参数为 true，则该方法写入 1；如果该参数为 false，则该方法写入 0
     */
    writeBoolean(value: boolean): void {
        this.validateBuffer(BytesSize.SizeOfBoolean);
        this._bytes[this.position++] = +value;
    }

    /**
     * 在字节流中写入一个字节
     * 使用参数的低 8 位。忽略高 24 位
     * @param value 一个 32 位整数。低 8 位将被写入字节流
     */
    writeByte(value: number): void {
        this.validateBuffer(BytesSize.SizeOfInt8);
        this._bytes[this.position++] = value & 0xff;
    }

    /**
     * 将指定字节数组 bytes（起始偏移量为 offset，从零开始的索引）中包含 length 个字节的字节序列写入字节流
     * 如果省略 length 参数，则使用默认长度 0；该方法将从 offset 开始写入整个缓冲区。如果还省略了 offset 参数，则写入整个缓冲区
     * 如果 offset 或 length 超出范围，它们将被锁定到 bytes 数组的开头和结尾
     * @param bytes ByteArray 对象
     * @param offset 从 0 开始的索引，表示在数组中开始写入的位置
     * @param length 一个无符号整数，表示在缓冲区中的写入范围
     */
    writeBytes(bytes: ByteArray, offset: number = 0, length: number = 0): void {
        let writeLength: number;
        if (offset < 0) {
            return;
        }
        if (length < 0) {
            return;
        } else if (length == 0) {
            writeLength = bytes.length - offset;
        } else {
            writeLength = Math.min(bytes.length - offset, length);
        }
        if (writeLength > 0) {
            this.validateBuffer(writeLength);
            this._bytes.set(bytes._bytes.subarray(offset, offset + writeLength), this._position);
            this.position = this._position + writeLength;
        }
    }

    /**
     * 在字节流中写入一个 IEEE 754 双精度（64 位）浮点数
     * @param value 双精度（64 位）浮点数
     */
    writeDouble(value: number): void {
        this.validateBuffer(BytesSize.SizeOfFloat64);
        this.data.setFloat64(this._position, value, this.endian == BytesEdian.Little);
        this.position += BytesSize.SizeOfFloat64;
    }

    /**
     * 在字节流中写入一个 IEEE 754 单精度（32 位）浮点数
     * @param value 单精度（32 位）浮点数
     */
    writeFloat(value: number): void {
        this.validateBuffer(BytesSize.SizeOfFloat32);
        this.data.setFloat32(this._position, value, this.endian == BytesEdian.Little);
        this.position += BytesSize.SizeOfFloat32;
    }

    /**
     * 在字节流中写入一个带符号的 32 位整数
     * @param value 要写入字节流的整数
     */
    writeInt(value: number): void {
        this.validateBuffer(BytesSize.SizeOfInt32);
        this.data.setInt32(this._position, value, this.endian == BytesEdian.Little);
        this.position += BytesSize.SizeOfInt32;
    }

    /**
     * 在字节流中写入一个 16 位整数。使用参数的低 16 位。忽略高 16 位
     * @param value 32 位整数，该整数的低 16 位将被写入字节流
     */
    writeShort(value: number): void {
        this.validateBuffer(BytesSize.SizeOfInt16);
        this.data.setInt16(this._position, value, this.endian == BytesEdian.Little);
        this.position += BytesSize.SizeOfInt16;
    }

    /**
     * 在字节流中写入一个无符号的 32 位整数
     * @param value 要写入字节流的无符号整数
     */
    writeUnsignedInt(value: number): void {
        this.validateBuffer(BytesSize.SizeOfUint32);
        this.data.setUint32(this._position, value, this.endian == BytesEdian.Little);
        this.position += BytesSize.SizeOfUint32;
    }

    /**
     * 在字节流中写入一个无符号的 16 位整数
     * @param value 要写入字节流的无符号整数
     */
    writeUnsignedShort(value: number): void {
        this.validateBuffer(BytesSize.SizeOfUint16);
        this.data.setUint16(this._position, value, this.endian == BytesEdian.Little);
        this.position += BytesSize.SizeOfUint16;
    }

    /**
     * 将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节
     * @param value 要写入的字符串值
     */
    writeUTF(value: string): void {
        let utf8bytes: ArrayLike<number> = this.encodeUTF8(value);
        let length: number = utf8bytes.length;
        this.validateBuffer(BytesSize.SizeOfUint16 + length);
        this.data.setUint16(this._position, length, this.endian == BytesEdian.Little);
        this.position += BytesSize.SizeOfUint16;
        this._writeUint8Array(utf8bytes, false);
    }

    /**
     * 将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的词为字符串添加前缀
     * @param value 要写入的字符串值
     */
    writeUTFBytes(value: string): void {
        this._writeUint8Array(this.encodeUTF8(value));
    }


    toString(): string {
        return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
    }

    /**
     * @private
     * 将 Uint8Array 写入字节流
     * @param bytes 要写入的Uint8Array
     * @param validateBuffer
     */
    _writeUint8Array(bytes: Uint8Array | ArrayLike<number>, validateBuffer: boolean = true): void {
        let pos = this._position;
        let npos = pos + bytes.length;
        if (validateBuffer) {
            this.validateBuffer(npos);
        }
        this.bytes.set(bytes, pos);
        this.position = npos;
    }

    /**
     * @param len
     * @returns
     */
    validate(len: number): boolean {
        let bl = this._bytes.length;
        if (bl > 0 && this._position + len <= bl) {
            return true;
        } else {
            DEBUG && ThrowError(`bytes数据长度不匹配`);
        }
    }

    /**
         * 替换缓冲区
         * 
         * @param {ArrayBuffer} value 
         */
    replaceBuffer(value: ArrayBuffer) {
        this.write_position = value.byteLength;
        this._bytes = new Uint8Array(value);
        this.data = new DataView(value);
    }

    /**
     * 
     * 读取指定长度的Buffer
     * @param {number} length       指定的长度
     * @returns {Buffer}
     */
    readBuffer(length: number): ArrayBuffer {
        if (!this.validate(length)) return;
        let start = this.position;
        this.position += length;
        return this.buffer.slice(start, this.position);
    }

    readInt64() {
        if (this.validate(BytesSize.SizeOfInt64)) {
            let low: number, high: number;
            let flag = this.endian == BytesEdian.Little;
            let data = this.data;
            let pos = this._position;
            if (flag) {
                low = data.getUint32(pos, flag);
                high = data.getUint32(pos + BytesSize.SizeOfUint32, flag);
            } else {
                high = data.getUint32(pos, flag);
                low = data.getUint32(pos + BytesSize.SizeOfUint32, flag);
            }
            this.position = pos + BytesSize.SizeOfInt64;
            return Int64.toNumber(low, high);
        }
    }

    writeInt64(value: number): void {
        this.validateBuffer(BytesSize.SizeOfInt64);
        let i64 = Int64.fromNumber(value);
        let { high, low } = i64;
        let flag = this.endian == BytesEdian.Little;
        let data = this.data;
        let pos = this._position;
        if (flag) {
            data.setUint32(pos, low, flag);
            data.setUint32(pos + BytesSize.SizeOfUint32, high, flag);
        } else {
            data.setUint32(pos, high, flag);
            data.setUint32(pos + BytesSize.SizeOfUint32, low, flag);
        }
        this.position = pos + BytesSize.SizeOfInt64;
    }

    /**
     * 读取ProtoBuf的`Double`
     * protobuf封装是使用littleEndian的，不受Endian影响
     */
    readPBDouble() {
        if (this.validate(BytesSize.SizeOfFloat64)) {
            let value = this.data.getFloat64(this._position, true);
            this.position += BytesSize.SizeOfFloat64;
            return value;
        }
    }

    /**
     * 写入ProtoBuf的`Double`
     * protobuf封装是使用littleEndian的，不受Endian影响
     * @param value 
     */
    writePBDouble(value: number) {
        this.validateBuffer(BytesSize.SizeOfFloat64);
        this.data.setFloat64(this._position, value, true);
        this.position += BytesSize.SizeOfFloat64;
    }

    /**
     * 读取ProtoBuf的`Float`
     * protobuf封装是使用littleEndian的，不受Endian影响
     */
    readPBFloat() {
        if (this.validate(BytesSize.SizeOfFloat32)) {
            let value = this.data.getFloat32(this._position, true);
            this.position += BytesSize.SizeOfFloat32;
            return value;
        }
    }

    /**
      * 写入ProtoBuf的`Float`
      * protobuf封装是使用littleEndian的，不受Endian影响
      * @param value 
      */
    writePBFloat(value: number) {
        this.validateBuffer(BytesSize.SizeOfFloat32);
        this.data.setFloat32(this._position, value, true);
        this.position += BytesSize.SizeOfFloat32;
    }

    readFix32() {
        if (this.validate(BytesSize.SizeOfFix32)) {
            let value = this.data.getUint32(this._position, true);
            this.position += BytesSize.SizeOfFix32;
            return value;
        }
    }

    writeFix32(value: number) {
        this.validateBuffer(BytesSize.SizeOfFix32);
        this.data.setUint32(this._position, value, true);
        this.position += BytesSize.SizeOfFix32;
    }

    readSFix32() {
        if (this.validate(BytesSize.SizeOfSFix32)) {
            let value = this.data.getInt32(this._position, true);
            this.position += BytesSize.SizeOfSFix32;
            return value;
        }
    }

    writeSFix32(value: number) {
        this.validateBuffer(BytesSize.SizeOfSFix32);
        this.data.setInt32(this._position, value, true);
        this.position += BytesSize.SizeOfSFix32;
    }

    readFix64() {
        if (this.validate(BytesSize.SizeOfFix64)) {
            let pos = this._position;
            let data = this.data;
            let low = data.getUint32(pos, true);
            let high = data.getUint32(pos + BytesSize.SizeOfUint32, true);
            this.position = pos + BytesSize.SizeOfFix64;
            return Int64.toNumber(low, high);
        }
    }

    writeFix64(value: number) {
        let i64 = Int64.fromNumber(value);
        this.validateBuffer(BytesSize.SizeOfFix64);
        let pos = this._position;
        let data = this.data;
        data.setUint32(pos, i64.low, true);
        data.setUint32(pos + BytesSize.SizeOfUint32, i64.high, true);
        this.position = pos + BytesSize.SizeOfFix64;
    }

    /**
     * 
     * 读取指定长度的ByteArray
     * @param {number} length       指定的长度
     * @param {number} [ext=0]      ByteArray扩展长度参数
     * @returns {ByteArray}
     */
    readByteArray(length: number, ext = 0) {
        let ba = new ByteArray(this.readBuffer(length), ext);
        ba.endian = this.endian;
        return ba;
    }
    /**
     * 向字节流中写入64位的可变长度的整数(Protobuf)
     */
    writeVarint64(value: number) {
        let i64 = Int64.fromNumber(value);
        var high = i64.high;
        var low = i64.low;
        if (high == 0) {
            this.writeVarint(low >>> 0);
        }
        else {
            for (var i: number = 0; i < 4; ++i) {
                this.writeByte((low & 0x7F) | 0x80);
                low >>>= 7;
            }
            if ((high & (0xFFFFFFF << 3)) == 0) {
                this.writeByte((high << 4) | low);
            }
            else {
                this.writeByte((((high << 4) | low) & 0x7F) | 0x80);
                this.writeVarint(high >>> 3);
            }
        }
    }

    /**
     * 向字节流中写入32位的可变长度的整数(Protobuf)
     */
    writeVarint(value: number) {
        for (; ;) {
            if (value < 0x80) {
                this.writeByte(value);
                return;
            }
            else {
                this.writeByte((value & 0x7F) | 0x80);
                value >>>= 7;
            }
        }
    }

    /**
     * 读取字节流中的32位变长整数(Protobuf)
     */
    readVarint() {
        var result = 0
        for (var i = 0; ; i += 7) {
            if (i < 32) {
                let b = this.readUnsignedByte();
                if (b >= 0x80) {
                    result |= ((b & 0x7f) << i);
                }
                else {
                    result |= (b << i);
                    break
                }
            } else {
                while (this.readUnsignedByte() >= 0x80) { }
                break
            }
        }
        return result;
    }

    /**
      * 读取字节流中的32位变长整数(Protobuf)
      */
    readVarint64() {
        let b: number, low: number, high: number, i = 0;
        for (; ; i += 7) {
            b = this.readUnsignedByte();
            if (i == 28) {
                break;
            }
            else {
                if (b >= 0x80) {
                    low |= ((b & 0x7f) << i);
                }
                else {
                    low |= (b << i);
                    return Int64.toNumber(low, high);
                }
            }
        }
        if (b >= 0x80) {
            b &= 0x7f;
            low |= (b << i);
            high = b >>> 4;
        }
        else {
            low |= (b << i);
            high = b >>> 4;
            return Int64.toNumber(low, high);
        }
        for (i = 3; ; i += 7) {
            b = this.readUnsignedByte();
            if (i < 32) {
                if (b >= 0x80) {
                    high |= ((b & 0x7f) << i);
                }
                else {
                    high |= (b << i);
                    break
                }
            }
        }
        return Int64.toNumber(low, high);
    }

    /**
     * 获取写入的字节
     * 此方法不会新建 ArrayBuffer
     */
    get outBytes() {
        return new Uint8Array(this._bytes.buffer, 0, this.write_position);
    }

    /**
     * 重置索引
     * 
     */
    reset() {
        this.write_position = this.position = 0;
    }

    /**********************/
    /*  PRIVATE METHODS   */
    /**********************/
    /**
     * @param len
     * @param needReplace
     */
    protected validateBuffer(len: number): void {
        this.write_position = len > this.write_position ? len : this.write_position;
        len += this._position;
        this._validateBuffer(len);
    }
    /**
     * 获取字符串使用Utf8编码的字节长度
     * 
     * 参考 https://github.com/dcodeIO/protobuf.js/tree/master/lib/utf8
     * @static
     * @param {string} string 
     * @returns 
     * 
     * @memberOf ByteArray
     */
    static utf8ByteLength(string: string) {
        let len = 0,
            c = 0;
        for (let i = 0; i < string.length; ++i) {
            c = string.charCodeAt(i);
            if (c < 128)
                len += 1;
            else if (c < 2048)
                len += 2;
            else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
                ++i;
                len += 4;
            } else
                len += 3;
        }
        return len;
    }

    /**
     * 接续utf8字符串
     * 
     * 参考 https://github.com/dcodeIO/protobuf.js/tree/master/lib/utf8
     * @param {string} string 
     * @returns 
     * @protected
     * @memberOf ByteArray
     */
    encodeUTF8(string: string) {
        let offset = 0,
            c1: number, // character 1
            c2: number; // character 2
        let buffer: number[] = [];//new Uint8Array(ByteArray.utf8ByteLength(string));
        for (var i = 0; i < string.length; ++i) {
            c1 = string.charCodeAt(i);
            if (c1 < 128) {
                buffer[offset++] = c1;
            } else if (c1 < 2048) {
                buffer[offset++] = c1 >> 6 | 192;
                buffer[offset++] = c1 & 63 | 128;
            } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
                c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
                ++i;
                buffer[offset++] = c1 >> 18 | 240;
                buffer[offset++] = c1 >> 12 & 63 | 128;
                buffer[offset++] = c1 >> 6 & 63 | 128;
                buffer[offset++] = c1 & 63 | 128;
            } else {
                buffer[offset++] = c1 >> 12 | 224;
                buffer[offset++] = c1 >> 6 & 63 | 128;
                buffer[offset++] = c1 & 63 | 128;
            }
        }
        return buffer;
    }

    /**
     * 从字节数组中读取utf8字符串
     * 
     * 参考 https://github.com/dcodeIO/protobuf.js/tree/master/lib/utf8
     * @param {(Uint8Array | ArrayLike<number>)} buffer 
     */
    decodeUTF8(buffer: Uint8Array | ArrayLike<number>) {
        let len = buffer.length;
        if (len < 1)
            return "";
        let parts: string[],
            chunk = [],
            start = 0,
            i = 0, // char offset
            t;     // temporary
        while (start < len) {
            t = buffer[start++];
            if (t < 128)
                chunk[i++] = t;
            else if (t > 191 && t < 224)
                chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
            else if (t > 239 && t < 365) {
                t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
                chunk[i++] = 0xD800 + (t >> 10);
                chunk[i++] = 0xDC00 + (t & 1023);
            } else
                chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
            if (i > 8191) {
                (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
                i = 0;
            }
        }
        if (parts) {
            if (i)
                parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
            return parts.join("");
        }
        return String.fromCharCode.apply(String, chunk.slice(0, i));
    }
}
let pt = ByteArray.prototype;
if (typeof TextDecoder === "function") {//如果有原生的文本编码解析类  浏览器支持状况： http://caniuse.com/#feat=textencoder
    let td = new TextDecoder();
    pt.decodeUTF8 = td.decode.bind(td);
    let te = new TextEncoder();
    pt.encodeUTF8 = te.encode.bind(te);
}
interface TextDecoder {
    decode(buffer: Uint8Array | ArrayLike<number>, options?: { stream: boolean }): string;
}
interface TextDecoderConstructor {
    new(): TextDecoder;
}
declare var TextDecoder: TextDecoderConstructor;
interface TextEncoder {
    encode(buffer: string, options?: { stream: boolean }): any;
}
interface TextEncoderConstructor {
    new(): TextEncoder;
}
declare var TextEncoder: TextEncoderConstructor;