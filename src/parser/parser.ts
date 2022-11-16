import BufferReader from "buffer-reader";
import { EventEmitter } from "events";

import { CollectionIds } from "./collection_ids";
import { parseRefTable, ReferenceTable } from "./table";
import { parseChunk } from "./chunk";
import { parseHeader } from "./header";

import pako from "pako";
import { FileRef, Vec3, Vec4, Transform, Vec2, Color, Quaternion, Chunk, Node } from "./types";

const lzo1x = require("./lzo1x.js");

const skippableChunks = [
  0x03029002,

  0x0303f007,

  0x03043018, 0x03043019, 0x0304301c, 0x03043029, 0x03043034, 0x03043036,
  0x03043038, 0x0304303d, 0x0304303e, 0x03043040, 0x03043042, 0x03043043,
  0x03043044, 0x03043048, 0x0304304b, 0x0304304f, 0x03043050, 0x03043051,
  0x03043052, 0x03043053, 0x03043054, 0x03043055, 0x03043056, 0x03043057,
  0x03043058, 0x03043059, 0x0304305a, 0x0304305b, 0x0304305c, 0x0304305d,
  0x0304305e, 0x0304305f, 0x03043060, 0x03043061, 0x03043062, 0x03043063,
  0x03043064, 0x03043065, 0x03043066, 0x03043067, 0x03043068, 0x03043069,

  0x0305b00a, 0x0305b00e,

  0x03092013, 0x0309201a, 0x0309201b, 0x03092022, 0x03092023, 0x03092024, 
  0x03092026, 0x03092027, 0x03092028, 0x03092029, 0x0309202A, 0x0309202B,
  0x0309202C, 0x0309202D,

  0x0309301A, 0x0309301B, 0x0309301C, 0x0309301D, 0x0309301E, 0x0309301F, 
  0x03093020, 0x03093021, 0x03093022, 0x03093023, 0x03093025, 0x03093026,
  0x03093027, 0x03093028,

  0x0310d00b, 0x0310d00c, 0x0310d010, 0x0310d011,

  0x2e009001,

  0x40000006,
];

const parsableSkippableChunks = [
  0x03092000, 0x03092005, 0x03092008, 0x03092009, 0x0309200a, 0x0309200b,
  0x03092013, 0x03092014, 0x03092017, 0x0309201d, 0x03092025,

  0x03093018
];

export default class MapParser extends EventEmitter {
  buffer?: Buffer;
  file?: string;
  parser: BufferReader;
  debug: any;
  map = new Map();
  lookbackSeen: boolean = false;
  lookbackStore: string[] = [];
  nodeStore: { [key: number]: Node } = {};
  referenceTable: ReferenceTable | null = null;

  tableCompressed: boolean = false;
  bodyCompressed: boolean = false;

  constructor(buffer: Buffer) {
    super();
    this.parser = new BufferReader(buffer);
    this.buffer = buffer;
  }

  async parse() {
    const header = parseHeader(this);

    this.referenceTable = parseRefTable(this);

    const body = this.parseBody();

    return { header, body };
  }

  parseBody() {
    if (this.bodyCompressed) {
      const data = this.compressedData("lzo");
      this.buffer = data;
      this.parser = new BufferReader(Buffer.from(data));
    }

    const node = this.parseNode();

    return node;
  }

  getChunkInfo(chunkId: number) {
    const info = {
      skippable: false,
      parsableSkippable: false,
    };

    if (skippableChunks.indexOf(chunkId) !== -1) info.skippable = true;

    if (parsableSkippableChunks.indexOf(chunkId) !== -1)
      info.parsableSkippable = true;

    return info;
  }

  parseNode(): Chunk[] {
    const chunks: Chunk[] = [];

    while (true) {
      const chunkId = this.uint32();
      if (chunkId === 0xfacade01) {
        // no more chunks
        break;
      }

      const chunkFlags = this.getChunkInfo(chunkId);

      if (chunkFlags.skippable) {
        const skip = this.uint32();
        if (skip !== 0x534b4950) {
          // "SKIP"
          break;
        }

        const chunkDataSize = this.uint32();
        this.skip(chunkDataSize);
      } else {
        if (chunkFlags.parsableSkippable) {
          this.skip(8); // skip and chunk size
        }

        const data = parseChunk(this, chunkId);
        if (data) chunks.push({ id: chunkId, ...data });
      }
    }

    return chunks;
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
    const chunks = this.parseNode();

    const node = { id: classId, chunks };

    this.nodeStore[index] = node;
    return node;
  }

  compressedData(type: "lzo" | "zlib"): Buffer {
    const uncompressedSize = this.int32();
    const compressedSize = this.int32();

    const compressedData = this.bytes(compressedSize);

    let uncompressedData: Buffer;

    if (type === "lzo") {
      const decompressState: {
        inputBuffer: Buffer;
        outputBuffer: Buffer | null;
      } = {
        inputBuffer: compressedData,
        outputBuffer: null,
      };
      lzo1x.decompress(decompressState);
      uncompressedData = decompressState.outputBuffer as Buffer;
    } else if (type === "zlib") {
      uncompressedData = Buffer.from(pako.inflate(compressedData));
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

  list(f: () => any): any[] {
    const count = this.int32();
    const items: any[] = [];
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

  bool() {
    const value = this.uint32();
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

  skip(count: number) {
    this.parser.move(count);
  }

  goto(index: number) {
    this.parser.seek(index);
  }

  skipUntilFacade() {
    while (true) {
      const n = this.uint32();
      if (n === 0xfacade01) {
        this.skip(-4);
        return;
      }
    }
  }

  string() {
    let len = this.int32();
    return this.parser.nextString(len);
  }

  lookBackString(cannotBeCollection: boolean = false): string {
    // Lookback Baguette
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
