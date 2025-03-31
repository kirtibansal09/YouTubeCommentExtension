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
  let searchBarAdded = false;

  const addSearchBar = () => {
    if (searchBarAdded) return;

    setTimeout(() => {
      const searchBarExists = document.querySelector(
        ".comment-search-container"
      );

      if (!searchBarExists) {
        // Create search container
        const searchContainer = document.createElement("div");
        searchContainer.className = "comment-search-container";

        // Create search bar
        const searchBar = document.createElement("input");
        searchBar.className = "comment-search-bar search-bar-yt";
        searchBar.placeholder = "Search comments...";
        searchBar.title = "Comment Search Bar";

        // Create clickable icon container
        const iconContainer = document.createElement("div");
        iconContainer.className = "comment-search-icon-container";

        // Create search icon
        const searchIcon = document.createElement("img");
        searchIcon.src = chrome.runtime.getURL("assets/search-icon.svg");
        searchIcon.className = "comment-search-icon";
        searchIcon.alt = "Search";

        // Build DOM structure
        iconContainer.appendChild(searchIcon);
        searchContainer.appendChild(iconContainer);
        searchContainer.appendChild(searchBar);

        // Find comments section
        const commentsTitlebar = document.querySelector("ytd-comments");

        if (commentsTitlebar) {
          // Add to page
          commentsTitlebar.prepend(searchContainer);
          searchBarAdded = true;

          // Make icon clickable
          iconContainer.addEventListener("click", () => {
            searchBar.focus();
          });

          // Listen for input in the search bar
          searchBar.addEventListener("input", () => {
            searchAndHighlightComments(searchBar.value);
          });

          console.log("Search bar with clickable icon added successfully");
        }
      }
    }, 1000); // 1 second delay
  };

  
  let originalCommentOrder = []; // Stores the original order of comments

  const searchAndHighlightComments = (keywords) => {
    const commentsContainer = document.querySelector("ytd-item-section-renderer #contents");
    const allComments = Array.from(document.querySelectorAll("#content-text")).map(comment => ({
      element: comment.closest("ytd-comment-thread-renderer"), // Get full comment thread
      originalText: comment.getAttribute("data-original-text") || comment.textContent
    }));
  
    if (!originalCommentOrder.length) {
      // Store the original order of comments on the first search
      originalCommentOrder = allComments.map(({ element }) => element);
    }
  
    if (!keywords.trim()) {
      // If search bar is empty, restore original order
      commentsContainer.innerHTML = "";
      originalCommentOrder.forEach(comment => commentsContainer.appendChild(comment));
      originalCommentOrder = []; // Reset stored order
      removeHighlights();
      return;
    }
  
    // Highlight and filter matching comments
    const escapedKeywords = keywords.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(${escapedKeywords})`, "gi");
  
    allComments.forEach(({ element, originalText }) => {
      const contentText = element.querySelector("#content-text");
      contentText.setAttribute("data-original-text", originalText); // Store original text
  
      if (originalText.match(regex)) {
        contentText.innerHTML = originalText.replace(regex, `<span class="highlighted">$1</span>`);
      } else {
        contentText.innerHTML = originalText;
      }
    });
  
    // Sort: Matched comments go to the top
    const matchedComments = allComments.filter(({ originalText }) => originalText.match(regex));
    const unmatchedComments = allComments.filter(({ originalText }) => !originalText.match(regex));
  
    // Reorder in DOM
    commentsContainer.innerHTML = "";
    matchedComments.forEach(({ element }) => commentsContainer.appendChild(element));
    unmatchedComments.forEach(({ element }) => commentsContainer.appendChild(element));
  
    // Scroll to the first match
    const firstMatch = document.querySelector(".highlighted");
    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  

  // Function to remove highlights
  const removeHighlights = () => {
    document.querySelectorAll("#content-text").forEach((comment) => {
      const originalText = comment.getAttribute("data-original-text");
      if (originalText) {
        comment.innerHTML = originalText; // Restore original text
      }
    });
  };

  // Set up MutationObserver for dynamic content
  observer = new MutationObserver(() => {
    addSearchBar();
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial load
  addSearchBar();

  // Handle messages from background script
  chrome.runtime.onMessage.addListener((obj) => {
    if (obj.type === "loadSearchBar") {
      addSearchBar();
    }
  });

  // Handle YouTube's SPA navigation
  window.addEventListener("yt-navigate-finish", addSearchBar);

  // Clean up observer when needed
  window.addEventListener("unload", () => {
    if (observer) observer.disconnect();
  });
})();
