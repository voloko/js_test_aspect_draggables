Draggable = Class.create({
    initialize: function(element, options) {
        this.element = $(element);
        this.options = options || {};
        this.setup();
    },
    
    setup: function() {},
    
    dragStart: function(e) {},
    
    dragEnd: function(e) {},
    
    drag: function(e) {}
});

Aspect.add(Draggable.prototype, 'mouseEvents', {
    "before setup": function() {
        this.element.observe('mousedown', function(e) {
            if (this.isDragging) return;
            this.isDragging = true;
            this.dragStart(e);
        }.bindAsEventListener(this));
        
        Event.observe(document, 'mousemove', function(e) {
            if (this.isDragging) this.drag(e);
        }.bindAsEventListener(this));
        
        Event.observe(document, 'mouseup', function(e) {
            if (this.isDragging) this.dragEnd(e);
            this.isDragging = false;
        }.bindAsEventListener(this));
    }
});

if (location.href.match(/[&#?]debug=1/)) {
    Aspect.add(Draggable.prototype, 'logging', {
       "before setup":  function() {
           console.log(["setup", this]);
       },
   
       "before dragStart":  function(e) {
           console.log(["dragStart", e, this]);
       },
   
       "before dragEnd":  function(e) {
           console.log(["dragEnd", e, this]);
       },
   
       "before drag":  function(e) {
           console.log(["drag", e, this]);
       }
    });
}

Aspect.add(Draggable.prototype, 'moving', {
    "after dragStart": function(e) {
        var position = this.element.cumulativeOffset();
        this.mouseOffset = [e.pointerX() - position[0], e.pointerY() - position[1]];
        this.element.absolutize();
    },

    "after drag": function(e) {
        this.calculatePosition(e);
        this.element.style.left = this.position[0] + 'px';
        this.element.style.top  = this.position[1] + 'px';
    },
    
    "after dragEnd": function(e) {
        this.element.style.position =
            this.element.style.top =
            this.element.style.left =
            this.element.style.bottom =
            this.element.style.right = ''      
    },

    calculatePosition: function(e) {
        this.position = [e.pointerX() - this.mouseOffset[0], e.pointerY() - this.mouseOffset[1]];
    }
});

Aspect.add(Draggable.prototype, 'snapToGrid', {
    "after calculatePosition": function(e) {
        var step = this.options.gridStep;
        if (step) {
            this.position[0] = Math.round(this.position[0] / step) * step;
            this.position[1] = Math.round(this.position[1] / step) * step;
        }
    }
});

Aspect.add(Draggable.prototype, 'containement', {
    "after dragStart": function() {
        if (this.options.containement) {
            var offset = this.options.containement.cumulativeOffset();
            this.bounds = {
                left: offset[0],
                top: offset[1],
                right: offset[0] + this.options.containement.getWidth() - this.element.getWidth(),
                bottom: offset[1] + this.options.containement.getHeight() - this.element.getHeight()
            };
        }
    },

    "after calculatePosition": function(e) {
        if (this.bounds) {
            this.position[0] = Math.max(this.bounds.left, Math.min(this.bounds.right, this.position[0]));
            this.position[1] = Math.max(this.bounds.top, Math.min(this.bounds.bottom, this.position[1]));
        }
    }
});

Aspect.add(Draggable.prototype, 'placeholder', {
   "after dragStart": function(e) {
       var placeholder = this.element.cloneNode(false);
       placeholder.style.visibility = 'hidden';
       placeholder.style.overflow = 'hidden';
       placeholder.style.position = 'static';
       placeholder.style.width = this.element.getWidth() + 'px';
       placeholder.style.height = this.element.getHeight() + 'px';
       this.element.parentNode.insertBefore(placeholder, this.element);
       this.placeholder = placeholder;
   },
   
   "after dragEnd": function(e) {
       this.placeholder.parentNode.removeChild(this.placeholder);
   }
});