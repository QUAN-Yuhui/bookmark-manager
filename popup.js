function getAllBookmarks(callback) {
  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    const allBookmarks = [];
    function traverse(nodes) {
      for (const node of nodes) {
        if (node.url) allBookmarks.push(node);
        if (node.children) traverse(node.children);
      }
    }
    traverse(bookmarkTreeNodes);
    callback(allBookmarks);
  });
}

function renderBookmarks(bookmarks, order = 'asc') {
  const container = document.getElementById('bookmarkList');
  container.innerHTML = '';

  bookmarks.sort((a, b) => {
    return order === 'asc' ? a.dateAdded - b.dateAdded : b.dateAdded - a.dateAdded;
  });

  for (const bookmark of bookmarks) {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = bookmark.id;
    checkbox.addEventListener('change', updateSelectedCount);

    const link = document.createElement('a');
    link.href = bookmark.url;
    link.target = '_blank';
    link.textContent = bookmark.title || bookmark.url;
    link.style.marginLeft = '5px';
    link.style.textDecoration = 'none';
    link.style.color = 'blue';

    label.appendChild(checkbox);
    label.appendChild(link);
    container.appendChild(label);
  }

  updateSelectedCount();
}

function updateSelectedCount() {
  const count = document.querySelectorAll('#bookmarkList input[type="checkbox"]:checked').length;
  document.getElementById('selectedCount').textContent = `Selected: ${count}`;
}

document.getElementById('sortOrder').addEventListener('change', () => {
  const order = document.getElementById('sortOrder').value;
  getAllBookmarks((bookmarks) => renderBookmarks(bookmarks, order));
});

document.getElementById('delete').addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('#bookmarkList input[type="checkbox"]:checked');
  const idsToDelete = Array.from(checkboxes).map(cb => cb.value);

  idsToDelete.forEach(id => chrome.bookmarks.remove(id));

  document.getElementById('status').textContent = 'Deleted';
  setTimeout(() => {
    document.getElementById('status').textContent = '';
    document.getElementById('sortOrder').dispatchEvent(new Event('change'));
  }, 1000);
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('sortOrder').dispatchEvent(new Event('change'));
});
