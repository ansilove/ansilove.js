document.addEventListener("DOMContentLoaded", function () {
    "use strict";
    var files;

    files = [];

    document.getElementById("file-drop").addEventListener('dragover', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = "copy";
    }, false);

    function removeExtension(text) {
        var index;
        index = text.lastIndexOf(".");
        return (index >= 0) ? text.substring(0, index) : text;
    }

    function getExtension(text) {
        return text.split(".").pop().toLowerCase();
    }

    function zeroPadding(num) {
        var text;
        text = num.toString(10);
        while (text.length < 4) {
            text = "0" + text;
        }
        return text;
    }

    function clearElement(element) {
        while (element.hasChildNodes()) {
            element.removeChild(element.firstChild);
        }
    }

    function clearFiles() {
        while (files.length > 0) {
            files.pop();
        }
    }

    function removeFile(name, element) {
        return function (evt) {
            var divFilenames, i;
            evt.preventDefault();
            divFilenames = document.getElementById("filenames");
            divFilenames.removeChild(element);
            if (divFilenames.childNodes.length === 0) {
                document.getElementById("clear-filenames").style.display = "none";
            }
            for (i = 0; i < files.length; i++) {
                if (files[i].name === name) {
                    files.splice(i, 1);
                    break;
                }
            }
        };
    }

    document.getElementById("file-drop").addEventListener('drop', function (evt) {
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
            removeAnchor.onclick = removeFile(evt.dataTransfer.files[i].name, p);
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

    document.getElementById("clear-output-link").onclick = function (evt) {
        evt.preventDefault();
        clearElement(document.getElementById("output"));
        document.getElementById("clear-output").style.display = "none";
    };

    function previewImage(canvas) {
        return function (evt) {
            var divPreviewContainer;
            evt.preventDefault();
            divPreviewContainer = document.getElementById("preview-container");
            clearElement(divPreviewContainer);
            divPreviewContainer.appendChild(canvas);
            if (window.devicePixelRatio > 1) {
                canvas.style.width = (canvas.width / 2) + "px";
                canvas.style.height = (canvas.height / 2) + "px";
                divPreviewContainer.style.width = (canvas.width / 2) + "px";
            } else {
                divPreviewContainer.style.width = canvas.width + "px";
            }
            divPreviewContainer.scrollTop = 0;
            divPreviewContainer.scrollLeft = 0;
            document.getElementById("preview-overlay").style.visibility = "visible";
            document.body.style.overflow = "hidden";
        };
    }

    function removeLink(element) {
        return function (evt) {
            var divOutput;
            evt.preventDefault();
            divOutput = document.getElementById("output");
            divOutput.removeChild(element);
            if (divOutput.childNodes.length === 0) {
                document.getElementById("clear-output").style.display = "none";
            }
        };
    }

    function addImageToList(canvas, name) {
        var imageAnchor, previewAnchor, removeAnchor, paragraph;
        if (canvas !== undefined) {
            imageAnchor = document.createElement("a");
            imageAnchor.href = canvas.toDataURL("image/png");
            name = name + "_" + canvas.width + "x" + canvas.height + ".png";
            imageAnchor.download = name;
            imageAnchor.textContent = name;
            previewAnchor = document.createElement("a");
            previewAnchor.textContent = "preview";
            previewAnchor.href = "#";
            previewAnchor.className = "preview-link";
            previewAnchor.onclick = previewImage(canvas);
            removeAnchor = document.createElement("a");
            removeAnchor.href = "#";
            removeAnchor.textContent = "X";
            removeAnchor.className = "remove-link";
            paragraph = document.createElement("p");
            paragraph.appendChild(imageAnchor);
            paragraph.appendChild(previewAnchor);
            paragraph.appendChild(removeAnchor);
            document.getElementById("output").appendChild(paragraph);
            removeAnchor.onclick = removeLink(paragraph);
            document.getElementById("clear-output").style.display = "block";
        }
    }

    function combineCanvases(canvases) {
        var canvas, ctx, i;
        canvas = document.createElement("canvas");
        canvas.width = canvases[0].width * canvases.length;
        canvas.height = canvases[0].height;
        ctx = canvas.getContext("2d");
        for (i = 0; i < canvases.length; ++i) {
            ctx.drawImage(canvases[i], i * canvases[i].width, 0);
        }
        return canvas;
    }

    document.getElementById("render-link").onclick = function (evt) {
        var workers, readers, timer, i, completed;
        evt.preventDefault();
        workers = [];
        readers = [];
        completed = 0;

        function showModal() {
            document.getElementById("modal-overlay").style.visibility = "visible";
            document.body.style.overflow = "hidden";
        }

        function removeModal() {
            clearTimeout(timer);
            document.getElementById("modal-overlay").style.visibility = "hidden";
            document.body.style.overflow = "auto";
        }

        if (files.length > 0) {
            timer = setTimeout(showModal, 100);
        }

        function fileOnLoadHandler(worker, file) {
            return function (data) {
                var settings;
                settings = {
                    "bytes":  new Uint8Array(data.target.result),
                    "bits": document.getElementById("bits").value,
                    "font": document.getElementById("font").value,
                    "icecolors": document.getElementById("icecolors").checked ? 1 : 0,
                    "columns": parseInt(document.getElementById("columns").value, 10),
                    "thumbnail": parseInt(document.getElementById("thumbnail").value, 10),
                    "split": parseInt(document.getElementById("split").value, 10),
                    "filetype": getExtension(file.name)
                };
                worker.addEventListener("error", function (e) {
                    alert("An error occured whilst attempting to render " + file.name);
                    if (++completed === files.length) {
                        removeModal();
                    }
                }, false);
                worker.postMessage(settings);
            };
        }

        function workerOnMessageHandler(file) {
            return function (evt) {
                var canvas, combined, canvases, name, i;
                if (evt.data.splitimagedata) {
                    combined = document.getElementById("combine").checked;
                    name = removeExtension(file.name) + "_";
                    if (document.getElementById("combine").checked) {
                        canvases = evt.data.splitimagedata.map(function (imagedata) {
                            return AnsiLove.displayDataToCanvas(imagedata);
                        });
                        addImageToList(combineCanvases(canvases), name + "split");
                    } else {
                        for (i = 0; i < evt.data.splitimagedata.length; ++i) {
                            canvas = AnsiLove.displayDataToCanvas(evt.data.splitimagedata[i]);
                            addImageToList(canvas, name + zeroPadding(i));
                        }
                    }
                } else {
                    canvas = AnsiLove.displayDataToCanvas(evt.data.imagedata);
                    addImageToList(canvas, file.name);
                }
                if (++completed === files.length) {
                    removeModal();
                }
            };
        }

        for (i = 0; i < files.length; ++i) {
            workers[i] = new Worker("../ansilove.js?");
            workers[i].onmessage = workerOnMessageHandler(files[i]);
            readers[i] = new FileReader();
            readers[i].onload = fileOnLoadHandler(workers[i], files[i]);
            readers[i].readAsArrayBuffer(files[i]);
        }
    };

    document.getElementById("preview-overlay").onclick = function () {
        document.getElementById("preview-overlay").style.visibility = "hidden";
        document.body.style.overflow = "auto";
    };
});