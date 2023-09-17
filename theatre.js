let theatreLinks = [];

async function loadListItemsFromFirebase() {
    const snapshot = await firebase.database().ref('theatreLinks').once('value');
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => data[key]);
    }
    return theatreLinks;
}

function saveListItemsToFirebase() {
    firebase.database().ref('theatreLinks').set(theatreLinks)
        .then(() => {
            console.log('List items saved successfully');
        })
        .catch((error) => {
            console.error('Error saving list items:', error);
        });
}

function addtheatreLinks(links, container) {
    container.innerHTML = ""; // Clear the container before adding items
    links.forEach((link, theatreIndex) => {
        const theatreItem = createtheatreItem(link, theatreIndex);
        container.appendChild(theatreItem);
    });
    saveListItemsToFirebase(); // Save the list items to Firebase
}

function createtheatreItem(link, theatreIndex) {
    const theatreItem = document.createElement("div");
    theatreItem.className = "theatre-item";
    theatreItem.setAttribute("draggable", "true");
    theatreItem.ondragstart = (event) => {
        event.dataTransfer.setData("text/plain", theatreIndex);
    };
    theatreItem.ondragover = (event) => {
        event.preventDefault();
    };
    theatreItem.ondrop = (event) => {
        event.preventDefault();
        const srcIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);
        const destIndex = theatreIndex;
        movetheatreLink(srcIndex, destIndex);
        addtheatreLinks(theatreLinks, document.getElementById("theatres"));
    };

    const titleLink = createTitleLink(link);
    theatreItem.appendChild(titleLink);

    const collapsibleContent = createCollapsibleContent(link, theatreIndex);
    theatreItem.appendChild(collapsibleContent);

    titleLink.onclick = () => {
        toggleCollapsibleContent(collapsibleContent);
    };

    return theatreItem;
}

function createTitleLink(link) {
    const titleLink = document.createElement("a");
    titleLink.href = "#";
    titleLink.textContent = link.title;
    titleLink.style.cursor = "pointer";
    return titleLink;
}

function createCollapsibleContent(link, theatreIndex) {
    const collapsibleContent = document.createElement("div");
    collapsibleContent.className = "collapsible-content";
    collapsibleContent.style.display = "none";

    const description = createDescription(link);
    collapsibleContent.appendChild(description);

    if (link.carouselImages && link.carouselImages.length > 0) {
        const carousel = createCarousel(link, theatreIndex);
        collapsibleContent.appendChild(carousel);
    }

    return collapsibleContent;
}

function createDescription(link) {
    const description = document.createElement("p");
    description.innerHTML = link.description;
    return description;
}

function createCarousel(link, theatreIndex) {
    const carouselWrapper = document.createElement("div");
    carouselWrapper.className = "carousel-wrapper";

    const carouselId = `theatreCarousel${theatreIndex}`;

    const carousel = document.createElement("div");
    carousel.className = "carousel slide";
    carousel.id = carouselId;
    carousel.setAttribute("data-ride", "carousel");
    carouselWrapper.appendChild(carousel);

    const carouselIndicators = document.createElement("ol");
    carouselIndicators.className = "carousel-indicators";
    carousel.appendChild(carouselIndicators);

    const carouselInner = document.createElement("div");
    carouselInner.className = "carousel-inner";
    carousel.appendChild(carouselInner);

    link.carouselImages.forEach((image, index) => {
        const carouselIndicator = document.createElement("li");
        carouselIndicator.setAttribute("data-target", `#${carouselId}`);
        carouselIndicator.setAttribute("data-slide-to", index);
        if (index === 0) {
            carouselIndicator.className = "active";
        }
        carouselIndicators.appendChild(carouselIndicator);

        const carouselItem = document.createElement("div");
        carouselItem.className = index === 0 ? "carousel-item active" : "carousel-item";
        carouselInner.appendChild(carouselItem);

        const carouselImage = document.createElement("img");
        carouselImage.className = "d-block w-100";
        carouselImage.src = image;
        carouselItem.appendChild(carouselImage);
    });

    const prevButton = document.createElement("a");
    prevButton.className = "carousel-control-prev";
    prevButton.href = `#${carouselId}`;
    prevButton.setAttribute("role", "button");
    prevButton.setAttribute("data-slide", "prev");
    carousel.appendChild(prevButton);

    const prevIcon = document.createElement("span");
    prevIcon.className = "carousel-control-prev-icon";
    prevIcon.setAttribute("aria-hidden", "true");
    prevButton.appendChild(prevIcon);

    const prevText = document.createElement("span");
    prevText.className = "sr-only";
    prevText.textContent = "Previous";
    prevButton.appendChild(prevText);

    const nextButton = document.createElement("a");
    nextButton.className = "carousel-control-next";
    nextButton.href = `#${carouselId}`;
    nextButton.setAttribute("role", "button");
    nextButton.setAttribute("data-slide", "next");
    carousel.appendChild(nextButton);

    const nextIcon = document.createElement("span");
    nextIcon.className = "carousel-control-next-icon";
    nextIcon.setAttribute("aria-hidden", "true");
    nextButton.appendChild(nextIcon);

    const nextText = document.createElement("span");
    nextText.className = "sr-only";
    nextText.textContent = "Next";
    nextButton.appendChild(nextText);

    return carouselWrapper;
}

function toggleCollapsibleContent(collapsibleContent) {
    const allCollapsibleContents = document.querySelectorAll(".collapsible-content");

    allCollapsibleContents.forEach((content) => {
        if (content !== collapsibleContent && content.style.display === "block") {
            content.style.display = "none";
        }
    });

    const currentDisplay = collapsibleContent.style.display;
    collapsibleContent.style.display = currentDisplay === "block" ? "none" : "block";
}

async function addNewListItem() {
    const titleInput = document.getElementById("title").value;
    const descriptionInput = document.getElementById("description").value;
    const imagesInput = document.getElementById("images").files;

    if (!titleInput || !descriptionInput) return;

    const carouselImages = await uploadImages(imagesInput); // Pass the imagesInput to the uploadImages function

    const newItem = {
        title: titleInput,
        description: descriptionInput,
        carouselImages: carouselImages.length > 0 ? carouselImages : [],
    };

    theatreLinks.push(newItem);
    addtheatreLinks(theatreLinks, document.getElementById("theatres"));
}

async function uploadImages(imagesInput) {
    const storageRef = firebase.storage().ref();
    const uploadedImages = [];

    for (let i = 0; i < imagesInput.length; i++) {
        const imageFile = imagesInput[i];

        try {
            const metadata = {
                contentType: imageFile.type,
            };
            const uniqueId = new Date().getTime();
            const imageRef = storageRef.child(`images/${uniqueId}_${imageFile.name}`);
            const uploadTask = await imageRef.put(imageFile, metadata);
            const downloadURL = await uploadTask.ref.getDownloadURL();
            uploadedImages.push(downloadURL);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    }

    return uploadedImages;
}

async function deleteListItem() {
    const itemTitle = document.getElementById("itemTitle").value;

    if (!itemTitle) return;

    theatreLinks = theatreLinks.filter(link => link.title !== itemTitle);
    addtheatreLinks(theatreLinks, document.getElementById("theatres"));
}

function movetheatreLink(srcIndex, destIndex) {
    if (srcIndex === destIndex) return;

    const movingItem = theatreLinks.splice(srcIndex, 1)[0];
    theatreLinks.splice(destIndex, 0, movingItem);
}

document.addEventListener("DOMContentLoaded", async () => {
    const theatreContainer = document.getElementById("theatres");
    theatreLinks = await loadListItemsFromFirebase();
    addtheatreLinks(theatreLinks, theatreContainer);

    const addNewItemForm = document.getElementById("addNewItemForm");
    addNewItemForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await addNewListItem();
    });

    const deleteItemForm = document.getElementById("deleteItemForm");
    deleteItemForm.addEventListener("submit", (event) => {
        event.preventDefault();
        deleteListItem();
    });

    const editItemForm = document.getElementById("editItemForm");
    editItemForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await editListItem();
    });
});

async function editListItem() {
    const itemTitle = document.getElementById("editItemTitle").value;
    const newTitle = document.getElementById("editTitle").value;
    const newDescription = document.getElementById("editDescription").value;
    const newImagesInput = document.getElementById("editImages").files;

    if (!itemTitle) return;

    const newItemIndex = theatreLinks.findIndex(link => link.title === itemTitle);
    if (newItemIndex === -1) {
        console.error("Item not found");
        return;
    }

    if (newTitle) {
        theatreLinks[newItemIndex].title = newTitle;
    }

    if (newDescription) {
        theatreLinks[newItemIndex].description = newDescription;
    }

    if (newImagesInput.length > 0) {
        const newCarouselImages = await uploadImages(newImagesInput);
        theatreLinks[newItemIndex].carouselImages = newCarouselImages;
    }

    addtheatreLinks(theatreLinks, document.getElementById("theatres"));
}

// Add a new event listener for the editItemForm:
const editItemForm = document.getElementById("editItemForm");
editItemForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission
    await editListItem();
});