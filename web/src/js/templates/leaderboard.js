module.exports = '\
{{#each survivors}} \
  <tr> \
    <td>{{inc @index}}</td> \
    <td>{{this.asset.name}}</td> \
    <td>{{this.asset.notes}}</td> \
    <td>{{distance this.distance}} miles</td> \
  </tr> \
{{/each}}'