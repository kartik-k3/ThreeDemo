import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Scene setup
const scene = new THREE.Scene();
const backgroundColor = 0x87ceeb; // Sky blue for background
scene.background = new THREE.Color(backgroundColor);

// Array to store selected videos
const selectedVideos = [];

// Main camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// WebGL renderer for 3D objects
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadow for better gradient effect
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0px";
document.body.appendChild(renderer.domElement);

// CSS3D renderer for text
const css3dRenderer = new CSS3DRenderer();
css3dRenderer.setSize(window.innerWidth, window.innerHeight);
css3dRenderer.domElement.style.position = "absolute";
css3dRenderer.domElement.style.top = "0px";
document.body.appendChild(css3dRenderer.domElement);

// Main Card with rounded edges
// Create a rounded rectangle shape
const width = 3.3;
const height = 4;
const depth = 0.15;
const radius = 0.2; // Corner radius

// Create a shape with rounded corners
const shape = new THREE.Shape();
const x = -width / 2;
const y = -height / 2;

shape.moveTo(x + radius, y);
shape.lineTo(x + width - radius, y);
shape.quadraticCurveTo(x + width, y, x + width, y + radius);
shape.lineTo(x + width, y + height - radius);
shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
shape.lineTo(x + radius, y + height);
shape.quadraticCurveTo(x, y + height, x, y + height - radius);
shape.lineTo(x, y + radius);
shape.quadraticCurveTo(x, y, x + radius, y);

// Create extruded geometry for the card
const extrudeSettings = {
  steps: 1,
  depth: depth,
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.05,
  bevelOffset: 0,
  bevelSegments: 3,
};

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

// Improved card material - Using PhongMaterial for better appearance
const material = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  specular: 0x111111,
  shininess: 100,
  emissive: 0x555555,
  emissiveIntensity: 0.1,
}); // Bright white color with shine

const card = new THREE.Mesh(geometry, material);
// Rotate the card to face the camera
card.rotation.x = Math.PI;
card.castShadow = true;
scene.add(card);

// Create a beach ball mesh (full sphere with colorful segments)
const buttonRadius = 0.4;
const buttonGeometry = new THREE.SphereGeometry(buttonRadius, 32, 16);

// Create a material with beach ball-like colorful segments
const segments = 6; // Number of color segments
const colors = [0xff0000, 0xffff00, 0x00ff00, 0x00ffff, 0x0000ff, 0xff00ff]; // Red, yellow, green, cyan, blue, magenta

// Create a group to hold all the segments
const buttonMesh = new THREE.Group();
buttonMesh.position.set(width + 0.5, 0, 0); // Position to the right of the card
buttonMesh.rotation.x = 7.9;
buttonMesh.rotation.y = 1.5;

// Create each segment
for (let i = 0; i < segments; i++) {
  const segmentGeometry = new THREE.SphereGeometry(
    buttonRadius,
    32,
    16,
    (i * Math.PI) / (segments / 2),
    Math.PI / (segments / 2),
    0,
    Math.PI
  );

  const buttonMaterial = new THREE.MeshPhongMaterial({
    color: colors[i % colors.length],
    specular: 0x111111,
    shininess: 80,
  });

  const segmentMesh = new THREE.Mesh(segmentGeometry, buttonMaterial);
  segmentMesh.castShadow = true;
  buttonMesh.add(segmentMesh);
}

scene.add(buttonMesh);

// Create a loader
const loader = new GLTFLoader();

// Load the GLTF model
loader.load(
  // Resource URL
  "/beach/scene.gltf",

  // Called when the resource is loaded
  function (gltf) {
    // Get the model from the loaded GLTF
    const groundModel = gltf.scene;

    // Apply transformations similar to your original ground plane
    groundModel.position.y = -5.5; // Position at the same height as original ground
    groundModel.position.z = -1;
    groundModel.position.x = 1.5;

    // Enable shadows for all meshes in the model
    groundModel.traverse((node) => {
      if (node.isMesh) {
        node.receiveShadow = true;

        // Optionally modify materials if needed
        if (node.material) {
          node.material.roughness = 0.8;
          node.material.metalness = 0.2;
        }
      }
    });

    // Add the model to the scene
    scene.add(groundModel);
  }
);

// Directional light for overall illumination and shadow casting
const directionalLight = new THREE.DirectionalLight(0xffffff, 4.856);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.left = -5;
directionalLight.shadow.camera.right = 5;
directionalLight.shadow.camera.top = 5;
directionalLight.shadow.camera.bottom = -5;
// Make the shadow lighter
directionalLight.shadow.opacity = 0.5;
directionalLight.shadow.bias = -0.0005;
scene.add(directionalLight);

// Add ambient light to brighten the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Increased intensity for brighter card
scene.add(ambientLight);

// Container element using CSS3D with fixed styling
const containerElement = document.createElement("div");
containerElement.className = "card-container";
containerElement.style.width = "330px"; // Match card width (3.3 units * 100)
containerElement.style.height = "400px"; // Match card height (4 units * 100)
containerElement.style.backgroundColor = "#ffffff !important";
containerElement.style.fontSize = "24px";
containerElement.style.fontWeight = "bold";
containerElement.style.textAlign = "center";
containerElement.style.display = "flex";
containerElement.style.flexDirection = "column"; // Make it a column layout
containerElement.style.alignItems = "center";
containerElement.style.justifyContent = "flex-start"; // Align items to the top
containerElement.style.pointerEvents = "none"; // Make text non-selectable
containerElement.style.borderRadius = "20px"; // Add border radius to match the card

// Create an actual HTML element with a background to ensure visibility
const innerTextElement = document.createElement("div");
innerTextElement.style.width = "100%";
innerTextElement.style.padding = "10px";
innerTextElement.style.background = "rgba(255, 255, 255, 1.0) !important"; // Fully opaque white
innerTextElement.style.color = "#000000 !important";
innerTextElement.style.borderRadius = "20px 20px 0 0"; // Round only top corners

// Add Font Awesome CSS to the document head
const fontAwesomeLink = document.createElement("link");
fontAwesomeLink.rel = "stylesheet";
fontAwesomeLink.href =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
document.head.appendChild(fontAwesomeLink);

// Use outlined camera icon with circular border and smaller size
innerTextElement.innerHTML = `
<div style='display: flex; justify-content: left; align-items: flex-start;'>
  <div style='display: flex; justify-content: center; align-items: center;'>
      <div style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid #939393; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
          <i class="fa fa-camera" style="color: #939393; font-size: 18px;"></i>
      </div>
      <div style='display:flex; flex-direction: column; justify-content: left; align-items: start;'>
          <p style='color: #939393 !important; margin: 0; font-size: 14px;'>username</p>
          <p style='color:rgb(130, 130, 130, 0.7) !important; margin: 0; font-size: 12px; font-weight: 300;'>Sponsored</p>
      </div>
  </div>
</div>
`;

containerElement.appendChild(innerTextElement);

// Create an image container with visible dimensions and content
const imageContainer = document.createElement("div");
imageContainer.style.width = "330px";
imageContainer.style.display = "flex";
imageContainer.style.justifyContent = "center";

const innerImageElement = document.createElement("div");
innerImageElement.style.width = "315px";
innerImageElement.style.height = "220px"; // Give it a specific height
innerImageElement.style.backgroundColor = "transparent !important"; // Light gray background
innerImageElement.style.display = "flex";
innerImageElement.style.alignItems = "center";
innerImageElement.style.justifyContent = "center";
innerImageElement.style.overflow = "hidden";
innerImageElement.style.pointerEvents = "auto"; // Changed to auto to allow interaction with video controls

imageContainer.appendChild(innerImageElement);

containerElement.appendChild(imageContainer);

// Create Instagram-style icon row (like, comment, share)
const iconRowContainer = document.createElement("div");
iconRowContainer.style.width = "330px";
iconRowContainer.style.display = "flex";
iconRowContainer.style.justifyContent = "center";

const iconRow = document.createElement("div");
iconRow.style.width = "315px";
iconRow.style.padding = "10px 0";
iconRow.style.display = "flex";
iconRow.style.alignItems = "center";
iconRow.style.justifyContent = "space-between"; // Main spacing between groups
iconRow.style.pointerEvents = "none";

iconRowContainer.appendChild(iconRow);

// Left group of interaction icons (like, comment, share)
const leftIcons = document.createElement("div");
leftIcons.style.display = "flex";
leftIcons.style.alignItems = "center";
leftIcons.style.gap = "16px"; // Space between icons

// Heart/Like icon
const likeIcon = document.createElement("div");
likeIcon.innerHTML = `<i class="fa-regular fa-heart" style="color: #939393; font-size: 24px;"></i>`;

// Comment icon
const commentIcon = document.createElement("div");
commentIcon.innerHTML = `<i class="fa-regular fa-comment" style="color: #939393; font-size: 24px;"></i>`;

// Share icon
const shareIcon = document.createElement("div");
shareIcon.innerHTML = `<i class="fa-regular fa-paper-plane" style="color: #939393; font-size: 24px;"></i>`;

// Add all icons to the left group
leftIcons.appendChild(likeIcon);
leftIcons.appendChild(commentIcon);
leftIcons.appendChild(shareIcon);

// Bookmark icon (right side)
const saveIcon = document.createElement("div");
saveIcon.innerHTML = `<i class="fa-regular fa-bookmark" style="color: #939393; font-size: 24px;"></i>`;

// Add both groups to the icon row
iconRow.appendChild(leftIcons);
iconRow.appendChild(saveIcon);

containerElement.appendChild(iconRowContainer);

// Add likes counter text
const likesCounter = document.createElement("div");
likesCounter.style.width = "315px";
likesCounter.style.textAlign = "left";
likesCounter.style.fontSize = "14px";
likesCounter.style.fontWeight = "600";
likesCounter.style.color = "#939393";
likesCounter.style.padding = "0 0 8px 0";
likesCounter.innerHTML = `<div style='padding-left: 10px;'><div>1,234 likes</div><div style='color:blue'>#Beach #Party</div></div>`;

containerElement.appendChild(likesCounter);

// Create CSS3D object for the container
const containerObject = new CSS3DObject(containerElement);
containerObject.position.set(0, 0, 0.1); // Position in front of card
containerObject.scale.set(0.01, 0.01, 0.01); // Scale down to match THREE.js units
scene.add(containerObject);

// Create a CSS3D button that will be placed on top of the button mesh
const buttonElement = document.createElement("div");
buttonElement.style.width = "80px";
buttonElement.style.height = "80px";
buttonElement.style.display = "flex";
buttonElement.style.alignItems = "center";
buttonElement.style.justifyContent = "center";
buttonElement.style.backgroundColor = "transparent";
buttonElement.style.cursor = "pointer";
buttonElement.style.pointerEvents = "auto"; // Make it clickable

// Create an actual button element for better click reliability
const htmlButton = document.createElement("button");
htmlButton.style.width = "80px";
htmlButton.style.height = "80px";
htmlButton.style.borderRadius = "50%";
htmlButton.style.background = "transparent";
htmlButton.style.cursor = "pointer";
htmlButton.style.display = "flex";
htmlButton.style.alignItems = "center";
htmlButton.style.justifyContent = "center";
htmlButton.style.position = "relative";
htmlButton.innerHTML = `<p></p>`;
htmlButton.style.border = "0px solid transparent";

buttonElement.appendChild(htmlButton);

const buttonCSS3D = new CSS3DObject(buttonElement);
buttonCSS3D.position.set(width + 0.5, 0, 0); // Same position as the button mesh
buttonCSS3D.scale.set(0.01, 0.01, 0.01); // Scale down to match THREE.js units
scene.add(buttonCSS3D);

// Create modal container (initially hidden)
const modalContainer = document.createElement("div");
modalContainer.style.position = "fixed";
modalContainer.style.top = "0";
modalContainer.style.left = "0";
modalContainer.style.width = "100%";
modalContainer.style.height = "100%";
modalContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
modalContainer.style.display = "none";
modalContainer.style.alignItems = "center";
modalContainer.style.justifyContent = "center";
modalContainer.style.zIndex = "1000";
modalContainer.style.pointerEvents = "auto"; // Ensure clickable
document.body.appendChild(modalContainer);

// Create modal content
const modalContent = document.createElement("div");
modalContent.style.width = "60%";
modalContent.style.maxWidth = "600px";
modalContent.style.backgroundColor = "white";
modalContent.style.borderRadius = "10px";
modalContent.style.padding = "20px";
modalContent.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
modalContainer.appendChild(modalContent);

// Create modal header
const modalHeader = document.createElement("div");
modalHeader.style.display = "flex";
modalHeader.style.justifyContent = "space-between";
modalHeader.style.alignItems = "center";
modalHeader.style.marginBottom = "20px";

const modalTitle = document.createElement("h2");
modalTitle.textContent = "Select a Video";
modalTitle.style.margin = "0";

const closeButton = document.createElement("button");
closeButton.innerHTML = `<i class="fa fa-times" style="font-size: 20px;"></i>`;
closeButton.style.background = "none";
closeButton.style.border = "none";
closeButton.style.cursor = "pointer";
closeButton.style.fontSize = "24px";

modalHeader.appendChild(modalTitle);
modalHeader.appendChild(closeButton);
modalContent.appendChild(modalHeader);

// Create video grid
const videoGrid = document.createElement("div");
videoGrid.style.display = "grid";
videoGrid.style.gridTemplateColumns = "repeat(3, 1fr)";
videoGrid.style.gap = "15px";
modalContent.appendChild(videoGrid);

// Create carousel container (initially hidden)
const carouselContainer = document.createElement("div");
carouselContainer.style.position = "fixed";
carouselContainer.style.bottom = "20px";
carouselContainer.style.left = "50%";
carouselContainer.style.transform = "translateX(-50%)";
carouselContainer.style.width = "80%";
carouselContainer.style.maxWidth = "800px";
carouselContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
carouselContainer.style.borderRadius = "10px";
carouselContainer.style.padding = "20px";
carouselContainer.style.display = "none";
carouselContainer.style.zIndex = "999";
carouselContainer.style.pointerEvents = "auto";
document.body.appendChild(carouselContainer);

// Create carousel title
const carouselTitle = document.createElement("h3");
carouselTitle.textContent = "Selected Videos";
carouselTitle.style.color = "white";
carouselTitle.style.margin = "0 0 15px 0";
carouselTitle.style.textAlign = "center";
carouselContainer.appendChild(carouselTitle);

// Create carousel content
const carouselContent = document.createElement("div");
carouselContent.style.position = "relative";
carouselContent.style.width = "100%";
carouselContent.style.height = "300px";
carouselContent.style.overflow = "hidden";
carouselContent.style.borderRadius = "5px";
carouselContainer.appendChild(carouselContent);

// Create video track to hold carousel items
const videoTrack = document.createElement("div");
videoTrack.id = "videoTrack";
videoTrack.style.display = "flex";
videoTrack.style.transition = "transform 0.5s ease-in-out";
videoTrack.style.height = "100%";
carouselContent.appendChild(videoTrack);

// Create carousel navigation
const carouselNav = document.createElement("div");
carouselNav.style.display = "flex";
carouselNav.style.justifyContent = "space-between";
carouselNav.style.marginTop = "15px";
carouselContainer.appendChild(carouselNav);

// Create prev and next buttons
const prevButton = document.createElement("button");
prevButton.innerHTML = '<i class="fa fa-chevron-left"></i> Prev';
prevButton.style.backgroundColor = "#4a86e8";
prevButton.style.color = "white";
prevButton.style.border = "none";
prevButton.style.borderRadius = "5px";
prevButton.style.padding = "8px 15px";
prevButton.style.cursor = "pointer";
carouselNav.appendChild(prevButton);

// Create close carousel button
const closeCarouselButton = document.createElement("button");
closeCarouselButton.innerHTML = "Close";
closeCarouselButton.style.backgroundColor = "#f44336";
closeCarouselButton.style.color = "white";
closeCarouselButton.style.border = "none";
closeCarouselButton.style.borderRadius = "5px";
closeCarouselButton.style.padding = "8px 15px";
closeCarouselButton.style.cursor = "pointer";
carouselNav.appendChild(closeCarouselButton);

const nextButton = document.createElement("button");
nextButton.innerHTML = 'Next <i class="fa fa-chevron-right"></i>';
nextButton.style.backgroundColor = "#4a86e8";
nextButton.style.color = "white";
nextButton.style.border = "none";
nextButton.style.borderRadius = "5px";
nextButton.style.padding = "8px 15px";
nextButton.style.cursor = "pointer";
carouselNav.appendChild(nextButton);

// Create toggle carousel button (to show/hide carousel)
const toggleCarouselButton = document.createElement("button");
toggleCarouselButton.innerHTML = '<i class="fa fa-film"></i> Show Videos';
toggleCarouselButton.style.position = "fixed";
toggleCarouselButton.style.bottom = "20px";
toggleCarouselButton.style.right = "20px";
toggleCarouselButton.style.backgroundColor = "#4a86e8";
toggleCarouselButton.style.color = "white";
toggleCarouselButton.style.border = "none";
toggleCarouselButton.style.borderRadius = "5px";
toggleCarouselButton.style.padding = "10px 15px";
toggleCarouselButton.style.cursor = "pointer";
toggleCarouselButton.style.display = "none"; // Initially hidden
toggleCarouselButton.style.zIndex = "998";
document.body.appendChild(toggleCarouselButton);

// Carousel state
let currentSlide = 0;
let isCarouselVisible = false;

// Function to update the carousel based on selected videos
function updateCarousel() {
  // Clear current videos in the track
  videoTrack.innerHTML = "";

  // If we have selected videos
  if (selectedVideos.length > 0) {
    // Show toggle button
    toggleCarouselButton.style.display = "block";

    // Add videos to the track
    selectedVideos.forEach((src, index) => {
      const videoContainer = document.createElement("div");
      videoContainer.style.minWidth = "100%";
      videoContainer.style.height = "100%";
      videoContainer.style.padding = "0 5px";
      videoContainer.style.boxSizing = "border-box";
      videoContainer.style.position = "relative"; // Added for remove button positioning

      const video = document.createElement("video");
      video.src = src;
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "contain";
      video.style.backgroundColor = "black";

      // Make videos playable
      video.controls = true;
      video.muted = false;

      // Pause other videos when this one starts playing
      video.addEventListener("play", () => {
        document.querySelectorAll("#videoTrack video").forEach((otherVideo) => {
          if (otherVideo !== video && !otherVideo.paused) {
            otherVideo.pause();
          }
        });
      });

      videoContainer.appendChild(video);
      videoTrack.appendChild(videoContainer);
    });

    // Reset to first slide
    goToSlide(0);
  } else {
    // Hide toggle button if no videos
    toggleCarouselButton.style.display = "none";
    carouselContainer.style.display = "none";
    isCarouselVisible = false;
  }

  // Add remove buttons
  addRemoveButtons();
}

// Function to go to a specific slide
function goToSlide(slideIndex) {
  if (selectedVideos.length === 0) return;

  currentSlide = slideIndex;

  // Handle circular navigation
  if (currentSlide < 0) {
    currentSlide = selectedVideos.length - 1;
  } else if (currentSlide >= selectedVideos.length) {
    currentSlide = 0;
  }

  // Update the transform to show the current slide
  videoTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

  // Pause all videos
  document.querySelectorAll("#videoTrack video").forEach((video) => {
    video.pause();
  });
}

// Create a function to render a carousel inside the card's imageContainer
function updateCardCarousel() {
  // Clear the current content of the innerImageElement
  innerImageElement.innerHTML = "";

  // Check if we have selected videos
  if (selectedVideos.length > 0) {
    // Create an in-card carousel container
    const cardCarouselContainer = document.createElement("div");
    cardCarouselContainer.style.width = "100%";
    cardCarouselContainer.style.height = "100%";
    cardCarouselContainer.style.position = "relative";
    cardCarouselContainer.style.overflow = "hidden";
    cardCarouselContainer.style.cursor =
      selectedVideos.length > 1 ? "grab" : "default"; // Show grab cursor when swiping is available

    // Create carousel track
    const cardCarouselTrack = document.createElement("div");
    cardCarouselTrack.id = "cardCarouselTrack";
    cardCarouselTrack.style.display = "flex";
    cardCarouselTrack.style.transition = "transform 0.5s ease-in-out";
    cardCarouselTrack.style.height = "100%";
    cardCarouselTrack.style.width = `${selectedVideos.length * 100}%`; // Set width based on number of slides

    // Add videos to the track
    selectedVideos.forEach((src) => {
      const videoContainer = document.createElement("div");
      videoContainer.style.width = `${100 / selectedVideos.length}%`; // Each container is sized proportionally
      videoContainer.style.height = "100%";
      videoContainer.style.flexShrink = "0";
      videoContainer.style.position = "relative";

      const video = document.createElement("video");
      video.src = src;
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "contain";
      video.style.backgroundColor = "black";
      video.controls = true; // Make videos playable
      video.muted = false;

      // Pause other videos when this one starts playing
      video.addEventListener("play", () => {
        document
          .querySelectorAll("#cardCarouselTrack video")
          .forEach((otherVideo) => {
            if (otherVideo !== video && !otherVideo.paused) {
              otherVideo.pause();
            }
          });
      });

      videoContainer.appendChild(video);
      cardCarouselTrack.appendChild(videoContainer);
    });

    // Create navigation buttons
    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = '<i class="fa fa-chevron-left"></i>';
    prevBtn.style.position = "absolute";
    prevBtn.style.left = "10px";
    prevBtn.style.top = "50%";
    prevBtn.style.transform = "translateY(-50%)";
    prevBtn.style.zIndex = "2";
    prevBtn.style.backgroundColor = "rgba(0,0,0,0.5)";
    prevBtn.style.color = "white";
    prevBtn.style.border = "none";
    prevBtn.style.borderRadius = "50%";
    prevBtn.style.width = "30px";
    prevBtn.style.height = "30px";
    prevBtn.style.cursor = "pointer";
    prevBtn.style.display = selectedVideos.length > 1 ? "block" : "none";
    prevBtn.style.pointerEvents = "auto"; // Ensure it's clickable

    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = '<i class="fa fa-chevron-right"></i>';
    nextBtn.style.position = "absolute";
    nextBtn.style.right = "10px";
    nextBtn.style.top = "50%";
    nextBtn.style.transform = "translateY(-50%)";
    nextBtn.style.zIndex = "2";
    nextBtn.style.backgroundColor = "rgba(0,0,0,0.5)";
    nextBtn.style.color = "white";
    nextBtn.style.border = "none";
    nextBtn.style.borderRadius = "50%";
    nextBtn.style.width = "30px";
    nextBtn.style.height = "30px";
    nextBtn.style.cursor = "pointer";
    nextBtn.style.display = selectedVideos.length > 1 ? "block" : "none";
    nextBtn.style.pointerEvents = "auto"; // Ensure it's clickable

    // Add counter indicator (e.g., "1/4")
    const counter = document.createElement("div");
    counter.id = "cardCarouselCounter";
    counter.style.position = "absolute";
    counter.style.bottom = "10px";
    counter.style.right = "10px";
    counter.style.backgroundColor = "rgba(0,0,0,0.5)";
    counter.style.color = "white";
    counter.style.padding = "5px 10px";
    counter.style.borderRadius = "10px";
    counter.style.fontSize = "12px";
    counter.style.zIndex = "2";
    counter.textContent = `1/${selectedVideos.length}`;
    counter.style.display = selectedVideos.length > 1 ? "block" : "none";

    // Variable to track current slide
    window.currentCardSlide = 0;

    // Function to go to a specific slide
    function goToCardSlide(slideIndex) {
      if (selectedVideos.length === 0) return;

      // Pause all videos
      document.querySelectorAll("#cardCarouselTrack video").forEach((video) => {
        video.pause();
      });

      window.currentCardSlide = slideIndex;

      // Handle circular navigation
      if (window.currentCardSlide < 0) {
        window.currentCardSlide = selectedVideos.length - 1;
      } else if (window.currentCardSlide >= selectedVideos.length) {
        window.currentCardSlide = 0;
      }

      // Calculate the percentage to move based on total width
      const slidePercentage = 100 / selectedVideos.length;

      // Update the transform to show the current slide - use fixed percentage based on number of slides
      cardCarouselTrack.style.transform = `translateX(-${
        window.currentCardSlide * slidePercentage
      }%)`;

      // Update counter
      counter.textContent = `${window.currentCardSlide + 1}/${
        selectedVideos.length
      }`;
    }

    // Add event listeners for navigation
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      goToCardSlide(window.currentCardSlide - 1);
    });

    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      goToCardSlide(window.currentCardSlide + 1);
    });

    // Make all video elements clickable for play/pause
    document.querySelectorAll("#cardCarouselTrack video").forEach((video) => {
      video.style.pointerEvents = "auto";
    });

    // Add elements to the carousel container
    cardCarouselContainer.appendChild(cardCarouselTrack);
    cardCarouselContainer.appendChild(prevBtn);
    cardCarouselContainer.appendChild(nextBtn);
    cardCarouselContainer.appendChild(counter);

    // Add swipe gesture support for the carousel
    let startX = 0;
    let startY = 0; // Track vertical position too
    let isDraggingCarousel = false;
    let carouselDragThreshold = 50; // Minimum distance to trigger a slide change
    let clickThreshold = 5; // Maximum movement to still consider it a click
    let isClick = true; // Track whether the current interaction is a click or drag

    cardCarouselContainer.addEventListener("mousedown", (e) => {
      if (selectedVideos.length <= 1) return; // Don't enable swiping for single video

      // Always allow video controls to work normally
      if (e.target.tagName === "BUTTON") {
        return;
      }

      isDraggingCarousel = true;
      isClick = true; // Initially assume it's a click
      startX = e.clientX;
      startY = e.clientY;
      cardCarouselContainer.style.cursor = "grabbing"; // Change cursor while dragging

      // Prevent default to avoid text selection during drag
      e.preventDefault();
      // Stop propagation to prevent card rotation from being triggered
      e.stopPropagation();
    });

    cardCarouselContainer.addEventListener("mousemove", (e) => {
      if (!isDraggingCarousel) return;

      // Calculate how far we've moved
      const deltaX = Math.abs(e.clientX - startX);
      const deltaY = Math.abs(e.clientY - startY);

      // If we've moved more than the click threshold in any direction, it's a drag, not a click
      if (deltaX > clickThreshold || deltaY > clickThreshold) {
        isClick = false;
      }

      e.preventDefault();
      e.stopPropagation(); // Stop propagation to prevent card rotation
    });

    cardCarouselContainer.addEventListener("mouseup", (e) => {
      if (!isDraggingCarousel) return;

      const endX = e.clientX;
      const deltaX = endX - startX;

      // If it was a drag (not a click) and the swipe distance is greater than the threshold, change slide
      if (!isClick && Math.abs(deltaX) > carouselDragThreshold) {
        if (deltaX > 0) {
          // Swiped right - go to previous slide
          goToCardSlide(window.currentCardSlide - 1);
        } else {
          // Swiped left - go to next slide
          goToCardSlide(window.currentCardSlide + 1);
        }
      } else if (isClick && e.target.tagName === "VIDEO") {
        // If it was a click on a video, toggle play/pause
        const video = e.target;
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }

      isDraggingCarousel = false;
      cardCarouselContainer.style.cursor = "grab"; // Reset cursor after dragging

      // Stop propagation to prevent card rotation
      e.stopPropagation();
    });

    cardCarouselContainer.addEventListener("mouseleave", () => {
      if (isDraggingCarousel) {
        isDraggingCarousel = false;
        cardCarouselContainer.style.cursor = "grab"; // Reset cursor if mouse leaves during drag
      }
    });

    // Touch events for mobile
    cardCarouselContainer.addEventListener(
      "touchstart",
      (e) => {
        if (selectedVideos.length <= 1) return;

        // Always allow buttons to work normally
        if (e.target.tagName === "BUTTON") {
          return;
        }

        isDraggingCarousel = true;
        isClick = true; // Initially assume it's a tap
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        // Stop propagation to prevent card rotation
        e.stopPropagation();
      },
      { passive: false }
    );

    cardCarouselContainer.addEventListener(
      "touchmove",
      (e) => {
        if (!isDraggingCarousel) return;

        // Calculate how far we've moved
        const deltaX = Math.abs(e.touches[0].clientX - startX);
        const deltaY = Math.abs(e.touches[0].clientY - startY);

        // If we've moved more than the click threshold in any direction, it's a swipe, not a tap
        if (deltaX > clickThreshold || deltaY > clickThreshold) {
          isClick = false;
        }

        // Stop propagation to prevent card rotation
        e.stopPropagation();
      },
      { passive: true }
    );

    cardCarouselContainer.addEventListener("touchend", (e) => {
      if (!isDraggingCarousel) return;

      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;

      // If it was a swipe (not a tap) and the swipe distance is greater than the threshold, change slide
      if (!isClick && Math.abs(deltaX) > carouselDragThreshold) {
        if (deltaX > 0) {
          // Swiped right - go to previous slide
          goToCardSlide(window.currentCardSlide - 1);
        } else {
          // Swiped left - go to next slide
          goToCardSlide(window.currentCardSlide + 1);
        }
      } else if (isClick && e.target.tagName === "VIDEO") {
        // If it was a tap on a video, toggle play/pause
        const video = e.target;
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }

      isDraggingCarousel = false;

      // Stop propagation to prevent card rotation
      e.stopPropagation();
    });

    // Add the carousel to the innerImageElement
    innerImageElement.appendChild(cardCarouselContainer);

    // Initialize to first slide
    goToCardSlide(0);
  } else {
    // If no videos selected, show the default image
    const defaultImage = document.createElement("img");
    defaultImage.src = "/design.avif";
    defaultImage.style.width = "100%";
    defaultImage.style.height = "100%";
    defaultImage.style.objectFit = "cover";
    innerImageElement.appendChild(defaultImage);
  }
}

// Function to add remove buttons to both carousels
function addRemoveButtons() {
  // Add remove buttons to the bottom carousel
  document.querySelectorAll("#videoTrack > div").forEach((container, index) => {
    // Check if a remove button already exists
    if (!container.querySelector(".remove-video-btn")) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-video-btn";
      removeBtn.innerHTML = "&times;";
      removeBtn.style.position = "absolute";
      removeBtn.style.top = "10px";
      removeBtn.style.right = "10px";
      removeBtn.style.backgroundColor = "rgba(255, 0, 0, 0.7)";
      removeBtn.style.color = "white";
      removeBtn.style.borderRadius = "50%";
      removeBtn.style.width = "30px";
      removeBtn.style.height = "30px";
      removeBtn.style.border = "none";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.zIndex = "10";

      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeSelectedVideo(index);
      });

      container.appendChild(removeBtn);
    }
  });

  // Add remove buttons to the in-card carousel
  document
    .querySelectorAll("#cardCarouselTrack > div")
    .forEach((container, index) => {
      // Check if a remove button already exists
      if (!container.querySelector(".remove-video-btn")) {
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-video-btn";
        removeBtn.innerHTML = "&times;";
        removeBtn.style.position = "absolute";
        removeBtn.style.top = "10px";
        removeBtn.style.right = "10px";
        removeBtn.style.backgroundColor = "rgba(255, 0, 0, 0.7)";
        removeBtn.style.color = "white";
        removeBtn.style.borderRadius = "50%";
        removeBtn.style.width = "30px";
        removeBtn.style.height = "30px";
        removeBtn.style.border = "none";
        removeBtn.style.cursor = "pointer";
        removeBtn.style.zIndex = "10";

        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          removeSelectedVideo(index);
        });

        container.appendChild(removeBtn);
      }
    });
}

// Function to remove a selected video
function removeSelectedVideo(index) {
  if (index >= 0 && index < selectedVideos.length) {
    selectedVideos.splice(index, 1);
    updateCarousel();
    updateCardCarousel();
  }
}

// Add event listeners for carousel navigation
prevButton.addEventListener("click", () => {
  goToSlide(currentSlide - 1);
});

nextButton.addEventListener("click", () => {
  goToSlide(currentSlide + 1);
});

closeCarouselButton.addEventListener("click", () => {
  carouselContainer.style.display = "none";
  isCarouselVisible = false;

  // Pause all videos when closing carousel
  document.querySelectorAll("#videoTrack video").forEach((video) => {
    video.pause();
  });
});

toggleCarouselButton.addEventListener("click", () => {
  isCarouselVisible = !isCarouselVisible;
  carouselContainer.style.display = isCarouselVisible ? "block" : "none";

  // Update button text
  toggleCarouselButton.innerHTML = isCarouselVisible
    ? '<i class="fa fa-film"></i> Hide Videos'
    : '<i class="fa fa-film"></i> Show Videos';

  // If not visible, pause all videos
  if (!isCarouselVisible) {
    document.querySelectorAll("#videoTrack video").forEach((video) => {
      video.pause();
    });
  }
});

// Add sample videos to the grid
const sampleVideos = [
  "/vid1.mp4",
  "/vid2.mp4",
  "/vid3.mp4",
  "/vid4.mp4",
  "/vid5.mp4",
  "/vid6.mp4",
];

// Add sample videos to the grid with updated event listeners
sampleVideos.forEach((src, index) => {
  const videoItem = document.createElement("div");
  videoItem.style.cursor = "pointer";
  videoItem.style.border = "1px solid #ddd";
  videoItem.style.borderRadius = "5px";
  videoItem.style.overflow = "hidden";
  videoItem.style.position = "relative";
  videoItem.style.height = "100px";

  // Create video element
  const video = document.createElement("video");
  video.src = src;
  video.style.width = "100%";
  video.style.height = "100%";
  video.style.objectFit = "cover";

  // Make videos unplayable by:
  // 1. Disable controls
  video.controls = false;
  // 2. Set to muted
  video.muted = true;
  // 3. Disable autoplay
  video.autoplay = false;

  videoItem.appendChild(video);

  // Add a play icon overlay to show it's a video
  const playIcon = document.createElement("div");
  playIcon.style.position = "absolute";
  playIcon.style.top = "50%";
  playIcon.style.left = "50%";
  playIcon.style.transform = "translate(-50%, -50%)";
  playIcon.style.color = "white";
  playIcon.style.fontSize = "24px";
  playIcon.style.zIndex = "2";
  playIcon.innerHTML = '<i class="fa fa-play-circle"></i>';

  // Add a transparent overlay to prevent direct interaction with video
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.zIndex = "1";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.2)";

  videoItem.appendChild(overlay);
  videoItem.appendChild(playIcon);

  videoGrid.appendChild(videoItem);

  // Updated event listener to work with both carousels
  videoItem.addEventListener("click", () => {
    const src = sampleVideos[index];

    // Add this video to selected videos if not already there
    if (!selectedVideos.includes(src)) {
      selectedVideos.push(src);

      // Update both carousels
      updateCarousel();
      updateCardCarousel();
    } else {
      // If video is already in the carousel, just show this video
      const videoIndex = selectedVideos.indexOf(src);
      if (videoIndex !== -1) {
        // Update the main carousel if it's visible
        if (isCarouselVisible) {
          goToSlide(videoIndex);
        }

        // Update the card carousel to show this video
        if (window.currentCardSlide !== undefined) {
          // Use the function inside updateCardCarousel
          const cardCarouselTrack =
            document.getElementById("cardCarouselTrack");
          if (cardCarouselTrack) {
            window.currentCardSlide = videoIndex;
            const slidePercentage = 100 / selectedVideos.length;
            cardCarouselTrack.style.transform = `translateX(-${
              videoIndex * slidePercentage
            }%)`;

            // Update counter if it exists
            const counter = document.getElementById("cardCarouselCounter");
            if (counter) {
              counter.textContent = `${videoIndex + 1}/${
                selectedVideos.length
              }`;
            }

            // Pause all videos
            document
              .querySelectorAll("#cardCarouselTrack video")
              .forEach((video) => {
                video.pause();
              });
          }
        }
      }
    }

    // Close the modal
    modalContainer.style.display = "none";
  });
});

// Close modal when clicking the close button
closeButton.addEventListener("click", () => {
  modalContainer.style.display = "none";
});

// Close modal when clicking outside the modal content
modalContainer.addEventListener("click", (event) => {
  if (event.target === modalContainer) {
    modalContainer.style.display = "none";
  }
});

// Event listeners for showing the modal when the button is clicked
htmlButton.addEventListener("click", (event) => {
  event.stopPropagation();
  modalContainer.style.display = "flex";
});

// Make sure the click event is properly detected
buttonElement.addEventListener("click", (event) => {
  event.stopPropagation();
  modalContainer.style.display = "flex";
});

// Create a raycaster for button interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Handle mouse click for the button mesh
renderer.domElement.addEventListener("click", onDocumentClick, false);

function onDocumentClick(event) {
  event.preventDefault();

  // Calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObject(buttonMesh);

  if (intersects.length > 0) {
    // Show the modal when the button is clicked
    modalContainer.style.display = "flex";
  }
}

// Set up camera position
camera.position.set(0, 0, 5);
camera.lookAt(scene.position);

// Spotlight for adding highlights to the card
const cardHighlight = new THREE.SpotLight(0xffffff, 1.2);
cardHighlight.position.set(3, 5, 5);
cardHighlight.angle = Math.PI / 4;
cardHighlight.penumbra = 0.5;
cardHighlight.decay = 1.5;
cardHighlight.distance = 20;
scene.add(cardHighlight);

// Drag rotation variables
let isDragging = false;
let previousMousePosition = {
  x: 0,
  y: 0,
};
let rotationSensitivity = 0.01;
let damping = 0.1;
let targetRotationY = 0;

// Add event listeners for drag behavior
document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mousemove", onMouseMove);
document.addEventListener("mouseup", onMouseUp);
document.addEventListener("touchstart", onTouchStart, { passive: false });
document.addEventListener("touchmove", onTouchMove, { passive: false });
document.addEventListener("touchend", onTouchEnd);

function onMouseDown(event) {
  // Don't initiate card rotation if the event originated from the carousel
  if (
    event.target.closest("#cardCarouselTrack") ||
    event.target.closest("#videoTrack") ||
    event.target.tagName === "VIDEO" ||
    event.target.tagName === "BUTTON"
  ) {
    return;
  }

  isDragging = true;
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
}

function onMouseMove(event) {
  if (!isDragging) return;

  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y,
  };

  // Apply rotation based on drag amount - only horizontal movement
  // Invert the rotation direction with negative sign
  targetRotationY -= deltaMove.x * rotationSensitivity;

  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
}

function onMouseUp() {
  isDragging = false;
}

function onTouchStart(event) {
  // Don't initiate card rotation if the event originated from the carousel
  if (
    event.target.closest("#cardCarouselTrack") ||
    event.target.closest("#videoTrack") ||
    event.target.tagName === "VIDEO" ||
    event.target.tagName === "BUTTON"
  ) {
    return;
  }

  if (event.touches.length === 1) {
    event.preventDefault();
    isDragging = true;
    previousMousePosition = {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY,
    };
  }
}

function onTouchMove(event) {
  if (!isDragging || event.touches.length !== 1) return;

  event.preventDefault();
  const deltaMove = {
    x: event.touches[0].pageX - previousMousePosition.x,
    y: event.touches[0].pageY - previousMousePosition.y,
  };

  // Apply rotation based on drag amount - only horizontal movement
  // Invert the rotation direction with negative sign
  targetRotationY -= deltaMove.x * rotationSensitivity;

  previousMousePosition = {
    x: event.touches[0].pageX,
    y: event.touches[0].pageY,
  };
}

function onTouchEnd() {
  isDragging = false;
}

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  css3dRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize the card carousel - show default image initially
updateCardCarousel();

function animate() {
  requestAnimationFrame(animate);

  // Apply damping for smooth motion with limited rotation range
  card.rotation.y += (targetRotationY - card.rotation.y) * damping;

  // Limit rotation to prevent seeing the back of the card
  // Restrict to -PI/4 to PI/4 (45 degrees each way)
  card.rotation.y = Math.max(
    -Math.PI / 4,
    Math.min(Math.PI / 4, card.rotation.y)
  );

  // Keep card upright with no vertical rotation
  card.rotation.x = Math.PI; // Keep the fixed rotation to face camera

  // Sync text rotation with card (negative value to match card's direction)
  containerObject.rotation.y = -card.rotation.y;
  containerObject.rotation.x = 0;
  containerObject.rotation.z = 0;

  // Ensure button mesh and CSS3D object stay in sync
  buttonCSS3D.position.copy(buttonMesh.position);
  // Keep a small offset to ensure the HTML button appears above the mesh
  buttonCSS3D.position.z += 0.01;

  buttonMesh.rotation.x += 0.03;
  buttonMesh.rotation.y += 0.03;

  // Render both renderers
  renderer.render(scene, camera);
  css3dRenderer.render(scene, camera);
}

animate();
