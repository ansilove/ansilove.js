document.addEventListener("DOMContentLoaded", function () {
    "use strict";
    var files;

    files = [];

    function httpGetJson(url, callback, callbackFail) {
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.onreadystatechange = function () {
            if (http.readyState === 4) {
                switch (http.status) {
                case 0:
                case 200:
                    callback(JSON.parse(http.response));
                    break;
                default:
                    if (callbackFail) {
                        callbackFail(http.status);
                    } else {
                        throw ("Could not retrieve: " + url);
                    }
                }
            }
        };
        http.setRequestHeader("Content-Type", "application/octet-stream");
        http.responseType = "text";
        http.send();
    }

    function clearElement(element) {
        while (element.hasChildNodes()) {
            element.removeChild(element.firstChild);
        }
    }

    function animate(controller, baudrate, canvas, callback) {
        var divPreviewContainer, divPreviewOverlay, timer;
        document.body.style.overflow = "hidden";
        divPreviewOverlay = document.getElementById("preview-overlay");
        divPreviewOverlay.style.visibility = "visible";
        divPreviewContainer = document.getElementById("preview-container");
        clearElement(divPreviewContainer);
        divPreviewContainer.style.width = canvas.width + "px";
        divPreviewContainer.style.height = canvas.height + "px";
        divPreviewContainer.appendChild(canvas);
        controller.play(baudrate, function () {
            timer = setTimeout(callback, 3000);
        });
        divPreviewOverlay.onclick = function () {
            clearTimeout(timer);
            controller.stop();
            divPreviewOverlay.style.visibility = "hidden";
            document.body.style.overflow = "auto";
        };
    }

    function playTube(url, baudrate, settings) {
        return function () {
            if (baudrate > 0) {
                AnsiLove.popupAnimation(url, baudrate, settings);
            } else {
                AnsiLove.popup(url, settings);
            }
        };
    }

    httpGetJson("tubes.json", function (tubes) {
        var i, divTubeLinks, paragraph;
        i = 0;
        divTubeLinks = document.getElementsByClassName("tube-link");
        (function next() {
            if (i < tubes.length) {
                divTubeLinks[i].style.backgroundImage = "url(" + tubes[i].thumb + ")";
                paragraph = document.createElement("p");
                paragraph.textContent = tubes[i].url.split("/").pop() + ", " + tubes[i].author;
                divTubeLinks[i].appendChild(paragraph);
                divTubeLinks[i].onclick = playTube(tubes[i].url, tubes[i].baudrate, tubes[i].settings);
                ++i;
                next();
            }
        }());
    });

    document.getElementById("file-drop").addEventListener("dragover", function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = "copy";
    }, false);

    function settings() {
        return {
            "bits": document.getElementById("bits").value,
            "font": document.getElementById("font").value,
            "icecolors": document.getElementById("icecolors").checked ? 1 : 0
        };
    }

    function readFile(file, callback) {
        var reader;
        reader = new FileReader();
        reader.onload = function (data) {
            var controller;
            controller = AnsiLove.animateBytes(new Uint8Array(data.target.result), function (canvas) {
                animate(controller, parseInt(document.getElementById("baudrate").value, 10), canvas, callback);
            }, settings());
        };
        reader.readAsArrayBuffer(file);
    }

    function clearFiles() {
        while (files.length > 0) {
            files.pop();
        }
    }

    function removeFile(index, element) {
        return function (evt) {
            var divFilenames;
            evt.preventDefault();
            divFilenames = document.getElementById("filenames");
            delete files[index];
            divFilenames.removeChild(element);
            if (divFilenames.childNodes.length === 0) {
                document.getElementById("clear-filenames").style.display = "none";
            }
        };
    }

    document.getElementById("file-drop").addEventListener("drop", function (evt) {
        var i, p, span, removeAnchor;
        evt.stopPropagation();
        evt.preventDefault();
        for (i = 0; i < evt.dataTransfer.files.length; ++i) {
            span = document.createElement("span");
            span.textContent = evt.dataTransfer.files[i].name;
            removeAnchor = document.createElement("a");
            removeAnchor.href = "#";
            removeAnchor.textContent = "X";
            removeAnchor.className = "remove-link";
            p = document.createElement("p");
            p.appendChild(span);
            p.appendChild(removeAnchor);
            document.getElementById("filenames").appendChild(p);
            removeAnchor.onclick = removeFile(files.length, p);
            files.push(evt.dataTransfer.files[i]);
        }
        document.getElementById("clear-filenames").style.display = "block";
    }, false);

    document.getElementById("clear-filenames-link").onclick = function (evt) {
        evt.preventDefault();
        clearElement(document.getElementById("filenames"));
        clearFiles();
        document.getElementById("clear-filenames").style.display = "none";
    };

    document.getElementById("play-link").onclick = function (evt) {
        var i;
        evt.preventDefault();
        i = 0;

        function nextItem() {
            if (i < files.length) {
                if (files[i] !== undefined) {
                    readFile(files[i], function () {
                        ++i;
                        nextItem();
                    });
                } else {
                    ++i;
                    nextItem();
                }
            } else {
                i = 0;
                setTimeout(nextItem, 0);
            }
        }

        setTimeout(nextItem, 250);
    };
});