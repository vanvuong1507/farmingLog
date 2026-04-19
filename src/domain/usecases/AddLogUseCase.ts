import type {LogRepository} from '@domain/usecases/LogRepository';
import type {UpsertLogInput} from '@domain/entities/Log';

export class AddLogUseCase {
  constructor(private readonly repository: LogRepository) {}

  execute(input: UpsertLogInput) {
    return this.repository.addLog(input);
  }
}
