function getAllBookmarks(callback) {
  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    const allBookmarks = [];
    function traverse(nodes) {
      for (const node of nodes) {
        if (node.url) {
          allBookmarks.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    }
    traverse(bookmarkTreeNodes);
    callback(allBookmarks);
  });
}

function renderBookmarks(bookmarks, order = 'asc') {
  const container = document.getElementById('bookmarkList');
  container.innerHTML = '';

  // Sort by dateAdded
  bookmarks.sort((a, b) => {
    if (order === 'asc') return a.dateAdded - b.dateAdded;
    else return b.dateAdded - a.dateAdded;
  });

  for (const bookmark of bookmarks) {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = bookmark.id;
    label.appendChild(checkbox);
    label.append(` ${bookmark.title || bookmark.url}`);
    container.appendChild(label);
  }
}

document.getElementById('refresh').addEventListener('click', () => {
  const order = document.getElementById('sortOrder').value;
  getAllBookmarks((bookmarks) => renderBookmarks(bookmarks, order));
});

document.getElementById('delete').addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('#bookmarkList input[type="checkbox"]:checked');
  checkboxes.forEach(cb => {
    chrome.bookmarks.remove(cb.value);
  });
  setTimeout(() => {
    document.getElementById('refresh').click();
  }, 200); // Wait for deletions to complete
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refresh').click();
});
