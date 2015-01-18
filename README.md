## Description

AnsiLove.js is a partial rewrite of [ansilove][1] and [AnsiLove-C][2] in the Javascript programming language. Unlike the original projects, AnsiLove.js enables artscene related file formats to be displayed directly on a webpage on the client-side, and supports ANSi (.ANS), PCBOARD (.PCB), BiNARY (.BIN), ADF (.ADF), iDF (.IDF), TUNDRA (.TND) and XBiN (.XB) formats.

AnsiLove.js supports the majority of options found in the original set of tools.

[ansilove™][1] is a trademark of Frederic Cambus.  
[AnsiLove-C™][2] is a trademark of Stefan Vogt, Brian Cassidy and Frederic Cambus.

AnsiLove.js has been tested on Safari, Firefox, and Chrome. Results may vary widely on Internet Explorer browsers.

## Features

- ANSi (.ANS) format support
- PCBOARD (.PCB) format support
- BiNARY (.BIN) format support
- ADF (.ADF) format support (Artworx)
- iDF (.IDF) format support (iCE Draw)
- TUNDRA (.TND) format support
- XBiN (.XB) format support
- SAUCE (Standard Architecture for Universal Comment Extentions)
- 80x25 font support
- 80x50 font support
- Amiga font support
- iCE colors support

## Supported charsets

- IBM PC (Code page 437)
- Baltic (Code page 775)
- Cyrillic (Code page 855)
- French Canadian (Code page 863)
- Greek (Code pages 737 and 869)
- Hebrew (Code page 862)
- Icelandic (Code page 861)
- Latin-1 (Code page 850)
- Latin-2 (Code page 852)
- Nordic (Code page 865)
- Portuguese (Code page 860)
- Russian (Code page 866)
- Turkish (Code page 857)
- Armenian
- Persian (Iran System encoding standard)

## Usage

    AnsiLove.render("example.bin", function (canvas, sauce) {
        document.body.appendChild(canvas);
        console.log(sauce);
    }, {"font": "80x25", "bits": "8", "icecolors": 0, "columns": 80, "thumbnail": 0});

For extremely large files, which may silently fail on some browsers when producing a single canvas element, the `splitRender` function will produce an array of canvas elements, which can then be stacked vertically in the browser to simulate a single, contiguous display. The value of `27` in the following example is the maximum amount of text-rows in used in each element.

When aligning these elements on a page there may be a small gap between each image. To correct this, simply apply the CSS style `vertical-align: bottom`, or apply it progmatically with a single line of Javascript.

    AnsiLove.splitRender("long_ansi.ans", function (canvases, sauce) {
        canvases.forEach(function (canvas) {
            canvas.style.verticalAlign = "bottom"; // For perfect, gap-less viewing.
            document.body.appendChild(canvas);
        });
        console.log(sauce);
    }, 27, {"bits": "8"});
   
And for ANSImations, the animate function returns a controller object which when issued with the play() call, renders an ANSI at a pre-determined baud rate, and can be passed an additional function which is called upon completion.

    var controller = AnsiLove.animate("ansimation.ans", function (canvas, sauce) {
        document.getElementById("example").appendChild(canvas);
        console.log(sauce);
        controller.play(14400, function () {
            console.log("Finished!");
        });
    }, {"bits": "9"});

If a function is passed after the options object of any method, then it will be called in the event that the file cannot be fetched, or if an error occured whilst attempting to interpret the file.

    AnsiLove.render("example.ans", function (canvas, sauce) {
        ...
    }, {}, function (message) {
        alert("Error: " + message);
    });

### PC font options: 

 - 80x25 (Default, code page 437)
 - 80x25small (small, but legible code page 437)
 - 80x50 (Code page 437, 80x50 mode)
 - armenian
 - baltic (Code page 775)
 - cyrillic (Code page 855)
 - french-canadian (Code page 863)
 - greek (Code page 737)
 - greek-869 (Code page 869)
 - hebrew (Code page 862)
 - icelandic (Code page 861)
 - latin1 (Code page 850)
 - latin2 (Code page 852)
 - nordic (Code page 865)
 - persian (Iran System encoding standard)
 - portuguese (Code page 860)
 - russian (Code page 866)
 - terminus (Terminus font)
 - turkish (Code page 857)

### Amiga font options:
 
 - amiga (alias to Topaz)
 - b-strict (Original B-Strict font)
 - b-struct (Original B-Struct font)
 - microknight (Original MicroKnight version)
 - microknight+ (Modified MicroKnight version)
 - microknightplus (alias to MicroKnight + to be used in URLs)
 - mosoul (Original mO’sOul font)
 - pot-noodle (Original P0T-NOoDLE font)
 - topaz (Original Topaz Kickstart 2.x version)
 - topaz+ (Modified Topaz Kickstart 2.x+ version)
 - topazplus (alias to Topaz+ to be used in URLs)
 - topaz500 (Original Topaz Kickstart 1.x version)
 - topaz500+ (Modified Topaz Kickstart 1.x version)
 - topaz500plus (alias to Topaz500+ to be used in URLs)


### Bits options
 
 - "8" (8-bit): Default rendering mode.
 - "9" (9-bit): Renders the 9th column of block characters, causing the output to look like it’s displayed in real textmode.
 - "ced": Renders files in black on gray, and limit the output to 78 columns (only available in ANSi loader). Used together with an Amiga font, the output will look like it is displayed on Amiga.
 - "workbench": Renders files using Amiga Workbench colors (only available in ANSi loader).

### iCE colors options

- 0 (default, turned OFF)
- 1 (turned ON)

### Columns options

Used for .BIN files only. Skip this option when converting other formats. The default is set at 160.

### Thumbnail options

- 0 (default, turned OFF)
- 1 (1/8 scale)
- 2 (1/4 scale)
- 3 (1/2 scale)

A thumbnail image is rendered instead of a full-size image. Does not apply when playing ansimations.

### Filetype options

- ans
- txt
- nfo
- asc
- diz
- ion
- adf
- bin
- idf
- pcb
- tnd
- xb

Instead of guessing the filetype based on the name or extension of the url, the chosen rendering method can be chosen from this list by using the option `"filetype": "<type>"`. Using this method, it is possible to display the raw data contained within a file by over-riding this property with `"asc"`.

### 2x options

- 0 (default, turned OFF)
- 1 (turned ON)

Delivers a canvas element which has double the width and height in pixels, but styled in half these amounts in CSS-pixels. This makes it suitable for display on devices with high pixel densities.

### SAUCE record

As well as a canvas element, a [SAUCE][3] record is returned as a Javascript object if one is found, and follows this format:

    {
        "version": "00",
        "title": "Example ANSI",
        "author": "Joe Q. Public",
        "group": "Generic Ansi Group",
        "date": "20130922",
        "fileSize": 1337,
        "dataType": 1,
        "fileType": 1,
        "tInfo1": 80,
        "tInfo2": 26,
        "tInfo3": 0,
        "tInfo4": 0,
        "comments": ["Comment 1.", "Comment 2.", ... ],
        "flags": 0
    }

It is also possible to retrieve a record for a file without generating an image by using the `sauce` function.

    AnsiLove.sauce("example.ans", function (sauce) {
        console.log(sauce);
    });

## License

AnsiLove.js is released under the BSD 3-Clause license. See `LICENSE` file for details.

## Author

AnsiLove is developed by [Frederic Cambus](http://www.cambus.net)  
AnsiLove.js is developed by [Andrew Herbert](http://andyh.org)

## Resources

Project Homepage : [https://ansilove.github.com/ansilove.js](https://ansilove.github.com/ansilove.js)

[1]: https://github.com/fcambus/ansilove
[2]: https://github.com/ByteProject/AnsiLove-C
[3]: http://web.archive.org/web/20120204063648/http://www.acid.org/info/sauce/sauce.htm