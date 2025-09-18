/**
 * Divvy - Windowing System
 * A flexible drag-and-drop windowing system using vanilla JavaScript
 */

class DivvyWindowingSystem {
    constructor() {
        this.paneIdCounter = 0;
        this.dragState = {
            isDragging: false,
            divider: null,
            startPos: { x: 0, y: 0 },
            startSizes: []
        };
        
        this.init();
    }

    /**
     * Initialize the windowing system
     */
    init() {
        const mainContainer = document.getElementById('mainContainer');
        
        // Create the initial pane
        const initialPane = this.createPane(true);
        mainContainer.appendChild(initialPane);
        
        // Set up global event listeners
        this.setupGlobalEventListeners();
    }

    /**
     * Create a new pane element
     * @param {boolean} isInitial - Whether this is the initial pane
     * @returns {HTMLElement} The created pane element
     */
    createPane(isInitial = false) {
        const pane = document.createElement('div');
        pane.className = isInitial ? 'pane initial-pane' : 'pane';
        pane.dataset.paneId = this.paneIdCounter++;
        pane.style.flex = '1';

        const content = document.createElement('div');
        content.className = 'pane-content';

        if (isInitial) {
            // Initial pane content
            const message = document.createElement('div');
            message.className = 'pane-message';
            message.textContent = 'Create your first split view';

            const splitButton = document.createElement('button');
            splitButton.className = 'btn btn-primary';
            splitButton.textContent = '+ Split Pane';
            splitButton.onclick = () => this.showSplitOptions(pane);

            content.appendChild(message);
            content.appendChild(splitButton);
        } else {
            // Regular pane content
            const message = document.createElement('div');
            message.className = 'pane-message';
            message.textContent = `Pane ${pane.dataset.paneId}`;

            const splitButton = document.createElement('button');
            splitButton.className = 'btn btn-secondary btn-small';
            splitButton.textContent = '+ Split';
            splitButton.onclick = () => this.showSplitOptions(pane);

            content.appendChild(message);
            content.appendChild(splitButton);

            // Add pane controls (delete button)
            const controls = document.createElement('div');
            controls.className = 'pane-controls';

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger btn-small';
            deleteButton.textContent = '×';
            deleteButton.title = 'Delete pane';
            deleteButton.onclick = (e) => {
                e.stopPropagation();
                this.deletePane(pane);
            };

            controls.appendChild(deleteButton);
            pane.appendChild(controls);
        }

        pane.appendChild(content);
        return pane;
    }

    /**
     * Show split options for a pane
     * @param {HTMLElement} pane - The pane to split
     */
    showSplitOptions(pane) {
        // Remove existing content
        const content = pane.querySelector('.pane-content');
        content.innerHTML = '';

        const message = document.createElement('div');
        message.className = 'pane-message';
        message.textContent = 'Choose split direction:';

        const horizontalBtn = document.createElement('button');
        horizontalBtn.className = 'btn btn-primary';
        horizontalBtn.textContent = 'Horizontal Split';
        horizontalBtn.onclick = () => this.splitPane(pane, 'horizontal');

        const verticalBtn = document.createElement('button');
        verticalBtn.className = 'btn btn-primary';
        verticalBtn.textContent = 'Vertical Split';
        verticalBtn.onclick = () => this.splitPane(pane, 'vertical');

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => this.resetPaneContent(pane);

        content.appendChild(message);
        content.appendChild(horizontalBtn);
        content.appendChild(verticalBtn);
        content.appendChild(cancelBtn);
    }

    /**
     * Reset pane content to default state
     * @param {HTMLElement} pane - The pane to reset
     */
    resetPaneContent(pane) {
        const content = pane.querySelector('.pane-content');
        content.innerHTML = '';

        const message = document.createElement('div');
        message.className = 'pane-message';
        message.textContent = `Pane ${pane.dataset.paneId}`;

        const splitButton = document.createElement('button');
        splitButton.className = 'btn btn-secondary btn-small';
        splitButton.textContent = '+ Split';
        splitButton.onclick = () => this.showSplitOptions(pane);

        content.appendChild(message);
        content.appendChild(splitButton);
    }

    /**
     * Split a pane in the specified direction
     * @param {HTMLElement} pane - The pane to split
     * @param {string} direction - 'horizontal' or 'vertical'
     */
    splitPane(pane, direction) {
        // Create a new container for the split
        const container = document.createElement('div');
        container.className = `split-container ${direction}`;
        container.style.flex = pane.style.flex;

        // Create two new panes
        const pane1 = this.createPane();
        const pane2 = this.createPane();

        // Create a divider
        const divider = this.createDivider(direction);

        // Set initial flex values
        pane1.style.flex = '1';
        pane2.style.flex = '1';

        // Add elements to container
        container.appendChild(pane1);
        container.appendChild(divider);
        container.appendChild(pane2);

        // Replace the original pane with the container
        pane.parentNode.replaceChild(container, pane);
    }

    /**
     * Create a divider element
     * @param {string} direction - 'horizontal' or 'vertical'
     * @returns {HTMLElement} The created divider element
     */
    createDivider(direction) {
        const divider = document.createElement('div');
        divider.className = `divider ${direction}`;
        
        // Create the drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        divider.appendChild(dragHandle);
        
        // Add mouse event listeners for dragging on both divider and handle
        divider.addEventListener('mousedown', (e) => this.startDrag(e, divider));
        dragHandle.addEventListener('mousedown', (e) => this.startDrag(e, divider));
        
        return divider;
    }

    /**
     * Delete a pane and merge its space with adjacent pane
     * @param {HTMLElement} pane - The pane to delete
     */
    deletePane(pane) {
        const container = pane.parentNode;
        
        // If this is the only pane in main container, reset to initial state
        if (container.id === 'mainContainer' && container.children.length === 1) {
            container.innerHTML = '';
            const initialPane = this.createPane(true);
            container.appendChild(initialPane);
            return;
        }

        // Find sibling elements
        const siblings = Array.from(container.children);
        const paneIndex = siblings.indexOf(pane);
        
        // Find the pane to expand (prefer right/bottom neighbor)
        let expandPane = null;
        let dividerToRemove = null;

        if (paneIndex < siblings.length - 2) {
            // There's a divider and pane to the right/bottom
            dividerToRemove = siblings[paneIndex + 1];
            expandPane = siblings[paneIndex + 2];
        } else if (paneIndex > 1) {
            // There's a divider and pane to the left/top
            dividerToRemove = siblings[paneIndex - 1];
            expandPane = siblings[paneIndex - 2];
        }

        if (expandPane && dividerToRemove) {
            // Calculate new flex value
            const currentFlex = parseFloat(pane.style.flex) || 1;
            const expandFlex = parseFloat(expandPane.style.flex) || 1;
            expandPane.style.flex = (currentFlex + expandFlex).toString();

            // Remove pane and divider
            container.removeChild(pane);
            container.removeChild(dividerToRemove);

            // If only one pane remains in container, replace container with pane
            if (container.children.length === 1) {
                const remainingPane = container.children[0];
                remainingPane.style.flex = container.style.flex;
                container.parentNode.replaceChild(remainingPane, container);
            }
        }
    }

    /**
     * Start dragging a divider
     * @param {MouseEvent} e - The mouse event
     * @param {HTMLElement} divider - The divider being dragged
     */
    startDrag(e, divider) {
        e.preventDefault();
        
        this.dragState.isDragging = true;
        this.dragState.divider = divider;
        this.dragState.startPos = { x: e.clientX, y: e.clientY };
        
        // Add dragging class for visual feedback
        divider.classList.add('dragging');
        document.body.classList.add('no-select');
        
        // Get adjacent panes
        const container = divider.parentNode;
        const siblings = Array.from(container.children);
        const dividerIndex = siblings.indexOf(divider);
        
        const leftPane = siblings[dividerIndex - 1];
        const rightPane = siblings[dividerIndex + 1];
        
        // Store initial sizes
        this.dragState.startSizes = [
            parseFloat(leftPane.style.flex) || 1,
            parseFloat(rightPane.style.flex) || 1
        ];
        
        this.dragState.leftPane = leftPane;
        this.dragState.rightPane = rightPane;
        this.dragState.isVertical = divider.classList.contains('vertical');
    }

    /**
     * Handle mouse move during drag
     * @param {MouseEvent} e - The mouse event
     */
    handleDrag(e) {
        if (!this.dragState.isDragging) return;
        
        e.preventDefault();
        
        const { divider, startPos, startSizes, leftPane, rightPane, isVertical } = this.dragState;
        
        // Calculate movement
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        const movement = isVertical ? deltaY : deltaX;
        
        // Get container dimensions
        const container = divider.parentNode;
        const containerSize = isVertical ? container.offsetHeight : container.offsetWidth;
        
        // Calculate new sizes as percentages
        const totalFlex = startSizes[0] + startSizes[1];
        const movementRatio = movement / containerSize;
        const flexChange = movementRatio * totalFlex;
        
        let newLeftFlex = startSizes[0] + flexChange;
        let newRightFlex = startSizes[1] - flexChange;
        
        // Enforce minimum sizes (convert to pixels for checking)
        const minSize = 100;
        const minFlex = (minSize / containerSize) * totalFlex;
        
        if (newLeftFlex < minFlex) {
            newLeftFlex = minFlex;
            newRightFlex = totalFlex - minFlex;
        } else if (newRightFlex < minFlex) {
            newRightFlex = minFlex;
            newLeftFlex = totalFlex - minFlex;
        }
        
        // Apply new sizes
        leftPane.style.flex = newLeftFlex.toString();
        rightPane.style.flex = newRightFlex.toString();
    }

    /**
     * End dragging
     * @param {MouseEvent} e - The mouse event
     */
    endDrag(e) {
        if (!this.dragState.isDragging) return;
        
        // Remove visual feedback
        this.dragState.divider.classList.remove('dragging');
        document.body.classList.remove('no-select');
        
        // Reset drag state
        this.dragState = {
            isDragging: false,
            divider: null,
            startPos: { x: 0, y: 0 },
            startSizes: []
        };
    }

    /**
     * Set up global event listeners
     */
    setupGlobalEventListeners() {
        // Mouse events for dragging
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));
        
        // Prevent default drag behavior
        document.addEventListener('dragstart', (e) => e.preventDefault());
        
        // Handle window resize
        window.addEventListener('resize', () => {
            // Force a repaint to handle any layout issues
            document.body.style.display = 'none';
            document.body.offsetHeight; // Trigger reflow
            document.body.style.display = '';
        });
    }
}

// Initialize the windowing system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DivvyWindowingSystem();
});

// Prevent context menu on dividers
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('divider')) {
        e.preventDefault();
    }
});
