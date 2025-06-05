document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript Loaded!");


    // Smooth scrolling for internal navigation links only
    document.querySelectorAll("nav ul li a").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            // Check if the link is an anchor to a section within the same page
            if (this.getAttribute("href").startsWith("#")) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute("href"));
                if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    });


    // Toggle Menu for Mobile
    const menuToggle = document.createElement("div");
    menuToggle.innerHTML = "&#9776;"; // Hamburger icon
    menuToggle.style.fontSize = "24px";
    menuToggle.style.cursor = "pointer";
    menuToggle.style.display = "none";
    document.querySelector("nav").prepend(menuToggle);


    menuToggle.addEventListener("click", function () {
        const navList = document.querySelector("nav ul");
        navList.style.display = navList.style.display === "block" ? "none" : "block";
    });


    // Make menu button appear only in mobile view
    function checkScreenSize() {
        if (window.innerWidth < 768) {
            menuToggle.style.display = "block";
            document.querySelector("nav ul").style.display = "none";
        } else {
            menuToggle.style.display = "none";
            document.querySelector("nav ul").style.display = "flex";
        }
    }


    window.addEventListener("resize", checkScreenSize);
    checkScreenSize();
});


