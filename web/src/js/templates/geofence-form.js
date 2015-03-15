module.exports = '\
<div class="form-modal-header"> \
  New {{type}} \
</div> \
<div class="form-modal-content"> \
  <form> \
    <div class="form-group"> \
      <label for="geofence-name">Name</label> \
      <input type="text" id="geofence-name" class="form-control" value="{{layer.name}}"> \
    </div> \
    <div class="form-group"> \
      <label for="geofence-description">Description</label> \
      <textarea id="geofence-description" class="form-control">{{layer.description}}</textarea> \
    </div> \
    <div class="form-group"> \
      <label> \
        <input type="checkbox" id="geofence-inclusive" checked="true"> Inclusive \
      </label> \
    </div> \
    <a href="#" class="btn btn-primary js-submit-button">Save it</a> \
    <a href="#" class="btn btn-default js-cancel-button">Cancel</a> \
  </form> \
</div>'