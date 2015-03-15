module.exports = '\
<div class="form-modal-header"> \
  New {{type}} \
</div> \
<div class="form-modal-content"> \
  <form> \
    <div class="form-group"> \
      <label for="asset_id">Recipient Asset ID</label> \
      <input type="text" id="asset_id" class="form-control"> \
    </div> \
    <div class="form-group"> \
      <label for="message">Message</label> \
      <textarea id="message" class="form-control"></textarea> \
    </div> \
    <a href="#" class="btn btn-primary js-submit-button">Send it</a> \
    <a href="#" class="btn btn-default js-cancel-button">Cancel</a> \
  </form> \
</div>'