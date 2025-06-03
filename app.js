const uploadInput = document.getElementById('pdfUpload');
const fileList = document.getElementById('fileList');
const mergeBtn = document.getElementById('mergeBtn');
const downloadLink = document.getElementById('downloadLink');

let files = [];

uploadInput.addEventListener('change', (e) => {
  files = Array.from(e.target.files);
  fileList.innerHTML = '';
  files.forEach((file, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${file.name}`;
    fileList.appendChild(li);
  });
});

mergeBtn.addEventListener('click', async () => {
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
});
