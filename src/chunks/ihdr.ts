import { ArrayBufferWalker } from '../util/arraybuffer-walker';

export type validBitDepth = 1 | 2 | 4 | 8 | 16;

/**
 * The color type our image uses. PngPong currently only supports
 * Palette images, PNGColorType.Palette
 * 
 * @export
 * @enum {number}
 */
export enum PNGColorType {
    Grayscale = 0,
    RGB = 2,
    Palette = 3,
    GrayscaleWithAlpha = 4,
    RGBA = 6
}


/**
 * The attributes for an IHDR chunk as defined in 
 * http://www.libpng.org/pub/png/spec/1.2/PNG-Chunks.html#C.IHDR
 * 
 * @export
 * @interface IHDROptions
 */
export interface IHDROptions {
    width: number;
    height: number;
    bitDepth: validBitDepth;
    colorType: PNGColorType;
    compressionMethod: number;
    filter: number;
    interface: number;
}

export function writeIHDR(walker: ArrayBufferWalker, options: IHDROptions) {

    // IHDR length is always 13 bytes
    walker.writeUint32(13);

    walker.startCRC();
    walker.writeString("IHDR");

    walker.writeUint32(options.width);
    walker.writeUint32(options.height);

    walker.writeUint8(options.bitDepth);
    walker.writeUint8(options.colorType);
    walker.writeUint8(options.compressionMethod);
    walker.writeUint8(options.filter);
    walker.writeUint8(options.interface);

    walker.writeCRC();

}


/**
 * Read out the values contained within IHDR. Does not let you edit these
 * values, as changing pretty much any of them would make the IDAT chunk
 * totally invalid.
 * 
 * @export
 * @param {ArrayBufferWalker} walker 
 * @param {number} length 
 * @returns {IHDROptions} 
 */
export function readIHDR(walker: ArrayBufferWalker, length: number): IHDROptions {

    if (length !== 13) {
        throw new Error("IHDR length must always be 13")
    }

    let width = walker.readUint32();
    let height = walker.readUint32();

    let bitDepth = walker.readUint8() as validBitDepth;
    let colorType = walker.readUint8() as PNGColorType;
    let compressionMethod = walker.readUint8();
    let filter = walker.readUint8();
    let pngInterface = walker.readUint8();

    // Don't do anything with this as we can't edit the header
    let crc = walker.readUint32();

    return {
        width,
        height,
        bitDepth,
        colorType,
        compressionMethod,
        filter,
        interface: pngInterface
    };


}

/**
 *  IHDR length is always 13 bytes. So we can store this as a constant.
 */
export const IHDRLength = 4 // Chunk length identifier
    + 4     // chunk header
    + 13    // actual IHDR length
    + 4     // CRC32 check;