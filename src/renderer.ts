// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

enum TimerState {
  INITIALIZED,
  PAUSED,
  RUNNING,
}

class Note {
  constructor(readonly elapsedTiming: Timing, readonly laps: Timing[]) {}
}

type Notifier = (note: Note) => void;

class Timing {
  constructor(
    readonly hours: number,
    readonly mins: number,
    readonly secs: number,
    readonly millis: number
  ) {}

  public toString(): string {
    return `${this.hours} :: ${this.mins} :: ${this.secs} :: ${this.millis}`;
  }
}

function createTiming(elapsedMillis: number): Timing {
  let delta = elapsedMillis;
  const millis = delta % 1000;
  delta = Math.trunc(delta / 1000);
  const secs = delta % 60;
  delta = Math.trunc(delta / 60);
  const mins = delta % 60;
  delta = Math.trunc(delta / 60);
  const hours = delta;
  return new Timing(hours, mins, secs, millis);
}

class Timer {
  state: TimerState;
  private intervalId: NodeJS.Timer;
  private refEpochMillis: number;
  private initialElapsedMillis: number;
  private laps: Timing[];

  constructor(
    readonly notifFreqMillis: number,
    readonly notifiers: Notifier[]
  ) {
    this.state = TimerState.INITIALIZED;
    this.intervalId = undefined;
    this.refEpochMillis = undefined;
    this.initialElapsedMillis = 0;
    this.laps = [];
  }

  public control(): TimerState {
    switch (this.state) {
      case TimerState.RUNNING:
        return this.pause();
      default:
        return this.resume();
    }
  }

  private resume(): TimerState {
    this.refEpochMillis = Date.now();
    this.intervalId = setInterval(() => {
      const note = new Note(this.elapsed(), this.laps);
      this.notifiers.forEach((_) => _(note));
    }, this.notifFreqMillis);
    this.state = TimerState.RUNNING;
    return this.state;
  }

  private pause(): TimerState {
    const currEpochMillis = Date.now();
    this.initialElapsedMillis += currEpochMillis - this.refEpochMillis;
    this.refEpochMillis = undefined;
    clearInterval(this.intervalId);
    this.intervalId = undefined;
    this.state = TimerState.PAUSED;
    return this.state;
  }

  public reset(): TimerState {
    this.initialElapsedMillis = 0;
    this.refEpochMillis = undefined;
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.laps.length = 0;
    this.state = TimerState.INITIALIZED;
    const note = new Note(this.elapsed(), this.laps);
    this.notifiers.forEach((_) => _(note));
    return this.state;
  }

  public lap() {
    console.log("TBD")
  }

  private elapsed(): Timing {
    const currEpochMillis = Date.now();
    let elapsedMillis = this.initialElapsedMillis;
    if (this.refEpochMillis !== undefined) {
      elapsedMillis += currEpochMillis - this.refEpochMillis;
    }
    return createTiming(elapsedMillis);
  }
}

class ClockRenderer {
  private hhElement: HTMLElement;
  private mmElement: HTMLElement;
  private ssElement: HTMLElement;
  private msElement: HTMLElement;

  constructor() {
    this.hhElement = document.getElementById("hh-display");
    this.mmElement = document.getElementById("mm-display");
    this.ssElement = document.getElementById("ss-display");
    this.msElement = document.getElementById("ms-display");
  }

  public render(timing: Timing) {
    this.hhElement.innerText = timing.hours.toString().padStart(2, "0");
    this.mmElement.innerText = timing.mins.toString().padStart(2, "0");
    this.ssElement.innerText = timing.secs.toString().padStart(2, "0");
    this.msElement.innerText = timing.millis.toString().padStart(3, "0");
  }
}

const ZERO_TIMING = createTiming(0);
const resetButton = document.getElementById("reset");
const controlButton = document.getElementById("control");
const lapButton = document.getElementById("lap");
const stateToControlValueMap = new Map<TimerState, string>([
  [TimerState.RUNNING, "pause"],
  [TimerState.PAUSED, "resume"],
  [TimerState.INITIALIZED, "start"],
]);

const clockRenderer = new ClockRenderer();
function timingListener(note: Note) {
  clockRenderer.render(note.elapsedTiming);
}
const timer = new Timer(100, [timingListener]);

// setup initial state of elements
clockRenderer.render(ZERO_TIMING);
controlButton.innerText = stateToControlValueMap.get(timer.state);

// attach event listeners
resetButton.addEventListener("click", () => {
  controlButton.innerText = stateToControlValueMap.get(timer.reset());
});

controlButton.addEventListener("click", () => {
  controlButton.innerText = stateToControlValueMap.get(timer.control());
});

lapButton.addEventListener("click", () => {
  timer.lap();
});
