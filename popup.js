document.getElementById("search").addEventListener("click", () => {
    let keyword = document.getElementById("keyword").value.toLowerCase();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "get_comments" }, (response) => {
        let results = response.comments.filter(comment => comment.toLowerCase().includes(keyword));
        let resultList = document.getElementById("results");
        resultList.innerHTML = "";
        results.forEach(comment => {
          let li = document.createElement("li");
          li.textContent = comment;
          resultList.appendChild(li);
        });
      });
    });
  });