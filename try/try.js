document.addEventListener("DOMContentLoaded", function () {
    "use strict";
    var files;

    files = [];

    document.getElementById("file-drop").addEventListener('dragover', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = "copy";
    }, false);

    function settings(filetype) {
        return {
            "bits": document.getElementById("bits").value,
            "font": document.getElementById("font").value,
            "icecolors": document.getElementById("icecolors").checked ? 1 : 0,
            "columns": parseInt(document.getElementById("columns").value, 10),
            "thumbnail": parseInt(document.getElementById("thumbnail").value, 10),
            "filetype": filetype
        };
    }

    function removeExtension(text) {
        var index;
        index = text.lastIndexOf(".");
        return (index >= 0) ? text.substring(0, index) : text;
    }

    function getExtension(text) {
        return text.split(".").pop().toLowerCase();
    }

    function readFile(name, file, callback) {
        var reader;
        reader = new FileReader();
        reader.onload = function (data) {
            var split;
            split = parseInt(document.getElementById("split").value, 10);
            if (split) {
                AnsiLove.splitRenderBytes(new Uint8Array(data.target.result), function (canvases) {
                    var canvas, ctx, i, zeroPadding;
                    if (document.getElementById("combine").checked) {
                        canvas = document.createElement("canvas");
                        canvas.width = canvases[0].width * canvases.length;
                        canvas.height = canvases[0].height;
                        ctx = canvas.getContext("2d");
                        for (i = 0; i < canvases.length; ++i) {
                            ctx.drawImage(canvases[i], i * canvases[i].width, 0);
                        }
                        callback(removeExtension(name) + "_split", canvas);
                    } else {
                        for (i = 0; i < canvases.length; ++i) {
                            zeroPadding = i.toString(10);
                            while (zeroPadding.length < 4) {
                                zeroPadding = "0" + zeroPadding;
                            }
                            callback(removeExtension(name) + "_" + zeroPadding, canvases[i]);
                        }
                    }
                }, split, settings(getExtension(name)));
            } else {
                AnsiLove.renderBytes(new Uint8Array(data.target.result), function (canvas) {
                    callback(removeExtension(name), canvas);
                }, settings(getExtension(name)));
            }
        };
        reader.readAsArrayBuffer(file);
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
            divPreviewContainer.style.width = canvas.width + "px";
            divPreviewContainer.scrollTop = 0;
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

    document.getElementById("render-link").onclick = function (evt) {
        var i, imageAnchor, previewAnchor, removeAnchor, paragraph;
        evt.preventDefault();
        document.getElementById("modal-overlay").style.visibility = "visible";
        document.body.style.overflow = "hidden";
        i = 0;

        function nextItem() {
            if (i < files.length) {
                if (files[i] !== undefined) {
                    readFile(files[i].name, files[i], function (name, canvas) {
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
                        ++i;
                        nextItem();
                    });
                } else {
                    ++i;
                    nextItem();
                }
            } else {
                document.getElementById("modal-overlay").style.visibility = "hidden";
                document.body.style.overflow = "auto";
            }
        }

        setTimeout(nextItem, 250);
    };

    document.getElementById("preview-overlay").onclick = function () {
        document.getElementById("preview-overlay").style.visibility = "hidden";
        document.body.style.overflow = "auto";
    };
});