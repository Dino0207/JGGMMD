const accountMessage = document.getElementById("account-message");
const accountEmail = document.getElementById("account-email");

document.querySelectorAll("[data-account-form]").forEach(form => {
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const action = form.dataset.accountForm;
        const payload = action === "password"
            ? {
                action,
                current_password: document.getElementById("current-password").value,
                new_password: document.getElementById("new-password").value,
                confirm_password: document.getElementById("confirm-password").value
            }
            : {
                action,
                current_password: document.getElementById("email-password").value,
                email: document.getElementById("new-email").value.trim()
            };

        accountMessage.textContent = "Updating account…";
        try {
            const response = await fetch("../backend/account.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || "Account update failed.");
            accountMessage.textContent = data.message;
            form.reset();
            if (action === "email") {
                accountEmail.textContent = payload.email;
                document.getElementById("new-email").value = payload.email;
            }
        } catch (error) {
            accountMessage.textContent = error.message;
        }
    });
});

document.getElementById("account-logout").addEventListener("click", async () => {
    if (!window.confirm("Log out of JGGMMD?")) return;
    accountMessage.textContent = "Logging out…";
    try {
        const response = await fetch("../backend/account.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "logout" })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Logout failed.");
        window.location.href = "index.php";
    } catch (error) {
        accountMessage.textContent = error.message;
    }
});

async function loadAccountAnalytics() {
    const status = document.getElementById("account-analytics-status");
    const recentActivity = document.getElementById("recent-activity");
    try {
        const response = await fetch("../backend/setlists.php");
        const setlists = await response.json().catch(() => []);
        if (response.status === 401) {
            window.location.href = "index.php";
            return;
        }
        if (!response.ok) throw new Error(setlists.error || "Unable to load setlist analytics.");

        const songs = setlists.flatMap(setlist => setlist.songs || []);
        const uniqueSongs = new Map(songs.map(song => [song.id || `${song.title}-${song.author}`, song]));
        document.getElementById("stat-total-songs").textContent = String(uniqueSongs.size);
        document.getElementById("stat-active-setlists").textContent = String(setlists.length);
        document.getElementById("stat-rotation").textContent = String(songs.length);

        recentActivity.replaceChildren();
        const latestSongs = songs.slice(0, 5);
        if (!latestSongs.length) {
            const empty = document.createElement("li");
            empty.className = "activity-empty";
            empty.textContent = "Add songs to a setlist to build your rotation.";
            recentActivity.appendChild(empty);
        } else {
            latestSongs.forEach(song => {
                const item = document.createElement("li");
                item.innerHTML = '<span class="activity-dot"></span><div><strong></strong><small></small></div>';
                item.querySelector("strong").textContent = song.title;
                item.querySelector("small").textContent = song.author || "Unknown author";
                recentActivity.appendChild(item);
            });
        }
        status.textContent = "";
    } catch (error) {
        status.textContent = error.message;
        recentActivity.replaceChildren();
    }
}

const profileImage = document.getElementById("profile-image");
const profileImageInput = document.getElementById("profile-image-input");
const profileImageRemove = document.getElementById("profile-image-remove");
const profileImageMessage = document.getElementById("profile-image-message");
const profileCropModal = document.getElementById("profile-crop-modal");
const profileCropImage = document.getElementById("profile-crop-image");
const profileCropFrame = document.getElementById("profile-crop-frame");
const profileCropZoom = document.getElementById("profile-crop-zoom-input");
const profileStorageKey = `jggm-profile-image:${encodeURIComponent(document.body.dataset.profileUser || "default")}`;
const defaultProfileImage = profileImage.src;
const savedProfileImage = localStorage.getItem(profileStorageKey);
if (savedProfileImage) profileImage.src = savedProfileImage;

let cropScale = 1;
let cropX = 0;
let cropY = 0;
let dragStartX = 0;
let dragStartY = 0;
let isDraggingCrop = false;

function updateCropPreview() {
    profileCropImage.style.transform = `translate(calc(-50% + ${cropX}px), calc(-50% + ${cropY}px)) scale(${cropScale})`;
}

function closeProfileCrop() {
    profileCropModal.hidden = true;
    profileCropImage.removeAttribute("src");
    profileImageInput.value = "";
}

profileImageInput.addEventListener("change", () => {
    const file = profileImageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        cropScale = 1;
        cropX = 0;
        cropY = 0;
        profileCropZoom.value = "1";
        profileCropImage.src = reader.result;
        profileCropImage.onload = () => {
            const imageRatio = profileCropImage.naturalWidth / profileCropImage.naturalHeight;
            profileCropImage.style.width = imageRatio >= 1 ? "auto" : "100%";
            profileCropImage.style.height = imageRatio >= 1 ? "100%" : "auto";
            profileCropModal.hidden = false;
            updateCropPreview();
        };
    });
    reader.readAsDataURL(file);
});

profileCropZoom.addEventListener("input", () => {
    cropScale = Number(profileCropZoom.value);
    updateCropPreview();
});
profileCropFrame.addEventListener("pointerdown", event => {
    isDraggingCrop = true;
    dragStartX = event.clientX - cropX;
    dragStartY = event.clientY - cropY;
    profileCropFrame.setPointerCapture(event.pointerId);
});
profileCropFrame.addEventListener("pointermove", event => {
    if (!isDraggingCrop) return;
    cropX = event.clientX - dragStartX;
    cropY = event.clientY - dragStartY;
    updateCropPreview();
});
profileCropFrame.addEventListener("pointerup", () => { isDraggingCrop = false; });
profileCropFrame.addEventListener("pointercancel", () => { isDraggingCrop = false; });
document.getElementById("profile-crop-close").addEventListener("click", closeProfileCrop);
document.getElementById("profile-crop-cancel").addEventListener("click", closeProfileCrop);
profileCropModal.addEventListener("click", event => {
    if (event.target === profileCropModal) closeProfileCrop();
});
document.getElementById("profile-crop-apply").addEventListener("click", () => {
    const frameRect = profileCropFrame.getBoundingClientRect();
    const imageRect = profileCropImage.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    const outputSize = 720;
    const context = canvas.getContext("2d");
    const sourceScale = profileCropImage.naturalWidth / imageRect.width;
    const cropLeft = (frameRect.left - imageRect.left) * sourceScale;
    const cropTop = (frameRect.top - imageRect.top) * sourceScale;
    const cropSize = frameRect.width * sourceScale;
    canvas.width = outputSize;
    canvas.height = outputSize;
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--profile-image-background").trim();
    context.fillRect(0, 0, outputSize, outputSize);
    context.drawImage(profileCropImage, cropLeft, cropTop, cropSize, cropSize, 0, 0, outputSize, outputSize);
    const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
    profileImage.src = croppedImage;
    localStorage.setItem(profileStorageKey, croppedImage);
    profileImageMessage.textContent = "Profile image updated.";
    closeProfileCrop();
});
profileImageRemove.addEventListener("click", () => {
    localStorage.removeItem(profileStorageKey);
    profileImage.src = defaultProfileImage;
    profileImageMessage.textContent = "Profile image removed.";
});

loadAccountAnalytics();
