class Airport extends Genny {
    constructor() {
        const p = [
            {type: ParamType.Select, value: "", data:["sine", "square", "sawtooth", "triangle"], title: "wave form", description: "oscillator wave type"},
            {type: ParamType.Value, min: 0, max: 20000, value: 220, title: "note", description: "base note frequency (hz)"},
            {type: ParamType.Slider, min: 1, max: 10, value: 3, title: "notes", description: "how many notes to spawn"},
            {type: ParamType.Range, min: 0, max: 100, value: 0, title: "detune (cents)", description: "range to detune oscillators by (random)"},
            {type: ParamType.Range, min: 0.001, max: 0.1, value: 0, title: "lfo range", description: "lfo range (random)"},
            {type: ParamType.Slider, min: 0, max: 50, value: 3, title: "reverb seconds", description: ""},
            {type: ParamType.Slider, min: 0, max: 100, value: 2, title: "reverb decay", description: ""}
        ];

        super(
            "airport",
            ["inspired by Brian Eno's <i>Music for Airports</i>",
            "[airport] will play continuous drones that are marginally out of tune, producing an almost hypnotic effect",
            "<a href='https://en.wikipedia.org/wiki/Ambient_1:_Music_for_Airports'>Music for Airports</a>"],
            p
        );
    }

    oscillators = [];
    lfos = [];
    oscillatorGains = [];
    modulatorGains = [];
    reverb;

    doStart() {
        const _WAVE_INDEX = 0;
        const _NOTE_INDEX = 1;
        const _NOTES_INDEX = 2;
        const _DETUNE_INDEX = 3;
        const _LFO_INDEX = 4;
        const _VERB_S_INDEX = 5;
        const _VERB_D_INDEX = 6;

        this.reverb = new SimpleReverb(this.audioCtx, {
            seconds: this._params[_VERB_S_INDEX].value,
            decay: this._params[_VERB_D_INDEX].value,
            reverse: 0
        });

        for (let i = 0; i < this._params[_NOTES_INDEX].value; i++) {
            const note = this._params[_NOTE_INDEX].value;
            const detune = this.getIntFromRange(this._params[_DETUNE_INDEX].min, this._params[_DETUNE_INDEX].max);
            const speed = this.getFloatFromRange(this._params[_LFO_INDEX].min, this._params[_LFO_INDEX].max);

            console.log(`oscillatorNode[${i}] note: ${note}`);
            console.log(`oscillatorNode[${i}] detune: ${detune}`);
            console.log(`oscillatorNode[${i}] speed: ${speed}`);

            this.oscillators[i] = this.audioCtx.createOscillator();
            this.oscillators[i].frequency.value = note;
            this.oscillators[i].detune.value = detune;
            this.oscillators[i].type = this._params[_WAVE_INDEX].value;

            this.oscillatorGains[i] = this.audioCtx.createGain();
            this.oscillatorGains[i].gain.value = 0.1;
            this.oscillatorGains[i].connect(this.reverb.input);

            this.oscillators[i].connect(this.oscillatorGains[i]);
            this.oscillatorGains[i].connect(this.audioCtx.destination);

            this.lfos[i] = this.audioCtx.createOscillator();
            this.lfos[i].frequency.value = speed;
            this.modulatorGains[i] = this.audioCtx.createGain();
            this.modulatorGains[i].gain.value = 0.1;//1 - (0.1 * this._params[_NOTES_INDEX].value);
            this.lfos[i].connect(this.modulatorGains[i]);
            this.modulatorGains[i].connect(this.oscillatorGains[i].gain);
        }

        this.reverb.connect(this.audioCtx.destination);

        for (let i = 0; i < this._params[_NOTES_INDEX].value; i++) {
            this.oscillators[i].start();
            this.lfos[i].start();
        }

        //console.log(this.oscillators);
    }

    doStop() {
        for (let i = 0; i < this.oscillators.length; i++) {
            this.oscillatorGains[i].gain.setTargetAtTime(0, this.audioCtx.currentTime + 0.25, 0.05);
            //this.oscillators[i].stop();
        }

        for (let i = 0; i < this.lfos.length; i++) {
            this.modulatorGains[i].gain.setTargetAtTime(0, this.audioCtx.currentTime + 0.25, 0.05);
            //this.lfos[i].stop();
        }

        this.oscillators = [];
        this.lfos = [];
        this.oscillatorGains = [];
        this.modulatorGains = [];
    }
}
