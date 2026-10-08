const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("show");
        hamburger.classList.toggle("active", isOpen);
        hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", event => {
        if (event.target instanceof Element && !event.target.closest(".navbar")) {
            navMenu.classList.remove("show");
            hamburger.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
        }
    });
}

document.querySelectorAll("[data-nav-logout]").forEach(button => {
    button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent = "Logging out…";
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
            button.disabled = false;
            button.textContent = "Log out";
            window.alert(error.message);
        }
    });
});
