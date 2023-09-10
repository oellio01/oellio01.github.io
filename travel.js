const tripLinks = [
    { 
        title: "Paris", 
        description: "Paris is the capital city of France and a popular tourist destination.",
        carouselImages: [ "https://oellio01.github.io/pictures/Homepage_photos/Website%20Photos/crested_butte.PNG", "https://oellio01.github.io/pictures/Homepage_photos/Website%20Photos/sky_cabin_overhead.jpg",
        ],
    },
    { 
        title: "Barcelona", 
        description: "Barcelona is a vibrant city in Spain, known for its art, architecture, and beautiful beaches.",
        carouselImages: [ "https://oellio01.github.io/pictures/Homepage_photos/Website%20Photos/crested_butte.PNG", "https://oellio01.github.io/pictures/Homepage_photos/Website%20Photos/sky_cabin_overhead.jpg",
        ],
    },
];

// Adds trip links to the specified container
function addTripLinks(links, container) {
    links.forEach((link, tripIndex) => {
        const tripItem = createTripItem(link, tripIndex);
        container.appendChild(tripItem);
    });
}

// Creates a single trip item element
function createTripItem(link, tripIndex) {
    const tripItem = document.createElement("div");
    tripItem.className = "trip-item";

    const titleLink = createTitleLink(link);
    tripItem.appendChild(titleLink);

    const collapsibleContent = createCollapsibleContent(link, tripIndex);
    tripItem.appendChild(collapsibleContent);

    titleLink.onclick = () => {
        toggleCollapsibleContent(collapsibleContent);
    };

    return tripItem;
}

// Creates the title link element for a trip item
function createTitleLink(link) {
    const titleLink = document.createElement("a");
    titleLink.href = "#";
    titleLink.textContent = link.title;
    titleLink.style.cursor = "pointer";
    return titleLink;
}

// Creates the collapsible content element for a trip item
function createCollapsibleContent(link, tripIndex) {
    const collapsibleContent = document.createElement("div");
    collapsibleContent.className = "collapsible-content";
    collapsibleContent.style.display = "none";

    const description = createDescription(link);
    collapsibleContent.appendChild(description);

    const carousel = createCarousel(link, tripIndex);
    collapsibleContent.appendChild(carousel);

    return collapsibleContent;
}

// Creates the description element for a trip item
function createDescription(link) {
    const description = document.createElement("p");
    description.innerHTML = link.description;
    return description;
}

// Creates the carousel element for a trip item
function createCarousel(link, tripIndex) {
    const carouselWrapper = document.createElement("div");
    carouselWrapper.className = "carousel-wrapper";
    
    const carouselId = `tripCarousel${tripIndex}`;

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

// Toggles the display of the collapsible content element
function toggleCollapsibleContent(collapsibleContent) {
    const currentDisplay = collapsibleContent.style.display;
    collapsibleContent.style.display = currentDisplay === "block" ? "none" : "block";
}

// Adds trip links to the container when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const tripContainer = document.getElementById("trips");
    addTripLinks(tripLinks, tripContainer);
});
