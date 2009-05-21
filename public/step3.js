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