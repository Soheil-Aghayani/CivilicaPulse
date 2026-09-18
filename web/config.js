(function configureCivilicaApi() {
  var localHosts = ["127.0.0.1", "localhost"];
  var isLocal = localHosts.indexOf(window.location.hostname) >= 0;
  window.CIVILICA_API_BASE_URL = isLocal
    ? ""
    : "https://civilicapulse-api.onrender.com";
})();
