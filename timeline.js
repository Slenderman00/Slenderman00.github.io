class Event {
    constructor(startDate, endDate, color, title, description, tags) {
        this.startDate = startDate;
        this.endDate = endDate;

        this.title = title;
        this.description = description;
        this.tags = tags;

        this.indexee;
        this.offset = 0;
        this.color = color;
        this.hover = false;
    }
}

class Timeline {
    constructor() {
        this.events = [];
        this.levels = [];
        this.scale = 0.000005000000999999999;

        this.timelineParent = document.getElementById("timeline");
        this.timeline = document.createElement("canvas");
        this.timeline.width = window.innerWidth;
        this.timeline.height = 240;
        this.timeline.id = "timeline-canvas";
        this.timelineParent.appendChild(this.timeline);
        this.ctx = this.timeline.getContext("2d");
    }

    calculateTimelineWidth() {
        //calculates the width of the timeline
        let startDate = this.events[0].startDate;
        let endDate = this.events[0].endDate;

        for (let event of this.events) {
            if (event.startDate < startDate) {
                startDate = event.startDate;
            }

            if (event.endDate > endDate) {
                endDate = event.endDate;
            }
        }

        //calculate the width of the timeline
        endDate -= startDate;
        startDate = 0;

        let dateDiff = endDate - startDate;
        let width = dateDiff * this.scale;

        console.log(width);

        this.timeline.width = width + 40;
    }

    addEvents(events) {
        //merges the events array into the timeline
        this.events = this.events.concat(events);
    }

    overlap(event1, event2) {
        //returns true if the events overlap
        if (event1.startDate <= event2.startDate && event1.endDate >= event2.startDate) {
            return true;
        } else if (event1.startDate >= event2.startDate && event1.startDate <= event2.endDate) {
            return true;
        }
        return false;

    }

    eventSort() {
        // Sort events by length
        this.events.sort((a, b) => { return a.startDate - b.startDate });

        // Initialize an array to store levels
        this.levels = [];

        for (let event of this.events) {
            let placed = false;

            // Try to find a level without overlap
            for (let level of this.levels) {
                let overlap = false;

                for (let existingEvent of level) {
                    if (this.overlap(existingEvent, event)) {
                        overlap = true;
                        break;
                    }
                }

                if (!overlap) {
                    level.push(event);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                // If no level without overlap is found, create a new level
                this.levels.push([event]);
            }
        }
    }

    getPosFromDate(date) {
        //returns the position on the timeline from a date
        let dateDiff = date - this.events[0].startDate;
        let pos = dateDiff * this.scale;
        return pos;
    }

    drawEvents() {
        //sets the offset of the timeline event line
        let offset = 20;
        for (let level of this.levels) {
            offset += 30;
            //draws the events on the timeline
            for (let event of level) {

                //sets the color of the event
                if (event.hover) {
                    this.ctx.strokeStyle = "#ffffff";
                    this.ctx.fillStyle = "#ffffff";
                } else {
                    this.ctx.strokeStyle = event.color;
                    this.ctx.fillStyle = event.color;
                }

                //sets a round point on the start
                this.ctx.beginPath();
                this.ctx.arc(this.getPosFromDate(event.startDate) + 6 + 20, offset, 12, 0, 2 * Math.PI);
                this.ctx.fill();

                //sets a round point on the end
                this.ctx.beginPath();
                this.ctx.arc(this.getPosFromDate(event.endDate) - 6 + 20, offset, 12, 0, 2 * Math.PI);
                this.ctx.fill();


                //set the offset of the event
                event.offset = offset;

                //draws a line from the start date to the end date
                let startX = this.getPosFromDate(event.startDate);
                let endX = this.getPosFromDate(event.endDate);

                //console.log(startX, endX);

                this.ctx.beginPath();

                this.ctx.moveTo(startX + 20, offset);
                this.ctx.lineTo(endX + 20, offset);

                this.ctx.lineWidth = 20;

                this.ctx.stroke();
            }
        }
    }

    onHoverOverEvent(callback, inverseCallback) {
        //checks if the mouse is over an event
        this.timeline.addEventListener("mousemove", (e) => {
            let rect = this.timeline.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            for (let level of this.levels) {
                for (let event of level) {
                    let startX = this.getPosFromDate(event.startDate);
                    let endX = this.getPosFromDate(event.endDate) + 30;

                    let startY = event.offset - 20;
                    let endY = event.offset + 20;

                    if (x > startX && x < endX && y > startY && y < endY) {
                        callback(event);
                        for (let levels of this.levels) {
                            for (let events of levels) {
                                if (events != event) {
                                    inverseCallback(events);
                                }
                            }
                        }
                    } else {
                        inverseCallback(event);
                    }
                }
            }
        });
    }

    onClickEvent(callback) {
        //checks if the mouse is over an event
        this.timeline.addEventListener("click", (e) => {
            let rect = this.timeline.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            for (let level of this.levels) {
                for (let event of level) {
                    let startX = this.getPosFromDate(event.startDate);
                    let endX = this.getPosFromDate(event.endDate);

                    let startY = event.offset - 20;
                    let endY = event.offset + 20;

                    if (x > startX && x < endX && y > startY && y < endY) {
                        callback(event);
                    }
                }
            }
        });
    }

    zoomIn(event) {
        //zooms in on an event
        let startDate = event.startDate;
        let endDate = event.endDate;

        this.timelineParent.scrollLeft = this.getPosFromDate(startDate) - 20;
    }

    generateIndex(container) {
        //generates a 2 column wide list of events
        let index = document.createElement("div");
        index.id = "index";
    
        events = []

        for (let level of this.levels) {
            events = events.concat(level);
        }

        //sort events by start date
        events.sort((a, b) => { return a.startDate - b.startDate });

        for (let event of events) {
            let indexItem = document.createElement("div");

            indexItem.className = "index-item";

            let titleAndDate = document.createElement("div");
            titleAndDate.className = "index-item-title-and-date";

            let indexItemTitle = document.createElement("div");
            indexItemTitle.className = "index-item-title";
            indexItemTitle.innerHTML = event.title;

            let indexItemDescription = document.createElement("div");
            indexItemDescription.className = "index-item-description";
            indexItemDescription.innerHTML = event.description;

            let titleDate = document.createElement("div");
            titleDate.className = "index-item-title-date";

            let startDateText = new Date(event.startDate * 1000).toLocaleDateString("en-US", { year: 'numeric', month: 'long' });
            let endDateText = new Date(event.endDate * 1000).toLocaleDateString("en-US", { year: 'numeric', month: 'long' });

            if (startDateText == endDateText) {
                titleDate.innerHTML = startDateText;
            } else {
                titleDate.innerHTML = startDateText + " - " + endDateText;
            }

            titleAndDate.appendChild(indexItemTitle);
            titleAndDate.appendChild(titleDate);
            indexItem.appendChild(titleAndDate);
            indexItem.appendChild(indexItemDescription);

            if(event.tags.length > 0) {
                let indexItemTags = document.createElement("div");
                indexItemTags.className = "index-item-tags";

                for (let tag of event.tags) {
                    let indexItemTag = document.createElement("div");
                    indexItemTag.className = "index-item-tag";
                    indexItemTag.innerHTML = tag;

                    indexItemTags.appendChild(indexItemTag);
                }

                indexItem.appendChild(indexItemTags);
            }

            event.indexee = indexItem;

            indexItem.addEventListener("mouseover", (_event) => {
                event.hover = true;
            });

            indexItem.addEventListener("mouseleave", (_event) => {
                event.hover = false;
            });

            index.appendChild(indexItem);
        }

        container.appendChild(index);
    }

    start() {
        //clears the canvas
        this.ctx.clearRect(0, 0, this.timeline.width, this.timeline.height);

        //draws a line the width of the canvas
        /*this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.timeline.width, 0);
        this.ctx.strokeStyle = "#ffffff44";
        this.ctx.lineWidth = 230;
        this.ctx.stroke();*/

        this.onHoverOverEvent((event) => {
            event.hover = true;
            event.indexee.className = "index-item index-item-hover";
        }, (event) => {
            event.hover = false;
            event.indexee.className = "index-item";
        });

        /*this.onClickEvent((event) => {
            this.zoomIn(event);
        });*/

        //draws the events on the timeline
        const animate = () => {
            this.ctx.clearRect(0, 0, this.timeline.width, this.timeline.height);
            this.drawEvents();
            requestAnimationFrame(animate);
        };

        animate();
    }
}

loadTimeline = () => {
    timeline = new Timeline();

    //colors: #838381, #494949

    events = [
        new Event(1546301401, 1577837401, "#838381", "Ordentlig Radio", "Developed a Radio app for Ordentlig Radio", ["JS", "React Native"]),
        new Event(1609459801, 1640995801, "#494949", "Jollestore", "Developed the webshop Jollestore.no", ["PHP", "JS", "HTML", "CSS"]),
        new Event(1664579401, 1677629401, "#838381", "Hotshot", "Developed custom boat electronics for the sailing yacht Hotshot", ["NodeJS", "JS", "HTML", "CSS", "C", "C++", "Python", "Raspberry Pi", "ESP32"]),
        new Event(1651360201, 1654460201, "#494949", "Jokermann 2", "Develped custom boat electronics for the Norwegian TP52 Jokermannen 2", []),
        new Event(1596237001, 1672531801, "#838381", "UiT", "Worked as a technician developing and maintaining the university of Tromsø's digital tools", ["Python", "Django", "PostgresSQL", "JS", "HTML", "CSS"]),
        new Event(1672531801, 1699402201, "#838381", "UiT", "The university promoted me to a department engineer", ["Python", "Django", "PostgresSQL", "JS", "HTML", "CSS"]),
        new Event(1451607001, 1560640201, "#838381", "High School", "Finished high school at the Oslo Cathedral school", []),
        new Event(1560640201, 1577837401, "#838381", "Finnish Navy", "As a finnish citizen i did my obligatory millitary service as a coastal jeager with a specialization in communication technologies in the finnish navy", []),
        new Event(1577837401, 1640995801, "#838381", "UiT", "Studied computer science at the univeristy of tromsø", []),
        new Event(1659309001, 1699402201, "#838381", "University College Kristiania", "Studying computer science the university college kristiania", []),
        new Event(1659309001, 1659309001, "#494949", "PyTor", "PyTor is a simple framework that enables the automatic creation of new Tor sessions.", ["Python", "Tor"]),
        new Event(1646957401, 1691017801, "#494949", "Dritings.io", "Created a free website and app that allows users to create, edit, play and share dynamic card based drinking games", ["PHP", "JS", "HTML", "CSS", "React Native", "React JS", "MySQL"]),
        new Event(1556752201, 1557702601, "#494949", "QuickSocket", "A system for creating and using WebSockets in php applications", ["PHP"]),
        new Event(1577664601, 1601248201, "#494949", "Visual Studio Code Internet Relay Chat", "VSIRC is an irc client for vscode", ["NodeJS", "JS", "HTML", "CSS"]),
        new Event(1582503001, 1598569801, "#494949", "Grindr Web Access", "Developed GWA, a framework for interfacing with the Grindr api, Forcing Grindr to pull their web application", ["Python"]),
        new Event(1694733001, 1694733001, "#838381", "Grindr Patch", "Developed an patch that modifies the Grindr application", ["Kotlin", "Java", "Android", "Smali"]),
        new Event(1690845001, 1691449801, "#494949", "Grindr Access", "A new framework for the Grindr API", ["Python"]),
        new Event(1575159001, 1699402201, "#494949", "Steez", "Creating machines, software and equipment for Steez ski co", []),
    ];

    timeline.addEvents(events);
    timeline.eventSort();
    timeline.calculateTimelineWidth();

    timeline.start();

    //if the timeline width is less than the parent width, add a margin
    if (timeline.timeline.width < timeline.timelineParent.clientWidth) {
        timeline.timeline.style.marginLeft = (timeline.timelineParent.clientWidth - timeline.timeline.width - 20) / 2 + "px";
    }

    timeline.generateIndex(document.getElementById("index-container"));

    const scroll = (e) => {
        //get scrollbar position percentage
        let scrollPercent = timeline.timelineParent.scrollLeft / (timeline.timelineParent.scrollWidth - timeline.timelineParent.clientWidth);

        //disable scrolling
        e.preventDefault();
        if (e.deltaY > 0) {
            timeline.scale -= 0.000001;
        } else {
            timeline.scale += 0.000001;
        }

        console.log(timeline.scale);

        timeline.calculateTimelineWidth();

        //set scrollbar position percentage
        timeline.timelineParent.scrollLeft = scrollPercent * (timeline.timelineParent.scrollWidth - timeline.timelineParent.clientWidth);

        //if the timeline width is less than the parent width, add a margin
        if (timeline.timeline.width < timeline.timelineParent.clientWidth) {
            timeline.timeline.style.marginLeft = (timeline.timelineParent.clientWidth - timeline.timeline.width - 20) / 2 + "px";
        }
    };

    timeline.timelineParent.addEventListener("wheel", scroll);
    timeline.timeline.addEventListener("wheel", scroll);

    let pressed = false;

    //mouse click
    timeline.timelineParent.addEventListener("mousedown", (e) => {
        pressed = true;
    });

    //mouse release
    window.addEventListener("mouseup", (e) => {
        pressed = false;
    });

    timeline.timelineParent.addEventListener("mousemove", (e) => {
        //drag the bar left and right
        if (pressed) {
            timeline.timelineParent.scrollLeft -= e.movementX;
        }
    });

}