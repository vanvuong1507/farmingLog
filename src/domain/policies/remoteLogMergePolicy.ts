import type {Log} from '@domain/entities/Log';

/**
 * Quy tắc merge snapshot từ server vào SQLite (offline-first).
 * - Không có bản local: luôn áp dụng remote.
 * - Remote mới hơn theo `updatedAt`: áp dụng.
 * - Remote cũ hơn: giữ local.
 * - Cùng `updatedAt` và local đang `pending` (chưa đẩy xong): giữ local để không ghi đè chỉnh sửa đang chờ sync.
 */
export function shouldApplyRemoteLogMerge(
  local: Log | null,
  remote: Log,
): boolean {
  if (!local) {
    return true;
  }
  if (remote.updatedAt > local.updatedAt) {
    return true;
  }
  if (remote.updatedAt < local.updatedAt) {
    return false;
  }
  return local.syncStatus !== 'pending';
}
