export class BaseApi {
  protected async simulateRequest(delayMs = 200): Promise<void> {
    await new Promise<void>(resolve => {
      setTimeout(resolve, delayMs);
    });
  }
}
