import Dexie, { Table } from "dexie";

export interface IAnalyzerRecord {
  index?: number;
  id: number;
  timestamp: number;
  networkState: number;
  direction: number;
  data: {[key: string]: any};
}

class AnalyzerDataDexie extends Dexie {
  public records!: Table<IAnalyzerRecord>;

  constructor() {
    super('packetlogger-analyzerData');
    this.version(1).stores({
      records: '++index, timestamp, networkState, direction, data'
    })
  }

  public clear() {
    return this.records.clear();
  }

  public getRecord(id: number) {
    return this.records.get(id);
  }

  public addBulkJson(data: IAnalyzerRecord[]) {
    return this.records.bulkAdd(data);
  }
  
  public async generateFrontViewData(): Promise<Exclude<IAnalyzerRecord, "data">[]> {
    const records = await this.records.toArray();
    return records.map(record => {
      const { data, ...rest } = record;
      return rest;
    }).sort((a, b) => {
      if (a.timestamp < b.timestamp) return -1;
      if (a.timestamp > b.timestamp) return 1;
      return 0;
    }) as Exclude<IAnalyzerRecord, "data">[];
  }
}

export const analyzerDb = new AnalyzerDataDexie();