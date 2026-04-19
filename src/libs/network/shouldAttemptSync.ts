import type {NetInfoState} from '@react-native-community/netinfo';

/**
 * Có nên **chạy pipeline sync** (Outbox / gọi API) hay không.
 *
 * Chỉ dựa vào `isConnected`: nhiều thiết bị/emulator báo `isInternetReachable === false`
 * trong khi mạng vẫn dùng được → nếu chặn theo reachability thì job pending mãi (đúng log bạn gửi).
 *
 * Trường hợp captive portal / WiFi không ra internet: vẫn cho thử sync; lỗi thật sẽ lộ
 * ở tầng HTTP + retry/backoff trên job, thay vì không bao giờ gọi.
 */
export function shouldAttemptSync(state: NetInfoState): boolean {
  return state.isConnected === true;
}
