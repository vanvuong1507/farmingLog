import type {LogRepository} from '@domain/usecases/LogRepository';
import type {UpsertLogInput} from '@domain/entities/Log';

export class EditLogUseCase {
  constructor(private readonly repository: LogRepository) {}

  execute(id: string, input: UpsertLogInput) {
    return this.repository.editLog(id, input);
  }
}
