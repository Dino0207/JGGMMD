(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || typeof Element.prototype.animate !== "function") return;

    window.addEventListener("load", () => {
        const elements = Array.from(document.body.querySelectorAll("*")).filter(element => {
            if (element.matches("script, style, link, meta, title, path, defs, g, symbol, use")) return false;
            if (!element.getClientRects().length) return false;
            const style = getComputedStyle(element);
            return style.visibility !== "hidden" && Number(style.opacity) > 0;
        });

        elements.forEach(element => {
            const style = getComputedStyle(element);
            const opacity = Number(style.opacity);
            const transform = style.transform === "none" ? "" : style.transform;
            const offset = (Math.random() < 0.5 ? -1 : 1) * (12 + Math.random() * 34);
            const animation = element.animate(
                [
                    { opacity: 0, transform: `translateY(${offset}px) ${transform}`.trim() },
                    { opacity, transform: transform || "none" }
                ],
                {
                    duration: 420 + Math.random() * 240,
                    delay: Math.random() * 180,
                    easing: "cubic-bezier(0.2, 0.7, 0.25, 1)",
                    fill: "both"
                }
            );
            animation.onfinish = () => animation.cancel();
        });
    }, { once: true });
})();
