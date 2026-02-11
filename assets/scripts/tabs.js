function openFolder(evt, folderName) {
    // 1. Hide all folder contents
    let contents = document.getElementsByClassName("folder-content");
    for (let i = 0; i < contents.length; i++) {
      contents[i].style.display = "none";
    }
  
    // 2. Remove the "active" highlight from all tabs
    let tabs = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].className = tabs[i].className.replace(" active", "");
    }
  
    // 3. Show the current folder and add the "active" class to the clicked tab
    document.getElementById(folderName).style.display = "flex";
    evt.currentTarget.className += " active";
  }