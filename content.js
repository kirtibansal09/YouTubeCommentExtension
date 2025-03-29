const getComments = () => {
    let comments = document.querySelectorAll("#content-text");
    return Array.from(comments).map(comment => comment.innerText);
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get_comments") {
      sendResponse({ comments: getComments() });
    }
  });
  