/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_198360882")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "bool3087654605",
    "name": "Completed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_198360882")

  // remove field
  collection.fields.removeById("bool3087654605")

  return app.save(collection)
})
