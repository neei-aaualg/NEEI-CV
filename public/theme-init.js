// Applies the saved (or system) theme before first paint, like neei.online. Kept external for the CSP.
(function () {
  try {
    var saved = localStorage.getItem("neei_theme");
    var dark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#070d14" : "#fffefb");
  } catch (e) {}
})();
