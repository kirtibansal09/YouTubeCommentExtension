// const getComments = () => {
//     let comments = document.querySelectorAll("#content-text");
//     return Array.from(comments).map(comment => comment.innerText);
//   };

//   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "get_comments") {
//       sendResponse({ comments: getComments() });
//     }
//   });


// This is the function that runs when page is loaded
(() => {
  let observer;

 const addSearchBar = () => {
  setTimeout(() => { // Wait for comments to load
    const searchBarExists = document.querySelector(".comment-search-bar");
    
    if (!searchBarExists) {
      const searchBar = document.createElement("input");
      searchBar.className = "comment-search-bar search-bar-yt";
      searchBar.placeholder = "Enter keyword to search in comments...";
      searchBar.title = "Comment Search Bar";

      commentsTitlebar = document.querySelector("ytd-comments");
      console.log("Comments Section:", commentsTitlebar);

      if (commentsTitlebar) {
        commentsTitlebar.prepend(searchBar);
        console.log("Search Bar Added!");
      } else {
        console.log("Comments Section Not Found!");
      }
    }
  }, 3000); // Delay for 3 seconds
};


  // MutationObserver to detect when YouTube updates its DOM
  observer = new MutationObserver(() => {
    if (addSearchBar()) {
      observer.disconnect(); // Stop once added
    }
  });

  // Start observing YouTube’s body for changes
  observer.observe(document.body, { childList: true, subtree: true });

  // Ensure search bar is added on initial load
  window.onload = () => addSearchBar();

  // Listen for messages from background.js
  chrome.runtime.onMessage.addListener((obj) => {
    if (obj.type === "loadSearchBar") {
      addSearchBar();
    }
  });

})();