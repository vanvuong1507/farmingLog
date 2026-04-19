import type {Log} from '@domain/entities/Log';

export interface LogsRemoteSource {
  fetchLogsList(): Promise<Log[]>;
}
