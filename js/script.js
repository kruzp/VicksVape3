// ===== Store details: fill these in and everything on the page updates =====
// Leave a value as "" and the page shows a marked placeholder instead of guessing.
var STORE = {
  street: "",                 // e.g. "123 Main St"
  cityStateZip: "",           // e.g. "Ames, IA 50010"
  phone: "",                  // e.g. "(515) 555-0123"
  // 24h hours, 0 = Sunday. A close past 24 runs past midnight (25 = 1 AM). null = closed.
  // Leave HOURS = null until the real hours are known.
  HOURS: null,
  // HOURS: [[8,22],[7,23],[7,23],[7,23],[7,23],[7,24],[8,24]],
  hoursNote: "Holiday hours may vary."
};

(function () {
  var $ = function (id) { return document.getElementById(id); };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function fmt(h) { var x = h % 24, s = x < 12 ? "AM" : "PM", y = x % 12 === 0 ? 12 : x % 12; return y + " " + s; }
  function now() {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.find(function (x) { return x.type === t; }) || {}).value; };
    return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), hour: (+g("hour") % 24) + (+g("minute")) / 60 };
  }
  function status() {
    var H = STORE.HOURS; if (!H) return null;
    var n = now(), t = H[n.day], y = H[(n.day + 6) % 7];
    if (y && y[1] > 24 && n.hour < y[1] - 24) return { open: true, until: y[1] };
    if (t && n.hour >= t[0] && n.hour < t[1]) return { open: true, until: t[1] };
    return { open: false };
  }

  // ----- letter board -----
  var s = status();
  var last = !s ? "STOP IN" : s.open ? "OPEN NOW" : "SEE YOU SOON";
  var rows = [["VICK'S", ""], ["VAPE · LIQUOR", ""], ["COLD BEER · FUEL", ""], [last, s && s.open ? "green" : "red"]];
  var face = $("face"), delay = 0, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  rows.forEach(function (r) {
    var row = document.createElement("div"); row.className = "row";
    r[0].split("").forEach(function (ch) {
      var t = document.createElement("span");
      t.className = "tile" + (ch === " " ? " sp" : "") + (r[1] ? " " + r[1] : "");
      t.textContent = ch === " " ? " " : ch;
      if (!reduce && ch !== " ") { t.classList.add("in"); t.style.animationDelay = (delay += 0.035) + "s"; }
      // hand-hung letters sit a touch crooked
      t.style.rotate = ((Math.sin(delay * 97) * 1.6)).toFixed(2) + "deg";
      row.appendChild(t);
    });
    face.appendChild(row);
  });
  setTimeout(function () { $("board").classList.add("lit"); }, reduce ? 0 : delay * 1000 + 300);

  // ----- status pill -----
  var st = $("status");
  if (!s) { $("statusText").textContent = "Stop in today"; }
  else { st.classList.add(s.open ? "open" : "closed"); $("statusText").textContent = s.open ? "Open now · until " + fmt(s.until) : "Closed right now"; }

  // ----- hours table -----
  var tb = document.querySelector("#hours tbody"), today = now().day;
  [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
    var tr = document.createElement("tr"), a = document.createElement("td"), b = document.createElement("td");
    a.textContent = DAYS[d];
    if (!STORE.HOURS) { b.textContent = "Add hours"; b.className = "ph"; }
    else b.textContent = STORE.HOURS[d] ? fmt(STORE.HOURS[d][0]) + " – " + fmt(STORE.HOURS[d][1]) : "Closed";
    if (d === today) tr.className = "today";
    tr.appendChild(a); tr.appendChild(b); tb.appendChild(tr);
  });
  $("hoursNote").textContent = STORE.hoursNote;

  // ----- address + phone -----
  var addr = $("addr");
  if (STORE.street) { addr.innerHTML = ""; addr.appendChild(document.createTextNode(STORE.street)); addr.appendChild(document.createElement("br")); addr.appendChild(document.createTextNode(STORE.cityStateZip)); }
  else { addr.textContent = "Street address here"; addr.classList.add("ph"); }
  var q = encodeURIComponent("Vick's Vapor & Liquor Vault " + STORE.street + " " + STORE.cityStateZip);
  $("dirBtn").href = "https://www.google.com/maps/search/?api=1&query=" + q;
  var ph = $("phone");
  if (STORE.phone) { ph.textContent = STORE.phone; ph.href = "tel:" + STORE.phone.replace(/[^0-9+]/g, ""); $("callBtn").href = ph.href; }
  else { ph.textContent = "(515) 000-0000"; ph.classList.add("ph"); }
})();
