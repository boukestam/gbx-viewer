import BufferReader from "buffer-reader";

import { CollectionIds } from "./collection_ids";
import { parseRefTable, ReferenceTable } from "./table";
import { getChunkInfo, parseChunk } from "./chunk";
import { FileRef, Vec3, Vec4, Transform, Vec2, Color, Quaternion, Node } from "./types";
import { parseHeader } from "./header";

import pako from "pako";

const lzo1x = require("./lzo1x.js");

export default class GameBoxParser {
  buffer: Buffer;
  parser: BufferReader;

  lookbackSeen: boolean = false;
  lookbackStore: string[] = [];

  nodeStore: { [key: number]: Node | null } = {};

  referenceTable: ReferenceTable | null = null;

  tableCompressed: boolean = false;
  bodyCompressed: boolean = false;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this.parser = new BufferReader(buffer);
  }

  encapsulate(): GameBoxParser {
    const e = new GameBoxParser(this.buffer);
    e.parser = this.parser;
    return e;
  }

  parse() {
    const header = parseHeader(this);

    this.referenceTable = parseRefTable(this);

    const body = this.parseBody(header.classId);

    return { header, body };
  }

  parseBody(classId: number): Node {
    if (this.bodyCompressed) {
      const data = this.compressedData("lzo");
      this.buffer = Buffer.from(data);
      this.parser = new BufferReader(this.buffer);
    }

    const node = this.parseNode(classId);

    return node as Node;
  }

  parseNode(classId?: number): Node | null {
    if (!classId) classId = this.uint32();

    if (classId === 0xffffffff) {
      return null;
    }

    const node: Node = {classId};

    while (true) {
      const chunkId = this.uint32();
      if (chunkId === 0xfacade01) {
        break;
      }

      const chunkFlags = getChunkInfo(chunkId);

      if (chunkFlags.skippable) {
        const skip = this.uint32();
        if (skip !== 0x534b4950) {
          break;
        }

        const chunkDataSize = this.uint32();
        this.skip(chunkDataSize);
      } else {
        if (chunkFlags.parsableSkippable) {
          this.skip(8); // skip and chunk size
        }

        const data = parseChunk(this, chunkId, node);
        if (data) {
          for (const key in data) {
            node[key] = data[key];
          }
        }
      }
    }

    return node;
  }

  nodeRef(): Node | null {
    const index = this.int32() - 1;

    if (index < 0) {
      return null;
    }

    if (index in this.nodeStore && this.nodeStore[index]) {
      return this.nodeStore[index];
    }

    // max value
    const classId = this.uint32();
    const node = this.parseNode(classId);

    this.nodeStore[index] = node;
    return node;
  }

  static decompressLZO(compressedData: Buffer) {
    const decompressState: {
      inputBuffer: Buffer;
      outputBuffer: Buffer | null;
    } = {
      inputBuffer: compressedData,
      outputBuffer: null,
    };
    lzo1x.decompress(decompressState);
    return decompressState.outputBuffer as Buffer;
  }

  static decompressZLIB(compressedData: Buffer) {
    return Buffer.from(pako.inflate(compressedData));;
  }

  compressedData(type: "lzo" | "zlib"): Buffer {
    const uncompressedSize = this.int32();
    const compressedSize = this.int32();

    const compressedData = this.bytes(compressedSize);

    let uncompressedData: Buffer;

    if (type === "lzo") {
      uncompressedData = GameBoxParser.decompressLZO(compressedData);
    } else if (type === "zlib") {
      uncompressedData = GameBoxParser.decompressZLIB(compressedData);
    } else {
      throw new Error("Invalid compression type");
    }

    if (uncompressedData.length !== uncompressedSize) {
      throw new Error("Invalid compressed data");
    }

    return uncompressedData;
  }

  fileRef(): FileRef {
    const version = this.byte();

    let checksum, locatorUrl;

    if (version >= 3) {
      checksum = this.bytes(32);
    }

    const filePath = this.string();

    if ((filePath.length > 0 && version >= 1) || version >= 3) {
      locatorUrl = this.string();
    }

    return { version, filePath, checksum, locatorUrl };
  }

  list<T>(f: () => T, length?: number): T[] {
    const count = typeof length === 'undefined' ? this.int32() : length;
    const items: T[] = [];
    for (let i = 0; i < count; i++) {
      items.push(f());
    }
    return items;
  }

  vec2(): Vec2 {
    const x = this.float();
    const y = this.float();
    return { x, y };
  }

  vec3(): Vec3 {
    const x = this.float();
    const y = this.float();
    const z = this.float();
    return new Vec3(x, y, z);
  }

  quat(): Quaternion {
    const x = this.float();
    const y = this.float();
    const z = this.float();
    const w = this.float();
    return new Quaternion(x, y, z, w);
  }

  int2(): Vec2 {
    const x = this.uint32();
    const y = this.uint32();
    return { x, y };
  }

  int3(): Vec3 {
    const x = this.uint32();
    const y = this.uint32();
    const z = this.uint32();
    return new Vec3(x, y, z);
  }

  int4(): Vec4 {
    const x = this.uint32();
    const y = this.uint32();
    const z = this.uint32();
    const w = this.uint32();
    return { x, y, z, w };
  }

  byte3(): Vec3 {
    const x = this.byte();
    const y = this.byte();
    const z = this.byte();
    return new Vec3(x, y, z);
  }

  color(): Color {
    const r = this.float();
    const g = this.float();
    const b = this.float();
    return new Color(r, g, b);
  }

  transform(): Transform {
    const position = this.vec3();

    const angle = this.uint16() / 65535 * Math.PI;
    const axisHeading = this.int16() / 32767 * Math.PI;
    const axisPitch = this.int16() / 32767 * Math.PI / 2;

    const speed = Math.exp(this.int16() / 1000);
    const velocityHeading = this.sybte() / 127 * Math.PI;
    const velocityPitch = this.sybte() / 127 * Math.PI / 2;

    const axis = new Vec3(
      Math.sin(angle) * Math.cos(axisPitch) * Math.cos(axisHeading),
      Math.sin(angle) * Math.cos(axisPitch) * Math.sin(axisHeading),
      Math.sin(angle) * Math.sin(axisPitch)
    );

    const rotation = new Quaternion(axis.x, axis.y, axis.z, Math.cos(angle));

    const velocity = new Vec3(
      speed * Math.cos(velocityPitch) * Math.cos(velocityHeading),
      speed * Math.cos(velocityPitch) * Math.sin(velocityHeading),
      speed * Math.sin(velocityPitch)
    );

    return {position, rotation, speed, velocity};
  }

  bool(asByte?: boolean) {
    const value = asByte ? this.byte() : this.uint32();
    if (value > 1) throw new Error("Invalid boolean: " + value);
    return value !== 0;
  }

  byte() {
    return this.parser.nextUInt8();
  }

  sybte() {
    return this.byte() - 128;
  }

  bytes(length: number) {
    return this.parser.nextBuffer(length);
  }

  uint16() {
    return this.parser.nextUInt16LE();
  }

  uint32() {
    return this.parser.nextUInt32LE();
  }

  int16() {
    return this.parser.nextInt16LE();
  }

  int32() {
    return this.parser.nextInt32LE();
  }

  float() {
    return this.parser.nextFloatLE();
  }

  meta() {
    const id = this.lookBackString();
    const collection = this.lookBackString();
    const author = this.lookBackString();
    return [id, collection, author];
  }

  iso4() {
    return {
      xx: this.float(),
      xy: this.float(),
      xz: this.float(),
      yx: this.float(),
      yy: this.float(),
      yz: this.float(),
      zx: this.float(),
      zy: this.float(),
      zz: this.float(),
      tx: this.float(),
      ty: this.float(),
      tz: this.float(),
    };
  }

  optimizedIntArray(length: number, determineFrom?: number): number[] {
    if (length === 0) return [];

    if (length < 0) throw new Error("Length is zero");

    const arrayLength = (determineFrom || length) >>> 0;

    if (arrayLength >= 65535) return this.list(() => this.int32(), length);
    if (arrayLength >= 255) return this.list(() => this.uint16(), length);

    return this.list(() => this.byte(), length);
  }

  optimizedInt(determineFrom: number): number {
    determineFrom = determineFrom >>> 0;

    if (determineFrom >= 65535) return this.int32();
    if (determineFrom >= 255) return this.uint16();

    return this.byte();
  }

  skip(count: number) {
    this.parser.move(count);
  }

  goto(index: number) {
    this.parser.seek(index);
  }

  peekUint32() {
    const n = this.uint32();
    this.skip(-4);
    return n;
  }

  skipUntilFacade() {
    while (this.peekUint32() !== 0xfacade01) {
      this.skip(1);
    }
  }

  string() {
    let len = this.int32();
    return this.parser.nextString(len);
  }

  lookBackString(cannotBeCollection: boolean = false): string {
    if (!this.lookbackSeen) {
      this.skip(4);
      this.lookbackSeen = true;
      this.lookbackStore = [];
    }

    let inp = this.uint32();
    if (inp === 0) {
      return "";
    }

    if (((inp & 0xc0000000) !== 0 && (inp & 0x3fffffff) === 0) || inp === 0) {
      let str = this.string();
      this.lookbackStore.push(str);
      return str;
    }

    if (inp === 0xffffffff) return "";

    if (cannotBeCollection) {
      return inp.toString();
    }

    if ((inp & 0x3fffffff) === inp) {
      if (!(inp in CollectionIds)) {
        throw new Error("String not found in global collection: " + inp);
      }

      return CollectionIds[inp];
    }

    inp &= 0x3fffffff;

    if (inp - 1 >= this.lookbackStore.length) {
      throw new Error(
        "String not found in lookback list!. Offset: " + this.parser.tell() + " Index: " + inp
      );
    }

    return this.lookbackStore[inp - 1];
  }

  resetLookBackStrings() {
    if (this.lookbackSeen) {
      this.lookbackStore = [];
      this.lookbackSeen = false;
    }
  }
}
