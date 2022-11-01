import MapParser from "./parser";

export interface Folder {
  name: string;
  subFolders: Folder[];
}

export interface ExternalNode {
  fileName: any;
  resourceIndex: any;
  nodeIndex: number;
  useFile: number;
  folderIndex: any;
}

export interface ReferenceTable {
  ancestorLevel: number;
  folders: Folder[];
  externalNodes: ExternalNode[];
}

function parseFolder(p: MapParser): Folder {
  const name = p.string();
  const numSubFolders = p.uint32();

  const subFolders: Folder[] = [];

  for (let i = 0; i < numSubFolders; i++) {
    const subfolder = parseFolder(p);
    subFolders.push(subfolder);
  }

  return { name, subFolders };
}

export function parseRefTable(p: MapParser): ReferenceTable | null {
  const numExternalNodes = p.uint32();
  if (numExternalNodes > 0) {
    const ancestorLevel = p.uint32();
    const numSubFolders = p.uint32();
    const folders: Folder[] = [];

    for (let i = 0; i < numSubFolders; i++) {
      const folder = parseFolder(p);
      folders.push(folder);
    }

    const externalNodes: ExternalNode[] = [];

    for (let i = 0; i < numExternalNodes; i++) {
      const flags = p.uint32();

      let fileName, resourceIndex, folderIndex;

      if ((flags & 4) === 0) {
        fileName = p.string();
      } else {
        resourceIndex = p.uint32();
      }

      const nodeIndex = p.uint32();
      const useFile = p.uint32();

      if ((flags & 4) === 0) {
        folderIndex = p.uint32();
      }

      const node = {
        fileName,
        resourceIndex,
        nodeIndex,
        useFile,
        folderIndex,
      };
      externalNodes.push(node);
    }

    const table = { ancestorLevel, folders, externalNodes };
    return table;
  }

  return null;
}
