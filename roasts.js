let roastLinks = [];

async function loadListItemsFromFirebase() {
    const snapshot = await firebase.database().ref('roastLinks').once('value');
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => data[key]);
    }
    return roastLinks;
}

function saveListItemsToFirebase() {
    firebase.database().ref('roastLinks').set(roastLinks)
        .then(() => {
            console.log('List items saved successfully');
        })
        .catch((error) => {
            console.error('Error saving list items:', error);
        });
}

function addroastLinks(links, container) {
    container.innerHTML = ""; // Clear the container before adding items
    links.forEach((link, roastIndex) => {
        const roastItem = createroastItem(link, roastIndex);
        container.appendChild(roastItem);
    });
    saveListItemsToFirebase(); // Save the list items to Firebase
}

function createroastItem(link, roastIndex) {
    const roastItem = document.createElement("div");
    roastItem.className = "roast-item";
    roastItem.setAttribute("draggable", "true");
    roastItem.ondragstart = (event) => {
        event.dataTransfer.setData("text/plain", roastIndex);
    };
    roastItem.ondragover = (event) => {
        event.preventDefault();
    };
    roastItem.ondrop = (event) => {
        event.preventDefault();
        const srcIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);
        const destIndex = roastIndex;
        moveroastLink(srcIndex, destIndex);
        addroastLinks(roastLinks, document.getElementById("roasts"));
    };

    const titleLink = createTitleLink(link);
    roastItem.appendChild(titleLink);

    const collapsibleContent = createCollapsibleContent(link, roastIndex);
    roastItem.appendChild(collapsibleContent);

    titleLink.onclick = () => {
        toggleCollapsibleContent(collapsibleContent);
    };

    return roastItem;
}

function createTitleLink(link) {
    const titleLink = document.createElement("a");
    titleLink.href = "#";
    titleLink.textContent = link.title;
    titleLink.style.cursor = "pointer";
    return titleLink;
}

function createCollapsibleContent(link, roastIndex) {
    const collapsibleContent = document.createElement("div");
    collapsibleContent.className = "collapsible-content";
    collapsibleContent.style.display = "none";

    const description = createDescription(link);
    collapsibleContent.appendChild(description);

    if (link.carouselImages && link.carouselImages.length > 0) {
        const carousel = createCarousel(link, roastIndex);
        collapsibleContent.appendChild(carousel);
    }

    return collapsibleContent;
}

function createDescription(link) {
    const description = document.createElement("p");
    description.innerHTML = link.description;
    return description;
}

function createCarousel(link, roastIndex) {
    const carouselWrapper = document.createElement("div");
    carouselWrapper.className = "carousel-wrapper";

    const carouselId = `roastCarousel${roastIndex}`;

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

    roastLinks.push(newItem);
    addroastLinks(roastLinks, document.getElementById("roasts"));
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

    roastLinks = roastLinks.filter(link => link.title !== itemTitle);
    addroastLinks(roastLinks, document.getElementById("roasts"));
}

function moveroastLink(srcIndex, destIndex) {
    if (srcIndex === destIndex) return;

    const movingItem = roastLinks.splice(srcIndex, 1)[0];
    roastLinks.splice(destIndex, 0, movingItem);
}

document.addEventListener("DOMContentLoaded", async () => {
    const roastContainer = document.getElementById("roasts");
    roastLinks = await loadListItemsFromFirebase();
    addroastLinks(roastLinks, roastContainer);

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

    const newItemIndex = roastLinks.findIndex(link => link.title === itemTitle);
    if (newItemIndex === -1) {
        console.error("Item not found");
        return;
    }

    if (newTitle) {
        roastLinks[newItemIndex].title = newTitle;
    }

    if (newDescription) {
        roastLinks[newItemIndex].description = newDescription;
    }

    if (newImagesInput.length > 0) {
        const newCarouselImages = await uploadImages(newImagesInput);
        roastLinks[newItemIndex].carouselImages = newCarouselImages;
    }

    addroastLinks(roastLinks, document.getElementById("roasts"));
}

// Add a new event listener for the editItemForm:
const editItemForm = document.getElementById("editItemForm");
editItemForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission
    await editListItem();
});