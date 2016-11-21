const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");

function install(aData, aReason) {
}
function uninstall(aData, aReason) {
}

function startup(data, reason) {
  let enumerator = Services.wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
    if (win.document.readyState === "complete")
      loadIntoWindow(win);
    else
      win.addEventListener("load", function() {
        win.removeEventListener("load", arguments.callee, false);
        loadIntoWindow(win);
      })
  }
  Services.wm.addListener(windowListener);
}

function shutdown(data, reason) {
  Services.wm.removeListener(windowListener);

  let enumerator = Services.wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(win);
  }
}

var orighideChromeForLocation;

function loadIntoWindow(window) {
  if (!window || window.document.documentElement.getAttribute("windowtype") != "navigator:browser")
    return;
  origHideChromeForLocation = window.XULBrowserWindow.hideChromeForLocation;
  window.XULBrowserWindow.hideChromeForLocation = function() {return false;};
}

function unloadFromWindow(window) {
  if (!window || window.document.documentElement.getAttribute("windowtype") != "navigator:browser")
    return;
  window.XULBrowserWindow.hideChromeForLocation = origHideChromeForLocation;
}

var windowListener = {
  onOpenWindow: function(window) {
    let domWindow = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  onCloseWindow: function(window) {
    let domWindow = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  },
  onWindowTitleChange: function(window) {}
};
