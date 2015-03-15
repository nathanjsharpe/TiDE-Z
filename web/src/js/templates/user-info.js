module.exports = '\
<div class="form-modal-header"> \
  New {{type}} \
</div> \
<div class="form-modal-content"> \
  <form> \
    <div class="form-group"> \
      <label for="landmark-name">Name</label> \
      <input type="text" name="landmark-name" id="landmark-name" class="form-control" value="{{layer.name}}"> \
    </div> \
    <div class="form-group"> \
      <label for="landmark-description">Description</label> \
      <textarea name="landmark-description" id="landmark-description" class="form-control">{{layer.description}}</textarea> \
    </div> \
    <div class="form-group"> \
      <label for="landmark-icon">Icon</label> \
      <input type="text" name="landmark-icon" id="landmark-icon" class="form-control" value="{{layer.icon}}"> \
    </div> \
    <div class="form-group"> \
      <label> \
        <input type="checkbox" name="landmark-showOnMap" id="landmark-showOnMap" checked="true"> Show on Map \
      </label> \
    </div> \
    <input type="hidden" value=""> \
 \
    <a href="#" class="btn btn-primary js-submit-button">Save it</a> \
    <a href="#" class="btn btn-default js-cancel-button">Cancel</a> \
  </form> \
</div>'