import BackgroundFetch from 'react-native-background-fetch';

type SyncHandler = () => Promise<void>;

export class BackgroundScheduler {
  async start(task: SyncHandler): Promise<void> {
    await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15,
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
      },
      async taskId => {
        await task();
        BackgroundFetch.finish(taskId);
      },
      taskId => BackgroundFetch.finish(taskId),
    );
  }
}
