/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3368750219")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1594474806",
    "max": 0,
    "min": 0,
    "name": "moduleName",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3239013921",
    "max": 0,
    "min": 0,
    "name": "lessonName",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2878948514",
    "max": 0,
    "min": 0,
    "name": "LessonDescription",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool2600263333",
    "name": "isLearned",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "bool56683945",
    "name": "isCompleted",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3368750219")

  // remove field
  collection.fields.removeById("text1594474806")

  // remove field
  collection.fields.removeById("text3239013921")

  // remove field
  collection.fields.removeById("text2878948514")

  // remove field
  collection.fields.removeById("bool2600263333")

  // remove field
  collection.fields.removeById("bool56683945")

  return app.save(collection)
})
