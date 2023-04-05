class Drmbit extends Genny {
    constructor() {
        const p = [
            {type: ParamType.Select, value: "square", data:["sine", "square", "sawtooth", "triangle"], title: "wave form", description: "oscillator wave type"},
            {type: ParamType.Value, min: 60, max: 240, value: 120, title: "bpm", description: "beats per minute"},
            {type: ParamType.Slider, min: 1, max: 6, value: "3", title: "bass drum step count", description: ""},
            {type: ParamType.Slider, min: 1, max: 6, value: "4", title: "snare drum step count", description: ""},
            {type: ParamType.Slider, min: 1, max: 6, value: "5", title: "hi hat step count", description: ""},
            {type: ParamType.Select, value: "static", data:["static", "dynamic"], title: "pattern type", description: ""},
            {type: ParamType.Slider, min: 0, max: 10, value: 0, title: "delay time", description: ""},
            {type: ParamType.Slider, min: 0, max: 10, value: 0, title: "delay feedback", description: ""},
            {type: ParamType.Slider, min: 0, max: 50, value: 0, title: "reverb seconds", description: ""},
            {type: ParamType.Slider, min: 0, max: 100, value: 0, title: "reverb decay", description: ""}
        ];

        super(
            "drmbit",
            ["very basic generative drum sequencer"],
            p
        );
    }

    _OSC_TYPE_INDEX = 0;
    _BPM_INDEX = 1;
    _BD_STEPS_INDEX = 2;
    _SD_STEPS_INDEX = 3;
    _HH_STEPS_INDEX = 4;
    _HH_TYPE_INDEX = 5;
    _DT_INDEX = 6;
    _DF_INDEX = 7;
    _RS_INDEX = 8;
    _RD_INDEX = 9;

    valueToStepCount(value) {
        switch (value) {
            case "1" || 1:
                return 1;
            case "2" || 2:
                return 2;
            case "3" || 3:
                return 4;
            case "4" || 4:
                return 8;
            case "5" || 5:
                return 16;
            case "6" || 6:
                return 32;
            case "7" || 7:
                return 64;
            case "8" || 8:
                return 128;
            default:
                return 16;
        }
    }

    doValidate() {
        //this.errors.push("class not implemented");
    }

    oscillator;
    gain;
    interval;
    count = 0;
    bd;
    sn;
    hh;
    reverb;
    delay;
    feedback;

    playNote(freq, time, oscType) {
        this.oscillator = this.audioCtx.createOscillator();
        this.gain = this.audioCtx.createGain();
        this.oscillator.type = (oscType) ? oscType : 'square';
        this.oscillator.frequency.value = freq;

        this.oscillator.connect(this.gain);
        this.gain.connect(this.reverb.input);
        this.gain.connect(this.delay);
        this.gain.connect(this.audioCtx.destination);
        this.gain.gain.value = 0.25;

        this.oscillator.start(this.audioCtx.currentTime);
        this.gain.gain.exponentialRampToValueAtTime(0.00001, this.audioCtx.currentTime + time);
    }

    getBoolArr(length) {
        let ret = [];
        for (let i = 0; i < length; i++) {
            const rand = Math.random() < 0.5;
            ret.push(rand);
        }
        return ret;
    }

    getPaddedBoolArr(length, pad) {
        const arr = this.getBoolArr(length);
        const step = pad / length;

        let ret = [];
        let pos = 1;
        let count = 0;

        for (let i = 0; i < pad; i++) {
            if (pos == 1) {
                //ret.push(true);
                ret.push(arr[count]);
                count++;
            } else {
                ret.push(false);
            }

            if (pos >= step) {
                pos = 1;
            } else {
                pos++;
            }
        }
        return ret;
    }

    doStart() {
        const _MAX = 32;

        this.count = 0;

        this.bd = this.getPaddedBoolArr(this.valueToStepCount(this._params[this._BD_STEPS_INDEX].value), _MAX);
        this.sd = this.getPaddedBoolArr(this.valueToStepCount(this._params[this._SD_STEPS_INDEX].value), _MAX);
        this.hh = this.getPaddedBoolArr(this.valueToStepCount(this._params[this._HH_STEPS_INDEX].value), _MAX);

        this.reverb = new SimpleReverb(this.audioCtx, {
            seconds: this._params[this._RS_INDEX].value,
            decay: this._params[this._RD_INDEX].value,
            reverse: 0
        });

        this.reverb.connect(this.audioCtx.destination);

        this.delay = this.audioCtx.createDelay();
        this.delay.delayTime.value = (this._params[this._DT_INDEX].value / 10);

        this.feedback = this.audioCtx.createGain();
        this.feedback.gain.value = (this._params[this._DF_INDEX].value / 10);

        this.delay.connect(this.feedback);
        this.feedback.connect(this.delay);
        this.delay.connect(this.audioCtx.destination);

        const me = this;

        const fn = function () {
            if (me.bd[me.count] == 1) {
                me.playNote(55, 0.50, me._params[me._OSC_TYPE_INDEX].value);
            }
            if (me.sd[me.count] == 1) {
                me.playNote(440, 0.50, me._params[me._OSC_TYPE_INDEX].value);
            }
            if (me.hh[me.count] == 1) {
                me.playNote(1760, 0.25, me._params[me._OSC_TYPE_INDEX].value);
            }

            me.count++;

            if (me.count >= _MAX) {
                me.count = 0;
            }

            if (me._params[me._HH_TYPE_INDEX].value == "dynamic") {
                me.hh = me.getPaddedBoolArr(me.valueToStepCount(me._params[me._HH_STEPS_INDEX].value), _MAX);
            }
        }

        const bpm = this.bpmToFrequency(this._params[this._BPM_INDEX].value) / 8;
        this.interval = setInterval(fn, bpm);
    }

    doStop() {
        clearInterval(this.interval);
        this.count = 0;
    }
}
