const uploadInput = document.getElementById('pdfUpload');
const fileList = document.getElementById('fileList');
const fileListContainer = document.getElementById('fileListContainer');
const mergeBtn = document.getElementById('mergeBtn');
const addMoreBtn = document.getElementById('addMoreBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const downloadLink = document.getElementById('downloadLink');

let files = [];

// Update UI based on current files
function updateUI() {
  fileList.innerHTML = '';
  
  if (files.length === 0) {
    fileListContainer.style.display = 'none';
    addMoreBtn.style.display = 'none';
    clearAllBtn.style.display = 'none';
    mergeBtn.disabled = true;
    downloadLink.style.display = 'none';
  } else {
    fileListContainer.style.display = 'block';
    addMoreBtn.style.display = 'inline-block';
    clearAllBtn.style.display = 'inline-block';
    mergeBtn.disabled = false;
    
    files.forEach((file, index) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      li.draggable = true;
      li.dataset.index = index;
      
      li.innerHTML = `
        <span class="drag-handle">⋮⋮</span>
        <span class="file-name">${index + 1}. ${file.name}</span>
        <button class="duplicate-btn" onclick="duplicateFile(${index})">Duplicate</button>
        <button class="remove-btn" onclick="removeFile(${index})">Remove</button>
      `;
      
      // Add drag and drop event listeners
      li.addEventListener('dragstart', handleDragStart);
      li.addEventListener('dragover', handleDragOver);
      li.addEventListener('drop', handleDrop);
      li.addEventListener('dragend', handleDragEnd);
      
      fileList.appendChild(li);
    });
  }
  
  // Reset the file input
  uploadInput.value = '';
}

// Handle file selection (accumulate files instead of replacing)
uploadInput.addEventListener('change', (e) => {
  const newFiles = Array.from(e.target.files);
  files.push(...newFiles);
  updateUI();
});

// Add more files button
addMoreBtn.addEventListener('click', () => {
  uploadInput.click();
});

// Clear all files button
clearAllBtn.addEventListener('click', () => {
  files = [];
  updateUI();
});

// Duplicate file function
function duplicateFile(index) {
  const fileToDuplicate = files[index];
  // Insert the duplicate right after the original file
  files.splice(index + 1, 0, fileToDuplicate);
  updateUI();
}

// Remove individual file
function removeFile(index) {
  files.splice(index, 1);
  updateUI();
}

// Drag and drop functionality
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  if (draggedElement !== this) {
    const draggedIndex = parseInt(draggedElement.dataset.index);
    const targetIndex = parseInt(this.dataset.index);
    
    // Reorder the files array
    const movedFile = files[draggedIndex];
    files.splice(draggedIndex, 1);
    files.splice(targetIndex, 0, movedFile);
    
    updateUI();
  }
  
  return false;
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  draggedElement = null;
}

// Merge PDFs
mergeBtn.addEventListener('click', async () => {
  if (files.length === 0) return;
  
  try {
    mergeBtn.disabled = true;
    mergeBtn.textContent = 'Merging...';
    
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();

    for (let file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });

    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.style.display = 'inline';
    downloadLink.click();
    
  } catch (error) {
    console.error('Error merging PDFs:', error);
    alert('Error merging PDFs. Please try again.');
  } finally {
    mergeBtn.disabled = false;
    mergeBtn.textContent = 'Merge PDFs';
  }
});

// Initialize UI
updateUI();
