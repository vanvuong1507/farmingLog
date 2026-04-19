/**
 * @jest-environment node
 */
import {BaseApi} from '../src/data/api/core/BaseApi';

class TestApi extends BaseApi {
  runSimulate(ms: number) {
    return this.simulateRequest(ms);
  }
}

describe('BaseApi.simulateRequest', () => {
  it('schedules resolve after delayMs', async () => {
    const spy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((fn: TimerHandler) => {
        if (typeof fn === 'function') {
          fn();
        }
        return 0 as unknown as ReturnType<typeof setTimeout>;
      });
    const api = new TestApi();
    await expect(api.runSimulate(250)).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalledWith(expect.any(Function), 250);
    spy.mockRestore();
  });
});
