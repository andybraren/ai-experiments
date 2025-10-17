class TechTree {
    constructor() {
        this.canvas = document.getElementById('tech-tree-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentEra = 0;
        this.showGrid = false;
        this.draggedNode = null;
        this.dragOffset = { x: 0, y: 0 };
        this.hoveredNode = null;
        this.tooltip = null;
        this.cameraOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        
        // Define eras and their tech nodes
        this.eras = [
            {
                name: "Ancient",
                nodes: [
                    { id: 'pottery', name: 'Pottery', x: 100, y: 200, completed: false, dependencies: [], description: 'Basic clay work and storage' },
                    { id: 'agriculture', name: 'Agriculture', x: 100, y: 300, completed: false, dependencies: [], description: 'Farming and food production' },
                    { id: 'animal_husbandry', name: 'Animal Husbandry', x: 100, y: 400, completed: false, dependencies: [], description: 'Domestication of animals' },
                    { id: 'writing', name: 'Writing', x: 300, y: 200, completed: false, dependencies: ['pottery'], description: 'Record keeping and communication' },
                    { id: 'bronze_working', name: 'Bronze Working', x: 300, y: 350, completed: false, dependencies: ['pottery', 'agriculture'], description: 'Metal tools and weapons' },
                    { id: 'sailing', name: 'Sailing', x: 500, y: 250, completed: false, dependencies: ['writing'], description: 'Ocean exploration and trade' },
                    { id: 'wheel', name: 'The Wheel', x: 500, y: 400, completed: false, dependencies: ['bronze_working'], description: 'Transportation revolution' }
                ],
                similarConnections: [
                    ['agriculture', 'animal_husbandry'],
                    ['writing', 'bronze_working']
                ]
            },
            {
                name: "Classical",
                nodes: [
                    { id: 'iron_working', name: 'Iron Working', x: 700, y: 200, completed: false, dependencies: ['bronze_working'], description: 'Advanced metallurgy' },
                    { id: 'currency', name: 'Currency', x: 700, y: 300, completed: false, dependencies: ['writing', 'sailing'], description: 'Economic systems' },
                    { id: 'horseback_riding', name: 'Horseback Riding', x: 700, y: 450, completed: false, dependencies: ['animal_husbandry', 'wheel'], description: 'Mounted warfare and mobility' },
                    { id: 'construction', name: 'Construction', x: 900, y: 250, completed: false, dependencies: ['iron_working'], description: 'Advanced building techniques' },
                    { id: 'mathematics', name: 'Mathematics', x: 900, y: 350, completed: false, dependencies: ['currency'], description: 'Numerical systems and calculations' },
                    { id: 'engineering', name: 'Engineering', x: 1100, y: 300, completed: false, dependencies: ['construction', 'mathematics'], description: 'Applied sciences and mechanics' }
                ],
                similarConnections: [
                    ['iron_working', 'currency'],
                    ['construction', 'mathematics']
                ]
            },
            {
                name: "Medieval",
                nodes: [
                    { id: 'machinery', name: 'Machinery', x: 1300, y: 200, completed: false, dependencies: ['engineering'], description: 'Complex mechanical devices' },
                    { id: 'optics', name: 'Optics', x: 1300, y: 300, completed: false, dependencies: ['engineering'], description: 'Lenses and light manipulation' },
                    { id: 'printing_press', name: 'Printing Press', x: 1300, y: 400, completed: false, dependencies: ['engineering'], description: 'Mass communication' },
                    { id: 'gunpowder', name: 'Gunpowder', x: 1500, y: 250, completed: false, dependencies: ['machinery'], description: 'Explosive chemistry' },
                    { id: 'navigation', name: 'Navigation', x: 1500, y: 350, completed: false, dependencies: ['optics'], description: 'Precise sea travel' }
                ],
                similarConnections: [
                    ['machinery', 'optics'],
                    ['optics', 'printing_press']
                ]
            }
        ];
        
        this.initializeEventListeners();
        this.createTooltip();
        this.updateUI();
        this.draw();
    }
    
    initializeEventListeners() {
        // Mouse events for canvas interaction
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        
        // Control buttons
        document.getElementById('reset-btn').addEventListener('click', this.resetProgress.bind(this));
        document.getElementById('toggle-grid').addEventListener('click', this.toggleGrid.bind(this));
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'node-tooltip';
        this.tooltip.style.display = 'none';
        document.body.appendChild(this.tooltip);
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left - this.cameraOffset.x,
            y: e.clientY - rect.top - this.cameraOffset.y
        };
    }
    
    getAllNodes() {
        return this.eras.flatMap(era => era.nodes);
    }
    
    getNodeAt(x, y) {
        const allNodes = this.getAllNodes();
        const nodeWidth = 120;
        const nodeHeight = 60;
        
        for (let node of allNodes) {
            if (x >= node.x - nodeWidth/2 && x <= node.x + nodeWidth/2 &&
                y >= node.y - nodeHeight/2 && y <= node.y + nodeHeight/2) {
                return node;
            }
        }
        return null;
    }
    
    isNodeUnlocked(node) {
        // Check if all dependencies are completed
        if (node.dependencies.length === 0) return true;
        
        const allNodes = this.getAllNodes();
        return node.dependencies.every(depId => {
            const depNode = allNodes.find(n => n.id === depId);
            return depNode && depNode.completed;
        });
    }
    
    getNodeEra(node) {
        for (let i = 0; i < this.eras.length; i++) {
            if (this.eras[i].nodes.includes(node)) {
                return i;
            }
        }
        return -1;
    }
    
    isEraVisible(eraIndex) {
        if (eraIndex <= this.currentEra) return true;
        if (eraIndex === this.currentEra + 1) {
            return this.getEraProgress(this.currentEra) >= 80;
        }
        return false;
    }
    
    getEraProgress(eraIndex) {
        if (eraIndex >= this.eras.length) return 0;
        
        const era = this.eras[eraIndex];
        const completed = era.nodes.filter(node => node.completed).length;
        return Math.round((completed / era.nodes.length) * 100);
    }
    
    handleMouseDown(e) {
        const mousePos = this.getMousePos(e);
        const node = this.getNodeAt(mousePos.x, mousePos.y);
        
        if (node) {
            this.draggedNode = node;
            this.dragOffset = {
                x: mousePos.x - node.x,
                y: mousePos.y - node.y
            };
        } else {
            this.isDragging = true;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
        }
    }
    
    handleMouseMove(e) {
        const mousePos = this.getMousePos(e);
        
        if (this.draggedNode) {
            // Drag node
            this.draggedNode.x = mousePos.x - this.dragOffset.x;
            this.draggedNode.y = mousePos.y - this.dragOffset.y;
            this.draw();
        } else if (this.isDragging) {
            // Pan camera
            const deltaX = e.clientX - this.lastMousePos.x;
            const deltaY = e.clientY - this.lastMousePos.y;
            
            this.cameraOffset.x += deltaX;
            this.cameraOffset.y += deltaY;
            
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.draw();
        } else {
            // Handle hover for tooltip
            const node = this.getNodeAt(mousePos.x, mousePos.y);
            if (node !== this.hoveredNode) {
                this.hoveredNode = node;
                this.updateTooltip(e, node);
            }
        }
    }
    
    handleMouseUp(e) {
        this.draggedNode = null;
        this.isDragging = false;
    }
    
    handleClick(e) {
        const mousePos = this.getMousePos(e);
        const node = this.getNodeAt(mousePos.x, mousePos.y);
        
        if (node && this.isNodeUnlocked(node) && !node.completed) {
            node.completed = true;
            this.updateCurrentEra();
            this.updateUI();
            this.draw();
        }
    }
    
    updateTooltip(e, node) {
        if (node) {
            const nodeEra = this.getNodeEra(node);
            const isVisible = this.isEraVisible(nodeEra);
            const isUnlocked = this.isNodeUnlocked(node);
            
            let content = `<strong>${node.name}</strong><br>`;
            
            if (isVisible && (isUnlocked || node.completed)) {
                content += `${node.description}<br>`;
                content += `Era: ${this.eras[nodeEra].name}<br>`;
                content += `Status: ${node.completed ? 'Completed' : (isUnlocked ? 'Available' : 'Locked')}`;
                
                if (node.dependencies.length > 0 && !node.completed) {
                    content += `<br>Requires: ${node.dependencies.join(', ')}`;
                }
            } else {
                content += 'Information hidden until era unlocks';
            }
            
            this.tooltip.innerHTML = content;
            this.tooltip.style.display = 'block';
            this.tooltip.style.left = (e.clientX + 10) + 'px';
            this.tooltip.style.top = (e.clientY - 10) + 'px';
        } else {
            this.tooltip.style.display = 'none';
        }
    }
    
    updateCurrentEra() {
        for (let i = 0; i < this.eras.length; i++) {
            if (this.getEraProgress(i) < 80) {
                this.currentEra = i;
                return;
            }
        }
        this.currentEra = this.eras.length - 1;
    }
    
    updateUI() {
        document.getElementById('current-era-name').textContent = this.eras[this.currentEra].name;
        document.getElementById('era-progress').textContent = this.getEraProgress(this.currentEra) + '%';
    }
    
    resetProgress() {
        this.getAllNodes().forEach(node => node.completed = false);
        this.currentEra = 0;
        this.updateUI();
        this.draw();
    }
    
    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.draw();
    }
    
    drawGrid() {
        if (!this.showGrid) return;
        
        this.ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        
        // Vertical lines
        for (let x = gridSize; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = gridSize; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawConnections() {
        const allNodes = this.getAllNodes();
        
        // Draw dependency connections (solid lines)
        allNodes.forEach(node => {
            node.dependencies.forEach(depId => {
                const depNode = allNodes.find(n => n.id === depId);
                if (depNode) {
                    this.drawConnection(depNode, node, 'solid');
                }
            });
        });
        
        // Draw similar connections (dotted lines)
        this.eras.forEach(era => {
            era.similarConnections.forEach(([id1, id2]) => {
                const node1 = allNodes.find(n => n.id === id1);
                const node2 = allNodes.find(n => n.id === id2);
                if (node1 && node2) {
                    this.drawConnection(node1, node2, 'dotted');
                }
            });
        });
    }
    
    drawConnection(node1, node2, style) {
        const nodeEra1 = this.getNodeEra(node1);
        const nodeEra2 = this.getNodeEra(node2);
        
        // Only draw if both nodes' eras are visible
        if (!this.isEraVisible(nodeEra1) || !this.isEraVisible(nodeEra2)) {
            return;
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(node1.x, node1.y);
        this.ctx.lineTo(node2.x, node2.y);
        
        if (style === 'dotted') {
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
            this.ctx.lineWidth = 2;
        } else {
            this.ctx.setLineDash([]);
            this.ctx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
            this.ctx.lineWidth = 3;
        }
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawNode(node) {
        const nodeEra = this.getNodeEra(node);
        const isVisible = this.isEraVisible(nodeEra);
        const isUnlocked = this.isNodeUnlocked(node);
        
        const nodeWidth = 120;
        const nodeHeight = 60;
        const x = node.x - nodeWidth / 2;
        const y = node.y - nodeHeight / 2;
        
        // Determine node state and colors
        let fillColor, strokeColor, textColor;
        
        if (!isVisible) {
            // Future era - hidden
            fillColor = 'rgba(26, 26, 26, 0.8)';
            strokeColor = 'rgba(255, 255, 255, 0.2)';
            textColor = 'rgba(255, 255, 255, 0.3)';
        } else if (node.completed) {
            // Completed
            fillColor = 'rgba(50, 205, 50, 0.8)';
            strokeColor = '#32cd32';
            textColor = '#ffffff';
        } else if (isUnlocked) {
            // Available
            fillColor = 'rgba(255, 215, 0, 0.8)';
            strokeColor = '#ffd700';
            textColor = '#1a1a2e';
        } else {
            // Locked
            fillColor = 'rgba(105, 105, 105, 0.6)';
            strokeColor = '#696969';
            textColor = '#cccccc';
        }
        
        // Draw node background
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(x, y, nodeWidth, nodeHeight);
        
        // Draw node border
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, nodeWidth, nodeHeight);
        
        // Draw node text
        this.ctx.fillStyle = textColor;
        this.ctx.font = 'bold 12px Georgia';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        if (isVisible && (isUnlocked || node.completed)) {
            // Split text if too long
            const words = node.name.split(' ');
            if (words.length > 1 && node.name.length > 12) {
                this.ctx.fillText(words[0], node.x, node.y - 8);
                this.ctx.fillText(words.slice(1).join(' '), node.x, node.y + 8);
            } else {
                this.ctx.fillText(node.name, node.x, node.y);
            }
        } else {
            // Hidden text for future eras
            this.ctx.fillText('???', node.x, node.y);
        }
        
        // Add glow effect for completed nodes
        if (node.completed) {
            this.ctx.shadowColor = '#32cd32';
            this.ctx.shadowBlur = 10;
            this.ctx.strokeRect(x, y, nodeWidth, nodeHeight);
            this.ctx.shadowBlur = 0;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera offset
        this.ctx.save();
        this.ctx.translate(this.cameraOffset.x, this.cameraOffset.y);
        
        // Draw grid
        this.drawGrid();
        
        // Draw connections first (behind nodes)
        this.drawConnections();
        
        // Draw nodes
        this.getAllNodes().forEach(node => this.drawNode(node));
        
        // Restore context
        this.ctx.restore();
    }
}

// Initialize the application when the page loads
window.addEventListener('load', () => {
    new TechTree();
});
