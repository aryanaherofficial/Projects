const url = 'pdf.pdf';

let pdfDoc = null,
    pagenum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// Render the Page
const renderPage = num => {
    pageIsRendering = true;

    //Get the Page
    pdfDoc.getPage(num).then(page => {
       //Set Scale
       const viewport = page.getViewport({scale});
       canvas.height = viewport.height;
       canvas.width = viewport.width;
       
        const renderCtx = {
            canvasContext: ctx,
            viewport
        }

       page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            if(pageNumIsPending != null){
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
       });

       // Output Current Page
       document.querySelector('#page-num').textContent = num;
    });
};

//Check for pages rendering
const queueRenderPage = num => {
    if(pageIsRendering){
        pageNumIsPending = num;
    } else{
        renderPage(num);
    }
}

// Show previous page
const showPrevPage = () => {
    if(pagenum <= 1) {
        return;
    }
    pagenum--;
    queueRenderPage(pagenum);
}

//Show next page
const showNextPage = () => {
    if(pagenum >= pdfDoc.numPages) {
        return;
    }
    pagenum++;
    queueRenderPage(pagenum);
}


// Get Document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;

    document.querySelector('#page-count').textContent = pdfDoc.numPages;

    renderPage(pagenum)
})
    .catch(err => {
        //Display error
        const div = document.createElement('div');
        div.className = 'error';
        div.appendChild(document.createTextNode(err.message));
        document.querySelector('body').insertBefore(div, canvas);
        //Remove top bar
        document.querySelector('.top-bar').style.display = 'none';
    });

// Button events
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);