document.addEventListener('DOMContentLoaded', function () {
    const img = document.getElementById('draggable-image');

    let posX = 0, posY = 0, posInitialX = 0, posInitialY = 0;

    // Define multiple marker positions
    const markerPositions = [
        { id: 'marker1', x: 100, y: 50 },
        // Add other markers with unique x, y values and their corresponding IDs
    ];

    img.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        posInitialX = e.clientX;
        posInitialY = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        posX = posInitialX - e.clientX;
        posY = posInitialY - e.clientY;
        posInitialX = e.clientX;
        posInitialY = e.clientY;
        img.style.top = (img.offsetTop - posY) + "px";
        img.style.left = (img.offsetLeft - posX) + "px";

        // Update positions of all markers
        markerPositions.forEach(markerPos => {
            let marker = document.getElementById(markerPos.id);
            updateMarkerPosition(marker, markerPos);
        });
    }

    function updateMarkerPosition(marker, markerPos) {
        let imgRect = img.getBoundingClientRect();
        let markerRect = marker.getBoundingClientRect();      
        let newPosX = imgRect.left + markerPos.x - markerRect.width / 2;
        let newPosY = imgRect.top + markerPos.y - markerRect.height / 2;
        marker.style.left = newPosX + 'px';
        marker.style.top = newPosY + 'px';
    }

    // Set initial positions of all markers
    markerPositions.forEach(markerPos => {
        let marker = document.getElementById(markerPos.id);
        updateMarkerPosition(marker, markerPos);
    });

    // Optionally, handle window resize to update marker position
    window.onresize = () => {
        markerPositions.forEach(markerPos => {
            let marker = document.getElementById(markerPos.id);
            updateMarkerPosition(marker, markerPos);
        });
    };
});
