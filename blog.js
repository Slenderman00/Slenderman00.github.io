class Post {
    constructor(title, description, data, tags, date) {
        this.title = title;
        this.description = description;
        this.data = data;
        this.tags = tags;
        this.date = date;
    }

    getHTML() {
        let blogPost = document.createElement("div");

        blogPost.className = "blog-item blog-content hoverable";

        let titleAndDate = document.createElement("div");
        titleAndDate.className = "index-item-title-and-date";

        let indexItemTitle = document.createElement("div");
        indexItemTitle.className = "index-item-title";
        indexItemTitle.innerHTML = this.title;

        let indexItemDescription = document.createElement("div");
        indexItemDescription.className = "index-item-description";
        indexItemDescription.innerHTML = this.description;

        //wtf is even javascript anymore
        indexItemDescription.dataset.originalContent = this.description;


        let titleDate = document.createElement("div");
        titleDate.className = "index-item-title-date";

        let date = new Date(this.date * 1000).toLocaleDateString("en-US", { day: '2-digit', year: 'numeric', month: 'long' });
        titleDate.innerHTML = date;

        titleAndDate.appendChild(indexItemTitle);
        titleAndDate.appendChild(titleDate);
        blogPost.appendChild(titleAndDate);
        blogPost.appendChild(indexItemDescription);

        if(this.tags.length > 0) {
            let indexItemTags = document.createElement("div");
            indexItemTags.className = "index-item-tags";

            for (let tag of this.tags) {
                let indexItemTag = document.createElement("div");
                indexItemTag.className = "index-item-tag";
                indexItemTag.innerHTML = tag;

                indexItemTags.appendChild(indexItemTag);
            }

            blogPost.appendChild(indexItemTags);
        }

        //scope transfer
        let data = this.data;
        let description = this.description;

        blogPost.onclick = function (event) {
            //prevent the event from propagating to the body
            event.stopPropagation();

            //close any previously opened posts
            let expandedPosts = document.querySelectorAll(".blog-item.expanded");

            expandedPosts.forEach(function (post) {
                if (post !== blogPost) {
                    post.classList.remove("expanded");
                    post.classList.add("hoverable");
                    let description = post.querySelector(".index-item-description");
                    setTimeout(function () {
                        description.innerHTML = description.dataset.originalContent;
                    }, 500);
                }
            });

            //toggle the expanded class on the clicked post
            blogPost.classList.toggle("expanded");
            blogPost.classList.toggle("hoverable");

            //update the content based on the state
            if (blogPost.classList.contains("expanded")) {
                indexItemDescription.innerHTML = data;
            } else {
                setTimeout(function () {
                    indexItemDescription.innerHTML = description;
                }, 500);
            }
        };


        return blogPost;
    }
}

class RichText {
    constructor(data) {
        this.data = data;
        this.mother = document.createElement("div");
    }

    parseItem(item, parent) {
        switch (item.nodeType) {
            case "text":
                //console.log(item.value);
                parent.appendChild(document.createTextNode(item.value));
                break;
            case "paragraph":
                let paragraph = document.createElement("p");
                for (let subItem of item.content) {
                    //console.log(subItem);
                    this.parseItem(subItem, paragraph);
                }
                parent.appendChild(paragraph);
                break;
            case "heading-1":
                let heading1 = document.createElement("h1");
                heading1.innerHTML = item.content[0].value;
                parent.appendChild(heading1);
                break;
            case "heading-2":
                let heading2 = document.createElement("h2");
                heading2.innerHTML = item.content[0].value;
                parent.appendChild(heading2);
                break;
            case "heading-3":
                let heading3 = document.createElement("h3");
                heading3.innerHTML = item.content[0].value;
                parent.appendChild(heading3);
                break;
            case "heading-4":
                let heading4 = document.createElement("h4");
                heading4.innerHTML = item.content[0].value;
                parent.appendChild(heading4);
                break;
            case "heading-5":
                let heading5 = document.createElement("h5");
                heading5.innerHTML = item.content[0].value;
                parent.appendChild(heading5);
                break;
            case "heading-6":
                let heading6 = document.createElement("h6");
                heading6.innerHTML = item.content[0].value;
                parent.appendChild(heading6);
                break;
            case "unordered-list":
                let unorderedList = document.createElement("ul");
                for (let subItem of item.content) {
                    //console.log(subItem);
                    this.parseItem(subItem, unorderedList);
                }
                parent.appendChild(unorderedList);
                break;
            case "ordered-list":
                let orderedList = document.createElement("ol");
                for (let subItem of item.content) {
                    let listItem = document.createElement("li");
                    listItem.innerHTML = subItem.content[0].value;
                    orderedList.appendChild(listItem);
                }
                parent.appendChild(orderedList);
                break;
            case "list-item":
                let listItem = document.createElement("li");
                for (let subItem of item.content) {
                    //console.log(subItem);
                    this.parseItem(subItem, listItem);
                }
                parent.appendChild(listItem);
                break;
            case "hyperlink":
                let hyperlink = document.createElement("a");
                hyperlink.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" height="0.8em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"/></svg>';
                for (let subItem of item.content) {
                    //console.log(subItem);
                    this.parseItem(subItem, hyperlink);
                }
                hyperlink.href = item.data.uri;
                parent.appendChild(hyperlink);
                break;
            case "embedded-asset-block":
                let image = document.createElement("img");
                image.id = item.data.id;
                parent.appendChild(image);
                break;
            case "blockquote":
                let blockquote = document.createElement("blockquote");
                for (let subItem of item.content) {
                    //console.log(subItem);
                    this.parseItem(subItem, blockquote);
                }
                parent.appendChild(blockquote);
                break;
            case "hr":
                let hr = document.createElement("hr");
                parent.appendChild(hr);
                break;        
            default:
                console.log(item);
                break;
        }
    }

    parse() {
        let imageMap = [];

        for(let item of this.data) {
            if (item.nodeType == "embedded-asset-block") {
                let id = "image-" + item.data.target.sys.id;
                item.data.id = id;
                fetchImage(item.data.target.sys.id).then(function (url) {
                    imageMap.push({ id: id, url: "https:" + url });
                });
            }
        }
    
        //Replace with some sort of setTimeout
        setInterval(function () {
            for (let item of imageMap) {
                let image = document.getElementById(item.id);
                if (image) {
                    image.src = item.url;
                }
            }
        }, 1000);

        for (let item of this.data) {
            this.parseItem(item, this.mother);
        }
        //console.log(this.data);
        return this.mother.innerHTML;
    }
}

let fetchImage =  async (id) => {
    //fetch("https://cdn.contentful.com/spaces/030xzm76gl6f/environments/master/assets/" + id + "?access_token=2qct9J11QIyz6eGjuZTY5arti-xqpvC8803H0PvfTyE")
    let response = await fetch("https://cdn.contentful.com/spaces/030xzm76gl6f/environments/master/assets/" + id + "?access_token=2qct9J11QIyz6eGjuZTY5arti-xqpvC8803H0PvfTyE");
    let json = await response.json();
    //console.log(json);
    return json.fields.file.url;
}

let addPosts = (container) => {
    let posts = [];

    //fetch posts https://cdn.contentful.com/spaces/{space_id}/environments/{environment_id}/entries?access_token={access_token}
    fetch("https://cdn.contentful.com/spaces/030xzm76gl6f/environments/master/entries?access_token=2qct9J11QIyz6eGjuZTY5arti-xqpvC8803H0PvfTyE").then(function (response) {
        return response.json();
    }).then(function (json) {
        //console.log(json);
        for (let item of json.items) {
            let title = item.fields.title;
            let description = item.fields.description;
            //data is rtf so we need to parse it
            rtf = new RichText(item.fields.content.content);
            let data = rtf.parse();

            let tags = item.fields.tags;

            let date = new Date(item.sys.createdAt).getTime() / 1000;

            posts.push(new Post(title, description, data, tags, date));
        }
        posts.sort(function (a, b) {
            return b.date - a.date;
        });

        for (let post of posts) {
            container.appendChild(post.getHTML());
        }
    });
}