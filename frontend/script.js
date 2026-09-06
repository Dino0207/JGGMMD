
function showForm(formId) {
    document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
    document.getElementById(formId).classList.add("active");
}

function accDrop() {
    document.getElementById("acc-set-items").classList.toggle("show");
}   

window.onclick = function(event) {
    if (!event.target.matches('.accbtn')) {
        var dropdowns = document.getElementsByClassName("acc-set-items");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
