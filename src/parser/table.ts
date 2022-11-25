import GameBoxParser from "./parser";

export interface Folder {
  name: string;
  subFolders: Folder[];
}

export interface File {
  fileName: any;
  resourceIndex: any;
  nodeIndex: number;
  useFile: number;
  folderIndex: any;
}

export interface ReferenceTable {
  ancestorLevel: number;
  folders: Folder[];
  files: File[];
}

function parseFolder(p: GameBoxParser): Folder {
  const name = p.string();
  const numSubFolders = p.uint32();

  const subFolders: Folder[] = [];

  for (let i = 0; i < numSubFolders; i++) {
    const subfolder = parseFolder(p);
    subFolders.push(subfolder);
  }

  return { name, subFolders };
}

export function parseRefTable(p: GameBoxParser): ReferenceTable | null {
  const numFiles = p.uint32();
  if (numFiles > 0) {
    const ancestorLevel = p.uint32();
    const numSubFolders = p.uint32();
    const folders: Folder[] = [];

    for (let i = 0; i < numSubFolders; i++) {
      const folder = parseFolder(p);
      folders.push(folder);
    }

    const files: File[] = [];

    for (let i = 0; i < numFiles; i++) {
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
      files.push(node);
    }

    const table = { ancestorLevel, folders, files };
    return table;
  }

  return null;
}
