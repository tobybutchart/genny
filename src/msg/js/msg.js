/* configurable global vars */
let MSG_HEADER_FONT = "Verdana, sans-serif";
let MSG_CONTENT_FONT = "Verdana, sans-serif";

let MSG_HEADER_FONT_COLOUR = "#FFFFFF";
let MSG_CONTENT_FONT_COLOUR = "#FFFFFF";

let MSG_CONTENT_MAX_WIDTH = "386px";

let MSG_SUCCESS_COLOUR = "#4caf50";
let MSG_INFO_COLOUR = "#2196F3";
let MSG_WARNING_COLOUR = "#ff9800";
let MSG_ERROR_COLOUR = "#d32f2f";
let MSG_CONFIRM_COLOUR = "#7308B0";
let MSG_INPUT_COLOUR = "#7308B0";
let MSG_CUSTOM_COLOUR = "#4caf50";

let MSG_TEXT_OK = "OK";
let MSG_TEXT_CANCEL = "Cancel";
let MSG_TEXT_CONFIRM_OK = "OK";
let MSG_TEXT_CONFIRM_CANCEL = "Cancel";

let MSG_TEXT_SUCCESS = "Success!";
let MSG_TEXT_INFO = "Info...";
let MSG_TEXT_WARNING = "Warning!";
let MSG_TEXT_ERROR = "Error!";
let MSG_TEXT_CONFIRM = "Confirm?";
let MSG_TEXT_INPUT = "Input";

let MSG_USE_ICONS = true;

function mainMsg() {
    return document.getElementById("msg-main");
}

var onMsgKeyDown = function(e) {
    const btnOK = document.getElementById('msg-close');
    const btnCancel = document.getElementById('msg-cancel');

    var event = e || window.event;

    if (event.key === "Escape") {
        if (btnCancel) {
            btnCancel.click();
        } else if (btnOK) {
            btnOK.click();
        }
    }

    if (event.key === "Enter") {
        if (btnOK) {
            btnOK.click();
        }
    }
}

function buildMsg(msgType, onConfirm, onDecline, sender) {
    let divMain = document.createElement("div");
    let divContent = document.createElement("div");
    let divHeader = document.createElement("div");
    let headerIcon = document.createElement("i");
    let h2Title = document.createElement("h2");
    let divBody = document.createElement("div");
    let divFooter = document.createElement("div");
    let btnOK = document.createElement("button");
    let icoOK = document.createElement("i");

    let btnCancel;
    let icoCancel;
    let inp;

    if (msgType.toLowerCase() == "confirm" || msgType.toLowerCase() == "input") {
        btnCancel = document.createElement("button");
        icoCancel = document.createElement("i");
    }

    if (msgType.toLowerCase() == "input") {
        inp = document.createElement("input");
        inp.type = "text";
        inp.id = "msg-input";
    }

    divMain.style.display = "none";
    divMain.id = "msg-main";
    divMain.classList.add("msg-main");

    divContent.id = "msg-content";
    divContent.classList.add("msg-content");
    divMain.appendChild(divContent);

    divHeader.id = "msg-header";
    divHeader.classList.add("msg-header");
    divContent.appendChild(divHeader);

    if (MSG_USE_ICONS) {
        headerIcon.id = "msg-icon";
        headerIcon.classList.add("material-icons", "msg-icon");
        //if installed as Chrome extension
        if (typeof isExtension === 'function' && isExtension()) {
            headerIcon.style.paddingTop = "5px";
        }
        // icon.innerHTML = info;
        divHeader.appendChild(headerIcon);
    }

    h2Title.id = "msg-title";
    h2Title.classList.add("msg-title");
    // h2Title.innerHTML = info;
    divHeader.appendChild(h2Title);

    divBody.id = "msg-body";
    divBody.classList.add("msg-body");
    divContent.appendChild(divBody);

    if (msgType.toLowerCase() == "input") {
        divBody.appendChild(inp);
    }

    divFooter.id = "msg-footer";
    divFooter.classList.add("msg-footer");
    divContent.appendChild(divFooter);

    btnOK.id = "msg-close";
    btnOK.classList.add("msg-close");
    btnOK.innerHTML = msgType.toLowerCase() == "confirm" ? MSG_TEXT_CONFIRM_OK : MSG_TEXT_OK + "&nbsp;";
    btnOK.onclick = function() {
        let elem = document.getElementById("msg-input");
        let value = elem ? elem.value : "";

        if (elem && !value) {
            elem.focus();
            return false;
        }

        closeMsg();

        if (typeof onConfirm === 'function') {
            if (msgType.toLowerCase() == "input") {
                onConfirm(sender, value);
            } else {
                onConfirm(btnOK);
            }
        }
    };
    divFooter.appendChild(btnOK);

    if (MSG_USE_ICONS) {
        icoOK.classList.add("material-icons");
        icoOK.innerHTML = "check";
        btnOK.appendChild(icoOK);
    }

    if (msgType.toLowerCase() == "confirm" || msgType.toLowerCase() == "input") {
        btnCancel.id = "msg-cancel";
        btnCancel.classList.add("msg-close");
        btnCancel.innerHTML = msgType.toLowerCase() == "confirm" ? MSG_TEXT_CONFIRM_CANCEL : MSG_TEXT_CANCEL + "&nbsp;";
        btnCancel.onclick = function() {
            closeMsg();

            if (typeof onDecline === 'function') {
                onDecline(btnCancel);
            }
        };
        divFooter.appendChild(btnCancel);

        if (MSG_USE_ICONS) {
            icoCancel.classList.add("material-icons");
            icoCancel.innerHTML = "close";
            btnCancel.appendChild(icoCancel);
        }
    }

    document.body.appendChild(divMain);
}

function showMsg(msgType, msgHTML, onConfirm, onDecline, inputText, sender) {
    //validation
    if (typeof msgHTML === 'undefined' || msgHTML === '') {
        return false;
    }

    buildMsg(msgType, onConfirm, onDecline, sender);

    let content = document.getElementById("msg-content");
    let icon = document.getElementById("msg-icon");
    let title = document.getElementById("msg-title");
    let header = document.getElementById("msg-header");
    let footer = document.getElementById("msg-footer");
    let body = document.getElementById("msg-body");
    let btnOK = document.getElementById("msg-close");
    let btnCancel = document.getElementById("msg-cancel");

    header.style.color = MSG_HEADER_FONT_COLOUR;
    content.style.color = MSG_CONTENT_FONT_COLOUR;
    content.style.maxWidth = MSG_CONTENT_MAX_WIDTH;

    if (icon) {
        icon.style.color = MSG_HEADER_FONT_COLOUR;
    }

    switch(msgType.toLowerCase()) {
        case "success":
            header.style.backgroundColor = MSG_SUCCESS_COLOUR;
            title.innerHTML = MSG_TEXT_SUCCESS;
            if (icon) {
                icon.innerHTML = "check_circle";
            }
            break;
        case "info":
            header.style.backgroundColor = MSG_INFO_COLOUR;
            title.innerHTML = MSG_TEXT_INFO;
            if (icon) {
                icon.innerHTML = msgType.toLowerCase();
            }
            break;
        case "warning":
            header.style.backgroundColor = MSG_WARNING_COLOUR;
            title.innerHTML = MSG_TEXT_WARNING;
            if (icon) {
                icon.innerHTML = msgType.toLowerCase();
            }
            break;
        case "error":
            header.style.backgroundColor = MSG_ERROR_COLOUR;
            title.innerHTML = MSG_TEXT_ERROR;
            if (icon) {
                icon.innerHTML = msgType.toLowerCase();
            }
            break;
        case "confirm":
            header.style.backgroundColor = MSG_CONFIRM_COLOUR;
            title.innerHTML = MSG_TEXT_CONFIRM;
            if (icon) {
                icon.innerHTML = "help";
            }
            break;
        case "input":
            header.style.backgroundColor = MSG_INPUT_COLOUR;
            title.innerHTML = MSG_TEXT_INPUT;
            if (icon) {
                icon.innerHTML = msgType.toLowerCase();
            }
            break;
        default:
            header.style.backgroundColor = MSG_CUSTOM_COLOUR;
            title.innerHTML = msgType.toLowerCase();
            if (icon) {
                icon.innerHTML = "";
            }
            break;
    }

    //appended as may contain input
    body.innerHTML = msgHTML + body.innerHTML;

    let inp;
    if (inputText) {
        inp = document.getElementById("msg-input");

        if (inp) {
            inp.value = inputText;
        }
    }

    header.style.fontFamily = MSG_HEADER_FONT;
    footer.style.fontFamily = MSG_HEADER_FONT;
    content.style.fontFamily = MSG_CONTENT_FONT;
    btnOK.style.fontFamily = MSG_HEADER_FONT;

    if (btnCancel) {
        btnCancel.style.fontFamily = MSG_HEADER_FONT;
    }

    mainMsg().style.display = "block";
    document.addEventListener('keydown', onMsgKeyDown, false);

    if (inp) {
        inp.focus();
    } else {
        btnOK.focus();
    }

    return true;
}

function closeMsg() {
    mainMsg().style.display = "none";
    mainMsg().remove();
    document.removeEventListener('keydown', onMsgKeyDown, false);
}
