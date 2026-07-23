const API = "api.php";
const MAX_SIZE = 10 * 1024 * 1024;
const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const emptyState = document.getElementById("emptyState");
const previewState = document.getElementById("previewState");
const previewImage = document.getElementById("previewImage");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const uploadButton = document.getElementById("uploadButton");
const uploadButtonText = document.getElementById("uploadButtonText");
const progressTrack = document.getElementById("progressTrack");
const progressBar = document.getElementById("progressBar");
const message = document.getElementById("message");
const gallery = document.getElementById("gallery");
const imageGrid = document.getElementById("imageGrid");
const imageCount = document.getElementById("imageCount");
const lightboxBackdrop = document.getElementById("lightboxBackdrop");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxName = document.getElementById("lightboxName");
const lightboxSize = document.getElementById("lightboxSize");
const deleteTrigger = document.getElementById("deleteTrigger");
const deleteConfirm = document.getElementById("deleteConfirm");
const deleteError = document.getElementById("deleteError");

let selectedFile = null;
let selectedImage = null;
let previewUrl = "";

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function showMessage(text, success = false) {
  message.textContent = text;
  message.classList.toggle("success", success);
  message.classList.toggle("hidden", !text);
}

function chooseFile(file) {
  showMessage("");
  if (!file) return;
  if (!acceptedTypes.includes(file.type)) {
    showMessage("Please choose a JPG, PNG, WebP, or GIF image.");
    return;
  }
  if (file.size > MAX_SIZE) {
    showMessage("That image is larger than 10 MB.");
    return;
  }
  selectedFile = file;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  previewImage.src = previewUrl;
  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);
  emptyState.classList.add("hidden");
  previewState.classList.remove("hidden");
  uploadButton.classList.remove("hidden");
}

dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") fileInput.click();
});
fileInput.addEventListener("change", () => chooseFile(fileInput.files[0]));
dropZone.addEventListener("dragover", event => {
  event.preventDefault();
  dropZone.classList.add("dragging");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragging"));
dropZone.addEventListener("drop", event => {
  event.preventDefault();
  dropZone.classList.remove("dragging");
  chooseFile(event.dataTransfer.files[0]);
});

uploadButton.addEventListener("click", () => {
  if (!selectedFile) return;
  const form = new FormData();
  form.append("image", selectedFile);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${API}?action=upload`);
  uploadButton.disabled = true;
  progressTrack.classList.remove("hidden");
  showMessage("");

  xhr.upload.onprogress = event => {
    if (!event.lengthComputable) return;
    const percent = Math.round((event.loaded / event.total) * 100);
    progressBar.style.width = `${percent}%`;
    uploadButtonText.textContent = `Uploading ${percent}%`;
  };
  xhr.onload = async () => {
    uploadButton.disabled = false;
    uploadButtonText.textContent = "Upload image";
    if (xhr.status >= 200 && xhr.status < 300) {
      showMessage("Uploaded successfully. Your image is saved on the server.", true);
      selectedFile = null;
      fileInput.value = "";
      emptyState.classList.remove("hidden");
      previewState.classList.add("hidden");
      uploadButton.classList.add("hidden");
      progressTrack.classList.add("hidden");
      progressBar.style.width = "0";
      await loadImages();
    } else {
      let error = "Upload failed. Please try again.";
      try { error = JSON.parse(xhr.responseText).error || error; } catch {}
      showMessage(error);
    }
  };
  xhr.onerror = () => {
    uploadButton.disabled = false;
    uploadButtonText.textContent = "Upload image";
    showMessage("Upload failed. Please check your connection.");
  };
  xhr.send(form);
});

async function loadImages() {
  try {
    const response = await fetch(`${API}?action=list`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    renderImages(data.images);
  } catch {
    showMessage("The gallery could not be loaded.");
  }
}

function renderImages(images) {
  imageGrid.replaceChildren();
  gallery.classList.toggle("hidden", images.length === 0);
  imageCount.textContent = `${images.length} ${images.length === 1 ? "image" : "images"}`;
  images.forEach(image => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "image-tile";
    button.setAttribute("aria-label", `View ${image.name}`);
    const img = document.createElement("img");
    img.src = image.url;
    img.alt = image.name;
    img.loading = "lazy";
    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = image.name;
    const size = document.createElement("span");
    size.textContent = formatBytes(image.size);
    info.append(name, size);
    button.append(img, info);
    button.addEventListener("click", () => openLightbox(image));
    imageGrid.append(button);
  });
}

function openLightbox(image) {
  selectedImage = image;
  lightboxImage.src = image.url;
  lightboxImage.alt = image.name;
  lightboxName.textContent = image.name;
  lightboxSize.textContent = formatBytes(image.size);
  deleteTrigger.classList.remove("hidden");
  deleteConfirm.classList.add("hidden");
  deleteError.classList.add("hidden");
  lightboxBackdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  document.getElementById("closeLightbox").focus();
}

function closeLightbox() {
  selectedImage = null;
  lightboxBackdrop.classList.add("hidden");
  document.body.style.overflow = "";
}

document.getElementById("closeLightbox").addEventListener("click", closeLightbox);
lightboxBackdrop.addEventListener("mousedown", event => {
  if (event.target === lightboxBackdrop) closeLightbox();
});
window.addEventListener("keydown", event => {
  if (event.key === "Escape" && !lightboxBackdrop.classList.contains("hidden")) closeLightbox();
});

deleteTrigger.addEventListener("click", () => {
  deleteTrigger.classList.add("hidden");
  deleteConfirm.classList.remove("hidden");
});
document.getElementById("cancelDelete").addEventListener("click", () => {
  deleteTrigger.classList.remove("hidden");
  deleteConfirm.classList.add("hidden");
});
document.getElementById("confirmDelete").addEventListener("click", async () => {
  if (!selectedImage) return;
  const button = document.getElementById("confirmDelete");
  button.disabled = true;
  button.textContent = "Deleting…";
  try {
    const body = new URLSearchParams({ file: selectedImage.file });
    const response = await fetch(`${API}?action=delete`, { method: "POST", body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The image could not be deleted.");
    closeLightbox();
    await loadImages();
  } catch (error) {
    deleteError.textContent = error.message;
    deleteError.classList.remove("hidden");
  } finally {
    button.disabled = false;
    button.textContent = "Delete";
  }
});

loadImages();
