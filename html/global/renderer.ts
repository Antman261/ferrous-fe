type ComponentUpdater = () => void;
const updateQueue = new Set<ComponentUpdater>();

const FPS = 60;
const FRAME_LENGTH_MS = 1000 / FPS;

export const enqueueUpdate = (updater: ComponentUpdater): void => {
  updateQueue.add(updater);
  if (updateQueue.size === 1) {
    queueMicrotask(performUpdate);
  }
};

// could turn tagToHtmlElements into a generator that yields after every value, allowing interruptible updates.
// it seems very unlikely though -- this "renderer" is very light -- the browser does most the heavy lifting
const performUpdate = (): void => {
  const hasExceededFrameDuration = beginDurationTimer();
  for (const updater of updateQueue.values()) {
    updater();
    if (hasExceededFrameDuration()) {
      resumeOnNextTick();
      break;
    }
  }
};

const beginDurationTimer = () => {
  const startTime = Date.now();
  return (): boolean => Date.now() - startTime > FRAME_LENGTH_MS;
};

const resumeOnNextTick = () => setTimeout(() => queueMicrotask(performUpdate), 1);
