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

        let date = new Date(this.date * 1000).toLocaleDateString("en-US", { year: 'numeric', month: 'long' });
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
            // Prevent the event from propagating to the body
            event.stopPropagation();

            // Close any previously opened posts
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

            // Toggle the expanded class on the clicked post
            blogPost.classList.toggle("expanded");
            blogPost.classList.toggle("hoverable");

            // Update the content based on the state
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