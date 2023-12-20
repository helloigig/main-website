

import { createClient } from 'https://esm.sh/@sanity/client'



let PROJECT_ID = "qaqhkjbk"; 
let DATASET = "production";
let QUERY = encodeURIComponent('*[_type == "project"]');

// // Compose the URL for your project's endpoint and add the query
let URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;



export const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    useCdn: true, // set to `false` to bypass the edge cache
    apiVersion: '2022-03-07', // use current date (YYYY-MM-DD) to target the latest API version
    // token: process.env.SANITY_SECRET_TOKEN // Only if you want to update content with the client
})


let projectDataCache = {};

async function fetchProjectDataByTitle(title) {
    // if (projectDataCache[title]) {
    //     return projectDataCache[title];
    // }

    const query = `*[_type == "project" && title == $title]{
        title,
        year,
        Description,
        "body": body[]{
            ...,
            "imageUrl": asset->url
        }
    }`;
    const params = { title };

    try {
        const projects = await client.fetch(query, params);
        // console.log('Fetched projects:', projects); // Debugging line

        projectDataCache[title] = projects.length > 0 ? projects[0] : null;
        return projectDataCache[title];
    } catch (error) {
        console.error('Error fetching project data:', error);
        return null;
    }
}




async function fetchProjectData() {
    const query = `*[_type == "project"]{
        title,
        year,
        Description,
        "body": body[]{
            ...,
            "imageUrl": asset->url
        }
    }`;

    try {
        const projects = await client.fetch(query);
        if (projects.length > 0) {
            return projects[0]; // Assuming you want the first project matching the title
        } else {
            console.error('No projects found');
            return null;
        }
    } catch (error) {
        console.error('Sanity fetch error:', error);
        return null;
    }
}



function populateRightPanel(project) {
    const rightPanel = document.querySelector('.right-panel');
    // console.log(project)
    rightPanel.innerHTML = `

    <div class="title">${project.title}</div>
    <div class="yearanddescription">
        <div class="year">${project.year}</div>
        <div class="description">${project.Description}</div>
    </div>
    ${project.body.map(block => {
        if (block._type === 'block') {
            return `<p class = "bodycopy" >${block.children[0].text}</p>`;

        } else if (block._type === 'image') {
            // Make sure your image tag has the right styles or classes
            return `<img src="${block.imageUrl}" alt="${block.caption}" style="width: 100%; height: auto; object-fit: cover;" />`;
        }    }).join('')}
    `;

    
}


document.addEventListener('DOMContentLoaded', async function () {
    const img = document.getElementById('draggable-image');
    let isDragging = false;
    let activeMarkerId = null; // Store the ID of the currently active marker


    if(img){
        img.addEventListener('mousedown', function(e) {
            // Start drag
            isDragging = false;
            dragMouseDown(e);
        });

        img.addEventListener('mousemove', function() {
            // During drag
            isDragging = true;
        });

        img.addEventListener('mouseup', function(e) {
            // End drag
                // It was a click, not a drag
                if (!isDragging && !e.target.classList.contains('location-marker')) {
                    closeRightPanel();
                }
            closeDragElement();
        });


}

    
    const projectData = await fetchProjectData();

    if (projectData) {
        populateRightPanel(projectData);
    }
    let posX = 0, posY = 0, posInitialX = 0, posInitialY = 0;

    // Define multiple marker positions
    const markerPositions = [
        { id: 'marker1', x: 1370, y: 637, text: "Fenway Refresh", title: "Fenway Refresh Title", listItems: ["list1", "list2"] },
        { id: 'marker2', x: 1400, y: 720, text: "building(f)locks", listItems: ["list1", "list2"] },
        { id: 'marker3', x: 1200, y: 690, text: "Does Colour Matter?", listItems: ["list1", "list2"] },
        { id: 'marker4', x: 1190, y: 800, text: "Heirlooms", listItems: ["list1", "list2"] },
        { id: 'marker5', x: 1060, y: 820, text: "Shadovview", listItems: ["list1", "list2"] },
        { id: 'marker6', x: 960, y: 890, text: "Atomic Field", listItems: ["list1", "list2"] },
        { id: 'marker7', x: 773, y: 940, text: "3ge3 Wenling Collaboration", listItems: ["list1", "list2"] },
        { id: 'marker8', x: 678, y: 1019, text: "3ge3 M/M Paris", listItems: ["list1", "list2"] },

        // Add other markers with unique x, y values and their corresponding IDs
    ];

    function closeRightPanel() {
        if (!isDragging) {
            const rightPanel = document.querySelector('.right-panel');
            if (rightPanel) {
                rightPanel.style.transform = 'translateX(100%)';
            }
        }
    }
    
    function updateMarkerPosition(markerId, markerPos, img) {
        let marker = document.getElementById(markerId);
        if (marker && img) {
            let imgRect = img.getBoundingClientRect();
            let newPosX = imgRect.left + window.scrollX + markerPos.x;
    
            // Calculate the bottom position by subtracting the marker's y position 
            // from the image's bottom edge relative to the viewport
            // let markerBottomPosition = window.innerHeight - Math.abs(imgRect.bottom - markerPos.y); 
            let markerTopPosition = imgRect.top + window.scrollY + markerPos.y;
        
            // Convert this to a position from the bottom of the viewport
            let markerBottomPosition = window.innerHeight - markerTopPosition;
    
            marker.style.position = 'absolute';
            marker.style.left = newPosX + 'px';
            marker.style.bottom = markerBottomPosition + 'px'; // Set bottom position
        }
    }
    

    
    function initializeMarkers(img) {
        markerPositions.forEach(markerPos => {
            createMarker(markerPos.id, markerPos.text, img);
            updateMarkerPosition(markerPos.id, markerPos, img);
        });
    }

    initializeMarkers(img);

    // Function to create a marker if it does not exist
    function createMarker(id, text, img) {
        let markerContainer = document.createElement('div');
        markerContainer.className = 'location-marker';
        markerContainer.id = id;

        let textBubble = document.createElement('div');
        textBubble.className = 'text-bubble';
        textBubble.textContent = text; // Set the text content for the text bubble

        let itemList = document.createElement('ul');
        itemList.className = 'marker-list';

        markerContainer.appendChild(textBubble);
        markerContainer.appendChild(itemList);
        // console.log("markercontainer")

        markerContainer.addEventListener('mouseover', async () => {
            markerContainer.classList.add('expanded');
            const projectData = await fetchProjectDataByTitle(text);
              if (activeMarkerId && activeMarkerId !== id) {
            hideMarkerList(activeMarkerId); // Hide the previous marker's list
        }
        if (projectData && projectData.Description) {
            showMarkerList(id, projectData.Description);
        }
        
        });
    
        markerContainer.addEventListener('mouseout', () => {
            markerContainer.classList.remove('expanded');

            if (id !== activeMarkerId) {
                hideMarkerList(id);
            }
        });

        
        markerContainer.addEventListener('click', async () => {
            if (activeMarkerId) {
                hideMarkerList(activeMarkerId);
            }
            const projectData = await fetchProjectDataByTitle(text);
            if (projectData) {
                console.log(projectData)
                populateRightPanel(projectData);
                openRightPanel();
                activeMarkerId = id; // Set the new marker as active
                showMarkerList(id, projectData.Description);
            }
            
        });

        const container = document.querySelector('.svg-and-marker-container');
        if (container) {
            container.appendChild(markerContainer);
            console.log("appended")
        } else {
            console.error('Container for markers not found');
        }
        return markerContainer;
    }


    function showMarkerList(markerId, description) {
        
        const marker = document.getElementById(markerId);

        if (marker && description) {
            const itemList = marker.querySelector('.marker-list');

            if (description) {
                itemList.innerHTML = ''; // Clear existing items
                description.split(',').forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.textContent = item.trim();
                    itemList.appendChild(listItem);
                });
            } else {
                console.log("this project has no")
            }
            itemList.style.display = 'block'; // Show the list
        }
    }
    
    function hideMarkerList(markerId) {
        const marker = document.getElementById(markerId);
        if (marker) {
            const itemList = marker.querySelector('.marker-list');
            itemList.style.display = 'none'; // Hide the list
        }
    }

    function openRightPanel() {
        const rightPanel = document.querySelector('.right-panel');
        if (rightPanel) {
            rightPanel.style.transform = 'translateX(0%)'; // Should show the panel
            // adjustMarkersForRightPanel(); // Adjust markers for the open right panel
            
            console.log("Opening right panel"); // Debugging line
        } else {
            console.error("Right panel not found");
        }
    }


function resetMarker(markerId) {
    const marker = document.getElementById(markerId);
    if (marker) {
        const itemList = marker.querySelector('.marker-list');
        itemList.innerHTML = ''; // Clear the list
        itemList.style.display = 'none'; // Hide the list
    }
}

    
    function updateAllMarkersPositions(img) {
        markerPositions.forEach(markerPos => {
            updateMarkerPosition(markerPos.id, markerPos, img);
        });
    }

    window.addEventListener('resize', function() {
        if (document.querySelector('.right-panel').style.transform === 'translateX(0%)') {
        } else {
        }
    });

    // Function to handle the drag event
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        posX = posInitialX - e.clientX;
        posY = posInitialY - e.clientY;
        posInitialX = e.clientX;
        posInitialY = e.clientY;
        // Calculate new position
        let newLeft = img.offsetLeft - posX;
        let newTop = img.offsetTop - posY;

        // Get window dimensions
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        // Get SVG dimensions
        let svgWidth = img.offsetWidth;
        let svgHeight = img.offsetHeight;

        // Restrict movement

        let leftConstraint = windowWidth - (svgWidth / 2) + (svgWidth - windowWidth);
        let topConstraint = windowHeight - (svgHeight / 2) + (svgHeight - windowHeight)
        let rightConstraint = -(windowWidth - (svgWidth / 2) + (svgWidth - windowWidth)) + windowWidth / 2

        if (newLeft > leftConstraint) newLeft = leftConstraint;
        if (newTop > topConstraint) newTop = topConstraint;
        // if (newLeft < windowWidth - svgWidth) newLeft = windowWidth - svgWidth;
        // if (newTop < windowHeight - svgHeight) newTop = windowHeight - svgHeight;
        if (newLeft < rightConstraint) newLeft = rightConstraint;
        if (newTop < 0) newTop = 0;
        // Apply new position
        img.style.left = (img.offsetLeft - posX) + "px";
        img.style.top = (img.offsetTop - posY) + "px";
        updateAllMarkersPositions(img);
    }

    // Function to handle the mouse down event to start dragging
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        posInitialX = e.clientX;
        posInitialY = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }


    // Function to handle the mouse up event to stop dragging
    function closeDragElement() {
        isDragging = false;
        document.onmouseup = null;
        document.onmousemove = null;
    }


});



const divider = document.querySelector('.divider');
// console.log(divider)
let isDragging = false;

divider.addEventListener('mousedown', function (e) {
    isDragging = true;
});

let requestId = null;

document.addEventListener('mousemove', function (e) {
    if (isDragging) {
        if (requestId) {
            cancelAnimationFrame(requestId);
        }
        requestId = requestAnimationFrame(() => {
            const parentWidth = e.target.parentNode.offsetWidth;
            const newWidth = (e.clientX / parentWidth) * 100; // Convert to percentage
            document.querySelector('.left-panel').style.flexBasis = `${newWidth}%`;
        });
    }
});

document.addEventListener('mouseup', function (e) {
    isDragging = false;
    if (requestId) {
        cancelAnimationFrame(requestId);
        requestId = null;
    }
});
