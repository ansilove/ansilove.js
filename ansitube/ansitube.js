document.addEventListener("DOMContentLoaded", function () {
    "use strict";
    var files;

    files = [];

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

    function clearElement(element) {
        while (element.hasChildNodes()) {
            element.removeChild(element.firstChild);
        }
    }

    function readFile(file, callback) {
        var reader;
        reader = new FileReader();
        reader.onload = function (data) {
            var controller, divPreviewContainer, divPreviewOverlay, timer;
            controller = AnsiLove.animateBytes(new Uint8Array(data.target.result), function (canvas) {
                divPreviewOverlay = document.getElementById("preview-overlay");
                divPreviewOverlay.style.visibility = "visible";
                divPreviewContainer = document.getElementById("preview-container");
                clearElement(divPreviewContainer);
                divPreviewContainer.appendChild(canvas);
                divPreviewContainer.style.width = canvas.width + "px";
                divPreviewContainer.style.height = canvas.height + "px";
                controller.play(parseInt(document.getElementById("baudrate").value, 10), function () {
                    timer = setTimeout(callback, 3000);
                });
                divPreviewOverlay.onclick = function () {
                    clearTimeout(timer);
                    controller.stop();
                    document.getElementById("preview-overlay").style.visibility = "hidden";
                    document.body.style.overflow = "auto";
                };
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
        document.body.style.overflow = "hidden";
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