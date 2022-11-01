import BufferReader from "buffer-reader";
import { EventEmitter } from "events";

import { CollectionIds } from "./collection_ids";
import { Chunk, Node } from "./nodes";
import { parseRefTable, ReferenceTable } from "./table";
import { parseChunk } from "./chunk";
import { parseHeader } from "./header";

import pako from "pako";

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

  0x03092013, 0x0309201a, 0x0309201b,

  0x0310d00b, 0x0310d00c, 0x0310d010, 0x0310d011,

  0x2e009001,
];

const parsableSkippableChunks = [
  0x03092000, 0x03092005, 0x03092008, 0x03092009, 0x0309200a, 0x0309200b,
  0x03092013, 0x03092014, 0x03092017, 0x0309201d,
];

export interface Vec2 {
  x: number;
  y: number;
}

export class Vec3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(other: Vec3) {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  sub(other: Vec3) {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  mul(value: number) {
    return new Vec3(this.x * value, this.y * value, this.z * value);
  }

  div(value: number) {
    return new Vec3(this.x / value, this.y / value, this.z / value);
  }

  static zero() {
    return new Vec3(0, 0, 0);
  }
}

export interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

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

        console.log("Skipping chunk: " + chunkId.toString(16));
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

  fileRef() {
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

  color() {
    const r = this.float();
    const g = this.float();
    const b = this.float();
    return { r, g, b };
  }

  bool() {
    const value = this.int32();
    if (value > 1) throw new Error("Invalid boolean: " + value);
    return value === 1;
  }

  byte() {
    return this.parser.nextUInt8();
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

  skipUntilFacade() {
    while (true) {
      const n = this.uint32();
      if (n === 0xfacade01) return;
    }
  }

  string() {
    // [len] [string...(until len reached)]
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
      console.log(inp);
      throw new Error(
        "String not found in lookback list!. Offset: " + this.parser.tell()
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
