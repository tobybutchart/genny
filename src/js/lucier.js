class Lucier extends Genny {
    constructor() {
        const p = [
            {type: ParamType.File, min: 0, max: 0, value: "", title: "audio file", description: "file to play"},
            {type: ParamType.Slider, min: 1, max: 100, value: 5, title: "speed offset", description: ""},
            {type: ParamType.Slider, min: 2, max: 10, value: 2, title: "nodes", description: ""},
        ];

        super(
            "lucier",
            ["inspired by Alvin Lucier's <i>I Am Sitting in a Room</i>",
            "[lucier] will spwan a fixed amount of audio nodes that play a chosen audio file, changing the playback rate on each loop",
            "works best with spoken word sounds",
            "<a href='https://en.wikipedia.org/wiki/I_Am_Sitting_in_a_Room'>I Am Sitting in a Room</a>"],
            p
        );
    }

    doValidate() {
        if (this._params[0].value == "") {
            this.errors.push("Please select a file to play");
        }
    }

    sourceNodes = [];
    audioNodes = [];

    initEventListeners() {
        window.addEventListener('load', this.onLoad.bind(this), false);

        for(let i = 0; i < this.audioNodes.length; i++) {
            //first node is fixed
            if (i == 0) {
                this.audioNodes[i].addEventListener('ended', function() {
                    if (this.firstPlay == "true") {
                        this.volume = 1 - (this.dataset.nodeCount * 0.1);
                        this.firstPlay = false;
                    } else {
                        this.volume = 1;
                    }

                    this.currentTime = 0;
                    this.playbackRate = 1;

                    console.log(`audiNode[${this.dataset.index}]: static playback rate of ${this.playbackRate}`);
                    this.play();
                }, false);
            } else {
                this.audioNodes[i].addEventListener('ended', function() {
                    if (this.firstPlay == "true") {
                        this.volume = 1 - (this.dataset.nodeCount * 0.1);
                        this.firstPlay = false;
                    } else {
                        this.volume = 1;
                    }
                    
                    this.currentTime = 0;

                    if (this.dataset.speedUp == "true" && this.playbackRate < 16) {
                        console.log(`audiNode[${this.dataset.index}]: speeding up by ${this.playbackRate}`);
                    } else {
                        console.log(`audiNode[${this.dataset.index}]: slowing down by ${this.playbackRate}`);
                        this.dataset.speedUp = false;

                        if (this.playbackRate <= 1) {
                            this.dataset.speedUp = true;
                        }
                    }

                    if (this.dataset.speedUp == "true") {
                        const n = this.playbackRate + Number(this.dataset.speedOffset);
                        this.playbackRate = (n > 16) ? 16 : n;
                    } else {
                        const n = this.playbackRate - Number(this.dataset.speedOffset);
                        this.playbackRate = (n < 1) ? 1 : n;
                    }

                    this.play();
                }, false);
            }
        }
    }

    play() {
        for(let i = 0; i < this.audioNodes.length; i++) {
            this.audioNodes[i].src = URL.createObjectURL(this._params[0].files[0]);
            this.audioNodes[i].playbackRate = 1;
            this.audioNodes[i].play();
        }
    }

    onLoad() {
        this.sourceNodes = [];

        for(let i = 0; i < this.audioNodes.length; i++) {
            this.sourceNodes.push(this.audioCtx.createMediaElementSource(this.audioNodes[i]));
            this.audioNodes[i].connect(this.audioCtx.destination);
        }
    }

    doStart() {
        this.audioNodes = [];

        for(let i = 0; i < this._params[2].value; i++) {
            this.audioNodes.push(new Audio());
            this.audioNodes[i].dataset.speedOffset = (this._params[1].value * + 0.01) * i;
            this.audioNodes[i].dataset.speedUp = true;
            this.audioNodes[i].dataset.nodeCount = this._params[2].value;
            this.audioNodes[i].dataset.index = i;
            this.audioNodes[i].dataset.firstPlay = true;
        }

        this.initEventListeners();
        this.play();
    }

    doStop() {
        for(let i = 0; i < this.audioNodes.length; i++) {
            this.audioNodes[i].pause();
        }
        this.audioNodes = [];
    }
}
