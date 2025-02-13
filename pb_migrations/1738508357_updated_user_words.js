/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1829754180")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number666537513",
    "max": null,
    "min": null,
    "name": "points",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1829754180")

  // remove field
  collection.fields.removeById("number666537513")

  return app.save(collection)
})
