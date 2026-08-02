(function () {
  var target = document.querySelector("[data-post-views]");
  if (!target) return;

  var attempts = 0;
  var timer = window.setInterval(function () {
    attempts += 1;

    if (window.goatcounter && window.goatcounter.visit_count) {
      window.clearInterval(timer);
      window.goatcounter.visit_count({
        append: "[data-post-views]",
        no_branding: true,
        attr: {
          width: "72",
          height: "22",
          title: "Article visit count",
          "aria-label": "Article visit count"
        },
        style: "div { border: 0; background: transparent; padding: 0; color: inherit; font: inherit; } #gcvc-for { display: none; } #gcvc-views { font: inherit; }"
      });
    } else if (attempts >= 100) {
      window.clearInterval(timer);
      target.textContent = "unavailable";
    }
  }, 100);
})();
