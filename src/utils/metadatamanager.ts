import axios from "axios";

const HOST_URL = "https://raw.githubusercontent.com/aridevelopment-de/fabric-packet-logger-metadata/main/";
const INDEX_FILE = HOST_URL + "index.json";

export interface PacketMetadata {
  url: string;
  name: string;
  description: string;
  notes: string | null;
  fields: {
    [key: string]: string;
  }
}

export interface Metadata {
  clientbound: {
    play: {
      [key: string]: PacketMetadata;
    },
    status: {
      [key: string]: PacketMetadata;
    },
    login: {
      [key: string]: PacketMetadata;
    },
  },
  serverbound: {
    play: {
      [key: string]: PacketMetadata;
    },
    status: {
      [key: string]: PacketMetadata;
    },
    login: {
      [key: string]: PacketMetadata;
    },
    handshaking: {
      [key: string]: PacketMetadata;
    },
  }
}

class MetadataManager {
  private LS_HASH_KEY = "packetlogger-metadata-hash";
  private LS_METADATA_KEY = "packetlogger-metadata";
  private metadata: Metadata | null = null;

  private getHash(): string {
    return localStorage.getItem(this.LS_HASH_KEY) || "";
  }

  private updateLocalstorage(hash: string, metadata: Metadata): void {
    console.info("Updated metadata cache. (Hash: " + hash + ")");
    localStorage.setItem(this.LS_HASH_KEY, hash);
    localStorage.setItem(this.LS_METADATA_KEY, JSON.stringify(metadata));
  }

  private async isCacheOutdated(): Promise<{isOutdated: false} | {isOutdated: true, location: string, hash: string}> {
    const index = await axios.get(INDEX_FILE, { validateStatus: () => true });

    if (index.status !== 200) {
      console.error("Failed to fetch metadata index. Status: " + index.status);
      /* fallback */
      return { isOutdated: false };
    }

    const hash = this.getHash();

    if (index.data.hash === hash) {
      return { isOutdated: false };
    }

    return { isOutdated: true, location: HOST_URL + index.data.filename, hash: index.data.hash };
  }

  public async fetchMetadata(): Promise<boolean> {
    const data = await this.isCacheOutdated();

    if (!data.isOutdated) {
      this.metadata = JSON.parse(localStorage.getItem(this.LS_METADATA_KEY) || "{}") as Metadata;
      return false;
    }

    const metadata = await axios.get(data.location, { validateStatus: () => true });

    if (metadata.status !== 200) {
      console.error("Failed to fetch metadata. Status: " + metadata.status);
      this.metadata = JSON.parse(localStorage.getItem(this.LS_METADATA_KEY) || "{}") as Metadata;
      return false;
    }

    this.updateLocalstorage(data.hash, metadata.data);
    this.metadata = metadata.data;
    return true;
  }

  public async getMetadata(): Promise<Metadata | null> {
    // TODO: Make promise
    if (this.metadata === null) {
      console.info("Metadata is not loaded yet. Trying to load metadata...");
      await this.fetchMetadata();
      return null;
    }

    return this.metadata;
  }
}

export const metadataManager = new MetadataManager();