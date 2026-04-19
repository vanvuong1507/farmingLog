import {LogsDao} from '@data/db/LogsDao';
import {SyncJobsDao} from '@data/db/SyncJobsDao';
import {LogsApi} from '@data/api/logs/LogsApi';
import {LogsRepositoryImpl} from '@data/repository/LogsRepositoryImpl';
import {SyncJobRepositoryImpl} from '@data/repository/SyncJobRepositoryImpl';
import {AddLogUseCase} from '@domain/usecases/AddLogUseCase';
import {EditLogUseCase} from '@domain/usecases/EditLogUseCase';
import {RefreshLogsUseCase} from '@domain/usecases/RefreshLogsUseCase';
import {OutboxSyncEngine} from '@services/sync/OutboxSyncEngine';
import {BackgroundScheduler} from '@services/background/BackgroundScheduler';

const logsDao = new LogsDao();
const syncJobsDao = new SyncJobsDao();
const syncJobRepository = new SyncJobRepositoryImpl(syncJobsDao);
const repository = new LogsRepositoryImpl(logsDao, syncJobRepository);

const logsApi = new LogsApi();

export const dependencies = {
  addLogUseCase: new AddLogUseCase(repository),
  editLogUseCase: new EditLogUseCase(repository),
  refreshLogsUseCase: new RefreshLogsUseCase(repository, logsApi),
  logsApi,
  syncEngine: OutboxSyncEngine.create({
    logRepository: repository,
    syncJobRepository,
    apis: {logsApi},
  }),
  backgroundScheduler: new BackgroundScheduler(),
};
