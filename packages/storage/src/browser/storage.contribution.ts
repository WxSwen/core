import { Domain, StorageResolverContribution, URI, IStorage, ClientAppContribution } from '@ali/ide-core-browser';
import { Autowired } from '@ali/common-di';
import { DatabaseStorage } from './storage';
import { DatabaseStorageServerPath, IDatabaseStorageServer } from '../common';
import { IWorkspaceService } from '@ali/ide-workspace';

@Domain(StorageResolverContribution, ClientAppContribution)
export class DatabaseStorageContribution implements StorageResolverContribution, ClientAppContribution {

  @Autowired(DatabaseStorageServerPath)
  database: IDatabaseStorageServer;

  @Autowired(IWorkspaceService)
  workspaceService: IWorkspaceService;
  storage: IStorage;

  async resolve(storageId: URI) {
    const storageName = storageId.authority;
    if (storageId.scheme !== 'db') {
      return;
    }
    const storage: IStorage = new DatabaseStorage(this.database, this.workspaceService, storageName);
    // 等待后台存储模块初始化数据
    await storage.whenReady;

    this.storage = storage;

    return storage;
  }

  onReconnect() {
    if (this.storage) {
      this.storage.reConnectInit();

    }
  }
}
