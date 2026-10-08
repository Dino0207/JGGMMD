const supportReportForm = document.getElementById("support-report-form");
const supportReportSubmit = document.getElementById("support-report-submit");
const supportReportStatus = document.getElementById("support-report-status");
const supportReportTotal = document.getElementById("support-report-total");
const supportReportPeak = document.getElementById("support-report-peak");
const supportReportChart = document.getElementById("support-report-chart");
const supportAnalyticsStatus = document.getElementById("support-analytics-status");

function formatReportDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function renderReportAnalytics(data) {
    const days = Array.isArray(data.days) ? data.days : [];
    const peak = days.reduce((highest, day) => Number(day.count) > Number(highest?.count || 0) ? day : highest, null);
    const maxCount = Math.max(1, ...days.map(day => Number(day.count) || 0));

    supportReportTotal.textContent = String(Number(data.total) || 0);
    supportReportPeak.textContent = peak && Number(peak.count) > 0
        ? `${formatReportDate(peak.date)} (${peak.count})`
        : "No peak yet";
    supportReportChart.replaceChildren();
    supportReportChart.setAttribute("aria-label", `Report activity over the last 7 days. ${days.map(day => `${formatReportDate(day.date)}: ${day.count} reports`).join(", ")}`);

    days.forEach(day => {
        const count = Number(day.count) || 0;
        const row = document.createElement("div");
        row.className = "support-chart-row";

        const dateLabel = document.createElement("span");
        dateLabel.className = "support-chart-date";
        dateLabel.textContent = formatReportDate(day.date);

        const track = document.createElement("div");
        track.className = "support-chart-track";
        const bar = document.createElement("span");
        bar.className = "support-chart-bar";
        bar.style.width = `${count ? Math.max(5, (count / maxCount) * 100) : 0}%`;
        if (peak && day.date === peak.date && count > 0) bar.classList.add("is-peak");
        track.appendChild(bar);

        const countLabel = document.createElement("strong");
        countLabel.className = "support-chart-count";
        countLabel.textContent = String(count);

        row.append(dateLabel, track, countLabel);
        supportReportChart.appendChild(row);
    });
}

async function loadReportAnalytics() {
    const response = await fetch("../backend/support-reports.php", { headers: { Accept: "application/json" } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Unable to load report analytics.");
    renderReportAnalytics(data);
    supportAnalyticsStatus.textContent = "";
}

if (supportReportForm) {
    supportReportForm.addEventListener("submit", async event => {
        event.preventDefault();
        supportReportSubmit.disabled = true;
        supportReportStatus.textContent = "Sending your report…";

        try {
            const formData = new FormData(supportReportForm);
            const response = await fetch(supportReportForm.action, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || ![true, "true"].includes(result.success)) {
                throw new Error(result.message || "Unable to send your report. Please try again.");
            }

            supportReportForm.reset();
            supportReportStatus.textContent = "Your report was sent. Thank you for helping us improve JGGMMD.";
            try {
                const analyticsResponse = await fetch("../backend/support-reports.php", {
                    method: "POST",
                    headers: { Accept: "application/json" }
                });
                const analyticsResult = await analyticsResponse.json().catch(() => ({}));
                if (!analyticsResponse.ok) throw new Error(analyticsResult.error || "Unable to update report analytics.");
                renderReportAnalytics(analyticsResult);
                supportAnalyticsStatus.textContent = "";
            } catch (error) {
                supportAnalyticsStatus.textContent = `Your report was sent, but analytics could not be updated: ${error.message}`;
            }
        } catch (error) {
            supportReportStatus.textContent = error.message;
        } finally {
            supportReportSubmit.disabled = false;
        }
    });
}

loadReportAnalytics().catch(error => {
    supportReportChart.replaceChildren();
    supportReportChart.setAttribute("aria-label", "Report activity is unavailable.");
    supportAnalyticsStatus.textContent = error.message;
});
