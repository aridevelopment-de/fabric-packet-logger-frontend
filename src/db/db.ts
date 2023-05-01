import Dexie, { Table } from "dexie";
import Pako from "pako";

export interface IBaseAnalyzerRecord {
  index?: number;
  id: number;
  timestamp: number;
  networkState: number;
  direction: number;
}

interface ICompressedAnalyzerRecord extends IBaseAnalyzerRecord {
  data: ArrayBuffer;
}

export interface IAnalyzerRecord extends IBaseAnalyzerRecord {
  data: {[key: string]: any};
}

class AnalyzerDataDexie extends Dexie {
  public records!: Table<ICompressedAnalyzerRecord>;

  constructor() {
    super('packetlogger-analyzerData');
    this.version(1).stores({
      records: '++index, timestamp, networkState, direction, data'
    })
  }

  public clear() {
    return this.records.clear();
  }

  public async getRecord(id: number): Promise<IAnalyzerRecord | undefined> {
    const serializedRecord = await this.records.get(id);

    if (serializedRecord === undefined) {
      return undefined;
    }

    const record: IAnalyzerRecord = {
      ...serializedRecord,
      data: JSON.parse(Pako.inflate(serializedRecord.data, { to: 'string' }))
    }


    return record;
  }

  public addBulkJson(_data: IAnalyzerRecord[]) {
    const data = _data.map((record) => {
      // @ts-ignore
      record.data = Pako.deflate(JSON.stringify(record.data), { to: 'string' });
      return record;
    }) as any as ICompressedAnalyzerRecord[];

    return this.records.bulkAdd(data);
  }
  
  public async generateFrontViewData(): Promise<IBaseAnalyzerRecord[]> {
    const records = await this.records.toArray();
    return records.map(record => {
      const { data, ...rest } = record;
      return rest;
    }).sort((a, b) => {
      if (a.timestamp < b.timestamp) return -1;
      if (a.timestamp > b.timestamp) return 1;
      return 0;
    }) as IBaseAnalyzerRecord[];
  }
}

export const analyzerDb = new AnalyzerDataDexie();