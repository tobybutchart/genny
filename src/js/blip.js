const _C4 = 261.63;
const _A4 = 440.0;

const Frequency = {
    a: 440.0,
    b: 493.88,
    c: 261.63,
    d: 293.66,
    e: 329.63,
    f: 349.23,
    g: 392.00
};

class Blip extends Genny {
    constructor() {
        const p = [
            {type: ParamType.Select, value: "", data:["sine", "square", "sawtooth", "triangle"], title: "wave form", description: "oscillator wave type"},
            {type: ParamType.Select, value: "", data:["a", "b", "c", "d", "e", "f", "g"], title: "base note", description: ""},
            {type: ParamType.Select, value: "", data:["major", "minor", "ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"], title: "mode", description: "mode to select notes from"},
            {type: ParamType.Slider, min: 1, max: 10, value: 5, title: "notes", description: "amount of notes to spawn"},
            {type: ParamType.Slider, min: 1, max: 8, value: 1, title: "note length", description: "duration of each note (increases by 1/4 second)"},
            {type: ParamType.Range, min: 500, max: 10000, value: 0, title: "timing", description: "min and max values to select each node's loop time from"},
            {type: ParamType.Slider, min: 0, max: 10, value: 4, title: "delay time", description: ""},
            {type: ParamType.Slider, min: 0, max: 10, value: 3, title: "delay feedback", description: ""},
            {type: ParamType.Slider, min: 0, max: 50, value: 3, title: "reverb seconds", description: ""},
            {type: ParamType.Slider, min: 0, max: 100, value: 2, title: "reverb decay", description: ""}
        ];

        super(
            "blip",
            ["[blip] spawns individual notes that loop in a fixed time period, producing interesting polyrhythms",
            "Notes are chosen from the selected mode, and are weighted to more commonly used notes in the mode (i.e., tonics and dominants will be prefered over second intervals, etc.)"],
            p
        );
    }

    master;
    delay;
    feedback;
    reverb;
    blips = [];
    notes = [];
    oscillatorGains = [];

    _WAVE_INDEX = 0;
    _NOTES_INDEX = 3;
    _LENGTH_INDEX = 4;
    _TIMING_INDEX = 5;

    spawnNode(wait, blip) {
        console.log(blip);

        let sn = () => {
            if (this._state != State.Playing) {
                return false;
            }

            const length = this._params[this._LENGTH_INDEX].value * 0.25;

            const osc = this.audioCtx.createOscillator();
            osc.type = this._params[this._WAVE_INDEX].value;
            osc.frequency.value = this.notes[blip.noteIndex];

            const gain = this.audioCtx.createGain();
            gain.value = 0.25;
            osc.connect(gain);

            gain.connect(this.master);
            gain.connect(this.delay);

            osc.onended = this.spawnNode(true, blip);
            osc.start(this.audioCtx.currentTime);
            osc.stop(this.audioCtx.currentTime + length);
            //stop click/pops
            gain.gain.setTargetAtTime(0, this.audioCtx.currentTime + length - 0.05, 0.05);
        }

        if (wait) {
            setTimeout(sn, blip.duration);
        } else {
            sn();
        }
    }

    doStart() {
        const _NOTE_INDEX = 1;
        const _KEY_INDEX = 2;
        const _DELAY_TIME_INDEX = 6;
        const _DELAY_FEED_INDEX = 7;
        const _VERB_S_INDEX = 8;
        const _VERB_D_INDEX = 9;

        const freq = Frequency[this._params[_NOTE_INDEX].value];

        this.blips = [];

        switch (this._params[_KEY_INDEX].value) {
            case "major":
                this.notes = this.getNotes(freq, Modes.Major);
                break;
            case "minor":
                this.notes = this.getNotes(freq, Modes.Minor);
                break;
            case "ionian":
                this.notes = this.getNotes(freq, Modes.Ionian);
                break;
            case "dorian":
                this.notes = this.getNotes(freq, Modes.Dorian);
                break;
            case "phrygian":
                this.notes = this.getNotes(freq, Modes.Phrygian);
                break;
            case "lydian":
                this.notes = this.getNotes(freq, Modes.Lydian);
                break;
            case "mixolydian":
                this.notes = this.getNotes(freq, Modes.Mixolydian);
                break;
            case "aeolian":
                this.notes = this.getNotes(freq, Modes.Aeolian);
                break;
            case "locrian":
                this.notes = this.getNotes(freq, Modes.Locrian);
                break;
            default:
                this.notes = this.getNotes(freq, Modes.Major);
        }

        for (let i = 0; i < this._params[this._NOTES_INDEX].value; i++) {
            // const freq = this.getIntFromRange(0, this.notes.length - 1);
            const noteIndex = this.getNoteIndex(this.notes)
            const duration = this.getIntFromRange(this._params[this._TIMING_INDEX].min, this._params[this._TIMING_INDEX].max);
            const blip = {index: i, noteIndex: noteIndex, duration: duration};
            this.blips.push(blip);
        }

        this.reverb = new SimpleReverb(this.audioCtx, {
            seconds: this._params[_VERB_S_INDEX].value,
            decay: this._params[_VERB_D_INDEX].value,
            reverse: 0
        });

        this.master = this.audioCtx.createGain();
        this.master.gain.value = 0.25;// - (this._params[this._NOTES_INDEX].value * 0.09);

        this.delay = this.audioCtx.createDelay();
        this.delay.delayTime.value = (this._params[_DELAY_TIME_INDEX].value / 10);

        this.feedback = this.audioCtx.createGain();
        this.feedback.gain.value = (this._params[_DELAY_FEED_INDEX].value / 10);// * 0.25;

        this.master.connect(this.audioCtx.destination);
        this.reverb.connect(this.master);
        this.master.connect(this.reverb.input);
        this.delay.connect(this.feedback);
        this.delay.connect(this.master);
        this.feedback.connect(this.delay);

        for (let i = 0; i < this._params[this._NOTES_INDEX].value; i++) {
            this.spawnNode((i != 0), this.blips[i]);
        }
    }

    doStop() {
        this.master = null;
        this.delay = null;
        this.feedback = null;
        this.reverb = null;
        this.blips = [];
        this.notes = [];
        this.oscillatorGains = [];
    }
}
