const ParamType = {
    Range: 0,
    Slider: 1,
    Value: 2,
    Check: 3,
    File: 4,
    Select: 5
};

const State = {
    NotPlaying: 0,
    Playing: 1
};

const Modes = {
    Major: 0,
    Minor: 1,
    Ionian: 2,
    Dorian: 3,
    Phrygian: 4,
    Lydian: 5,
    Mixolydian: 6,
    Aeolian: 7,
    Locrian: 8,
};

class Genny {
    constructor(title, description, params) {
        this._title = title;
        this._description = description;
        this._params = params;
        this._state = State.NotPlaying;

        //HTML elements
        this._parent = document.getElementById(`col-genny-${this._title}`);
        this._header = null;
        this._ctrlContainer = null;
        this._btnContainer = null;
        this._btnStart = null;

        if (!this._parent) {
            throw new Error(`col-genny-${this._title} does not exist`);
        }

        this.init();
        this.paramsToControls();
    }

    audioCtx;

    init() {
        this._header = document.createElement('h2');
        this._header.innerHTML = `[${this._title}]`;
        this._parent.appendChild(this._header);

        this._ctrlContainer = document.createElement('div');
        this._ctrlContainer.innerHTML = "";
        this._ctrlContainer.classList.add("div-genny");
        this._ctrlContainer.style.backgroundImage = `url('img/${this._title}.jpg')`;
        this._ctrlContainer.style.backgroundRepeat = "no-repeat";
        this._ctrlContainer.style.backgroundPosition = "center";
        this._ctrlContainer.style.backgroundSize = "cover";
        this._parent.appendChild(this._ctrlContainer);

        this._btnStart = document.createElement('button');
        this._btnStart.innerHTML = "[start]";
        this._btnStart.onclick = this.togglePlayState.bind(this);

        this._btnContainer = document.createElement('div');
        this._btnContainer.classList.add("btn-container-genny");
        this._btnContainer.appendChild(this._btnStart);
        this._parent.appendChild(this._btnContainer);
    }

    togglePlayState() {
        if (this._state == State.NotPlaying) {
            this.start();
        } else if (this._state == State.Playing) {
            this.stop();
        }
    }

    sanitiseId(id) {
        return id.replaceAll(' ', '-');
    }

    getInfo() {
        let s = `<h3>${this._title}</h3>`;

        this._description.forEach(function(description, index) {
            s += `<p>${description}</p>`;
        });

        s += `<h4>Parameters</h4><ul style='text-align: left;'>`;

        this._params.forEach(function(param, index) {
            if (param.description) {
                s += `<li>${param.title}:&nbsp;${param.description}</li>`;
            } else {
                s += `<li>${param.title}</li>`;
            }
        });

        s += `</ul>`;
        s = s.replaceAll("'", "&apos;");
        return s;
    }

    showValue(id, value) {
        const e = document.getElementById(id);

        if (e) {
            e.innerHTML += value;
        }
    }

    paramsToControls() {
        this._ctrlContainer.innerHTML = "";
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        const me = this;//TODO...

        let btnId = me.sanitiseId(`btn-info-${this._title}`);
        let info = this.getInfo();
        tbody.innerHTML = '<tr style="text-align: right"><td colspan="4"><button id="' + btnId + '" onclick="showMsg(`info`, `' + info + '`)">[&nbsp;i&nbsp;]</button></td></tr>';

        this._params.forEach(function(param, index) {
            let row = "";
            let id = me.sanitiseId(`ctrl-${me._title} ${param.title} ${index}`);

            switch(param.type) {
                case ParamType.Range:
                    row += `<tr>
                        <td><label for="${id}-from">${param.title}</label></td>
                        <td><input type="number" id="${id}-from" name="${id}-from" min="${param.min}" max="${param.max}" value="${param.min}" style="width: 75%; float: left"></td>
                        <td><label for="${id}-to"> - </label></td>
                        <td><input type="number" id="${id}-to" name="${id}-to" min="${param.min}" max="${param.max}" value="${param.max}" style="width: 75%; float: right"></td>
                    </tr>`;
                    break;
                case ParamType.Slider:
                    row += `<tr><td><label for="${id}">${param.title}</label></td>
                        <td colspan="3"><input type="range" id="${id}" name="${id}" min="${param.min}" max="${param.max}" value="${param.value}"></td></tr>`;
                    break;
                case ParamType.Value:
                    row += `<tr><td><label for="${id}">${param.title}</label></td>
                        <td colspan="3"><input type="number" id="${id}" name="${id}" min="${param.min}" max="${param.max}" value="${param.value}" style="width: 96%"></td></tr>`;
                    break;
                case ParamType.Check:
                    row += `<tr><td><label for="${id}">${param.title}</label></td>
                        <td colspan="3"><input type="checkbox" id="${id}" name="${id}"></td></tr>`;
                    break;
                case ParamType.File:
                    row += `<tr><td><label for="${id}">${param.title}</label></td>
                        <td colspan="3"><input type="file" id="${id}" name="${id}"><button style="font-size: large;" id="btn-${id}" onclick="document.getElementById('${id}').click()">[select file]</button></td></tr>`;
                    break;
                case ParamType.Select:
                    let data = "";

                    for(let i = 0; i < param.data.length; i++) {
                        const sel = (param.value != "" && param.value == param.data[i]) ? "selected" : "";
                        data += `<option value="${param.data[i]}" ${sel}>${param.data[i]}</option>`;
                    }

                    row += `<tr><td><label for="${id}">${param.title}</label></td>
                        <td colspan="3">
                            <select id="${id}" name="${id}">
                                ${data}
                            </select>
                        </td></tr>`;
                    break;
            }

            tbody.innerHTML += row;
            param.id = id;
        });

        table.appendChild(tbody);
        this._ctrlContainer.appendChild(table);
    }

    controlsToParams() {
        this._params.forEach(function(param, index) {
            const ctrl = document.getElementById(param.id);
            const ctrlFrom = document.getElementById(param.id + '-from');
            const ctrlTo = document.getElementById(param.id + '-to');

            switch(param.type) {
                case ParamType.Range:
                    param.min = ctrlFrom.value;
                    param.max = ctrlTo.value;
                    break;
                case ParamType.Slider:
                    param.value = ctrl.value;
                    break;
                case ParamType.Value:
                    param.value = ctrl.value;
                    break;
                case ParamType.Check:
                    param.value = ctrl.checked ? 1 : 0;
                    break;
                case ParamType.File:
                    param.value = ctrl.value;
                    param.files = ctrl.files;
                    break;
                case ParamType.Select:
                    param.value = ctrl.value;
                    break;
            }
        });
    }

    errors = [];

    validate() {
        this.errors = [];
        this.doValidate();
        return (this.errors.length == 0);
    }

    doValidate() {
        //to be overridden
        return true;
    }

    start() {
        this.controlsToParams();

        if (this.validate()) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this._state = State.Playing;
            this._btnStart.innerHTML = "[stop]";
            this.doStart();
        } else {
            let s = ":<ol>";
            this.errors.forEach(function(error, index) {
                s += `<li>${error}</li>`;
            });
            s += "</ol>";

            const max = MSG_CONTENT_MAX_WIDTH;
            MSG_CONTENT_MAX_WIDTH = "386px";
            showMsg('error', 'Validation failed' + s);
            MSG_CONTENT_MAX_WIDTH = max;
        }
    }

    doStart() {
        throw new Error("Abstract method 'doStart()' has not been implemented.");
    }

    stop() {
        this._state = State.NotPlaying;
        this._btnStart.innerHTML = "[start]";
        this.doStop();
    }

    doStop() {
        throw new Error("Abstract method 'stop()' has not been implemented.");
    }

    getIntFromRange(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getFloatFromRange(min, max) {
        return Math.random() * (Number(max) - Number(min)) + Number(min);
    }

    getNoteIndex(notes) {
        let a = [];
        let pos = 1;
        let pad;

        for (let i = 0; i < notes.length; i++) {
            if (pos >= 8) {
                pos = 1;
            }

            switch (pos) {
                case 1:
                    pad = 10;
                    break;
                case 2:
                    pad = 2;
                    break;
                case 3:
                    pad = 5;
                    break;
                case 4:
                    pad = 5;
                    break;
                case 5:
                    pad = 8;
                    break;
                case 6:
                    pad = 5;
                    break;
                case 7:
                    pad = 4;
                    break;
                default:
                    pad = 0;
            }

            for (let j = 0; j < pad; j++) {
                a.push(i);
            }
        }

        const index = this.getIntFromRange(0, a.length - 1);
        return a[index];
    }

    getNotes(hz, mode) {
        const magic = 1.059463094359;

        const major = [0, 2, 4, 5, 7, 9, 11, 12,
                          14, 16, 17, 19, 21, 23, 24];
        const minor = [0, 2, 3, 5, 7, 8, 10, 12,
                          14, 15, 17, 19, 20, 22, 24];
        const ionian = [0, 2, 4, 5, 7, 9, 11, 12,
                           14, 16, 17, 19, 21, 23, 24];
        const dorian = [0, 2, 3, 5, 7, 9, 10, 12,
                           14, 15, 17, 19, 21, 22, 24];
        const phrygian = [0, 1, 3, 5, 7, 8, 10, 12,
                             13, 15, 17, 19, 20, 22, 24];
        const lydian = [0, 2, 4, 6, 7, 9, 11, 12,
                           14, 16, 18, 19, 21, 23, 24];
        const mixolydian = [0, 2, 4, 5, 7, 9, 10, 12,
                               14, 16, 17, 19, 21, 22, 24];
        const aeolian = [0, 2, 3, 5, 7, 8, 10, 12,
                            14, 15, 17, 19, 20, 22, 24];
        const locrian = [0, 1, 3, 5, 6, 8, 10, 12,
                            13, 15, 17, 18, 20, 22, 24];

        let ret = [];
        let arr;

        switch(mode) {
            case Modes.Major:
                arr = major;
                break;
            case Modes.Minor:
                arr = minor;
                break;
            case Modes.Ionian:
                arr = ionian;
                break;
            case Modes.Dorian:
                arr = dorian;
                break;
            case Modes.Phrygian:
                arr = phrygian;
                break;
            case Modes.Lydian:
                arr = lydian;
                break;
            case Modes.Mixolydian:
                arr = mixolydian;
                break;
            case Modes.Aeolian:
                arr = aeolian;
                break;
            case Modes.Locrian:
                arr = locrian;
                break;
            default:
                arr = maj;
                break;
        }

        for (let i = 0; i < arr.length; i++) {
            const freq = (hz * Math.pow(magic, arr[i]));
            ret.push(freq);
        }

        return ret;
    }

    bpmToFrequency(bpm) {
        return (1000 * 60) / bpm;
    }
}
