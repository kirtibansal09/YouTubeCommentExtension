// chrome.runtime.onInstalled.addListener(() => {
//     console.log("YouTube Comment Filter Extension Installed");
//   });


chrome.tabs.onUpdated.addListener((tabId,tab) =>{
  if(tab.url && tab.url.includes("youtube.com/watch")){
    chrome.tabs.sendMessage(tabId,{
      type: "loadSearchBar",
    })
  }
})