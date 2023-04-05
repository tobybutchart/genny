class Gran extends Genny {
    constructor() {
        const p = [
            {type: ParamType.File, min: 0, max: 0, value: "", title: "audio file", description: "file to play"},
            {type: ParamType.Slider, min: 1, max: 1000, value: 660, title: "volume", description: ""},
            {type: ParamType.Slider, min: 1, max: 1200, value: 1200, title: "position (1 - 1200)", description: ""},
            {type: ParamType.Slider, min: 0, max: 100, value: 40, title: "attack", description: ""},
            {type: ParamType.Slider, min: 0, max: 100, value: 40, title: "release", description: ""},
            {type: ParamType.Slider, min: 0, max: 1000, value: 85, title: "density", description: ""},
            {type: ParamType.Slider, min: 0, max: 1000, value: 46, title: "playbackRate", description: ""}
        ];

        super(
            "gran",
            ["stuff n that"],
            p
        );
    }

    doValidate() {
        if (this._params[0].value == "") {
            this.errors.push("Please select a file to play");
        }
    }

    volume = 660;
    position = 1200;
    x = 400;
    y = 400;

    attack = 0.40;
    release = 0.40;
    density = 0.85;

    playbackRate = 1;
    buffer;

    setBuffer(e) {
        const me = this;
        this.audioCtx.decodeAudioData(e.srcElement.result, function(b){
            me.buffer = b;

            let fn = function() {
                me.volume = (me._params[1].value / 1000);
                me.position = me._params[2].value;
                // me.x = me._params[3].value;
                // me.y = me._params[4].value;

                me.attack = (me._params[3].value / 100);
                me.release = (me._params[4].value / 100);
                me.density = (me._params[5].value / 100);
                //me.spread = (me._params[8].value / 100);

                me.playbackRate = (me._params[6].value / 1000) * 16;

            	me.source = me.audioCtx.createBufferSource();
            	me.source.playbackRate.value = me.source.playbackRate.value * me.playbackRate;
            	me.source.buffer = me.buffer;
            	me.gain = me.audioCtx.createGain();
            	me.source.connect(me.gain);
            	me.gain.connect(me.audioCtx.destination);
            	//me.offset = me.x * (me.buffer.duration / me.position); //pixels to seconds
                //me.amp = me.volume;

            	if(me.release < 0){
            		me.release = 0.1; // 0 - release causes mute for some reason
            	}

            	//me.randomoffset = (Math.random() * me.spread) - (me.spread / 2); //in seconds
            	//me.source.start(me.audioCtx.currentTime, Math.max(0, me.offset + me.randomoffset), me.attack + me.release); //parameters (when,offset,duration)
                me.source.start();
                me.gain.gain.setValueAtTime(0.0, me.audioCtx.currentTime);
            	me.gain.gain.linearRampToValueAtTime(me.volume, me.audioCtx.currentTime + me.attack);
            	me.gain.gain.linearRampToValueAtTime(0, me.audioCtx.currentTime + (me.attack +  me.release) );

            	me.source.stop(me.audioCtx.currentTime + me.attack + me.release + 0.1);
            	var tms = (me.attack + me.release) * 1000; //calculate the time in miliseconds

                setTimeout(function(){
            		me.gain.disconnect();
            	},tms + 200);

                me.timeout = setTimeout(fn, me.density);
            }

            fn();
            //me.togglePlayState();
        });
    }

    doStart() {
        // this.grains = [];
    	// this.grainscount = 0;

        var reader = new FileReader();

        reader.onload = this.setBuffer.bind(this);
        reader.readAsArrayBuffer(this._params[0].files[0]);
    }

    doStop() {
        clearTimeout(this.timeout);
        // this.grains = [];
        // this.grainscount = 0;
    }
}
