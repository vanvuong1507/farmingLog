import type {LogRepository} from '@domain/usecases/LogRepository';

export class ListLogsUseCase {
  constructor(private readonly repository: LogRepository) {}

  execute() {
    return this.repository.listLogs();
  }
}
