import GameBoxParser from "./parser";
import { Node } from "./types";

export function parseHeader(p: GameBoxParser): Node {
  p.skip(3); // skip GBX

  const version = p.uint16();
  const format = p.byte();
  p.tableCompressed = p.byte() === 67;
  p.bodyCompressed = p.byte() === 67;

  p.skip(1); // skip unknown

  const classId = p.uint32();

  const userDataSize = p.uint32();

  let chunks: any[] = [];

  if (userDataSize > 0) {
    let numHeaderChunks = p.uint32();
    let headerChunks: {
      [index: number | string]: number;
    } = {};

    // Parse chunks (extract from header).
    for (var chunkNr = 0; chunkNr < numHeaderChunks; chunkNr++) {
      const chunkId = p.uint32();
      const chunkSize = p.uint32();
      headerChunks[chunkId] = chunkSize & ~0x80000000;
    }

    chunks = Object.keys(headerChunks).map((chunkId) => {
      const chunk = parseHeaderChunk(p, chunkId, headerChunks[chunkId]);

      // Clear Lookback
      p.resetLookBackStrings();

      return chunk;
    });
  }

  const numNodes = p.uint32();

  return { classId, chunks };
}

function parseHeaderChunk(p: GameBoxParser, id: string, size: number) {
  switch (id) {
    case "50606082": // 0x03043002
      return _parseC1(p, size);
    case "50606083": // 0x03043003
      return _parseC2(p, size);
    case "50606084": // 0x03043004
      return _parseC3(p, size);
    case "50606085": // 0x03043005
      return _parseC4(p, size);
    case "50606087": // 0x03043007
      return _parseC5(p, size);
    case "50606088": // 0x03043008
      return _parseC6(p, size);

    default: // Skip by default (when not found).
      p.skip(size);
  }
}

/**
 * Parse First Chunk, time and attribute information in it.
 * Part name 'basic'.
 * Chunk '50606082' (0x03043002)
 *
 * @param size
 * @returns {Promise}
 * @private
 */
function _parseC1(p: GameBoxParser, size: number) {
  let version = p.byte();

  p.skip(4);

  const time = {
    bronze: p.uint32(),
    silver: p.uint32(),
    gold: p.uint32(),
    author: p.uint32(),
  };

  const price = p.uint32();
  const isMultilap = p.bool();
  const type = p.uint32();

  p.skip(4);

  const authorScore = p.uint32();
  const editor = p.uint32() === 1 ? "simple" : "advanced";

  p.skip(4);

  const checkpoints = p.uint32();
  const laps = p.uint32();

  return {
    version,
    time,
    price,
    isMultilap,
    type,
    authorScore,
    editor,
    checkpoints,
    laps,
  };
}

/**
 * Parse Second Chunk, extended map informations, mostly general/technical.
 * Part name 'basic'.
 * Chunk '50606083' (0x03043003)
 *
 * @param size
 * @returns {Promise}
 * @private
 */
function _parseC2(p: GameBoxParser, size: number) {
  let version = p.byte();

  const uid = p.lookBackString();
  const environment = p.lookBackString();
  const authorLogin = p.lookBackString();
  const name = p.string();

  p.skip(5);
  p.string(); // I don't want that on my baguette!

  const mood = p.lookBackString();
  const decorationEnvironment = {
    id: p.lookBackString(),
    author: p.lookBackString(),
  };

  p.skip(4 * 4 + 16);

  const mapType = p.string();
  const style = p.string();

  p.skip(9);

  const title = p.lookBackString();

  return {
    version,
    uid,
    environment,
    authorLogin,
    name,
    mood,
    decorationEnvironment,
    mapType,
    style,
    title,
  };
}

/**
 * Parse Chunk 3. (skip)
 * Chunk '50606084' (0x03043004)
 *
 * @param size
 * @returns {Promise}
 * @private
 */
function _parseC3(p: GameBoxParser, size: number) {
  let version = p.byte();

  p.skip(size - 1);

  return { version };
}

/**
 * Parse Chunk 4. Header XML
 * Chunk '50606085' (0x03043005)
 *
 * @param size
 * @returns {Promise}
 * @private
 */
function _parseC4(p: GameBoxParser, size: number) {
  const xml = p.string();
  return { xml };
}

/**
 * Parse Chunk 5. Thumb + Comment
 * Chunk '50606087' (0x03043007)
 *
 * @param size
 * @returns {Promise}
 * @private
 */
function _parseC5(p: GameBoxParser, size: number) {
  let thumb;
  let comment = "";

  if (p.uint32() === 1) {
    // Has Thumb.
    let thumbSize = p.uint32();
    p.skip(15); // Begin thumb xml tag

    thumb = p.bytes(thumbSize);

    p.skip(16); // </Thumbnail.jpg>
    p.skip(10); // <Comments>

    let commentSize = p.uint32();
    if (commentSize > 0) {
      comment = p.parser.nextString(commentSize);
    }

    p.skip(11); // </Comments>
  } else {
    p.skip(size - 4);
  }

  return { thumb, comment };
}

/**
 * Parse Chunk 6. Author information.
 * Chunk '50606088' (0x03043008)
 *
 * @param size
 * @returns {Promise}
 * @private
 */
function _parseC6(p: GameBoxParser, size: number) {
  let version = p.uint32();

  const author = {
    version: p.uint32(),
    login: p.string(),
    nickname: p.string(),
    zone: p.string(),
    extra: p.string(),
  };

  return { version, author };
}
