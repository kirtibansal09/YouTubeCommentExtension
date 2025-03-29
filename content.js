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

  const searchAndHighlightComments = (keywords) => {
    if (!keywords.trim()) {
      removeHighlights();
      return;
    }

    const comments = document.querySelectorAll("#content-text");

    comments.forEach((comment) => {
     // Restore the original text before applying highlights
    const originalText = comment.getAttribute("data-original-text") || comment.textContent;
    comment.setAttribute("data-original-text", originalText); // Store original text

    const escapedKeywords = keywords.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    // Match full words or substrings dynamically
    const regex = new RegExp(`(${escapedKeywords})`, "gi");

      if (originalText.match(regex)) {
        comment.innerHTML = originalText.replace(
          regex,
          `<span class="highlighted">$1</span>`
        );
      }
      else{
        comment.innerHTML = originalText;
      }
    });

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
