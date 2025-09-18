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
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'pane-input';
            input.placeholder = 'What would you like to see here';
            
            // Add enter key event listener for magical effect
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.triggerSparkleEffect(pane, input);
                }
            });

            // Create button container for split and close buttons
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'pane-button-container';

            const splitButton = document.createElement('button');
            splitButton.className = 'btn btn-secondary btn-small';
            splitButton.textContent = '+ Split';
            splitButton.onclick = () => this.showSplitOptions(pane);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger btn-small';
            deleteButton.textContent = '×';
            deleteButton.title = 'Delete pane';
            deleteButton.onclick = (e) => {
                e.stopPropagation();
                this.deletePane(pane);
            };

            buttonContainer.appendChild(splitButton);
            buttonContainer.appendChild(deleteButton);

            content.appendChild(input);
            content.appendChild(buttonContainer);
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
        horizontalBtn.textContent = '↕️';
        horizontalBtn.onclick = () => this.splitPane(pane, 'horizontal');

        const verticalBtn = document.createElement('button');
        verticalBtn.className = 'btn btn-primary';
        verticalBtn.textContent = '↔️';
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

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'pane-input';
        input.placeholder = 'What would you like to see here';
        
        // Add enter key event listener for magical effect
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.triggerSparkleEffect(pane, input);
            }
        });

        // Create button container for split and close buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'pane-button-container';

        const splitButton = document.createElement('button');
        splitButton.className = 'btn btn-secondary btn-small';
        splitButton.textContent = '+ Split';
        splitButton.onclick = () => this.showSplitOptions(pane);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-small';
        deleteButton.textContent = '×';
        deleteButton.title = 'Delete pane';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            this.deletePane(pane);
        };

        buttonContainer.appendChild(splitButton);
        buttonContainer.appendChild(deleteButton);

        content.appendChild(input);
        content.appendChild(buttonContainer);
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
     * Trigger sparkle effect on pane
     * @param {HTMLElement} pane - The pane element
     * @param {HTMLElement} input - The input element
     */
    triggerSparkleEffect(pane, input) {
        // Create sparkle overlay
        const overlay = document.createElement('div');
        overlay.className = 'sparkle-overlay';
        
        // Create blur backdrop
        const blurBackdrop = document.createElement('div');
        blurBackdrop.className = 'blur-backdrop';
        overlay.appendChild(blurBackdrop);
        
        // Create sparkle container
        const sparkleContainer = document.createElement('div');
        sparkleContainer.className = 'sparkle-container';
        overlay.appendChild(sparkleContainer);
        
        // Generate sparkle emojis
        const sparkleEmojis = ['✨', '⭐', '🌟', '💫', '⚡', '💎'];
        const sparkleCount = 15;
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
            
            // Random position and animation delay
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.animationDelay = Math.random() * 0.5 + 's';
            
            sparkleContainer.appendChild(sparkle);
        }
        
        // Add overlay to pane
        pane.style.position = 'relative';
        pane.appendChild(overlay);
        
        // Remove overlay and replace input after 2 seconds
        setTimeout(() => {
            // Remove overlay
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            
            // Replace input with text
            const content = pane.querySelector('.pane-content');
            if (content && input.parentNode === content) {
                const text = document.createElement('div');
                text.className = 'pane-result-text';
                text.textContent = 'Here you go!';
                
                // Replace input with text
                content.replaceChild(text, input);
            }
        }, 2000);
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
    
    // Setup bottom bar functionality
    setupBottomBar();
});

/**
 * Setup bottom bar functionality
 */
function setupBottomBar() {
    const bottomInput = document.querySelector('.bottom-input');
    const paintBrushBtn = document.querySelector('.paint-brush-btn');
    
    // Handle input enter key
    if (bottomInput) {
        bottomInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = bottomInput.value.trim();
                if (value) {
                    console.log('Creating:', value);
                    bottomInput.value = '';
                    // TODO: Implement creation logic
                }
            }
        });
    }
    
    // Handle paint brush button click
    if (paintBrushBtn) {
        paintBrushBtn.addEventListener('click', () => {
            toggleMarkupMode();
        });
    }
}

// Markup system state
let markupState = {
    isActive: false,
    isDrawing: false,
    canvas: null,
    ctx: null,
    overlay: null,
    lastX: 0,
    lastY: 0
};

/**
 * Toggle markup mode on/off
 */
function toggleMarkupMode() {
    const paintBrushBtn = document.querySelector('.paint-brush-btn');
    const overlay = document.getElementById('markupOverlay');
    const canvas = document.getElementById('markupCanvas');
    
    if (!markupState.isActive) {
        // Activate markup mode
        markupState.isActive = true;
        markupState.overlay = overlay;
        markupState.canvas = canvas;
        markupState.ctx = canvas.getContext('2d');
        
        // Setup canvas
        setupCanvas();
        
        // Show overlay
        overlay.style.display = 'block';
        
        // Update button state
        paintBrushBtn.classList.add('active');
        
        // Setup drawing event listeners
        setupDrawingEvents();
        
        console.log('Markup mode activated');
    } else {
        // Deactivate markup mode
        deactivateMarkupMode();
    }
}

/**
 * Deactivate markup mode and clear overlay
 */
function deactivateMarkupMode() {
    const paintBrushBtn = document.querySelector('.paint-brush-btn');
    const overlay = document.getElementById('markupOverlay');
    
    markupState.isActive = false;
    markupState.isDrawing = false;
    
    // Hide overlay
    overlay.style.display = 'none';
    
    // Update button state
    paintBrushBtn.classList.remove('active');
    
    // Clear canvas
    if (markupState.ctx && markupState.canvas) {
        markupState.ctx.clearRect(0, 0, markupState.canvas.width, markupState.canvas.height);
    }
    
    // Remove drawing event listeners
    removeDrawingEvents();
    
    console.log('Markup mode deactivated');
}

/**
 * Setup canvas dimensions and properties
 */
function setupCanvas() {
    const canvas = markupState.canvas;
    const ctx = markupState.ctx;
    const overlay = markupState.overlay;
    
    console.log('Setting up canvas...');
    console.log('Overlay dimensions:', overlay.offsetWidth, 'x', overlay.offsetHeight);
    
    // Set canvas size to match the overlay dimensions (main content area)
    canvas.width = overlay.offsetWidth;
    canvas.height = overlay.offsetHeight;
    
    console.log('Canvas dimensions set to:', canvas.width, 'x', canvas.height);
    
    // Setup drawing properties
    ctx.strokeStyle = '#ff0000'; // Red color
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    console.log('Canvas context configured:', {
        strokeStyle: ctx.strokeStyle,
        lineWidth: ctx.lineWidth,
        lineCap: ctx.lineCap,
        lineJoin: ctx.lineJoin
    });
    
    // Clear any existing content
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Setup drawing event listeners
 */
function setupDrawingEvents() {
    const canvas = markupState.canvas;
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile with passive: false to allow preventDefault
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
}

/**
 * Remove drawing event listeners
 */
function removeDrawingEvents() {
    const canvas = markupState.canvas;
    if (!canvas) return;
    
    // Mouse events
    canvas.removeEventListener('mousedown', startDrawing);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
    canvas.removeEventListener('mouseout', stopDrawing);
    
    // Touch events
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', stopDrawing);
    
    // Window resize
    window.removeEventListener('resize', handleResize);
}

/**
 * Start drawing
 */
function startDrawing(e) {
    console.log('Start drawing triggered', e.type);
    markupState.isDrawing = true;
    const rect = markupState.overlay.getBoundingClientRect();
    markupState.lastX = e.clientX - rect.left;
    markupState.lastY = e.clientY - rect.top;
    console.log('Drawing started at:', markupState.lastX, markupState.lastY);
}

/**
 * Draw lines
 */
function draw(e) {
    if (!markupState.isDrawing) return;
    
    const rect = markupState.overlay.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    console.log('Drawing line from', markupState.lastX, markupState.lastY, 'to', currentX, currentY);
    
    markupState.ctx.beginPath();
    markupState.ctx.moveTo(markupState.lastX, markupState.lastY);
    markupState.ctx.lineTo(currentX, currentY);
    markupState.ctx.stroke();
    
    markupState.lastX = currentX;
    markupState.lastY = currentY;
}

/**
 * Stop drawing
 */
function stopDrawing() {
    markupState.isDrawing = false;
}

/**
 * Handle touch start
 */
function handleTouchStart(e) {
    e.preventDefault(); // Prevent scrolling
    console.log('Touch start triggered');
    const touch = e.touches[0];
    const rect = markupState.overlay.getBoundingClientRect();
    markupState.isDrawing = true;
    markupState.lastX = touch.clientX - rect.left;
    markupState.lastY = touch.clientY - rect.top;
    console.log('Touch started at:', markupState.lastX, markupState.lastY);
}

/**
 * Handle touch move
 */
function handleTouchMove(e) {
    if (!markupState.isDrawing) return;
    
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    const rect = markupState.overlay.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    console.log('Touch drawing line from', markupState.lastX, markupState.lastY, 'to', currentX, currentY);
    
    markupState.ctx.beginPath();
    markupState.ctx.moveTo(markupState.lastX, markupState.lastY);
    markupState.ctx.lineTo(currentX, currentY);
    markupState.ctx.stroke();
    
    markupState.lastX = currentX;
    markupState.lastY = currentY;
}

/**
 * Prevent default behavior
 */
function preventDefault(e) {
    e.preventDefault();
}

/**
 * Handle window resize
 */
function handleResize() {
    if (markupState.isActive && markupState.canvas) {
        // Save current drawing
        const imageData = markupState.ctx.getImageData(0, 0, markupState.canvas.width, markupState.canvas.height);
        
        // Resize canvas
        setupCanvas();
        
        // Restore drawing (this will be at the original position, which is okay for most use cases)
        markupState.ctx.putImageData(imageData, 0, 0);
    }
}

// Prevent context menu on dividers
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('divider')) {
        e.preventDefault();
    }
});
