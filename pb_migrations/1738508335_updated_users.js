/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("ocvl0y7r9zeew8i")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number1767698865",
    "max": null,
    "min": null,
    "name": "totalPoints",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("ocvl0y7r9zeew8i")

  // remove field
  collection.fields.removeById("number1767698865")

  return app.save(collection)
})
